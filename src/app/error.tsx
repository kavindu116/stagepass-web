"use client";

import Link from "next/link";

/** Shown when a page throws — most often because the Spring Boot API isn't running. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl font-bold">Something went wrong</h1>
      <p className="text-soft">We couldn&apos;t load this page. Please try again in a moment.</p>
      {process.env.NODE_ENV === "development" && (
        <pre className="w-full overflow-x-auto rounded-xl border border-line bg-surface p-4 text-left text-sm text-danger">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:bg-accent-hover"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-line-soft px-6 py-3.5 hover:border-soft">
          Home
        </Link>
      </div>
    </main>
  );
}
