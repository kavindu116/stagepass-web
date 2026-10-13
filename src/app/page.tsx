import Link from "next/link";
import { Footer, Header } from "@/components/Header";
import { EventCard } from "@/components/EventCard";
import { BallIcon, FilmIcon, MaskIcon, MusicIcon, Rings } from "@/components/icons";
import { fetchEvents } from "@/lib/api";

const categories = [
  { label: "Concerts", value: "Concert", Icon: MusicIcon },
  { label: "Movies", value: "Movie", Icon: FilmIcon },
  { label: "Sports", value: "Sports", Icon: BallIcon },
  { label: "Theatre & Comedy", value: "Theatre", Icon: MaskIcon },
];

const promises = [
  { title: "Pick your exact seat", text: "Live seat map — see what's open in real time." },
  { title: "Seats held for 10 minutes", text: "No one can grab your seat while you pay." },
  { title: "QR ticket on your phone", text: "Scan at the gate. No printing." },
];

export default async function HomePage() {
  const events = await fetchEvents();
  const featured = events[0];

  return (
    <>
      <Header signedIn={false} showCategories />

      <section className="mx-auto max-w-7xl px-6 pb-6 pt-12">
        <div className="flex flex-wrap items-stretch gap-8">
          <div className="relative flex min-h-[420px] min-w-0 flex-[999_1_560px] flex-col justify-end gap-[18px] overflow-hidden rounded-[20px] border border-violet-line bg-violet-deep p-8 sm:p-12">
            <Rings className="pointer-events-none absolute -right-16 -top-16 h-[420px] w-[420px] opacity-55" />
            <span className="relative self-start rounded-full bg-accent px-3 py-1.5 text-[13px] font-bold tracking-wide text-accent-ink">
              ON SALE NOW
            </span>
            <h1 className="relative max-w-[640px] font-display text-5xl font-bold leading-none tracking-[-2px] sm:text-[64px]">
              {featured.title.replace("in Concert", "in Colombo")}
            </h1>
            <p className="relative text-lg text-soft">
              {featured.dateLabel} · {featured.time} · {featured.venue}, {featured.city}
            </p>
            <div className="relative mt-2 flex flex-wrap gap-3">
              <Link href={`/events/${featured.id}`} className="rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:bg-accent-hover">
                Get tickets
              </Link>
              <Link href={`/events/${featured.id}`} className="rounded-xl border border-line-soft px-6 py-3.5 text-ink hover:border-soft">
                Event details
              </Link>
            </div>
          </div>

          <div className="flex flex-[1_1_320px] flex-col gap-4">
            <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-6">
              <span className="text-[13px] tracking-wider text-muted">SELLING FAST</span>
              <strong className="font-display text-[22px]">{events[0].title} – Night 2</strong>
              <span className="text-sm text-soft">Sun, 15 Dec · {events[0].venue}</span>
              <div className="mt-2.5 h-1.5 rounded-full bg-line">
                <div className="h-1.5 w-[82%] rounded-full bg-[#FF6B4A]" />
              </div>
              <span className="text-[13px] text-[#FF8A6E]">82% sold</span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-6">
              <span className="text-[13px] tracking-wider text-muted">THIS WEEKEND</span>
              <strong className="font-display text-[22px]">{events[3].title}</strong>
              <span className="text-sm text-soft">{events[3].dateLabel} · {events[3].venue}</span>
              <Link href={`/events/${events[3].id}`} className="mt-2 text-sm text-accent hover:text-accent-hover">
                View →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <h2 className="mb-[18px] font-display text-[22px] font-bold">Browse by category</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {categories.map(({ label, value, Icon }) => (
            <Link
              key={value}
              href={`/events?category=${value}`}
              className="flex items-center gap-3.5 rounded-[14px] border border-line bg-surface p-[22px] font-medium hover:border-line-soft"
            >
              <Icon size={26} className="text-accent" strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[22px] font-bold">Trending in Colombo</h2>
          <Link href="/events" className="text-[15px] text-accent hover:text-accent-hover">See all events →</Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7 rounded-[20px] border border-line bg-surface p-10">
          {promises.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <strong className="font-display text-xl">{p.title}</strong>
              <span className="text-[15px] text-muted">{p.text}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
