import type { Metadata } from "next";
import WorkRow from "@/components/WorkRow";
import { getWorkItems } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work — Leslie Johnson",
  description:
    "Case studies in AI product design, service design, and design systems.",
};

export default function WorkPage() {
  const items = getWorkItems();

  return (
    <div className="container-wide pb-24 pt-16 sm:pt-20">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-fg sm:text-5xl">
          Work
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-secondary">
          Every case study, most recent work first.
        </p>
      </header>

      <div className="mt-12">
        {items.map((item) => (
          <WorkRow key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
