import { formatLKR } from "@/lib/format";
import type { OrderDraft } from "@/lib/order";

export function OrderSummary({ order, compact = false }: { order: OrderDraft; compact?: boolean }) {
  const { event, lines, subtotal } = order;
  return (
    <div className="flex flex-col gap-4">
      {compact ? (
        <>
          <strong className="text-[17px]">Order summary</strong>
          <span className="text-sm text-muted">{event.title} · {event.dateLabel}</span>
        </>
      ) : (
        <div className="flex items-center gap-3.5">
          <div className="h-20 w-16 flex-none rounded-[10px]" style={{ backgroundColor: event.tint }} />
          <div className="flex flex-col gap-1">
            <strong>{event.title}</strong>
            <span className="text-[13px] text-muted">{event.dateLabel} · {event.time}</span>
            <span className="text-[13px] text-muted">{event.venue}, {event.city}</span>
          </div>
        </div>
      )}
      <div className="h-px bg-line" />
      {lines.map((l) => (
        <div key={l.seatId} className="flex justify-between text-[15px]">
          <span>{l.tier.name} · Seat {l.seatId}</span>
          <span>{formatLKR(l.tier.price)}</span>
        </div>
      ))}
      <div className="flex justify-between text-[15px] text-muted">
        <span>Service fee</span>
        <span>[LKR fee]</span>
      </div>
      <div className="h-px bg-line" />
      <div className="flex justify-between text-xl">
        <span>Total</span>
        <strong>{formatLKR(subtotal)} + fee</strong>
      </div>
    </div>
  );
}
