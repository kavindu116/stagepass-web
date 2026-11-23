"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Coming back from PayHere, the browser can arrive BEFORE PayHere's server notification.
 * While the order is PENDING, re-render the page every 2 s (up to ~1 minute).
 */
export function BookingPoller({ maxSeconds = 60 }: { maxSeconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started > maxSeconds * 1000) clearInterval(id);
      else router.refresh();
    }, 2000);
    return () => clearInterval(id);
  }, [router, maxSeconds]);
  return null;
}
