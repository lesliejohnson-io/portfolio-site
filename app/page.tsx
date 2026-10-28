import Link from "next/link";
import HeroField from "@/components/HeroField";
import WorkRow from "@/components/WorkRow";
import { getFeaturedWorkItems } from "@/lib/work";

export default function Home() {
  const items = getFeaturedWorkItems();

  return (
    <>
      {/*
        HeroField carries its own band, column and headline, so it sits outside
        container-wide and replaces the tinted hero that used to be here.

        WaveHero's band extension above the nav is deliberately gone with it.
        That strip painted --wave-hero-bg behind the floating nav so the band
        reached the top of the page, which worked because on the light theme
        that token WAS the page background. The field band is dark on both
        themes, so the same strip would put the nav's translucent pill and its
        dark link text on near-black in light mode. The field starts below the
        nav instead, and the nav keeps the page background under it.
      */}
      <HeroField />

      <div className="container-wide">
        <section id="work" className="pb-24 pt-16 sm:pt-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
              Selected case studies
            </h2>
            <Link
              href="/work"
              className="link-draw font-mono text-xs uppercase tracking-[0.06em] text-accent"
            >
              All work →
            </Link>
          </div>

          <div className="mt-2">
            {items.map((item) => (
              <WorkRow key={item.slug} item={item} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
