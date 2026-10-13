import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackIcon } from "@/components/icons";
import { SeatMap } from "@/components/SeatMap";
import { fetchEvent, fetchSeatMap } from "@/lib/api";

export const metadata: Metadata = { title: "Select seats" };

export default async function SeatSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, rows] = await Promise.all([fetchEvent(id), fetchSeatMap(id)]);
  if (!event) notFound();

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-6 py-4">
          <Link
            href={`/events/${id}`}
            aria-label="Back to event"
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line-strong hover:border-line-soft"
          >
            <BackIcon />
          </Link>
          <div className="flex flex-1 flex-col gap-0.5">
            <strong className="font-display text-xl">{event.title}</strong>
            <span className="text-sm text-muted">
              {event.dateLabel} · {event.time} · {event.venue}, {event.city}
            </span>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-ok-line bg-ok-bg px-3.5 py-2 text-sm font-bold text-ok">
            <span className="h-2 w-2 rounded-full bg-ok" />
            Live · 214 people viewing
          </span>
        </div>
      </header>

      <SeatMap eventId={id} rows={rows} tiers={event.tiers} />
    </>
  );
}
