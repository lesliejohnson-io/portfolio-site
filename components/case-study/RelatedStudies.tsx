import Link from "next/link";
import WorkRowVisual from "@/components/WorkRowVisual";
import type { WorkItem } from "@/lib/work";

/**
 * "Other case studies" — the next two studies by `order`, wrapping around the
 * list and skipping the current one, so every page shows two neighbours
 * without a hand-maintained list.
 */
export function pickRelated(all: WorkItem[], currentSlug: string, count = 2) {
  const ordered = [...all].sort((a, b) => a.order - b.order);
  const at = ordered.findIndex((item) => item.slug === currentSlug);
  if (at === -1) return ordered.slice(0, count);
  return Array.from({ length: Math.min(count, ordered.length - 1) }, (_, i) =>
    // +1 so we start after the current study, then wrap.
    ordered[(at + 1 + i) % ordered.length]
  );
}

export default function RelatedStudies({ items }: { items: WorkItem[] }) {
  if (!items.length) return null;

  return (
    <section aria-labelledby="other-case-studies" className="container-wide">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2
          id="other-case-studies"
          className="font-display text-3xl font-bold tracking-[-0.015em] text-fg sm:text-4xl"
        >
          Other case studies
        </h2>
        <Link
          href="/work"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.08em] text-accent hover:underline"
        >
          See all case studies
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <ul className="mt-7 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            {/*
              The whole card links, using the same stretched-link pattern as
              the work rows: one tab stop, one readable link name.
            */}
            <article className="group relative grid gap-5 rounded-xl border border-border bg-bg-raised p-5 transition-colors hover:border-border-strong sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                {item.category && (
                  <span className="self-start rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">
                    {item.category}
                  </span>
                )}
                <Link
                  href={`/work/${item.slug}`}
                  className="font-display text-xl font-bold leading-tight text-fg after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
                >
                  {item.title}
                </Link>
                {item.stats?.[0] && (
                  <p className="mt-auto">
                    <span className="font-display text-2xl font-bold text-fg">
                      {item.stats[0].value}
                    </span>{" "}
                    <span className="text-sm text-fg-secondary">
                      {item.stats[0].label}
                    </span>
                  </p>
                )}
              </div>
              <WorkRowVisual visual={item.visual} />
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
