"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A real case-study visual, for the slots where artwork now exists. The
 * placeholder twin is VisualSlot.
 *
 * Illustrations show as they are on the page: there is no click-to-enlarge.
 * (Removed 2026-11-25 at Leslie's direction.)
 *
 * Progressive enhancement, same rule as the heading reveal: the figure
 * renders visible, and only arms the fade once this component mounts and
 * motion is allowed. With JavaScript off, or under prefers-reduced-motion,
 * `data-animate` is never set and the image is simply there.
 *
 * `width`/`height` are the asset's intrinsic pixels — they reserve the right
 * box before the file loads, so the paragraph below it doesn't jump.
 *
 * Write them in MDX as strings (`width="2213"`), not as expressions
 * (`width={2213}`). MDX attribute value expressions are dropped before the
 * props reach this component, so a numeric literal silently arrives as
 * undefined and the box is never reserved. String attributes and bare
 * booleans survive, which is why `src`, `alt` and `wide` work.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  background,
  wide,
  full,
  natural,
}: {
  src: string;
  alt: string;
  caption?: string;
  /** Intrinsic pixels. A string, per the note above — `width="2213"`. */
  width: number | string;
  height: number | string;
  /**
   * A mat colour behind the image, for artwork exported on a transparent or
   * partly transparent background. Without one, such a file would show the
   * page through it and lose its contrast on the dark theme.
   */
  background?: string;
  /**
   * Breaks the figure out of the 680px body column to about 1000px, for a
   * dense diagram that is unreadable at the reading measure. Centred on the
   * column with margins rather than a transform, so it does not fight the
   * translateY the reveal animates.
   */
  wide?: boolean;
  /**
   * Breaks out further, to the page's own measure — the same width the hero
   * band uses. For artwork still cramped at `wide`, such as a full service
   * blueprint.
   */
  full?: boolean;
  /**
   * Renders the artwork at its own pixel size instead of filling the column.
   * For a small export -- a single card or control -- where stretching to the
   * 680px measure would only magnify its pixels. It still shrinks below its
   * intrinsic width on a narrow viewport rather than overflowing.
   */
  natural?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      className="case-figure"
      data-animate={animate ? "true" : undefined}
      data-visible={visible ? "true" : undefined}
      data-width={full ? "full" : wide ? "wide" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        style={{
          ...(background ? { background } : null),
          /*
            `natural` pins the element to the asset's own width, so the browser
            paints it 1:1. max-w-full below still lets it shrink on a narrow
            viewport, where honouring the pixel size would overflow the column.
          */
          ...(natural ? { width: `${width}px` } : null),
        }}
        /*
          No frame: the artwork carries its own edge, and a border around a
          photograph reads as a second, competing one. The figure fills the
          body column edge to edge unless `natural` says otherwise.
        */
        className={natural ? "mx-auto block h-auto max-w-full" : "block w-full"}
      />

      {caption && (
        <figcaption className="mt-3 text-center text-sm leading-relaxed text-fg-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
