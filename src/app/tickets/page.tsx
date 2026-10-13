import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TicketsTabs } from "@/components/TicketsTabs";
import { fetchMyBookings } from "@/lib/api";

export const metadata: Metadata = { title: "My Tickets" };

export default async function TicketsPage() {
  const bookings = await fetchMyBookings();

  return (
    <>
      <Header showSearch={false} active="tickets" />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-[72px] pt-9">
        <h1 className="font-display text-4xl font-bold tracking-tight">My Tickets</h1>
        <TicketsTabs bookings={bookings} />
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-dashed border-line-strong p-7">
          <div className="flex flex-col gap-1">
            <strong>Looking for more?</strong>
            <span className="text-[15px] text-muted">Find your next night out.</span>
          </div>
          <Link href="/events" className="rounded-[10px] border border-line-soft px-5 py-3 hover:border-soft">Browse events</Link>
        </div>
      </main>
    </>
  );
}
