"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BankIcon, CardIcon, LockIcon, PhoneIcon } from "./icons";
import { clearHold } from "./HoldTimer";

const METHODS = [
  { id: "card", title: "Credit / debit card", sub: "Visa, Mastercard, Amex", Icon: CardIcon },
  { id: "wallet", title: "Mobile wallet", sub: "[Wallet options]", Icon: PhoneIcon },
  { id: "bank", title: "Online banking", sub: "[Supported banks]", Icon: BankIcon },
] as const;

/**
 * TODO (backend): on Pay, call POST /payments/{orderId}/session to get the
 * gateway (PayHere / Stripe) redirect URL and send the user there. The gateway
 * redirects back here; then poll GET /orders/{orderId} until the webhook has
 * marked it CONFIRMED (or FAILED -> ?status=failed).
 */
export function PaymentForm({ amountLabel, successHref }: { amountLabel: string; successHref: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("card");
  const [processing, setProcessing] = useState(false);

  function pay() {
    setProcessing(true);
    // Simulated gateway round-trip + webhook confirmation
    setTimeout(() => {
      clearHold();
      router.push(successHref);
    }, 1500);
  }

  if (processing) {
    return (
      <div className="flex flex-col items-center gap-3.5 rounded-[18px] border border-line bg-surface p-10 text-center" aria-live="polite">
        <div className="h-[52px] w-[52px] animate-spin rounded-full border-[3px] border-line border-t-accent" />
        <strong className="text-[17px]">Confirming your payment…</strong>
        <span className="text-sm leading-normal text-muted">
          Waiting for confirmation from the bank. Don&apos;t close this page.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3.5">
        <legend className="sr-only">Payment method</legend>
        {METHODS.map(({ id, title, sub, Icon }) => {
          const active = method === id;
          return (
            <label
              key={id}
              className={`flex cursor-pointer items-center gap-4 rounded-2xl p-[22px] ${
                active ? "border-2 border-accent bg-violet-select" : "border border-line-strong bg-surface hover:border-line-soft"
              }`}
            >
              <input
                type="radio"
                name="method"
                value={id}
                checked={active}
                onChange={() => setMethod(id)}
                className="h-5 w-5 accent-accent"
              />
              <Icon size={30} strokeWidth={1.8} className={active ? "text-accent" : "text-soft"} />
              <div className="flex flex-1 flex-col gap-0.5">
                <strong className="text-[17px]">{title}</strong>
                <span className={`text-sm ${active ? "text-soft" : "text-muted"}`}>{sub}</span>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="flex items-start gap-3.5 rounded-[14px] border border-line bg-surface px-[22px] py-[18px] text-sm leading-relaxed text-soft">
        <LockIcon size={22} className="mt-px flex-none text-ok" />
        <span>
          You&apos;ll be taken to our payment partner&apos;s secure page to enter your card. Stagepass never sees or
          stores your card number.
        </span>
      </div>

      <button
        type="button"
        onClick={pay}
        className="rounded-xl bg-accent p-[18px] text-[17px] font-bold text-accent-ink hover:bg-accent-hover"
      >
        Pay {amountLabel}
      </button>
    </div>
  );
}
