/**
 * Browser-side API calls (Client Components). These go straight from the user's browser to
 * Spring Boot, so they need NEXT_PUBLIC_API_URL and the backend's CORS config.
 */
import { toSeatRows, type ApiHold, type ApiSeatMap } from "./adapters";
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
