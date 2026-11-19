import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackIcon } from "@/components/icons";
import { SeatMap } from "@/components/SeatMap";
import { fetchEvent, fetchSeatMap } from "@/lib/api";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = { title: "Select seats" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SeatSelectionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) notFound();

  // ?show=12 picks the night; default = first show that isn't sold out
  const requested = firstParam((await searchParams).show);
  const show =
      event.shows.find((s) => s.id === requested) ?? event.shows.find((s) => !s.soldOut) ?? event.shows[0];
  if (!show) notFound();

  const seatMap = await fetchSeatMap(show.id);
  if (!seatMap) notFound();

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
              {show.dateLabel} · {show.timeLabel} · {event.venue}, {event.city}
            </span>
            </div>

            {event.shows.length > 1 && (
                <nav aria-label="Choose a night" className="flex flex-wrap gap-2">
                  {event.shows.map((s) => (
                      <Link
                          key={s.id}
                          href={`/events/${id}/seats?show=${s.id}`}
                          aria-current={s.id === show.id ? "page" : undefined}
                          className={`rounded-full px-3.5 py-2 text-sm ${
                              s.id === show.id
                                  ? "bg-accent font-bold text-accent-ink"
                                  : s.soldOut
                                      ? "pointer-events-none border border-line text-[#807C8C]"
                                      : "border border-line-strong hover:border-line-soft"
                          }`}
                      >
                        {s.dateLabel}
                      </Link>
                  ))}
                </nav>
            )}

            <span className="flex items-center gap-2 rounded-full border border-ok-line bg-ok-bg px-3.5 py-2 text-sm font-bold text-ok">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ok" />
            Live
          </span>
          </div>
        </header>

        {/* key: switching nights remounts the map with fresh state */}
        <SeatMap
            key={seatMap.showId}
            showId={seatMap.showId}
            initialRows={seatMap.rows}
            tiers={event.tiers}
            maxSeats={seatMap.maxSeatsPerOrder}
        />
      </>
  );
}
