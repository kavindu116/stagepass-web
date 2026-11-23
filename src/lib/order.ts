import { holdSeatToTier } from "./adapters";
import { fetchEvent, fetchHold } from "./api";
import { firstParam } from "./format";
import type { EventItem, Tier } from "./types";

export interface OrderLine {
  seatId: string; // "C7"
  tier: Tier;
}

export interface OrderDraft {
  holdId: string;
  event: EventItem;
  lines: OrderLine[];
  subtotal: number;
  expiresAt: number; // ms epoch, from the Redis hold
}

/**
 * The checkout step, before an order exists: seats + prices come from the hold (GET /api/holds/{id}).
 * After "Continue to payment" the order (GET /api/orders/{ref}) takes over.
 */
export async function loadOrderDraft(
  sp: Record<string, string | string[] | undefined>,
): Promise<OrderDraft | null> {
  const holdId = firstParam(sp.hold);
  if (!holdId) return null;
  const hold = await fetchHold(holdId);
  if (!hold) return null; // expired or unknown
  const event = await fetchEvent(hold.eventSlug);
  if (!event) return null;
  return {
    holdId,
    event,
    lines: hold.seats.map((s) => ({ seatId: s.label, tier: holdSeatToTier(s) })),
    subtotal: hold.subtotal,
    expiresAt: Date.parse(hold.expiresAt),
  };
}
