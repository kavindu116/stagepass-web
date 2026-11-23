/**
 * Browser-side API calls (Client Components). These go straight from the user's browser to
 * Spring Boot, so they need NEXT_PUBLIC_API_URL and the backend's CORS config.
 */
import { toSeatRows, type ApiHold, type ApiOrder, type ApiPaymentSession, type ApiSeatMap } from "./adapters";
import type { SeatRow } from "./types";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** RFC 9457 problem details from Spring, plus our extra "seats" field on 409. */
export interface Problem {
  status: number;
  title?: string;
  detail?: string;
  seats?: string[];
}

export type Result<T> = { ok: true; data: T } | { ok: false; problem: Problem };

async function call<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { Accept: "application/json", "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    if (res.ok) {
      const data = res.status === 204 ? (undefined as T) : ((await res.json()) as T);
      return { ok: true, data };
    }
    const problem = (await res.json().catch(() => ({}))) as Partial<Problem>;
    return { ok: false, problem: { ...problem, status: res.status } };
  } catch {
    return { ok: false, problem: { status: 0, detail: "Can't reach the server. Check your connection." } };
  }
}

export async function getSeatRows(showId: number): Promise<Result<SeatRow[]>> {
  const res = await call<ApiSeatMap>(`/api/shows/${showId}/seats`);
  return res.ok ? { ok: true, data: toSeatRows(res.data) } : res;
}

export function createHold(showId: number, seatIds: number[]): Promise<Result<ApiHold>> {
  return call<ApiHold>("/api/holds", { method: "POST", body: JSON.stringify({ showId, seatIds }) });
}

export function releaseHold(holdId: string): Promise<Result<void>> {
  return call<void>(`/api/holds/${encodeURIComponent(holdId)}`, { method: "DELETE" });
}

/** Server-Sent Events URL for live seat changes of one show. */
export function seatStreamUrl(showId: number): string {
  return `${BASE}/api/shows/${showId}/seats/stream`;
}

// ---------- Orders & payments (Phase 3) ----------

export interface CreateOrderBody {
  holdId: string;
  contact: { name: string; email: string; phone?: string };
  attendees?: { seat: string; name: string }[];
}

/** Idempotency-Key: a double-click or a retry returns the SAME order instead of creating a second one. */
export function createOrder(body: CreateOrderBody, idempotencyKey: string): Promise<Result<ApiOrder>> {
  return call<ApiOrder>("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function getOrder(orderRef: string): Promise<Result<ApiOrder>> {
  return call<ApiOrder>(`/api/orders/${encodeURIComponent(orderRef)}`);
}

export function createPaymentSession(orderRef: string): Promise<Result<ApiPaymentSession>> {
  return call<ApiPaymentSession>(`/api/orders/${encodeURIComponent(orderRef)}/payment-session`, { method: "POST" });
}

/** DEV ONLY: pretend to be PayHere calling our notify_url. */
export function simulatePayment(
  orderRef: string,
  outcome: "SUCCESS" | "FAILED" | "CANCELLED",
): Promise<Result<{ result: string; order: ApiOrder }>> {
  return call("/api/dev/payhere/simulate", { method: "POST", body: JSON.stringify({ orderRef, outcome }) });
}
