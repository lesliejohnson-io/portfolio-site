"use client";

import { useEffect, useState } from "react";

/**
 * Holds its children back until the visitor first scrolls the page, then
 * slides them up and fades them in once, using the same .reveal motion as
 * Reveal.tsx.
 *
 * Reveal.tsx waits for its element to enter the viewport. This one waits for
 * the first scroll instead, so content that is already on screen at load
 * (the SAR intro, on a tall display) still arrives as the page starts to
 * move rather than sitting there from the first frame.
 *
 * It shows straight away, with no motion, when:
 * - the page loads already scrolled (a reload partway down),
 * - prefers-reduced-motion is set,
 * - keyboard focus lands inside it, so a focused link is never invisible,
 * - JavaScript doesn't run (the <noscript> style below).
 */
export default function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (
      window.scrollY > 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return;
    }

    const onScroll = () => {
      setRevealed(true);
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-revealed={revealed}
      onFocus={() => setRevealed(true)}
      className={`reveal scroll-reveal ${className}`}
    >
      <noscript>
        <style>{`.scroll-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      {children}
    </div>
  );
}
