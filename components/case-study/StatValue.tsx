"use client";

import { Fragment, useEffect, useRef, useState } from "react";

/**
 * "89%" -> { number: 89, suffix: "%" }; "20×" -> { number: 20, suffix: "×" }.
 *
 * A value carrying a second number is not a single figure to count to — a
 * range like "42 → 74" would animate its first half while its second sat
 * still, reading as "100 → 74" on the way down. Those render as written,
 * the same as a value with no leading digit at all.
 */
function parse(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match || /\d/.test(match[2])) return null;
  return { number: parseFloat(match[1]), suffix: match[2] };
}

const START = 100;
const DURATION = 900;

/**
 * A before-and-after value joins its two figures with an arrow, e.g.
 * "42 → 74". Each arrow is wrapped so CSS can set it smaller and lighter
 * than the figures, leaving them to carry the visual weight.
 *
 * The arrow stays in the text — it isn't hidden from assistive technology,
 * because "42 74" would lose the relationship between the two numbers.
 * A value with no arrow renders as a plain string and gets no wrapper.
 */
function withArrows(value: string) {
  if (!value.includes("→")) return value;

  return (
    <span className="stat-value">
      {value.split("→").map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="stat-arrow">→</span>}
          {part.trim()}
        </Fragment>
      ))}
    </span>
  );
}

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
      {display ?? withArrows(value)}
    </span>
  );
}
