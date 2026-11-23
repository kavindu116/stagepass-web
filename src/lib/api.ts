/**
 * Server-side API layer (used by Server Components — runs on the Next.js server).
 * Browser-side calls (seat polling, POST /holds) live in client-api.ts.
 *
 * LIVE: events, event details, seat map, holds, orders, My Tickets
 */
import {
  toBooking,
  toEventItemFromDetail,
  toEventItemFromSummary,
  toSeatRows,
  type ApiEventDetail,
  type ApiEventSummary,
  type ApiHold,
  type ApiMyOrder,
  type ApiOrder,
  type ApiPage,
  type ApiSeatMap,
} from "./adapters";
import type { Booking, Category, EventItem, SeatRow } from "./types";

export const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiGet<T>(path: string): Promise<T | undefined> {
  let res: Response;
  try {
    // no-store: seat availability changes all the time, never serve a cached copy
    res = await fetch(`${API_URL}${path}`, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError(`Cannot reach the Stagepass API at ${API_URL}. Is the backend running?`);
  }
  if (res.status === 404) return undefined;
  if (!res.ok) {
    // Spring returns RFC 9457 problem details: { title, status, detail }
    const problem = await res.json().catch(() => null);
    throw new ApiError(problem?.detail ?? `API error ${res.status} for ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export interface EventQuery {
  category?: Category;
  city?: string;
  q?: string;
  maxPrice?: number;
  size?: number;
}

export async function fetchEvents(query: EventQuery = {}): Promise<EventItem[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.city) params.set("city", query.city);
  if (query.q) params.set("q", query.q);
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  params.set("size", String(query.size ?? 50));

  const page = await apiGet<ApiPage<ApiEventSummary>>(`/api/events?${params}`);
  return (page?.content ?? []).map(toEventItemFromSummary);
}

export async function fetchEvent(slug: string): Promise<EventItem | undefined> {
  const detail = await apiGet<ApiEventDetail>(`/api/events/${encodeURIComponent(slug)}`);
  return detail ? toEventItemFromDetail(detail) : undefined;
}

export interface SeatMapData {
  showId: number;
  maxSeatsPerOrder: number;
  rows: SeatRow[];
}

export async function fetchSeatMap(showId: string | number): Promise<SeatMapData | undefined> {
  const map = await apiGet<ApiSeatMap>(`/api/shows/${encodeURIComponent(String(showId))}/seats`);
  return map ? { showId: map.showId, maxSeatsPerOrder: map.maxSeatsPerOrder, rows: toSeatRows(map) } : undefined;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** undefined when the hold doesn't exist or has expired. */
export async function fetchHold(holdId: string): Promise<ApiHold | undefined> {
  if (!UUID_RE.test(holdId)) return undefined;
  return apiGet<ApiHold>(`/api/holds/${holdId}`);
}

const ORDER_REF_RE = /^SP-[A-Z0-9]{6}$/;

/** undefined when the order doesn't exist. */
export async function fetchOrder(orderRef: string): Promise<ApiOrder | undefined> {
  if (!ORDER_REF_RE.test(orderRef)) return undefined;
  return apiGet<ApiOrder>(`/api/orders/${orderRef}`);
}

/** My Tickets (the signed-in user's confirmed orders). */
export async function fetchMyBookings(): Promise<Booking[]> {
  const orders = await apiGet<ApiMyOrder[]>("/api/me/orders");
  return (orders ?? []).map((o) => toBooking(o));
}
