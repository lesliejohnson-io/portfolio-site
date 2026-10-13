import React from "react";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { CaseStudyBlockquote, extractText } from "@/components/mdx/CaseStudyBlocks";
import { VisualSlot } from "@/components/mdx/VisualSlot";
import StatRow from "@/components/case-study/StatRow";
import SurveyTimeline from "@/components/case-study/SurveyTimeline";
import FatigueChart from "@/components/case-study/FatigueChart";
import type { WorkItem } from "@/lib/work";

/**
 * Paragraphs whose entire content is a `*[Visual: …]*` marker become a
 * VisualSlot placeholder (rendered at block level, not inside a <p>). All
 * other paragraphs render normally.
 */
function Paragraph({ children }: { children?: React.ReactNode }) {
  const text = extractText(children).trim();

  const visual = text.match(/^\[Visual:\s*([\s\S]+?)\]$/);
  if (visual) {
    return <VisualSlot caption={visual[1].trim()} />;
  }

  /*
    Any other paragraph that is nothing but a bracketed note is content still
    to be supplied. Rendering it as a marked block rather than as a line of
    prose keeps it from reading as finished copy, and makes it impossible to
    publish without noticing.
  */
  const pending = text.match(/^\[([\s\S]+)\]$/);
  if (pending) {
    return <Placeholder>{pending[1].trim()}</Placeholder>;
  }

  return <p>{children}</p>;
}

/** A visible "still to supply" block, matching VisualSlot's dashed frame. */
function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-5">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">
        To supply
      </p>
      <p className="text-sm leading-relaxed text-fg-secondary">{children}</p>
    </div>
  );
}

/**
 * Takes the study's frontmatter so body components can read it — `<StatRow />`
 * renders the same `stats` as the strip under the hero, which keeps every
 * number written in exactly one place.
 */
/**
 * Links authored in the case study body. An outbound link opens in a new tab,
 * so a reader following a citation does not lose their place in the study —
 * the same convention as every other external link on the site, including the
 * screen-reader note that says so.
 */
function CaseStudyLink({
  href,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"a">) {
  if (!href || !/^https?:\/\//.test(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function caseStudyComponents(
  meta: WorkItem
): MDXRemoteProps["components"] {
  return {
    p: Paragraph,
    blockquote: CaseStudyBlockquote,
    a: CaseStudyLink,
    StatRow: () => <StatRow stats={meta.stats} id="how-we-measured" />,
    SurveyTimeline,
    FatigueChart,
  };
}
