import type { ReactNode } from "react";
import StatValue from "@/components/case-study/StatValue";

/**
 * The numbers row on About. Written in the MDX as plain tags:
 *
 *   <AboutStats>
 *     <Stat value="83%" label="survey completion, …" />
 *   </AboutStats>
 *
 * String props only, on purpose: next-mdx-remote v6 blocks JavaScript
 * expressions in MDX by default, so an array prop like `stats={[…]}` would
 * not survive. Child tags keep the numbers in the content file without that.
 *
 * Same treatment as the case study StatRow (display-face value that counts
 * down from 100, small label beneath) so a number reads the same everywhere.
 * Four across from the small breakpoint up, stacked on a phone.
 */
export function AboutStats({ children }: { children: ReactNode }) {
  return (
    <dl className="about-stats grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-4 sm:gap-5">
      {children}
    </dl>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    /*
      dt holds the label (what the number is), dd the value, as a description
      list expects. The visible label is a duplicate hidden from screen
      readers, so it isn't announced twice, and the value can sit on top.
    */
    <div className="flex flex-col gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="contents">
        <span className="font-display text-4xl font-bold leading-none text-fg sm:text-[2.5rem]">
          <StatValue value={value} />
        </span>
        <span aria-hidden="true" className="text-sm leading-snug text-fg-muted">
          {label}
        </span>
      </dd>
    </div>
  );
}
