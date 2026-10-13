import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { CheckoutForm } from "@/components/CheckoutForm";
import { HoldTimer } from "@/components/HoldTimer";
import { OrderSummary } from "@/components/OrderSummary";
import { CURRENT_USER } from "@/lib/mock-data";
import { loadOrderDraft } from "@/lib/order";

export const metadata: Metadata = { title: "Checkout" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutPage({ searchParams }: { searchParams: SP }) {
  const order = await loadOrderDraft(await searchParams);
  if (!order) redirect("/events");

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-6 py-4">
          <span className="font-display text-2xl font-bold tracking-tight">
            stage<span className="text-accent">pass</span>
          </span>
          <CheckoutSteps current={2} />
          <HoldTimer eventId={order.event.id} />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-6 pb-16 pt-9">
        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <h1 className="font-display text-[34px] font-bold tracking-tight">Checkout</h1>
          <CheckoutForm
            seatIds={order.lines.map((l) => l.seatId)}
            nextHref={`/checkout/payment?${order.query}`}
            defaultName={CURRENT_USER.name}
          />
        </main>

        <aside className="flex flex-[1_1_340px] flex-col gap-[18px] rounded-[18px] border border-line bg-surface p-[26px]">
          <OrderSummary order={order} />
          <div className="flex gap-2">
            <label htmlFor="promo" className="sr-only">Promo code</label>
            <input id="promo" placeholder="Promo code" className="field h-[46px] min-w-0 flex-1" />
            <button type="button" className="h-[46px] rounded-[10px] border border-line-soft px-4 hover:border-soft">Apply</button>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className="rounded-xl bg-accent p-4 font-bold text-accent-ink hover:bg-accent-hover"
          >
            Continue to payment
          </button>
          <Link href={`/events/${order.event.id}/seats`} className="text-center text-sm text-muted hover:text-ink">
            Change seats
          </Link>
        </aside>
      </div>
    </>
  );
}
