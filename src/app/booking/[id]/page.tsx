import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPoller } from "@/components/BookingPoller";
import { Header } from "@/components/Header";
import { CheckIcon } from "@/components/icons";
import { QrCode } from "@/components/QrCode";
import { formatShowTime } from "@/lib/adapters";
import { fetchOrder } from "@/lib/api";
import { formatLKR } from "@/lib/format";

export const metadata: Metadata = { title: "Your booking" };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) notFound();

  const d = formatShowTime(order.showStartsAt);
  const doors = order.doorsOpenAt ? formatShowTime(order.doorsOpenAt).time : null;
  const tint = order.tintColor ?? "#4B2E83";

  if (order.status === "PENDING") {
    return (
      <>
        <Header showSearch={false} />
        <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center" aria-live="polite">
          <div className="h-[52px] w-[52px] animate-spin rounded-full border-[3px] border-line border-t-accent" />
          <h1 className="font-display text-3xl font-bold">Confirming your payment…</h1>
          <p className="text-soft">Waiting for confirmation from PayHere. This page updates by itself.</p>
          <BookingPoller />
        </main>
      </>
    );
  }

  if (order.status !== "CONFIRMED") {
    const refund = order.status === "FAILED";
    return (
      <>
        <Header showSearch={false} />
        <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">{refund ? "We couldn't complete this booking" : "This order has expired"}</h1>
          <p className="text-soft">
            {refund
              ? "Your payment went through, but the seats were taken before it was confirmed. You'll get a full refund."
              : "The seat hold ran out before payment was completed. No money was taken."}
          </p>
          <Link href={`/events/${order.eventSlug}/seats`} className="rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:bg-accent-hover">
            Pick seats again
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showSearch={false} />
      <main className="mx-auto flex max-w-[960px] flex-col gap-8 px-6 pb-[72px] pt-12">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-ok bg-ok-bg">
            <CheckIcon size={34} strokeWidth={2.5} className="text-ok" />
          </div>
          <h1 className="font-display text-[42px] font-bold tracking-tight">You&apos;re going!</h1>
          <p className="text-[17px] text-soft">
            Booking <strong className="text-ink">#{order.orderRef}</strong> confirmed. Tickets go to {order.contactEmail}.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {order.tickets.map((t) => (
            <article key={t.code} className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface">
              <div className="flex flex-col gap-1 px-6 py-[22px]" style={{ backgroundColor: tint }}>
                <span className="text-xs tracking-wider text-violet-tint">E-TICKET · {t.tier.toUpperCase()}</span>
                <strong className="font-display text-[22px]">{order.eventTitle}</strong>
                <span className="text-sm text-violet-tint">{d.dateLabel}{doors ? ` · Doors ${doors}` : ` · ${d.time}`}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 p-6">
                <QrCode label={`QR code for seat ${t.seat}`} />
                <div className="grid flex-[1_1_120px] grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-xs tracking-wide text-muted">ROW</span>
                    <div className="font-display text-[26px] font-bold">{t.seat.replace(/\d+$/, "")}</div>
                  </div>
                  <div>
                    <span className="text-xs tracking-wide text-muted">SEAT</span>
                    <div className="font-display text-[26px] font-bold">{t.seat.replace(/^\D+/, "")}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs tracking-wide text-muted">TICKET</span>
                    <div className="truncate font-mono text-xs text-soft" title={t.code}>{t.code.slice(0, 8).toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="rounded-xl bg-accent px-6 py-4 font-bold text-accent-ink hover:bg-accent-hover">Download PDF</button>
          <button type="button" className="rounded-xl border border-line-soft px-6 py-4 hover:border-soft">Add to calendar</button>
          <Link href="/tickets" className="rounded-xl border border-line-soft px-6 py-4 hover:border-soft">View my tickets</Link>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[18px] rounded-2xl border border-line bg-surface px-[26px] py-[22px] text-[15px]">
          <div><span className="text-[13px] text-muted">Paid</span><div><strong>{formatLKR(order.total)}</strong></div></div>
          <div><span className="text-[13px] text-muted">Includes fee</span><div>{formatLKR(order.serviceFee)}</div></div>
          <div><span className="text-[13px] text-muted">Venue</span><div>{order.venue}, {order.city}</div></div>
        </div>
      </main>
    </>
  );
}
