import type {Metadata} from "next";
import Link from "next/link";
import {Header} from "@/components/Header";
import {EventRow} from "@/components/EventCard";
import {fetchEvents} from "@/lib/api";
import {firstParam, formatLKR} from "@/lib/format";
import type {Category} from "@/lib/types";

export const metadata: Metadata = {title: "All events"};

const CATEGORIES: { label: string; value: Category }[] = [
    {label: "Concerts", value: "Concert"},
    {label: "Festivals", value: "Festival"},
    {label: "Movies", value: "Movie"},
    {label: "Sports", value: "Sports"},
    {label: "Theatre & Comedy", value: "Theatre"},
];
const CITIES = ["All cities", "Colombo", "Kandy", "Galle", "Negombo"];
const PRICE_MAX = 20000;

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function EventsPage({searchParams}: { searchParams: SP }) {
    const sp = await searchParams;
    const q = firstParam(sp.q)?.trim() || undefined;
    const city = firstParam(sp.city) ?? "All cities";
    const maxParam = firstParam(sp.max);
    const maxPrice = maxParam ? Number(maxParam) : undefined;
    const sort = firstParam(sp.sort) ?? "date";
    const catParam = firstParam(sp.category);
    const category = CATEGORIES.some((c) => c.value === catParam) ? (catParam as Category) : undefined;

    // Filtering happens in the database (Spring Specifications), not in the browser.
    let events = await fetchEvents({
        category,
        city: city === "All cities" ? undefined : city,
        q,
        maxPrice: maxPrice !== undefined && maxPrice < PRICE_MAX ? maxPrice : undefined,
    });

    // Sorting the current page here; server-side sort by date/price comes with the next API iteration.
    if (sort === "price") events = [...events].sort((a, b) => a.priceFrom - b.priceFrom);

    return (
        <>
            <Header searchDefault={q}/>
            <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
                <h1 className="mb-1.5 font-display text-4xl font-bold tracking-tight">All events</h1>
                <p className="mb-7 text-muted">{events.length} events found</p>

                {/* Plain GET form: the URL holds the filter state, so results are shareable and server-rendered. */}
                <form action="/events" className="flex flex-wrap items-start gap-8">
                    {q && <input type="hidden" name="q" value={q}/>}

                    <aside
                        className="flex max-w-[300px] flex-[1_1_260px] flex-col gap-6 rounded-2xl border border-line bg-surface p-6">
                        <div className="flex items-center justify-between">
                            <strong className="text-[17px]">Filters</strong>
                            <Link href="/events" className="text-sm text-accent hover:text-accent-hover">Clear
                                all</Link>
                        </div>

                        <fieldset className="flex flex-col gap-3">
                            <legend className="mb-2.5 text-[13px] tracking-wider text-muted">CATEGORY</legend>
                            <label className="flex items-center gap-2.5">
                                <input type="radio" name="category" value="" defaultChecked={!category}
                                       className="h-[18px] w-[18px] accent-accent"/>
                                All categories
                            </label>
                            {CATEGORIES.map((c) => (
                                <label key={c.value} className="flex items-center gap-2.5">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={c.value}
                                        defaultChecked={category === c.value}
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
                            <label htmlFor="max" className="text-[13px] tracking-wider text-muted">MAX PRICE
                                (FROM)</label>
                            <input
                                id="max"
                                name="max"
                                type="range"
                                min={0}
                                max={PRICE_MAX}
                                step={500}
                                defaultValue={maxPrice ?? PRICE_MAX}
                                className="accent-accent"
                            />
                            <div className="flex justify-between text-[13px] text-muted">
                                <span>LKR 0</span>
                                <span
                                    className="text-ink">{maxPrice !== undefined && maxPrice < PRICE_MAX ? formatLKR(maxPrice) : "Any"}</span>
                            </div>
                        </div>

                        <button type="submit"
                                className="h-11 rounded-[10px] bg-accent font-bold text-accent-ink hover:bg-accent-hover">
                            Apply filters
                        </button>
                    </aside>

                    <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {category && (
                                    <span
                                        className="rounded-full bg-violet-line px-3 py-2 text-sm text-violet-tint">{category}</span>
                                )}
                                {city !== "All cities" && (
                                    <span
                                        className="rounded-full bg-violet-line px-3 py-2 text-sm text-violet-tint">{city}</span>
                                )}
                                {q && <span
                                    className="rounded-full bg-violet-line px-3 py-2 text-sm text-violet-tint">&ldquo;{q}&rdquo;</span>}
                            </div>
                            <label className="flex items-center gap-2.5 text-sm text-muted">
                                Sort by
                                <select name="sort" defaultValue={sort} className="field h-11 w-auto bg-surface">
                                    <option value="date">Default</option>
                                    <option value="price">Price (low → high)</option>
                                </select>
                            </label>
                        </div>

                        {events.length === 0 ? (
                            <div
                                className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">
                                No events match these filters.{" "}
                                <Link href="/events" className="text-accent">Clear filters</Link>
                            </div>
                        ) : (
                            events.map((e) => <EventRow key={e.id} event={e}/>)
                        )}
                    </main>
                </form>
            </div>
        </>
    );
}
