import Link from "next/link";
import { SearchIcon } from "./icons";
import { CURRENT_USER } from "@/lib/mock-data";

export function Logo() {
  return (
    <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
      stage<span className="text-accent">pass</span>
    </Link>
  );
}

export function Avatar({ highlight = false }: { highlight?: boolean }) {
  return (
    <Link
      href="/profile"
      aria-label="Profile"
      className={`flex h-11 w-11 items-center justify-center rounded-full font-bold ${
        highlight ? "bg-accent text-accent-ink" : "bg-violet-line text-ink"
      }`}
    >
      {CURRENT_USER.initial}
    </Link>
  );
}

const categories = [
  { label: "Concerts", value: "Concert" },
  { label: "Movies", value: "Movie" },
  { label: "Sports", value: "Sports" },
  { label: "Theatre", value: "Theatre" },
];

interface HeaderProps {
  signedIn?: boolean;
  showSearch?: boolean;
  showCategories?: boolean;
  searchDefault?: string;
  active?: "tickets" | "profile" | "events";
}

export function Header({
  signedIn = true,
  showSearch = true,
  showCategories = false,
  searchDefault,
  active,
}: HeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-4">
        <Logo />

        {showCategories && (
          <nav className="flex flex-wrap gap-5 text-[15px]">
            {categories.map((c, i) => (
              <Link
                key={c.value}
                href={`/events?category=${c.value}`}
                className={i === 0 ? "text-ink" : "text-muted hover:text-ink"}
              >
                {c.label}
              </Link>
            ))}
          </nav>
        )}

        {showSearch ? (
          <form action="/events" className="flex h-11 min-w-[240px] flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3.5">
            <SearchIcon size={18} className="text-muted" />
            <label htmlFor="site-search" className="sr-only">Search events</label>
            <input
              id="site-search"
              name="q"
              defaultValue={searchDefault}
              placeholder="Search events, artists, venues"
              className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
            />
          </form>
        ) : (
          <div className="flex-1" />
        )}

        {!showSearch && (
          <Link href="/events" className={`text-[15px] ${active === "events" ? "font-bold text-ink" : "text-muted hover:text-ink"}`}>
            Browse events
          </Link>
        )}
        <Link
          href="/tickets"
          className={`text-[15px] ${active === "tickets" ? "font-bold text-ink" : "text-muted hover:text-ink"}`}
        >
          My Tickets
        </Link>
        {signedIn ? (
          <Avatar highlight={active === "profile"} />
        ) : (
          <Link href="/login" className="rounded-[10px] bg-accent px-5 py-3 text-[15px] font-bold text-accent-ink hover:bg-accent-hover">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-6 py-7 text-sm text-muted">
        <span>© 2026 Stagepass</span>
        <div className="flex flex-wrap gap-5">
          <Link href="#" className="hover:text-ink">Help</Link>
          <Link href="#" className="hover:text-ink">Refund policy</Link>
          <Link href="#" className="hover:text-ink">For organizers</Link>
        </div>
      </div>
    </footer>
  );
}
