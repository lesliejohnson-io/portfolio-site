import Link from "next/link";
import WorkRow from "@/components/WorkRow";
import { getFeaturedWorkItems } from "@/lib/work";

export default function Home() {
  const items = getFeaturedWorkItems();

  return (
    <div className="container-wide">
      {/*
        Compact hero — headline plus one supporting line only, kept short so
        the first case study row is visible on a ~1440x900 laptop screen
        without scrolling.
      */}
      <section className="max-w-4xl pb-12 pt-16 sm:pb-16 sm:pt-20">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-fg sm:text-6xl">
          Intelligent systems
          <br />
          meet <span className="text-accent">human design.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-secondary">
          I turn complex systems into interfaces people can read, trust, and
          act on.
        </p>
      </section>

      <section id="work" className="pb-24">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
            Selected case studies
          </h2>
          <Link
            href="/work"
            className="font-mono text-xs uppercase tracking-[0.06em] text-accent hover:underline"
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
  );
}
