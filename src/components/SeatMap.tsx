"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, InfoIcon } from "./icons";
import { clearHold, getStoredHoldId, startHold } from "./HoldTimer";
import { SEAT_STATUS, type ApiSeatUpdate } from "@/lib/adapters";
import { createHold, getSeatRows, releaseHold, seatStreamUrl } from "@/lib/client-api";
import { formatLKR } from "@/lib/format";
import type { Seat, SeatRow, Tier } from "@/lib/types";

// Safety net only: live changes arrive instantly over Server-Sent Events.
const FALLBACK_POLL_MS = 30000;

interface Props {
  showId: number;
  initialRows: SeatRow[];
  tiers: Tier[];
  maxSeats: number;
}

/**
 * Live seat map.
 * - Subscribes to GET /api/shows/{id}/seats/stream (Server-Sent Events). When anyone holds,
 *   releases, or lets a hold expire, the change is pushed here instantly.
 * - On (re)connect it re-fetches the full map once, so nothing missed while offline is lost.
 * - "Hold seats" -> POST /api/holds. The backend holds all seats or none (Redis Lua);
 *   a 409 means someone was faster, so we drop those seats and refresh.
 */
export function SeatMap({ showId, initialRows, tiers, maxSeats }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<SeatRow[]>(initialRows);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const tierById = useMemo(() => Object.fromEntries(tiers.map((t) => [t.id, t])), [tiers]);
  const seatById = useMemo(() => {
    const m: Record<string, Seat> = {};
    rows.forEach((r) => r.seats.forEach((s) => (m[s.id] = s)));
    return m;
  }, [rows]);

  const refresh = useCallback(async () => {
    const res = await getSeatRows(showId);
    if (!res.ok) return;
    setRows(res.data);
    // If someone else took a seat I had selected (not held yet), drop it and say so.
    const taken = new Set(res.data.flatMap((r) => r.seats.filter((s) => s.status !== "available").map((s) => s.id)));
    setSelected((cur) => {
      const lost = cur.filter((id) => taken.has(id));
      if (lost.length) setNotice(`Seat ${lost.join(", ")} was just taken by someone else.`);
      return lost.length ? cur.filter((id) => !taken.has(id)) : cur;
    });
  }, [showId]);

  // Coming back from checkout ("Change seats")? Release the old hold so those seats aren't blocked for me.
  useEffect(() => {
    const previous = getStoredHoldId();
    if (!previous) return;
    clearHold();
    releaseHold(previous).then(refresh);
  }, [refresh]);

  /** Apply one pushed change: e.g. seats 621,622 -> HELD. */
  const applyUpdate = useCallback((u: ApiSeatUpdate) => {
    const ids = new Set(u.seatIds);
    const status = SEAT_STATUS[u.status];
    setRows((cur) =>
      cur.map((r) => ({
        ...r,
        seats: r.seats.map((s) => (s.showSeatId !== undefined && ids.has(s.showSeatId) ? { ...s, status } : s)),
      })),
    );
    if (status !== "available") {
      const lostLabels = rowsRef.current
        .flatMap((r) => r.seats)
        .filter((s) => s.showSeatId !== undefined && ids.has(s.showSeatId))
        .map((s) => s.id);
      setSelected((cur) => {
        const lost = cur.filter((id) => lostLabels.includes(id));
        if (lost.length) setNotice(`Seat ${lost.join(", ")} was just taken by someone else.`);
        return lost.length ? cur.filter((id) => !lost.includes(id)) : cur;
      });
    }
  }, []);

  useEffect(() => {
    const source = new EventSource(seatStreamUrl(showId));
    source.addEventListener("ready", () => {
      setLive(true);
      refresh(); // re-sync after connect / reconnect
    });
    source.addEventListener("seats", (e) => {
      try {
        applyUpdate(JSON.parse((e as MessageEvent<string>).data) as ApiSeatUpdate);
      } catch {
        /* ignore a malformed message */
      }
    });
    source.onerror = () => setLive(false); // EventSource reconnects by itself

    const fallback = setInterval(refresh, FALLBACK_POLL_MS);
    return () => {
      source.close();
      clearInterval(fallback);
    };
  }, [showId, refresh, applyUpdate]);

  const picked = selected
    .filter((id) => seatById[id])
    .map((id) => ({ seat: seatById[id], tier: tierById[seatById[id].tierId] }));
  const total = picked.reduce((sum, p) => sum + (p.tier?.price ?? 0), 0);

  function toggle(seat: Seat) {
    if (seat.status !== "available") return;
    setNotice(null);
    setSelected((cur) =>
      cur.includes(seat.id) ? cur.filter((x) => x !== seat.id) : cur.length < maxSeats ? [...cur, seat.id] : cur,
    );
  }

  async function holdAndContinue() {
    const seatIds = picked.map((p) => p.seat.showSeatId).filter((id): id is number => id !== undefined);
    if (!seatIds.length) return;
    setSubmitting(true);
    setNotice(null);

    const res = await createHold(showId, seatIds);
    if (res.ok) {
      startHold(res.data.expiresAt, res.data.holdId);
      router.push(`/checkout?hold=${res.data.holdId}`);
      return;
    }

    setSubmitting(false);
    if (res.problem.status === 409) {
      const lost = res.problem.seats ?? [];
      setSelected((cur) => cur.filter((id) => !lost.includes(id)));
      setNotice(`Sorry — ${lost.length ? `seat ${lost.join(", ")}` : "a seat"} was taken just before you. Please pick another.`);
      refresh();
    } else {
      setNotice(res.problem.detail ?? "Couldn't hold your seats. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-6 pb-16 pt-8">
      <main className="flex min-w-0 flex-[999_1_640px] flex-col gap-7 rounded-[20px] border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Legend tiers={tiers} />
          <span
            className={`flex items-center gap-2 text-sm ${live ? "text-ok" : "text-muted"}`}
            aria-live="polite"
          >
            <span className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-ok" : "bg-muted"}`} />
            {live ? "Live updates on" : "Connecting…"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-[640px] flex-col items-center gap-2.5">
            <div className="mb-6 flex h-[46px] w-[70%] items-center justify-center rounded-b-[120px] bg-violet-line text-sm font-bold tracking-[6px] text-violet-tint">
              STAGE
            </div>
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-1.5">
                <span className="w-[22px] text-center text-[13px] font-bold text-muted">{row.label}</span>
                {row.seats.map((seat, i) => {
                  const prev = row.seats[i - 1];
                  const aisle = !!prev && seat.posX !== undefined && prev.posX !== undefined && seat.posX - prev.posX > 1;
                  return (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      tier={tierById[seat.tierId]}
                      selected={selected.includes(seat.id)}
                      aisle={aisle}
                      onClick={() => toggle(seat)}
                    />
                  );
                })}
                <span className="w-[22px] text-center text-[13px] font-bold text-muted">{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-violet-line bg-violet-deep px-[18px] py-3.5 text-sm text-[#D6D0EA]"
          >
            <InfoIcon size={18} className="flex-none text-violet" />
            {notice}
          </div>
        )}
      </main>

      <aside className="flex flex-[1_1_320px] flex-col gap-[18px] rounded-[20px] border border-line bg-surface p-[26px]">
        <strong className="font-display text-xl">Your seats</strong>
        <span className="text-sm text-muted">
          {selected.length} of {maxSeats} selected
        </span>

        {picked.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-[22px] text-center text-[15px] text-muted">
            Tap a seat on the map to add it.
          </div>
        ) : (
          picked.map(({ seat, tier }) => (
            <div key={seat.id} className="flex items-center gap-3 border-b border-line pb-3.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: tier?.color }} />
              <div className="flex flex-1 flex-col">
                <strong>Seat {seat.id}</strong>
                <span className="text-[13px] text-muted">{tier?.name}</span>
              </div>
              <strong>{formatLKR(tier?.price ?? 0)}</strong>
              <button
                type="button"
                aria-label={`Remove seat ${seat.id}`}
                onClick={() => toggle(seat)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong hover:border-line-soft"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          ))
        )}

        <div className="flex justify-between text-lg">
          <span>Total</span>
          <strong>{formatLKR(total)}</strong>
        </div>
        <button
          type="button"
          onClick={holdAndContinue}
          disabled={!selected.length || submitting}
          className="rounded-xl bg-accent p-4 font-bold text-accent-ink hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {submitting ? "Holding seats…" : "Hold seats & continue"}
        </button>
        <span className="text-center text-[13px] leading-normal text-muted">
          Your seats are held for 10 minutes after you continue. Max {maxSeats} per booking.
        </span>
      </aside>
    </div>
  );
}

function SeatButton({
  seat,
  tier,
  selected,
  aisle,
  onClick,
}: {
  seat: Seat;
  tier: Tier | undefined;
  selected: boolean;
  aisle: boolean;
  onClick: () => void;
}) {
  const disabled = seat.status !== "available";
  const stateLabel = seat.status === "sold" ? "sold" : seat.status === "held" ? "held" : selected ? "selected" : "available";

  let cls = "h-8 w-8 rounded-[7px] border-2 text-xs font-bold transition ";
  let style: React.CSSProperties | undefined;
  if (seat.status === "sold") cls += "cursor-not-allowed border-seat-sold bg-seat-sold";
  else if (seat.status === "held") cls += "cursor-not-allowed border-dashed border-seat-held-line bg-seat-held";
  else if (selected) cls += "border-ink bg-ink text-accent-ink";
  else {
    cls += "bg-transparent hover:bg-white/10";
    style = { borderColor: tier?.color };
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Seat ${seat.id}, ${tier?.name ?? ""}, ${stateLabel}`}
      title={`${seat.id} · ${tier?.name ?? ""} · ${formatLKR(tier?.price ?? 0)}`}
      className={`${cls} ${aisle ? "ml-[22px]" : ""}`}
      style={style}
    >
      {selected ? "✓" : ""}
    </button>
  );
}

function Legend({ tiers }: { tiers: Tier[] }) {
  return (
    <div className="flex flex-wrap gap-[18px] text-sm text-soft">
      {tiers.map((t) => (
        <span key={t.id} className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[5px] border-2" style={{ borderColor: t.color }} />
          {t.name} · {formatLKR(t.price)}
        </span>
      ))}
      <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-[5px] bg-ink" />Your pick</span>
      <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-[5px] border-2 border-dashed border-seat-held-line bg-seat-held" />Held</span>
      <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-[5px] bg-seat-sold" />Sold</span>
    </div>
  );
}
