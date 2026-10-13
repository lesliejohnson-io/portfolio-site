"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures the element a chart draws into, so the chart can be laid out in
 * real pixels at whatever width it ends up with.
 *
 * The usual responsive-SVG trick — a fixed `viewBox` plus `width="100%"` —
 * scales the *whole* drawing, text and marker radii included. In the 680px
 * body column that means a label sized for desktop renders at about half size
 * on a phone, well under anything readable. Measuring instead keeps type and
 * marks at the sizes they were specified at, at every width.
 *
 * `fallback` is what server rendering and the first client pass use, so the
 * chart is already the right shape before the measurement lands and there is
 * no visible reflow. It is also what a reader with no JavaScript keeps.
 */
export function useChartWidth(fallback = 680) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      // Sub-pixel jitter on resize would re-render on every frame.
      setWidth((current) => (Math.abs(current - next) < 1 ? current : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
