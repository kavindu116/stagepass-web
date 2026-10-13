import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { CheckIcon } from "@/components/icons";
import { QrCode } from "@/components/QrCode";
import { formatLKR } from "@/lib/format";
import { loadOrderDraft } from "@/lib/order";

export const metadata: Metadata = { title: "Booking confirmed" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** TODO (backend): GET /bookings/{id} -> tickets with signed QR tokens. */
export default async function BookingConfirmedPage({ params, searchParams }: Props) {
  const { id } = await params;
  const order = await loadOrderDraft(await searchParams);
  if (!order) redirect("/tickets");
  const { event, lines, subtotal } = order;

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
            Booking <strong className="text-ink">#{id}</strong> confirmed. We&apos;ve emailed your tickets.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {lines.map((l) => (
            <article key={l.seatId} className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-surface">
              <div className="flex flex-col gap-1 px-6 py-[22px]" style={{ backgroundColor: event.tint }}>
                <span className="text-xs tracking-wider text-violet-tint">E-TICKET · {l.tier.name.toUpperCase()}</span>
                <strong className="font-display text-[22px]">{event.title}</strong>
                <span className="text-sm text-violet-tint">{event.dateLabel} · Doors {event.doors}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 p-6">
                <QrCode label={`QR code for seat ${l.seatId}`} />
                <div className="grid flex-[1_1_120px] grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-xs tracking-wide text-muted">ROW</span>
                    <div className="font-display text-[26px] font-bold">{l.seatId.charAt(0)}</div>
                  </div>
                  <div>
                    <span className="text-xs tracking-wide text-muted">SEAT</span>
                    <div className="font-display text-[26px] font-bold">{l.seatId.slice(1)}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs tracking-wide text-muted">GATE</span>
                    <div className="text-[15px]">[Gate / entrance]</div>
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
          <div><span className="text-[13px] text-muted">Paid</span><div><strong>{formatLKR(subtotal)} + fee</strong></div></div>
          <div><span className="text-[13px] text-muted">Method</span><div>Card ending ••[XXXX]</div></div>
          <div><span className="text-[13px] text-muted">Venue</span><div>{event.venue}, {event.city}</div></div>
        </div>
      </main>
    </>
  );
}
