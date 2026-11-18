/**
 * API layer. Pages import from here, never from mock-data directly.
 *
 * LIVE (Spring Boot):  fetchEvents, fetchEvent
 * STILL MOCK:          fetchSeatMap  (Phase 2: seats + Redis holds)
 *                      fetchMyBookings (Phase 3/5: orders + auth)
 *
 * These run in Server Components, i.e. on the Next.js server -> the browser never
 * calls the backend directly for these, so CORS doesn't apply here.
 */
import {
  toEventItemFromDetail,
  toEventItemFromSummary,
  type ApiEventDetail,
  type ApiEventSummary,
  type ApiPage,
} from "./adapters";
import * as mock from "./mock-data";
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

// ---------- still mock ----------

export async function fetchSeatMap(eventId: string): Promise<SeatRow[]> {
  return mock.getSeatMap(eventId);
}

export async function fetchMyBookings(): Promise<Booking[]> {
  return mock.BOOKINGS;
}
