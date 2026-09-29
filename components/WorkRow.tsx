import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { WorkItem } from "@/lib/work";

/**
 * A full-width case study row: text column (5 of 12) beside its visual
 * (7 of 12), separated from its neighbours by a hairline rule, stacking to
 * one column on mobile.
 *
 * The whole row is clickable via the "stretched link" pattern — the "Full
 * case study" anchor carries an absolutely positioned ::after covering the
 * row. That keeps the row a single tab stop with a real, readable link name,
 * rather than nesting interactive elements or wrapping everything in an <a>.
 */
export default function WorkRow({ item }: { item: WorkItem }) {
  return (
    <article
      data-cursor="grow"
      className="group relative grid grid-cols-1 items-center gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12 md:py-16"
    >
      <div className="md:col-span-5">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
          {item.name}
          <span className="mx-2 text-border-strong" aria-hidden="true">
            /
          </span>
          {item.tag}
        </p>

        <Reveal>
          <h3 className="font-display mt-4 text-2xl font-bold leading-snug tracking-[-0.01em] text-fg transition-colors group-hover:text-accent sm:text-3xl">
            {item.title}
          </h3>
        </Reveal>

        {item.result ? (
          <p className="mt-4 font-mono text-xs leading-relaxed text-fg-secondary">
            <span className="font-semibold text-fg">RESULT: </span>
            {item.result}
          </p>
        ) : item.summary ? (
          <p className="mt-4 max-w-[52ch] leading-relaxed text-fg-secondary">
            {item.summary}
          </p>
        ) : null}

        <Link
          href={`/work/${item.slug}`}
          className="mt-6 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.06em] text-accent after:absolute after:inset-0 after:content-['']"
        >
          Full case study
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      <div className="md:col-span-7">
        <div className="relative flex aspect-video items-center justify-center rounded-lg border border-border bg-surface transition-colors group-hover:border-border-strong">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
            Visual pending
          </span>
          <span
            className="absolute left-4 top-4 h-2 w-2 rounded-full bg-accent"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
