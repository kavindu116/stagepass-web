import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Logo } from "@/components/Header";
import { CalendarIcon, ClockIcon, PinIcon, Rings } from "@/components/icons";
import { fetchEvent } from "@/lib/api";
import { formatLKR } from "@/lib/format";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const event = await fetchEvent((await params).id);
  return { title: event?.title ?? "Event" };
}

export default async function EventDetailsPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) notFound();

  const bookHref = event.status === "queue" ? `/events/${id}/queue` : `/events/${id}/seats`;
  const soldOut = event.status === "sold-out";

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-4">
          <Logo />
          <nav aria-label="Breadcrumb" className="flex-1 text-sm text-muted">
            <Link href={`/events?category=${event.category}`} className="hover:text-ink">{event.category}</Link>
            {" / "}
            <span className="text-ink">{event.title}</span>
          </nav>
          <Link href="/tickets" className="text-[15px] text-muted hover:text-ink">My Tickets</Link>
          <Avatar />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-violet-line bg-violet-deep">
        <Rings className="pointer-events-none absolute -right-32 -top-40 h-[600px] w-[600px] opacity-45" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-10 px-6 py-14">
          <div
            className="flex h-[360px] flex-[0_0_280px] items-center justify-center rounded-[18px] border border-[#6A50A8] text-sm text-violet-tint"
            style={{ backgroundColor: event.tint }}
          >
            [Event poster]
          </div>
          <div className="flex flex-[1_1_420px] flex-col gap-4">
            <span className="text-sm font-bold tracking-wider text-violet">{event.category.toUpperCase()} · ALL AGES</span>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-[56px]">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-soft">
              <span className="flex items-center gap-2"><CalendarIcon size={18} className="text-accent" />{event.dateLabel}</span>
              <span className="flex items-center gap-2"><ClockIcon size={18} className="text-accent" />Doors {event.doors} · Show {event.time}</span>
              <span className="flex items-center gap-2"><PinIcon size={18} className="text-accent" />{event.venue}, {event.city}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-3">
              {soldOut ? (
                <span className="rounded-xl bg-seat-sold px-8 py-4 text-[17px] font-bold text-muted">Sold out</span>
              ) : (
                <Link href={bookHref} className="rounded-xl bg-accent px-8 py-4 text-[17px] font-bold text-accent-ink hover:bg-accent-hover">
                  Book now
                </Link>
              )}
              <button type="button" className="rounded-xl border border-line-soft px-6 py-4 text-ink hover:border-soft">Share</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-10 px-6 pb-[72px] pt-12">
        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-10">
          <section className="flex flex-col gap-3.5">
            <h2 className="font-display text-2xl font-bold">About this event</h2>
            <p className="leading-relaxed text-soft">{event.description}</p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold">Choose a show</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
              {event.shows.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={s.soldOut}
                  aria-pressed={i === 0}
                  className={`flex flex-col gap-1 rounded-[14px] p-[18px] text-left ${
                    s.soldOut
                      ? "cursor-not-allowed border border-line bg-[#131217] text-[#807C8C]"
                      : i === 0
                        ? "border-2 border-accent bg-violet-select"
                        : "border border-line-strong bg-surface hover:border-line-soft"
                  }`}
                >
                  <strong className="text-[17px]">{s.dateLabel}</strong>
                  <span className="text-sm text-soft">{s.timeLabel}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold">Venue</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex h-[220px] items-center justify-center bg-surface-2 text-muted">[Map embed]</div>
              <div className="flex flex-wrap justify-between gap-3 px-6 py-5">
                <div>
                  <strong>{event.venue}</strong>
                  <div className="mt-1 text-sm text-muted">{event.venueAddress}</div>
                </div>
                <a href="#" className="self-center text-[15px] text-accent hover:text-accent-hover">Get directions →</a>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-bold">Good to know</h2>
            <ul className="list-disc pl-5 leading-[1.9] text-soft">
              <li>Max 6 tickets per booking</li>
              <li>Seats are held for 10 minutes once selected</li>
              <li>Show your QR ticket at the gate — screenshots accepted</li>
              <li>[Refund policy summary]</li>
            </ul>
          </section>
        </main>

        <aside className="flex flex-[1_1_320px] flex-col gap-[18px] rounded-[18px] border border-line bg-surface p-[26px]">
          <strong className="font-display text-xl">Ticket prices</strong>
          {event.tiers.map((t) => (
            <div key={t.id} className="flex items-center gap-3.5 border-b border-line pb-4">
              <span className="h-3.5 w-3.5 flex-none rounded" style={{ backgroundColor: t.color }} />
              <div className="flex flex-1 flex-col gap-0.5">
                <strong>{t.name}</strong>
                <span className="text-[13px] text-muted">{t.remaining}</span>
              </div>
              <strong>{formatLKR(t.price)}</strong>
            </div>
          ))}
          {!soldOut && (
            <Link href={bookHref} className="rounded-xl bg-accent p-4 text-center font-bold text-accent-ink hover:bg-accent-hover">
              Select seats
            </Link>
          )}
          <span className="text-center text-[13px] text-muted">Prices include taxes · [Booking fee]</span>
        </aside>
      </div>
    </>
  );
}
