import React from "react";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { CaseStudyBlockquote, extractText } from "@/components/mdx/CaseStudyBlocks";
import { VisualSlot } from "@/components/mdx/VisualSlot";
import StatRow from "@/components/case-study/StatRow";
import type { WorkItem } from "@/lib/work";

/**
 * Paragraphs whose entire content is a `*[Visual: …]*` marker become a
 * VisualSlot placeholder (rendered at block level, not inside a <p>). All
 * other paragraphs render normally.
 */
function Paragraph({ children }: { children?: React.ReactNode }) {
  const text = extractText(children).trim();
  const match = text.match(/^\[Visual:\s*([\s\S]+?)\]$/);
  if (match) {
    return <VisualSlot caption={match[1].trim()} />;
  }
  return <p>{children}</p>;
}

/**
 * Takes the study's frontmatter so body components can read it — `<StatRow />`
 * renders the same `stats` as the strip under the hero, which keeps every
 * number written in exactly one place.
 */
export function caseStudyComponents(
  meta: WorkItem
): MDXRemoteProps["components"] {
  return {
    p: Paragraph,
    blockquote: CaseStudyBlockquote,
    StatRow: () => <StatRow stats={meta.stats} id="how-we-measured" />,
  };
}
