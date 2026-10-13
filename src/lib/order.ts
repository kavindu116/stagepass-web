import { fetchEvent } from "./api";
import { firstParam, parseSeatIds } from "./format";
import { tierForSeat } from "./mock-data";
import type { EventItem, Tier } from "./types";

export interface OrderLine {
  seatId: string;
  tier: Tier;
}

export interface OrderDraft {
  event: EventItem;
  lines: OrderLine[];
  subtotal: number;
  query: string; // "event=..&seats=.." to carry the order between steps
}

/**
 * Rebuilds the order from ?event=&seats= query params.
 * With the real backend this becomes GET /orders/{orderId}.
 */
export async function loadOrderDraft(
  sp: Record<string, string | string[] | undefined>,
): Promise<OrderDraft | null> {
  const eventId = firstParam(sp.event);
  const seatIds = parseSeatIds(firstParam(sp.seats));
  if (!eventId || seatIds.length === 0) return null;
  const event = await fetchEvent(eventId);
  if (!event) return null;
  const lines = seatIds.map((seatId) => ({ seatId, tier: tierForSeat(seatId) }));
  return {
    event,
    lines,
    subtotal: lines.reduce((s, l) => s + l.tier.price, 0),
    query: `event=${encodeURIComponent(eventId)}&seats=${seatIds.join(",")}`,
  };
}
