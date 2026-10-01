import Link from "next/link";
import Logomark from "@/components/Logomark";
import NavContact from "@/components/NavContact";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
];

/*
  Glass: a translucent bar with a saturating blur, so content scrolling
  underneath stays faintly visible and tinted rather than hidden. The blur
  comes from Tailwind's utility — a raw `backdrop-filter` in globals.css is
  stripped by Lightning CSS and silently does nothing.
*/
export default function Nav() {
  return (
    <header className="sticky top-2 z-30 mt-2">
      {/*
        container-wide supplies the page margin; the negative inline margin
        pushes the bar 8px past it on each side, so the pill sits just proud of
        the content below rather than flush with it.
      */}
      <div className="container-wide">
        <div className="-mx-2 flex items-center justify-between rounded-full border border-border/60 bg-bg/60 px-6 py-3 backdrop-blur-xl backdrop-saturate-150">
        <Link
          href="/"
          className="font-display flex items-center gap-2.5 text-lg font-medium tracking-tight text-fg transition-colors hover:text-accent"
        >
          <Logomark className="h-5 w-auto shrink-0" />
          Leslie Johnson
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-x-6 md:flex"
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

        {/* Below md the links live in the slide-in panel. */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <MobileNav links={LINKS} />
        </div>
        </div>
      </div>
    </header>
  );
}
