import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";

/*
  The live prototype. A separate site, so it opens in a new tab and uses a
  plain <a> rather than next/link, which is only for pages inside this site.
*/
const CONSOLE_HREF = "https://sarconsole.lesliejohnson.io/";

/**
 * The section straight after the hero: one prototype, shown big.
 *
 * A short left-aligned intro (eyebrow, one-sentence description, a link) sits
 * over a full-width screenshot of the search-and-rescue console. The image
 * runs edge to edge rather than inside container-wide, so the console reads
 * as a working product at close to its real size, not as a thumbnail.
 *
 * next/image serves the 3831px PNG as a resized WebP/AVIF sized to the
 * screen, so phones never download the full 1.4MB original. `sizes="100vw"`
 * tells it the image always spans the viewport, which is what it picks the
 * file size from.
 */
export default function FeaturedPrototype() {
  return (
    <section
      aria-labelledby="featured-prototype-title"
      className="featured-prototype bg-logo-band-bg pb-12"
    >
      {/*
        A dark band in both themes, like the hero and logo bar above it, so
        the console screenshot (itself dark) sits in a field of its own
        colour. The text uses the fixed --hero-field-* tokens, which are
        measured against that background in either theme: the site accent
        would fail contrast here in light mode.
      */}
      <div className="container-wide py-16 sm:py-20">
        {/*
          The intro stays hidden until the visitor first scrolls, then slides
          up into place. See ScrollReveal for when it shows straight away.
        */}
        <ScrollReveal className="flex flex-col items-start gap-5">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-hero-field-cta">
            Live prototype · 2026
          </p>
          <h2
            id="featured-prototype-title"
            className="max-w-[36rem] text-[clamp(18px,1.6vw,21px)] leading-[1.45] text-hero-field-subline"
          >
            A command-and-control console where the autonomy proposes, the
            operator decides, and every coverage gap is visible up front.
          </h2>
          <a
            href={CONSOLE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-1 inline-flex items-center gap-2 rounded-sm text-[17px] font-medium text-hero-field-cta underline-offset-4 hover:underline"
          >
            Open the console
            <span className="sr-only"> (opens in a new tab)</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </a>
        </ScrollReveal>
      </div>

      <div>
        <Image
          src="/work/drones-sar/console-live.png"
          alt="The search-and-rescue console mid-mission: SAR-1102, Coastal Flood Response, Charleston, South Carolina. A map of the flooded coast is split into four search sectors with their coverage, and a relay drone over Sector B is flagged Relay link lost. The event feed explains that seven Hydra drones are out of contact and holding position, shows Sector B’s expected coverage dropping, and offers the operator two options to choose between, A or B. A Sector Status rail on the right lists every sector’s units and tasks, with a Hold all units button at its foot."
          width={3831}
          height={1951}
          sizes="100vw"
          className="block h-auto w-full"
        />
      </div>
    </section>
  );
}
