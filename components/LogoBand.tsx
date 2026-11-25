import { PARTNER_LOGOS } from "@/lib/logos";

/**
 * A full-width dark band of partner marks directly under the home hero.
 *
 * Unlike LogoStrip (the case study version), this band is dark in both
 * themes, so the white artwork needs no light-mode inversion. The list lives
 * in lib/logos.ts so new marks can be added without touching this file.
 *
 * The marks spread across the container from md up. Below that they stay on
 * one row that scrolls sideways by touch, with the scrollbar hidden: the
 * mark cut off at the right edge is what tells you there is more to swipe
 * to. `shrink-0` on each item stops flexbox squashing the logos to fit
 * instead of letting the row overflow.
 */
export default function LogoBand() {
  if (!PARTNER_LOGOS.length) return null;

  return (
    <section aria-label="Partners and funders" className="logo-band bg-logo-band-bg">
      <ul className="container-wide flex items-center gap-x-12 overflow-x-auto overscroll-x-contain py-8 [scrollbar-width:none] md:justify-evenly md:overflow-x-visible [&::-webkit-scrollbar]:hidden">
        {PARTNER_LOGOS.map((logo) => (
          <li key={logo.src} className="flex h-12 shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              style={
                logo.scale
                  ? { maxHeight: `${2.25 * logo.scale}rem`, maxWidth: `${140 * logo.scale}px` }
                  : undefined
              }
              className="max-h-9 w-auto max-w-[140px] object-contain"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
