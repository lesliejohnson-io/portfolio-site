"use client";

import { useEffect, useRef } from "react";

/**
 * Floats the section headings inside it up into view as they are scrolled to.
 *
 * Progressive enhancement on purpose: the hiding rules are scoped to a
 * `.reveal-ready` class that only this component adds, so if JavaScript never
 * runs, nothing is ever hidden. The class is skipped entirely under
 * prefers-reduced-motion, so that case never even starts from opacity 0.
 *
 * Visuals are not included — VisualSlot runs its own reveal — and elements
 * already on screen at mount are revealed immediately rather than animating
 * into a position they are already in.
 */
export default function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));
    if (!targets.length) return;

    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    for (const el of targets) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.setAttribute("data-revealed", "true");
      } else {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
