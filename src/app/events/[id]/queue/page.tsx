import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HourglassIcon } from "@/components/icons";
import { fetchEvent } from "@/lib/api";

export const metadata: Metadata = { title: "Waiting room" };

/**
 * Virtual waiting room. Backend plan: user joins a Redis sorted set
 * (score = join time); an admission job lets users in batches and issues
 * an access token required by GET /events/{id}/seats.
 * Here: poll GET /queue/{eventId}/position (or a WS topic) and redirect when admitted.
 */
export default async function WaitingRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <span className="font-display text-2xl font-bold tracking-tight">
            stage<span className="text-accent">pass</span>
          </span>
          <span className="text-sm text-muted">{event.title} · {event.dateLabel}</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-[640px] flex-col items-center gap-7 text-center">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-violet-line">
            <div className="absolute -inset-0.5 animate-spin rounded-full border-2 border-transparent border-r-accent border-t-accent [animation-duration:2.4s]" />
            <HourglassIcon size={46} strokeWidth={1.8} className="text-accent" />
          </div>
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-4xl font-bold tracking-tight">You&apos;re in the queue</h1>
            <p className="text-[17px] leading-relaxed text-soft">
              Lots of people want tickets right now. Keep this tab open — we&apos;ll move you to seat
              selection automatically when it&apos;s your turn.
            </p>
          </div>

          <div className="flex w-full flex-col gap-5 rounded-[18px] border border-line bg-surface p-7" aria-live="polite">
            <div className="grid grid-cols-3 gap-4 text-left">
              <Stat label="YOUR POSITION" value="1,245" accent />
              <Stat label="AHEAD OF YOU" value="1,244" />
              <Stat label="EST. WAIT" value="~6 min" />
            </div>
            <div role="progressbar" aria-label="Queue progress" aria-valuenow={38} aria-valuemin={0} aria-valuemax={100} className="h-2.5 rounded-full bg-line">
              <div className="h-2.5 w-[38%] rounded-full bg-accent" />
            </div>
            <span className="text-sm text-muted">Last updated a few seconds ago</span>
          </div>

          <div className="flex w-full flex-col gap-2.5 rounded-[14px] border border-violet-line bg-violet-deep px-[22px] py-[18px] text-left text-[15px] text-[#D6D0EA]">
            <strong className="text-ink">Please don&apos;t refresh</strong>
            <span>Refreshing or opening a new tab may put you at the back of the line.</span>
          </div>

          <Link href={`/events/${id}/seats`} className="text-sm text-accent hover:text-accent-hover">
            (Dev) Skip to seat selection →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] tracking-wide text-muted">{label}</span>
      <strong className={`font-display text-2xl sm:text-4xl ${accent ? "text-accent" : ""}`}>{value}</strong>
    </div>
  );
}
