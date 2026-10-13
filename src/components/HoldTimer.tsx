"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TimerIcon } from "./icons";

const STORAGE_KEY = "stagepass.holdExpiresAt";

/**
 * Countdown for the 10-minute seat hold.
 * Mirrors the Redis TTL on the backend. When the real API exists, use the
 * `expiresAt` returned by POST /holds instead of the sessionStorage fallback.
 */
export function HoldTimer({ expiresAt, eventId }: { expiresAt?: number; eventId?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let target = expiresAt;
    if (!target) {
      try {
        const saved = Number(sessionStorage.getItem(STORAGE_KEY));
        target = saved > Date.now() ? saved : Date.now() + 10 * 60 * 1000;
        sessionStorage.setItem(STORAGE_KEY, String(target));
      } catch {
        target = Date.now() + 10 * 60 * 1000;
      }
    }
    const tick = () => setRemaining(Math.max(0, Math.round((target! - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === 0) {
    return (
      <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger-line bg-danger-bg px-4 py-2.5 text-sm text-danger">
        Hold expired —
        <Link href={eventId ? `/events/${eventId}/seats` : "/events"} className="font-bold text-danger underline">
          pick seats again
        </Link>
      </div>
    );
  }

  const mm = String(Math.floor((remaining ?? 600) / 60)).padStart(2, "0");
  const ss = String((remaining ?? 600) % 60).padStart(2, "0");

  return (
    <div
      role="timer"
      aria-label="Seat hold time remaining"
      className="flex items-center gap-2.5 rounded-xl border border-warn-line bg-warn-bg px-4 py-2.5 text-warn"
    >
      <TimerIcon size={18} />
      <span className="text-sm">Seats held for</span>
      <strong className="font-display text-xl tabular-nums text-warn-strong">
        {mm}:{ss}
      </strong>
    </div>
  );
}

export function startHold() {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now() + 10 * 60 * 1000));
  } catch {
    /* storage unavailable — timer falls back to a fresh 10 minutes */
  }
}

export function clearHold() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
