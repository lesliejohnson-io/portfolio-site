"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Placeholder-aware figure for case-study visuals. Floats beside the
 * paragraph that introduces it (see .prose-case CSS) and slides up + fades
 * in the first time it scrolls into view, fading back out when it scrolls
 * past — re-triggering on the way back up. Disabled entirely under
 * prefers-reduced-motion, where it just renders visible and static.
 */
export function VisualSlot({ caption }: { caption: string }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      data-visible={visible}
      className="visual-slot my-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-12 text-center"
    >
      <span
        aria-hidden="true"
        className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted"
      >
        Visual pending
      </span>
      <figcaption className="max-w-md text-sm leading-relaxed text-fg-secondary">
        {caption}
      </figcaption>
    </figure>
  );
}
