import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { HoldTimer } from "@/components/HoldTimer";
import { OrderSummary } from "@/components/OrderSummary";
import { PaymentForm } from "@/components/PaymentForm";
import { firstParam, formatLKR } from "@/lib/format";
import { loadOrderDraft } from "@/lib/order";

export const metadata: Metadata = { title: "Payment" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function PaymentPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const order = await loadOrderDraft(sp);
  if (!order) redirect("/events");
  const failed = firstParam(sp.status) === "failed";

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-6 py-4">
          <span className="font-display text-2xl font-bold tracking-tight">
            stage<span className="text-accent">pass</span>
          </span>
          <CheckoutSteps current={3} />
          <HoldTimer eventId={order.event.id} />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-6 pb-16 pt-9">
        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <h1 className="font-display text-[34px] font-bold tracking-tight">How would you like to pay?</h1>

          {failed && (
            <div role="alert" className="flex flex-col gap-2 rounded-[18px] border border-danger-line bg-danger-bg p-[22px]">
              <strong className="text-[#FFD0D0]">Payment didn&apos;t go through</strong>
              <span className="text-sm leading-normal text-[#E8BDBD]">
                Your seats are still held until the timer runs out. Try again or use a different method.
              </span>
            </div>
          )}

          <PaymentForm
            amountLabel={`${formatLKR(order.subtotal)} + fee`}
            successHref={`/booking/SP-1001?${order.query}`}
          />
          <Link href={`/checkout?${order.query}`} className="text-center text-sm text-muted hover:text-ink">
            ← Back to details
          </Link>
        </main>

        <aside className="flex flex-[1_1_340px] flex-col gap-5">
          <div className="rounded-[18px] border border-line bg-surface p-[26px]">
            <OrderSummary order={order} compact />
          </div>
        </aside>
      </div>
    </>
  );
}
