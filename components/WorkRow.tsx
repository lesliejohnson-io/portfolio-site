import Link from "next/link";
import Reveal from "@/components/Reveal";
import WorkRowVisual from "@/components/WorkRowVisual";
import type { WorkItem } from "@/lib/work";

/**
 * A full-width case study row: text column (5 of 12) beside its visual
 * (7 of 12), separated from its neighbours by a hairline rule, stacking to
 * one column on mobile.
 *
 * The whole row is clickable via the "stretched link" pattern — the "Case
 * study" anchor carries an absolutely positioned ::after covering the row.
 * That keeps the row a single tab stop with a real, readable link name,
 * rather than nesting interactive elements or wrapping everything in an <a>.
 */

/**
 * Sets `highlight` in the accent colour wherever it appears in `title`.
 * Falls back to the plain title when there's no highlight or no match, so
 * content drives the emphasis and a mismatch is never a visible error.
 */
function renderTitle(title: string, highlight?: string) {
  if (!highlight) return title;
  const at = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (at === -1) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="text-accent">
        {title.slice(at, at + highlight.length)}
      </span>
      {title.slice(at + highlight.length)}
    </>
  );
}

export default function WorkRow({ item }: { item: WorkItem }) {
  return (
    <article
      data-cursor="grow"
      className="group relative grid grid-cols-1 items-center gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12 md:py-16"
    >
      <div className="md:col-span-5">
        {/*
          One pill, saying what the product is. The project name is already
          the row's title and link, so repeating it here only competed with it.
        */}
        <p className="font-mono text-xs uppercase tracking-[0.08em]">
          <span className="inline-block rounded-full border border-border bg-surface px-2.5 py-1 text-fg-secondary">
            {item.tag}
          </span>
        </p>

        <Reveal>
          {/*
            A title written as more than one sentence stacks one sentence per
            line, matching the case study page header. A single-sentence title
            is one block and wraps as before. The highlight is resolved inside
            each sentence, so a highlight that straddles the break simply
            falls back to plain text rather than breaking the layout.
          */}
          <h3 className="font-display mt-4 text-2xl font-bold leading-snug tracking-[-0.01em] text-fg transition-colors group-hover:text-accent sm:text-3xl">
            {item.title.split(/(?<=\.)\s+/).map((sentence) => (
              <span key={sentence} className="block">
                {renderTitle(sentence, item.titleHighlight)}
              </span>
            ))}
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
          Case study
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      <div className="md:col-span-7">
        <WorkRowVisual visual={item.visual} />
      </div>
    </article>
  );
}
