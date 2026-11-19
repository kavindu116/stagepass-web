import { holdSeatToTier } from "./adapters";
import { fetchEvent, fetchHold } from "./api";
import { firstParam, parseSeatIds } from "./format";
import { tierForSeat } from "./mock-data";
import type { EventItem, Tier } from "./types";

export interface OrderLine {
  seatId: string; // "C7"
  tier: Tier;
}

export interface OrderDraft {
  event: EventItem;
  lines: OrderLine[];
  subtotal: number;
  query: string; // carries the order between checkout steps
  expiresAt?: number; // ms epoch, from the real hold
}

/**
 * Builds the checkout summary.
 *  - ?hold={holdId}         -> REAL: seats + prices come from the Redis hold (GET /api/holds/{id})
 *  - ?event=..&seats=C7,C8  -> legacy mock path (still used by "View QR" on My Tickets until Phase 3)
 * Phase 3 replaces this with GET /api/orders/{orderId}.
 */
export async function loadOrderDraft(
  sp: Record<string, string | string[] | undefined>,
): Promise<OrderDraft | null> {
  const holdId = firstParam(sp.hold);
  if (holdId) {
    const hold = await fetchHold(holdId);
    if (!hold) return null; // expired or unknown
    const event = await fetchEvent(hold.eventSlug);
    if (!event) return null;
    return {
      event,
      lines: hold.seats.map((s) => ({ seatId: s.label, tier: holdSeatToTier(s) })),
      subtotal: hold.subtotal,
      query: `hold=${encodeURIComponent(holdId)}`,
      expiresAt: Date.parse(hold.expiresAt),
    };
  }

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
