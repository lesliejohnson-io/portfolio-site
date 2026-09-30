import type { Metadata } from "next";
import BreathingPatterns from "@/components/BreathingPatterns";
import RobotSimulation from "@/components/RobotSimulation";
import DemoCard from "@/components/DemoCard";
import AuraLoop from "@/components/AuraLoop";
import ResourceCard from "@/components/ResourceCard";
import { resources } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Working Library — Leslie Johnson",
  description:
    "The papers, books, and tools behind the work: human-machine trust, autonomy, and interface design for AI systems.",
};

/** Fisher–Yates. Runs on the server at build time, so the order is baked into
 *  the static HTML — no hydration mismatch, and it reshuffles on each deploy. */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The rebuilt pens, each badged with a link back to its original. */
const demos = [
  <DemoCard
    key="robots"
    href="https://codepen.io/Ma5a/pen/LYQoLNR"
    label="robot simulation by masahito on CodePen"
  >
    <RobotSimulation className="aspect-[4/3] w-full" />
  </DemoCard>,
  <DemoCard key="aura" caption="Aura">
    <AuraLoop src="/resources/aura.webm" className="aspect-square w-full" />
  </DemoCard>,
  <DemoCard
    key="breathing"
    href="https://codepen.io/VoXelo/pen/myVpoLm"
    label="Breathing Patterns by VoXelo on CodePen"
    caption="Breathing"
  >
    <BreathingPatterns className="aspect-[4/3] w-full" />
  </DemoCard>,
];

/**
 * Placeholder until the curated, topic-filterable collection ships after
 * launch. This is the one allowed placeholder page on the site.
 */
export default function ResourcesPage() {
  const items = shuffled([
    ...resources.map((item) => (
      <ResourceCard key={item.title} item={item} />
    )),
    ...demos,
  ]);

  return (
    <div className="container-wide pb-24 pt-16 sm:pt-20">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-fg sm:text-5xl">
          Working Library
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-secondary">
          The papers, books, and tools behind the work: human-machine trust,
          autonomy, and interface design for AI systems.
        </p>
      </header>

      {/*
        A count line rather than the reference's shelf/type filter bar — with
        this few entries there is nothing worth filtering yet.
      */}
      <div className="mt-10 flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
          Explore
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
          {items.length} entries
        </span>
      </div>

      {/*
        CSS columns, not a grid: cards size to their own content and flow, so a
        short note doesn't leave dead space beside a long one.
      */}
      <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items}
      </div>
    </div>
  );
}
