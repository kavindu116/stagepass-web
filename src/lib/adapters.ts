/**
 * Backend DTO  ->  UI model (EventItem).
 * The Spring Boot API returns clean data (ISO UTC instants, enums, numbers);
 * everything display-specific (Colombo time, "SAT 14 DEC", labels) happens here.
 * Pages keep using EventItem, so none of them had to change.
 */
import type { Booking, Category, EventItem, EventStatus, SeatRow, SeatStatus, Show, Tier } from "./types";

// ---------- Backend response shapes (match the Java records) ----------

export type ApiCategory = "CONCERT" | "FESTIVAL" | "MOVIE" | "SPORTS" | "THEATRE";
export type ApiAvailability = "AVAILABLE" | "SELLING_FAST" | "SOLD_OUT";
export type ApiSaleMode = "DIRECT" | "QUEUE";

export interface ApiPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiEventSummary {
  id: number;
  slug: string;
  title: string;
  shortLabel: string | null;
  category: ApiCategory;
  tintColor: string | null;
  posterUrl: string | null;
  venueName: string;
  city: string;
  firstShowAt: string | null;
  priceFrom: number | null;
  saleMode: ApiSaleMode;
  availability: ApiAvailability;
}

export interface ApiShow {
  id: number;
  label: string | null;
  startsAt: string;
  doorsOpenAt: string | null;
  status: "SCHEDULED" | "SOLD_OUT" | "CANCELLED" | "COMPLETED";
  availableSeats: number;
  availability: ApiAvailability;
}

export interface ApiTier {
  id: number;
  name: string;
  price: number;
  currency: string;
  color: string;
}

export interface ApiEventDetail {
  id: number;
  slug: string;
  title: string;
  shortLabel: string | null;
  category: ApiCategory;
  description: string | null;
  posterUrl: string | null;
  tintColor: string | null;
  ageRestriction: string;
  saleMode: ApiSaleMode;
  maxTicketsPerOrder: number;
  priceFrom: number | null;
  venue: { id: number; name: string; address: string; city: string; latitude: number | null; longitude: number | null };
  shows: ApiShow[];
  tiers: ApiTier[];
}

// ---------- Formatting (always Sri Lanka time, whatever the server's TZ is) ----------

const TZ = "Asia/Colombo";

const dateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function parts(iso: string) {
  const p = Object.fromEntries(dateParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { weekday: p.weekday, day: p.day, month: p.month, year: p.year };
}

/** "2026-12-14T13:30:00Z" -> { day: "14", month: "DEC", dateLabel: "Sun, 14 Dec 2026", time: "7:00 PM" } */
export function formatShowTime(iso: string) {
  const { weekday, day, month, year } = parts(iso);
  return {
    day,
    month: month.toUpperCase(),
    dateLabel: `${weekday}, ${day} ${month} ${year}`,
    shortDate: `${weekday}, ${day} ${month}`,
    time: timeFmt.format(new Date(iso)),
  };
}

// ---------- Mappers ----------

const CATEGORY: Record<ApiCategory, Category> = {
  CONCERT: "Concert",
  FESTIVAL: "Festival",
  MOVIE: "Movie",
  SPORTS: "Sports",
  THEATRE: "Theatre",
};

export function toStatus(saleMode: ApiSaleMode, availability: ApiAvailability): EventStatus {
  if (availability === "SOLD_OUT") return "sold-out";
  if (saleMode === "QUEUE") return "queue";
  if (availability === "SELLING_FAST") return "selling-fast";
  return "available";
}

const EMPTY_DATE = { day: "--", month: "TBA", dateLabel: "Date TBA", shortDate: "TBA", time: "" };

export function toEventItemFromSummary(e: ApiEventSummary): EventItem {
  const d = e.firstShowAt ? formatShowTime(e.firstShowAt) : EMPTY_DATE;
  return {
    id: e.slug,                                  // URLs use the slug: /events/{slug}
    title: e.title,
    short: e.shortLabel ?? e.title.split(" ")[0].toUpperCase(),
    category: CATEGORY[e.category],
    day: d.day,
    month: d.month,
    dateLabel: d.dateLabel,
    time: d.time,
    doors: "",
    venue: e.venueName,
    venueAddress: "",
    city: e.city,
    priceFrom: e.priceFrom ?? 0,
    tint: e.tintColor ?? "#33363F",
    status: toStatus(e.saleMode, e.availability),
    description: "",
    shows: [],
    tiers: [],
  };
}

function toShow(s: ApiShow): Show {
  const d = formatShowTime(s.startsAt);
  const soldOut = s.status === "SOLD_OUT" || s.availability === "SOLD_OUT";
  return {
    id: String(s.id),
    dateLabel: d.shortDate,
    timeLabel: soldOut ? "Sold out" : [d.time, s.label].filter(Boolean).join(" · "),
    soldOut,
  };
}

function toTier(t: ApiTier): Tier {
  return {
    // Until the seat API exists (Phase 2) the mock seat map refers to tiers by lowercase name
    // ("vip", "gold" ...), so the id must match that.
    id: t.name.toLowerCase(),
    name: t.name,
    price: t.price,
    color: t.color,
    remaining: "",
  };
}

export function toEventItemFromDetail(e: ApiEventDetail): EventItem {
  const bookable = e.shows.filter((s) => s.status !== "CANCELLED");
  const first = bookable[0] ?? e.shows[0];
  const d = first ? formatShowTime(first.startsAt) : EMPTY_DATE;
  const doors = first?.doorsOpenAt ? formatShowTime(first.doorsOpenAt).time : "";

  const allSoldOut = e.shows.length > 0 && e.shows.every((s) => s.availability === "SOLD_OUT");
  const anySellingFast = e.shows.some((s) => s.availability === "SELLING_FAST");
  const availability: ApiAvailability = allSoldOut ? "SOLD_OUT" : anySellingFast ? "SELLING_FAST" : "AVAILABLE";

  return {
    id: e.slug,
    title: e.title,
    short: e.shortLabel ?? e.title.split(" ")[0].toUpperCase(),
    category: CATEGORY[e.category],
    day: d.day,
    month: d.month,
    dateLabel: d.dateLabel,
    time: d.time,
    doors,
    venue: e.venue.name,
    venueAddress: e.venue.address,
    city: e.venue.city,
    priceFrom: e.priceFrom ?? 0,
    tint: e.tintColor ?? "#33363F",
    status: toStatus(e.saleMode, availability),
    description: e.description ?? "",
    shows: e.shows.map(toShow),
    tiers: e.tiers.map(toTier),
  };
}

// ---------- Seats & holds (Phase 2) ----------

export type ApiSeatState = "AVAILABLE" | "HELD" | "SOLD" | "BLOCKED";

export interface ApiSeatMap {
  showId: number;
  eventSlug: string;
  maxSeatsPerOrder: number;
  rows: {
    label: string;
    seats: { id: number; label: string; row: string; number: number; posX: number; tier: string; status: ApiSeatState }[];
  }[];
}

export interface ApiHold {
  holdId: string;
  showId: number;
  eventSlug: string;
  expiresAt: string;
  seats: { id: number; label: string; tier: string; price: number; color: string }[];
  subtotal: number;
}

export const SEAT_STATUS: Record<ApiSeatState, SeatStatus> = {
  AVAILABLE: "available",
  HELD: "held",
  SOLD: "sold",
  BLOCKED: "sold", // not sellable -> drawn like sold
};

export function toSeatRows(map: ApiSeatMap): SeatRow[] {
  return map.rows.map((r) => ({
    label: r.label,
    seats: r.seats.map((s) => ({
      id: s.label,
      row: s.row,
      number: s.number,
      tierId: s.tier.toLowerCase(), // matches toTier() ids
      status: SEAT_STATUS[s.status],
      showSeatId: s.id,
      posX: s.posX,
    })),
  }));
}

export function holdSeatToTier(s: ApiHold["seats"][number]): Tier {
  return { id: s.tier.toLowerCase(), name: s.tier, price: s.price, color: s.color, remaining: "" };
}

/** One live update from GET /api/shows/{id}/seats/stream (event name "seats"). */
export interface ApiSeatUpdate {
  showId: number;
  status: ApiSeatState;
  seatIds: number[];
}

// ---------- Orders & payments (Phase 3) ----------

export type ApiOrderStatus = "PENDING" | "CONFIRMED" | "EXPIRED" | "FAILED" | "CANCELLED" | "REFUNDED";

export interface ApiOrder {
  orderRef: string;
  status: ApiOrderStatus;
  eventSlug: string;
  eventTitle: string;
  tintColor: string | null;
  showStartsAt: string;
  doorsOpenAt: string | null;
  venue: string;
  city: string;
  items: { seat: string; tier: string; price: number; color: string; attendeeName: string | null }[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  currency: string;
  contactEmail: string;
  holdExpiresAt: string;
  confirmedAt: string | null;
  tickets: { code: string; seat: string; tier: string; status: "VALID" | "USED" | "CANCELLED" }[];
}

export interface ApiMyOrder {
  orderRef: string;
  status: ApiOrderStatus;
  eventSlug: string;
  eventTitle: string;
  tintColor: string | null;
  showStartsAt: string;
  venue: string;
  city: string;
  seats: string[];
  seatSummary: string;
  total: number;
}

export interface ApiPaymentSession {
  mode: "SIMULATOR" | "SANDBOX";
  actionUrl: string;
  fields: Record<string, string>;
}

/** GET /api/me/orders row -> the existing "My Tickets" card model. */
export function toBooking(o: ApiMyOrder, now: number = Date.now()): Booking {
  const d = formatShowTime(o.showStartsAt);
  const upcoming = Date.parse(o.showStartsAt) > now;
  return {
    id: o.orderRef,
    eventId: o.eventSlug,
    title: o.eventTitle,
    day: d.day,
    month: d.month,
    venue: `${o.venue}, ${o.city}`,
    time: d.time,
    seatsLabel: `${o.seatSummary} · ${o.seats.join(", ")}`,
    status: o.status === "REFUNDED" ? "REFUNDED" : upcoming ? "CONFIRMED" : "ATTENDED",
    tint: o.tintColor ?? "#33363F",
    upcoming: upcoming && o.status !== "REFUNDED",
  };
}
