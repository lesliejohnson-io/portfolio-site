"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import WorkCard from "@/components/WorkCard";
import type { WorkItem } from "@/lib/work";

/**
 * Scroll-driven card stack, ported from
 * https://codepen.io/tahazsh/pen/WNYKage (aat.js's ScrollObserver, reimplemented
 * from scratch per this site's "no motion libraries" convention — see the
 * cursor and theme toggle). Each card is pinned with native `position: sticky`;
 * as the next card's sticky offset catches up to the current one, that card's
 * face scales down and dims in place — it never moves or resizes on its own,
 * only the incoming card slides in front of it.
 */

const BASE_OFFSET = 24; // px — first card's reveal band
const OFFSET_STEP = 24; // px — added per subsequent card
const MIN_BRIGHTNESS = 0.6;

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export default function WorkCardStack({ items }: { items: WorkItem[] }) {
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([]);
  const faceRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Every card face is held to the same height (the tallest one currently
  // needs), measured rather than guessed, so the stack's geometry stays
  // correct regardless of how long a given case study's summary line is.
  useLayoutEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    );
    if (!mq.matches) return;

    function measure() {
      const heights = faceRefs.current
        .filter((el): el is HTMLDivElement => el !== null)
        .map((el) => el.offsetHeight);
      if (heights.length === 0) return;
      const max = Math.max(...heights);
      setCardHeight((prev) => (prev !== null && Math.abs(prev - max) < 1 ? prev : max));
    }

    measure();
    const observer = new ResizeObserver(measure);
    faceRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  // Scroll-driven "covered" state. A card being covered never moves or
  // resizes itself — only scale and brightness change, driven by how far
  // the *next* card's own sticky offset has climbed toward it.
  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    );
    if (!mq.matches || cardHeight === null) return;

    const n = items.length;

    function update() {
      for (let i = 0; i < n - 1; i++) {
        const face = faceRefs.current[i];
        const nextWrapper = wrapperRefs.current[i + 1];
        if (!face || !nextWrapper || cardHeight === null) continue;

        const offsetTop = BASE_OFFSET + i * OFFSET_STEP;
        const containerBottom = cardHeight + offsetTop;
        const nextTop = nextWrapper.getBoundingClientRect().top;

        let percentage = (containerBottom - nextTop) / cardHeight;
        percentage = Math.min(Math.max(percentage, 0), 1);

        const toScale = 1 - (n - 1 - i) * 0.1;
        face.style.transform = `scale(${lerp(1, toScale, percentage)})`;
        face.style.filter = `brightness(${lerp(1, MIN_BRIGHTNESS, percentage)})`;
      }
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [cardHeight, items.length]);

  return (
    <div
      className="work-stack"
      style={{
        gridTemplateRows: `repeat(${items.length}, ${cardHeight ? `${cardHeight}px` : "auto"})`,
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.slug}
          ref={(el) => {
            wrapperRefs.current[i] = el;
          }}
          className="work-stack-item"
          style={
            {
              "--stack-offset": `${BASE_OFFSET + i * OFFSET_STEP}px`,
              "--stack-z": i + 1,
            } as CSSProperties
          }
        >
          <div
            ref={(el) => {
              faceRefs.current[i] = el;
            }}
            className="work-stack-face"
          >
            <WorkCard item={item} />
          </div>
        </div>
      ))}
    </div>
  );
}
