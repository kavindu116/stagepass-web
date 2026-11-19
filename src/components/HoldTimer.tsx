"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TimerIcon } from "./icons";

const EXPIRES_KEY = "stagepass.holdExpiresAt";
const HOLD_KEY = "stagepass.holdId";

/**
 * Countdown for the seat hold. The expiry comes from the backend (POST /api/holds -> expiresAt),
 * which matches the Redis TTL, so when this hits 00:00 the seats really are released.
 */
export function HoldTimer({ expiresAt, eventId }: { expiresAt?: number; eventId?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let target = expiresAt;
    if (!target) {
      try {
        const saved = Number(sessionStorage.getItem(EXPIRES_KEY));
        target = saved > 0 ? saved : Date.now() + 10 * 60 * 1000;
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

/** Remember the active hold (expiry for the timer, id so it can be released on "Change seats"). */
export function startHold(expiresAtIso: string, holdId: string) {
  try {
    sessionStorage.setItem(EXPIRES_KEY, String(Date.parse(expiresAtIso)));
    sessionStorage.setItem(HOLD_KEY, holdId);
  } catch {
    /* storage unavailable — timer falls back to 10 minutes */
  }
}

export function getStoredHoldId(): string | null {
  try {
    return sessionStorage.getItem(HOLD_KEY);
  } catch {
    return null;
  }
}

export function clearHold() {
  try {
    sessionStorage.removeItem(EXPIRES_KEY);
    sessionStorage.removeItem(HOLD_KEY);
  } catch {
    /* ignore */
  }
}
