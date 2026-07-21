import Link from "next/link";
import EmailAffordance from "@/components/EmailAffordance";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-fg hover:text-accent"
        >
          Leslie Johnson
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/#work"
            className="font-mono text-xs uppercase tracking-[0.08em] text-fg-secondary hover:text-accent"
          >
            Work
          </Link>
          <Link
            href="/about"
            className="font-mono text-xs uppercase tracking-[0.08em] text-fg-secondary hover:text-accent"
          >
            About
          </Link>
          <EmailAffordance />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
