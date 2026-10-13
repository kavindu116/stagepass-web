import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header showSearch={false} />
      <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Page not found</h1>
        <p className="text-soft">This event may have ended or the link is wrong.</p>
        <Link href="/events" className="rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:bg-accent-hover">
          Browse events
        </Link>
      </main>
    </>
  );
}
