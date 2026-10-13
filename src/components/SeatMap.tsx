"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CloseIcon, InfoIcon } from "./icons";
import { startHold } from "./HoldTimer";
import { AISLE_BEFORE } from "@/lib/mock-data";
import { formatLKR } from "@/lib/format";
import type { Seat, SeatRow, Tier } from "@/lib/types";

const MAX_SEATS = 6;

interface Props {
  eventId: string;
  rows: SeatRow[];
  tiers: Tier[];
}

/**
 * Live seat map.
 * TODO (backend): subscribe to /topic/event/{eventId}/seats over STOMP/WebSocket
 * and patch `rows` when other users hold / buy seats. On "Hold seats", call
 * POST /holds — a 409 means someone else won the Redis SET NX race.
 */
export function SeatMap({ eventId, rows, tiers }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tierById = useMemo(() => Object.fromEntries(tiers.map((t) => [t.id, t])), [tiers]);
  const seatById = useMemo(() => {
    const m: Record<string, Seat> = {};
    rows.forEach((r) => r.seats.forEach((s) => (m[s.id] = s)));
    return m;
  }, [rows]);

  const picked = selected.map((id) => ({ seat: seatById[id], tier: tierById[seatById[id].tierId] }));
  const total = picked.reduce((sum, p) => sum + p.tier.price, 0);

  function toggle(seat: Seat) {
    if (seat.status !== "available") return;
    setSelected((cur) =>
      cur.includes(seat.id) ? cur.filter((x) => x !== seat.id) : cur.length < MAX_SEATS ? [...cur, seat.id] : cur,
    );
  }

  function holdAndContinue() {
    if (!selected.length) return;
    setSubmitting(true);
    // Replace with: await fetch(`${API_URL}/holds`, { method: "POST", body: JSON.stringify({ eventId, seatIds: selected }) })
    startHold();
    router.push(`/checkout?event=${encodeURIComponent(eventId)}&seats=${selected.join(",")}`);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-6 pb-16 pt-8">
      <main className="flex min-w-0 flex-[999_1_640px] flex-col gap-7 rounded-[20px] border border-line bg-surface p-6 sm:p-8">
        <Legend tiers={tiers} />

        <div className="overflow-x-auto">
          <div className="flex min-w-[640px] flex-col items-center gap-2.5">
            <div className="mb-6 flex h-[46px] w-[70%] items-center justify-center rounded-b-[120px] bg-violet-line text-sm font-bold tracking-[6px] text-violet-tint">
              STAGE
            </div>
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-1.5">
                <span className="w-[22px] text-center text-[13px] font-bold text-muted">{row.label}</span>
                {row.seats.map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    tier={tierById[seat.tierId]}
                    selected={selected.includes(seat.id)}
                    aisle={AISLE_BEFORE.includes(seat.number)}
                    onClick={() => toggle(seat)}
                  />
                ))}
                <span className="w-[22px] text-center text-[13px] font-bold text-muted">{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-violet-line bg-violet-deep px-[18px] py-3.5 text-sm text-[#D6D0EA]" aria-live="polite">
          <InfoIcon size={18} className="flex-none text-violet" />
          Seat D9 was just taken by someone else. The map updates live.
        </div>
      </main>

      <aside className="flex flex-[1_1_320px] flex-col gap-[18px] rounded-[20px] border border-line bg-surface p-[26px]">
        <strong className="font-display text-xl">Your seats</strong>
        <span className="text-sm text-muted">{selected.length} of {MAX_SEATS} selected</span>

        {picked.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-[22px] text-center text-[15px] text-muted">
            Tap a seat on the map to add it.
          </div>
        ) : (
          picked.map(({ seat, tier }) => (
            <div key={seat.id} className="flex items-center gap-3 border-b border-line pb-3.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: tier.color }} />
              <div className="flex flex-1 flex-col">
                <strong>Seat {seat.id}</strong>
                <span className="text-[13px] text-muted">{tier.name}</span>
              </div>
              <strong>{formatLKR(tier.price)}</strong>
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
          Your seats are held for 10 minutes after you continue. Max {MAX_SEATS} per booking.
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
  tier: Tier;
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
    style = { borderColor: tier.color };
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Seat ${seat.id}, ${tier.name}, ${stateLabel}`}
      title={`${seat.id} · ${tier.name} · ${formatLKR(tier.price)}`}
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
