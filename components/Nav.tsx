import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import NavContact from "@/components/NavContact";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Library" },
];

/*
  Glass: a translucent bar with a saturating blur, so content scrolling
  underneath stays faintly visible and tinted rather than hidden. The blur
  comes from Tailwind's utility — a raw `backdrop-filter` in globals.css is
  stripped by Lightning CSS and silently does nothing.

  Every box between <body> and the mark carries `overflow-visible`. LogoMark's
  arms tumble past their own 40px viewBox on hover, and an ancestor clipping
  its overflow would shear them off mid-swing; stating it here keeps a later
  `overflow-hidden` from being added by accident.
*/
export default function Nav() {
  return (
    <header className="sticky top-2 z-30 mt-2 overflow-visible">
      {/*
        container-wide supplies the page margin; the negative inline margin
        pushes the bar 8px past it on each side, so the pill sits just proud of
        the content below rather than flush with it.
      */}
      <div className="container-wide overflow-visible">
        <div className="-mx-2 flex items-center justify-between overflow-visible rounded-full border border-border/60 bg-bg/60 px-6 py-3 backdrop-blur-xl backdrop-saturate-150">
        {/*
          LogoMark is the whole home link: it renders its own <Link>, the mark,
          and the "Leslie Johnson" wordmark, so there is no separate logo or
          name here to duplicate it.
        */}
        <LogoMark size={40} />

        <nav
          aria-label="Main"
          className="hidden items-center gap-x-6 md:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-draw font-mono text-xs uppercase tracking-[0.08em] text-fg-secondary hover:text-accent"
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
