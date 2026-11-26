import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import NavContact from "@/components/NavContact";
import MobileNav from "@/components/MobileNav";
import { CALIBRATE_URL } from "@/lib/calibrate";
import { externalProps, type NavLink } from "@/lib/nav";

/*
  No "Home" item: the mark and name on the left are the home link.
  Contact is not in this list because it opens an email rather than a page
  (NavContact); it renders after the links below.
*/
const LINKS: NavLink[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  // The Calibrate site. External, so it opens in a new tab.
  { href: CALIBRATE_URL, label: "Calibrate", external: true },
];

/*
  A full-width bar stuck to the top of the viewport. The translucent fill and
  blur let content scrolling underneath stay faintly visible rather than cut
  off at a hard edge. The blur comes from Tailwind's utility — a raw
  `backdrop-filter` in globals.css is stripped by Lightning CSS.

  The bar is dark on both themes: `theme-dark` (globals.css) swaps in the
  dark palette for everything inside it. `text-fg` gives the name in the
  mark that palette's off-white; it inherits its colour, and would otherwise
  take the page's dark text on the light theme.

  The fill is the hero field's own near-black (--hero-field-bg), so at the
  top of the home page the bar and the field read as one dark surface. It
  stays glass: 80% opaque with a heavy blur, so content scrolling under it
  shows through faintly, while still reading as dark over light sections.

  The bar spans the whole window, but its contents sit in container-wide, so
  the mark lines up with the hero headline and the case study rows below.
*/
export default function Nav() {
  return (
    <header className="theme-dark sticky top-0 z-30 border-b border-border/60 bg-hero-field-bg/80 text-fg backdrop-blur-xl backdrop-saturate-150">
      <div className="container-wide flex h-16 items-center justify-between">
        {/*
          Dimmed until hovered or focused. The opacity lives on a wrapper so
          LogoMark itself stays a plain, reusable link. focus-within brings it
          up for keyboard users too, not just the mouse.
        */}
        <div className="opacity-65 transition-opacity duration-200 focus-within:opacity-100 hover:opacity-100">
          <LogoMark size={32} />
        </div>

        <nav aria-label="Main" className="hidden items-center gap-x-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              {...(link.external ? externalProps : {})}
              className="link-draw font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-fg-secondary hover:text-fg"
            >
              {link.label}
              {link.external && (
                <span className="sr-only"> (opens in a new tab)</span>
              )}
            </Link>
          ))}
          <NavContact />
        </nav>

        {/* Below md the links live in the slide-in panel. */}
        <div className="flex items-center gap-1 md:hidden">
          <MobileNav links={LINKS} />
        </div>
      </div>
    </header>
  );
}
