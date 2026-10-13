import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EventRow } from "@/components/EventCard";
import { fetchEvents } from "@/lib/api";
import { firstParam, formatLKR } from "@/lib/format";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "All events" };

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Concerts", value: "Concert" },
  { label: "Festivals", value: "Festival" },
  { label: "Movies", value: "Movie" },
  { label: "Sports", value: "Sports" },
  { label: "Theatre & Comedy", value: "Theatre" },
];
const CITIES = ["All cities", "Colombo", "Kandy", "Galle", "Negombo"];

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function EventsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.toLowerCase() ?? "";
  const city = firstParam(sp.city) ?? "All cities";
  const maxPrice = Number(firstParam(sp.max) ?? 20000);
  const sort = firstParam(sp.sort) ?? "date";
  const catParam = sp.category;
  const selectedCats = (Array.isArray(catParam) ? catParam : catParam ? [catParam] : []) as Category[];

  let events = (await fetchEvents()).filter((e) => {
    if (q && !`${e.title} ${e.venue} ${e.city}`.toLowerCase().includes(q)) return false;
    if (selectedCats.length && !selectedCats.includes(e.category)) return false;
    if (city !== "All cities" && e.city !== city) return false;
    if (e.priceFrom > maxPrice) return false;
    return true;
  });
  if (sort === "price") events = [...events].sort((a, b) => a.priceFrom - b.priceFrom);

  return (
    <>
      <Header searchDefault={firstParam(sp.q)} />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <h1 className="mb-1.5 font-display text-4xl font-bold tracking-tight">All events</h1>
        <p className="mb-7 text-muted">{events.length} events found</p>

        {/* Filters are a plain GET form: the URL holds the filter state, so results are shareable and server-rendered. */}
        <form action="/events" className="flex flex-wrap items-start gap-8">
          {q && <input type="hidden" name="q" value={firstParam(sp.q)} />}

          <aside className="flex max-w-[300px] flex-[1_1_260px] flex-col gap-6 rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center justify-between">
              <strong className="text-[17px]">Filters</strong>
              <Link href="/events" className="text-sm text-accent hover:text-accent-hover">Clear all</Link>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2.5 text-[13px] tracking-wider text-muted">CATEGORY</legend>
              {CATEGORIES.map((c) => (
                <label key={c.value} className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    name="category"
                    value={c.value}
                    defaultChecked={selectedCats.includes(c.value)}
                    className="h-[18px] w-[18px] accent-accent"
                  />
                  {c.label}
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="city" className="text-[13px] tracking-wider text-muted">LOCATION</label>
              <select id="city" name="city" defaultValue={city} className="field">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="max" className="text-[13px] tracking-wider text-muted">MAX PRICE (FROM)</label>
              <input id="max" name="max" type="range" min={0} max={20000} step={500} defaultValue={maxPrice} className="accent-accent" />
              <div className="flex justify-between text-[13px] text-muted">
                <span>LKR 0</span>
                <span className="text-ink">{formatLKR(maxPrice)}</span>
              </div>
            </div>

            <button type="submit" className="h-11 rounded-[10px] bg-accent font-bold text-accent-ink hover:bg-accent-hover">
              Apply filters
            </button>
          </aside>

          <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {selectedCats.map((c) => (
                  <span key={c} className="rounded-full bg-violet-line px-3 py-2 text-sm text-violet-tint">{c}</span>
                ))}
                {city !== "All cities" && (
                  <span className="rounded-full bg-violet-line px-3 py-2 text-sm text-violet-tint">{city}</span>
                )}
              </div>
              <label className="flex items-center gap-2.5 text-sm text-muted">
                Sort by
                <select name="sort" defaultValue={sort} className="field h-11 w-auto bg-surface">
                  <option value="date">Date (soonest)</option>
                  <option value="price">Price (low → high)</option>
                </select>
              </label>
            </div>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">
                No events match these filters.{" "}
                <Link href="/events" className="text-accent">Clear filters</Link>
              </div>
            ) : (
              events.map((e) => <EventRow key={e.id} event={e} />)
            )}
          </main>
        </form>
      </div>
    </>
  );
}
