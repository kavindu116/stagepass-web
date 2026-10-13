import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { formatLKR } from "@/lib/format";

const statusText: Record<EventItem["status"], { label: string; className: string }> = {
  available: { label: "Available", className: "text-ok" },
  "selling-fast": { label: "Selling fast", className: "text-[#FF8A6E]" },
  queue: { label: "Waiting room on sale day", className: "text-violet" },
  "sold-out": { label: "Sold out", className: "text-muted" },
};

/** Vertical card used on the home page grid. */
export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-ink transition hover:border-line-soft"
    >
      <div
        className="flex h-[170px] items-end p-4 font-display text-[26px] font-bold tracking-tight text-white"
        style={{ backgroundColor: event.tint }}
      >
        {event.short}
      </div>
      <div className="flex flex-col gap-1.5 px-[18px] pb-5 pt-4">
        <span className="text-[13px] font-bold tracking-wide text-accent">
          {event.dateLabel.split(",")[0].toUpperCase()} {event.day} {event.month}
        </span>
        <strong className="text-[17px]">{event.title}</strong>
        <span className="text-sm text-muted">{event.venue}, {event.city}</span>
        <span className="mt-1.5 text-sm text-soft">
          From <strong className="text-ink">{formatLKR(event.priceFrom)}</strong>
        </span>
      </div>
    </Link>
  );
}

/** Horizontal row used on the listing page. */
export function EventRow({ event }: { event: EventItem }) {
  const s = statusText[event.status];
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex flex-wrap overflow-hidden rounded-2xl border border-line bg-surface text-ink transition hover:border-line-soft"
    >
      <div
        className="flex min-h-[140px] flex-[0_0_200px] flex-col items-center justify-center gap-0.5"
        style={{ backgroundColor: event.tint }}
      >
        <span className="font-display text-[40px] font-bold leading-none">{event.day}</span>
        <span className="text-sm tracking-widest">{event.month}</span>
      </div>
      <div className="flex flex-[1_1_280px] flex-col justify-center gap-1.5 px-6 py-5">
        <span className="text-[13px] tracking-wide text-muted">
          {event.category.toUpperCase()} · {event.time}
        </span>
        <strong className="font-display text-[21px]">{event.title}</strong>
        <span className="text-[15px] text-soft">{event.venue}, {event.city}</span>
      </div>
      <div className="flex flex-[0_1_220px] flex-col items-start justify-center gap-2.5 px-6 py-5">
        <span className="text-[13px] text-muted">From</span>
        <strong className="text-xl">{formatLKR(event.priceFrom)}</strong>
        <span className={`text-[13px] font-bold ${s.className}`}>{s.label}</span>
      </div>
    </Link>
  );
}
