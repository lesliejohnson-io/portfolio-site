import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources — Leslie Johnson",
  description:
    "A curated collection on AI product design, coming after launch.",
};

/**
 * Placeholder until the curated, topic-filterable collection ships after
 * launch. This is the one allowed placeholder page on the site.
 */
export default function ResourcesPage() {
  return (
    <div className="container-wide pb-24 pt-16 sm:pt-20">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-fg sm:text-5xl">
          Resources
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-secondary">
          A curated collection of what I read, use, and return to on designing
          AI systems. Coming soon.
        </p>
      </header>
    </div>
  );
}
