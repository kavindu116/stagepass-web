"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Rings } from "./icons";

/**
 * TODO (backend): POST /auth/login or /auth/register -> JWT (httpOnly cookie
 * set by the API). "Continue with Google" -> Spring Security OAuth2 login.
 */
export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-wrap">
      <section className="relative flex min-h-[360px] flex-[1_1_480px] flex-col justify-between gap-10 overflow-hidden border-r border-violet-line bg-violet-deep p-8 sm:p-12">
        <Rings className="pointer-events-none absolute -bottom-56 -left-40 h-[640px] w-[640px] opacity-50" />
        <Link href="/" className="relative font-display text-[26px] font-bold tracking-tight text-ink">
          stage<span className="text-accent">pass</span>
        </Link>
        <div className="relative flex max-w-[460px] flex-col gap-3.5">
          <h1 className="font-display text-[44px] font-bold leading-[1.02] tracking-tight sm:text-[52px]">Your seat is waiting.</h1>
          <p className="text-[17px] leading-relaxed text-[#D6D0EA]">
            Sign in to book seats, keep your QR tickets in one place, and get alerts when shows go on sale.
          </p>
        </div>
      </section>

      <main className="flex flex-[1_1_480px] items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-[420px] flex-col gap-[22px]">
          <nav aria-label="Account" className="grid grid-cols-2 gap-1.5 rounded-xl border border-line bg-surface p-[5px]">
            <TabLink href="/login" active={isLogin}>Sign in</TabLink>
            <TabLink href="/register" active={!isLogin}>Create account</TabLink>
          </nav>

          <button
            type="button"
            className="flex h-[50px] items-center justify-center gap-3 rounded-xl bg-ink text-[15px] font-bold text-accent-ink hover:bg-white"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
              <path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.1 2.7-7z" />
              <path d="M12 21c2.6 0 4.7-.9 6.3-2.3l-3.1-2.4c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.7-5.3-3.9H3.5v2.5A9 9 0 0 0 12 21z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span className="h-px flex-1 bg-line" />
            or with email
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-[22px]">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm text-soft">Full name</label>
                <input id="name" name="name" required autoComplete="name" className="field bg-surface" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-soft">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="field bg-surface" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm text-soft">Password</label>
                {isLogin && <a href="#" className="text-sm text-accent hover:text-accent-hover">Forgot password?</a>}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={isLogin ? undefined : 8}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="field bg-surface"
              />
              {!isLogin && <span className="text-[13px] text-muted">At least 8 characters, with a number.</span>}
            </div>
            {!isLogin && (
              <label className="flex items-start gap-2.5 text-sm leading-normal text-soft">
                <input type="checkbox" required className="mt-0.5 h-[18px] w-[18px] accent-accent" />
                <span>
                  I agree to the <a href="#" className="text-accent">terms</a> and{" "}
                  <a href="#" className="text-accent">privacy policy</a>.
                </span>
              </label>
            )}
            <button type="submit" className="rounded-xl bg-accent p-[15px] font-bold text-accent-ink hover:bg-accent-hover">
              {isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <span className="text-center text-sm text-muted">
            {isLogin ? "New to Stagepass? " : "Already have an account? "}
            <Link href={isLogin ? "/register" : "/login"} className="text-accent hover:text-accent-hover">
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </span>
        </div>
      </main>
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-11 items-center justify-center rounded-[9px] text-[15px] ${
        active ? "bg-violet-line font-bold text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
