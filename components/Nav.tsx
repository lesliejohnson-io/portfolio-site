import Link from "next/link";
import NavContact from "@/components/NavContact";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <div className="container-wide flex flex-wrap items-center justify-between gap-y-3 py-4">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-tight text-fg hover:text-accent"
        >
          Leslie Johnson
        </Link>

        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.08em] text-fg-secondary hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <NavContact />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
