"use client";

import { useEffect, useRef, useState } from "react";

/** "89%" -> { number: 89, suffix: "%" }; "20×" -> { number: 20, suffix: "×" }. */
function parse(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { number: parseFloat(match[1]), suffix: match[2] };
}

const START = 100;
const DURATION = 900;

/**
 * Counts down from 100 to the stat's real value the first time it scrolls into
 * view, then stops. Anything without a leading number (a phrase, a range)
 * renders as written.
 *
 * The real value is always in the DOM as text — the animation only overwrites
 * it once mounted — so it is present for search engines and for anyone whose
 * JavaScript never runs. Under prefers-reduced-motion nothing animates at all.
 */
export default function StatValue({ value }: { value: string }) {
  const parsed = parse(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const decimals = (parsed.number.toString().split(".")[1] ?? "").length;
        const start = performance.now();

        const step = (now: number) => {
          const t = Math.min((now - start) / DURATION, 1);
          // easeOutCubic: fast at first, settling onto the real number.
          const eased = 1 - Math.pow(1 - t, 3);
          const current = START + (parsed.number - START) * eased;
          setDisplay(current.toFixed(decimals) + parsed.suffix);
          if (t < 1) requestAnimationFrame(step);
          else setDisplay(null); // hand back to the exact authored string
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [parsed?.number, parsed?.suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {display ?? value}
    </span>
  );
}
