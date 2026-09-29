import type { WorkLogo } from "@/lib/work";

/**
 * A row of partner / funder marks under a case study title.
 *
 * The artwork is white-on-transparent, which would be invisible on the light
 * theme, so `.logo-strip` inverts it to near-black in light mode and leaves it
 * white in dark (see globals.css). Both are held at a low opacity so the strip
 * reads as supporting evidence rather than competing with the headline.
 *
 * Each mark is sized by `object-contain` inside a fixed box, so logos with very
 * different proportions (a wide NIH lockup, a squarer crest) sit on a shared
 * baseline without being stretched.
 */
export default function LogoStrip({ logos }: { logos: WorkLogo[] }) {
  if (!logos.length) return null;

  return (
    <section aria-label="Partners and funders" className="logo-strip mt-8">
      <ul className="flex flex-wrap gap-2">
        {logos.map((logo) => (
          <li
            key={logo.src}
            className="flex h-20 flex-1 basis-40 items-center justify-center rounded-lg border border-border bg-surface px-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-10 w-full max-w-[150px] object-contain"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
