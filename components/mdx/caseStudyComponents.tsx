import React from "react";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import {
  CaseStudyBlockquote,
  VisualSlot,
  extractText,
} from "@/components/mdx/CaseStudyBlocks";

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

export const caseStudyComponents: MDXRemoteProps["components"] = {
  p: Paragraph,
  blockquote: CaseStudyBlockquote,
};
