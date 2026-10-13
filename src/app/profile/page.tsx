import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { CURRENT_USER } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Profile" };

const notifications = [
  { id: "n-booking", title: "Booking confirmations", sub: "Tickets and receipts by email", on: true },
  { id: "n-onsale", title: "On-sale alerts", sub: "When artists you follow announce shows", on: true },
  { id: "n-reminder", title: "Event reminders", sub: "SMS one day before the show", on: false },
];

/** TODO (backend): GET/PUT /me, PUT /me/notifications. */
export default function ProfilePage() {
  return (
    <>
      <Header showSearch={false} active="profile" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-6 pb-[72px] pt-9">
        <nav aria-label="Account" className="flex max-w-[280px] flex-[1_1_240px] flex-col gap-1">
          <div className="flex items-center gap-3.5 pb-[22px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-line font-display text-[22px] font-bold">
              {CURRENT_USER.initial}
            </div>
            <div className="flex flex-col">
              <strong>{CURRENT_USER.name}</strong>
              <span className="text-[13px] text-muted">Member since {CURRENT_USER.memberSince}</span>
            </div>
          </div>
          <Link href="/profile" aria-current="page" className="rounded-[10px] border border-line bg-surface px-4 py-3 font-bold">Personal details</Link>
          <Link href="#" className="rounded-[10px] px-4 py-3 text-soft hover:text-ink">Password &amp; security</Link>
          <Link href="#notifications" className="rounded-[10px] px-4 py-3 text-soft hover:text-ink">Notifications</Link>
          <Link href="/tickets" className="rounded-[10px] px-4 py-3 text-soft hover:text-ink">My tickets</Link>
          <Link href="/login" className="rounded-[10px] px-4 py-3 text-[#FF9A9A]">Sign out</Link>
        </nav>

        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          <h1 className="font-display text-[32px] font-bold tracking-tight">Personal details</h1>

          <form className="flex flex-col gap-[18px] rounded-[18px] border border-line bg-surface p-7">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
              <Field id="name" label="Full name" defaultValue={CURRENT_USER.name} autoComplete="name" />
              <Field id="phone" label="Mobile number" placeholder="+94 7X XXX XXXX" type="tel" autoComplete="tel" />
              <Field id="email" label="Email" placeholder="you@example.com" type="email" autoComplete="email" />
              <div className="flex flex-col gap-2">
                <label htmlFor="city" className="text-sm text-soft">City</label>
                <select id="city" name="city" className="field">
                  <option>Colombo</option><option>Kandy</option><option>Galle</option><option>Negombo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="reset" className="rounded-[10px] border border-line-soft px-5 py-3 hover:border-soft">Cancel</button>
              <button type="submit" className="rounded-[10px] bg-accent px-[22px] py-3 font-bold text-accent-ink hover:bg-accent-hover">Save changes</button>
            </div>
          </form>

          <section id="notifications" className="flex flex-col gap-1.5 rounded-[18px] border border-line bg-surface p-7">
            <h2 className="mb-2.5 text-lg font-bold">Notifications</h2>
            {notifications.map((n, i) => (
              <label
                key={n.id}
                className={`flex items-center justify-between gap-4 py-3.5 ${i < notifications.length - 1 ? "border-b border-line" : ""}`}
              >
                <span className="flex flex-col gap-0.5">
                  <span>{n.title}</span>
                  <span className="text-[13px] text-muted">{n.sub}</span>
                </span>
                <input type="checkbox" defaultChecked={n.on} className="h-[22px] w-[22px] accent-accent" />
              </label>
            ))}
          </section>

          <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-danger-line px-7 py-6">
            <div className="flex flex-col gap-1">
              <strong>Delete account</strong>
              <span className="text-sm text-muted">Permanently remove your account and ticket history.</span>
            </div>
            <button type="button" className="rounded-[10px] border border-[#8A3A3A] px-[18px] py-3 text-[#FFB0B0] hover:bg-danger-bg">
              Delete account
            </button>
          </section>
        </main>
      </div>
    </>
  );
}

function Field({ id, label, ...input }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-soft">{label}</label>
      <input id={id} name={id} className="field" {...input} />
    </div>
  );
}
