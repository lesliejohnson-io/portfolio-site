"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The site's one signature motion: slides its children up and fades them in
 * the first time they enter the viewport, then stops observing so the reveal
 * never replays. Under prefers-reduced-motion it renders visible and static
 * immediately and never registers an observer.
 */
export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        // One-shot: stop observing so scrolling back up doesn't replay it.
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-revealed={revealed} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
