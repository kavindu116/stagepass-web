"use client";

import Link from "next/link";
import { useState } from "react";
import type { Booking, BookingStatus } from "@/lib/types";

const badge: Record<BookingStatus, string> = {
  CONFIRMED: "bg-ok-bg text-ok",
  ATTENDED: "bg-seat-sold text-soft",
  REFUNDED: "bg-warn-bg text-warn",
};

export function TicketsTabs({ bookings }: { bookings: Booking[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const upcoming = bookings.filter((b) => b.upcoming);
  const past = bookings.filter((b) => !b.upcoming);
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Bookings" className="flex gap-1.5 border-b border-line">
        <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming ({upcoming.length})</Tab>
        <Tab active={tab === "past"} onClick={() => setTab("past")}>Past ({past.length})</Tab>
      </div>

      <div role="tabpanel" className="flex flex-col gap-6">
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-muted">No bookings here yet.</p>
        )}
        {list.map((b) => (
          <article key={b.id} className="flex flex-wrap overflow-hidden rounded-[18px] border border-line bg-surface">
            <div
              className="flex min-h-[150px] flex-[0_0_160px] flex-col items-center justify-center gap-0.5"
              style={{ backgroundColor: b.tint }}
            >
              <span className="font-display text-[40px] font-bold leading-none">{b.day}</span>
              <span className="text-sm tracking-widest">{b.month}</span>
            </div>
            <div className="flex flex-[1_1_320px] flex-col justify-center gap-2 px-[26px] py-[22px]">
              <span className={`self-start rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${badge[b.status]}`}>{b.status}</span>
              <strong className="font-display text-[21px]">{b.title}</strong>
              <span className="text-[15px] text-soft">{b.venue} · {b.time}</span>
              <span className="text-sm text-muted">{b.seatsLabel} · Booking #{b.id}</span>
            </div>
            <div className="flex flex-[0_1_300px] flex-wrap items-center justify-end gap-2.5 px-[26px] py-[22px]">
              {b.upcoming ? (
                <>
                  <Link
                    href={`/booking/${b.id}?event=${b.eventId}&seats=C7,C8`}
                    className="rounded-[10px] bg-accent px-[18px] py-3 text-[15px] font-bold text-accent-ink hover:bg-accent-hover"
                  >
                    View QR
                  </Link>
                  <button type="button" className="rounded-[10px] border border-line-soft px-4 py-3 text-[15px] hover:border-soft">PDF</button>
                  <button type="button" className="px-2 py-3 text-sm text-muted underline hover:text-ink">Request cancel</button>
                </>
              ) : (
                <button type="button" className="rounded-[10px] border border-line-soft px-4 py-3 text-[15px] hover:border-soft">Receipt</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px border-b-[3px] px-[18px] py-3.5 ${
        active ? "border-accent font-bold text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
