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
    <article className="group relative grid grid-cols-1 items-center gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12 md:py-16">
      <div className="md:col-span-5">
        {/*
          One eyebrow, saying what the product is. Set as a bare line of type
          rather than inside a pill: the row already carries a hairline rule
          and a framed visual, and a third enclosed shape above the title read
          as chrome competing with it. The wide tracking is what makes it
          register as a label without a box around it.
        */}
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-fg-secondary">
          {item.tag}
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

        {/*
          A line of figures under the blurb, in the same mono face as the
          eyebrow above the title. It sits below rather than replacing the
          blurb, because a count of states is the shape of the work, not an
          outcome the blurb could be dropped for.
        */}
        {item.statLine && (
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
            {item.statLine}
          </p>
        )}

        {/*
          A button rather than a bare link: outlined at rest, filled in the
          accent on hover.

          Square-ish at 4px rather than the nav Contact button's pill. A pill
          is the shape Machine State UI gives a state badge — something being
          reported — and this is a control, something to press. The nav and
          About buttons keep their pills.

          The whole hover is driven by `group-hover` — the row's hover, not
          the button's. The whole row is one click target via the stretched
          link below, so lighting the button only when the cursor is over the
          button itself would under-report what is actually clickable.
        */}
        <Link
          href={`/work/${item.slug}`}
          className="mt-6 inline-flex items-center rounded-[4px] border border-border-strong px-5 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-fg transition-colors after:absolute after:inset-0 after:content-[''] group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg motion-reduce:transition-none"
        >
          <span className="inline-flex items-center gap-1.5">
            {/*
              A status lamp, borrowed from Machine State UI's own vocabulary:
              dim at rest, lit and glowing when the row is hovered. It is
              decoration here rather than a reading — nothing about the case
              study is being reported — so it carries no state colour of its
              own and is hidden from assistive technology.
            */}
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-fg-muted transition-[background-color,box-shadow] group-hover:bg-[var(--lamp-lit)] group-hover:shadow-[0_0_7px_1px_color-mix(in_srgb,var(--lamp-lit)_55%,transparent)] motion-reduce:transition-none"
            />
            Case study
          </span>

          {/*
            The arrow is not there at rest. On hover its slot opens and the
            arrow slides out of it, left to right, so it reads as coming out
            from behind the words rather than fading in beside them.

            The slot clips, which is what sells it: the arrow travels from
            fully outside the slot's left edge — under the end of the label —
            to its resting place, and is never seen crossing the text. The
            button widens as the slot opens, which nothing else depends on,
            because the row's layout is a column and the button is the last
            thing in it.
          */}
          <span
            aria-hidden="true"
            className="inline-flex w-0 justify-end overflow-hidden transition-[width] duration-200 ease-out group-hover:w-5 motion-reduce:transition-none"
          >
            <span className="-translate-x-full transition-transform duration-200 ease-out group-hover:translate-x-0 motion-reduce:transition-none">
              →
            </span>
          </span>
        </Link>
      </div>

      <div className="md:col-span-7">
        <WorkRowVisual visual={item.visual} />
      </div>
    </article>
  );
}
