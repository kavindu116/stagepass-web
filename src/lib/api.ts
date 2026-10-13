/**
 * API layer. Pages import from here, never from mock-data directly,
 * so switching to the Spring Boot backend is a one-file change.
 *
 * When the backend is ready, set NEXT_PUBLIC_API_URL (e.g. http://localhost:8080/api)
 * and replace each mock return with a fetch, e.g.:
 *
 *   const res = await fetch(`${API_URL}/events/${id}`, { cache: "no-store" });
 *   if (!res.ok) return undefined;
 *   return res.json();
 *
 * Planned endpoints (from the booking flow):
 *   GET  /events                     -> EventItem[]
 *   GET  /events/{id}                -> EventItem
 *   GET  /events/{id}/seats          -> SeatRow[]   (+ WS topic /topic/event/{id}/seats)
 *   POST /holds                      -> { holdId, expiresAt }   (Redis SET NX EX 600)
 *   POST /orders                     -> { orderId, status: "PENDING" }
 *   POST /payments/webhook           (gateway -> backend, idempotent)
 *   GET  /me/bookings                -> Booking[]
 */
import * as mock from "./mock-data";
import type { Booking, EventItem, SeatRow } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchEvents(): Promise<EventItem[]> {
  return mock.getEvents();
}

export async function fetchEvent(id: string): Promise<EventItem | undefined> {
  return mock.getEvent(id);
}

export async function fetchSeatMap(eventId: string): Promise<SeatRow[]> {
  return mock.getSeatMap(eventId);
}

export async function fetchMyBookings(): Promise<Booking[]> {
  return mock.BOOKINGS;
}
