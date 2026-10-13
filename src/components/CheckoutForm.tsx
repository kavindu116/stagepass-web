"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface Props {
  seatIds: string[];
  nextHref: string;
  defaultName?: string;
}

/**
 * Contact + attendee details.
 * TODO (backend): on submit, POST /orders { holdId, contact, attendees }
 * -> { orderId, status: "PENDING" }, then go to /checkout/payment?order={orderId}.
 * Personal details go in the request body, never in the URL.
 */
export function CheckoutForm({ seatIds, nextHref, defaultName }: Props) {
  const router = useRouter();
  const [sendAllToMe, setSendAllToMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!data.get("terms")) {
      setError("Please accept the terms and refund policy to continue.");
      return;
    }
    setError(null);
    router.push(nextHref);
  }

  return (
    <form id="checkout-form" onSubmit={onSubmit} className="flex flex-col gap-6" noValidate={false}>
      <section className="flex flex-col gap-[18px] rounded-[18px] border border-line bg-surface p-7">
        <div>
          <h2 className="text-lg font-bold">Contact details</h2>
          <p className="mt-1 text-sm text-muted">Your tickets will be sent here.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <Field id="fullName" label="Full name" defaultValue={defaultName} required autoComplete="name" />
          <Field id="phone" label="Mobile number" placeholder="+94 7X XXX XXXX" type="tel" required autoComplete="tel" />
          <div className="col-span-full">
            <Field id="email" label="Email" placeholder="you@example.com" type="email" required autoComplete="email" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-7">
        <h2 className="text-lg font-bold">Attendees</h2>
        <label className="flex items-center gap-2.5 text-[15px]">
          <input
            type="checkbox"
            checked={sendAllToMe}
            onChange={(e) => setSendAllToMe(e.target.checked)}
            className="h-[18px] w-[18px] accent-accent"
          />
          Send all tickets to me
        </label>
        {!sendAllToMe && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {seatIds.map((id) => (
              <Field key={id} id={`attendee-${id}`} label={`Seat ${id} – name (optional)`} />
            ))}
          </div>
        )}
      </section>

      <label className="flex items-start gap-2.5 text-sm leading-normal text-soft">
        <input type="checkbox" name="terms" className="mt-0.5 h-[18px] w-[18px] accent-accent" />
        <span>
          I agree to the <a href="#" className="text-accent">terms</a> and{" "}
          <a href="#" className="text-accent">refund policy</a>.
        </span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  ...input
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-soft">{label}</label>
      <input id={id} name={id} className="field" {...input} />
    </div>
  );
}
