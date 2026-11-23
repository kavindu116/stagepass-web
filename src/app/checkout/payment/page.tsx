import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { HoldTimer } from "@/components/HoldTimer";
import { OrderSummary } from "@/components/OrderSummary";
import { PaymentForm } from "@/components/PaymentForm";
import { formatShowTime } from "@/lib/adapters";
import { fetchOrder } from "@/lib/api";
import { firstParam, formatLKR } from "@/lib/format";

export const metadata: Metadata = { title: "Payment" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function PaymentPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const order = await fetchOrder(firstParam(sp.order) ?? "");
  if (!order) redirect("/events");
  if (order.status === "CONFIRMED") redirect(`/booking/${order.orderRef}`);

  const cancelled = firstParam(sp.status) === "cancelled";
  const d = formatShowTime(order.showStartsAt);
  const payable = order.status === "PENDING" && Date.parse(order.holdExpiresAt) > Date.now();

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-6 py-4">
          <span className="font-display text-2xl font-bold tracking-tight">
            stage<span className="text-accent">pass</span>
          </span>
          <CheckoutSteps current={3} />
          {payable && <HoldTimer eventId={order.eventSlug} expiresAt={Date.parse(order.holdExpiresAt)} />}
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-6 pb-16 pt-9">
        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <h1 className="font-display text-[34px] font-bold tracking-tight">Payment</h1>
          <p className="text-sm text-muted">Order <strong className="text-ink">#{order.orderRef}</strong></p>

          {cancelled && payable && (
            <div role="alert" className="flex flex-col gap-2 rounded-[18px] border border-danger-line bg-danger-bg p-[22px]">
              <strong className="text-[#FFD0D0]">Payment cancelled</strong>
              <span className="text-sm leading-normal text-[#E8BDBD]">
                Your seats are still held until the timer runs out. You can try again.
              </span>
            </div>
          )}

          {payable ? (
            <PaymentForm orderRef={order.orderRef} amountLabel={formatLKR(order.total)} />
          ) : (
            <div className="flex flex-col gap-3 rounded-[18px] border border-line bg-surface p-7">
              <strong className="text-lg">This order can no longer be paid</strong>
              <span className="text-soft">
                {order.status === "PENDING" || order.status === "EXPIRED"
                  ? "Your 10-minute seat hold ran out, so the seats were released."
                  : `Order status: ${order.status}.`}
              </span>
              <Link href={`/events/${order.eventSlug}/seats`} className="self-start rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:bg-accent-hover">
                Pick seats again
              </Link>
            </div>
          )}
        </main>

        <aside className="flex flex-[1_1_340px] flex-col gap-5">
          <div className="rounded-[18px] border border-line bg-surface p-[26px]">
            <OrderSummary
              compact
              title={order.eventTitle}
              when={`${d.dateLabel} · ${d.time}`}
              where={`${order.venue}, ${order.city}`}
              tint={order.tintColor ?? "#33363F"}
              lines={order.items.map((i) => ({ seat: i.seat, tier: i.tier, price: i.price }))}
              subtotal={order.subtotal}
              serviceFee={order.serviceFee}
              total={order.total}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
