"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A real case-study visual, for the slots where artwork now exists. The
 * placeholder twin is VisualSlot.
 *
 * Progressive enhancement, same rule as the heading reveal: the figure
 * renders visible, and only arms the fade once this component mounts and
 * motion is allowed. With JavaScript off, or under prefers-reduced-motion,
 * `data-animate` is never set and the image is simply there.
 *
 * `width`/`height` are the asset's intrinsic pixels — they reserve the right
 * box before the file loads, so the paragraph below it doesn't jump.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  background,
}: {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  /**
   * A mat colour behind the image, for artwork exported on a transparent or
   * partly transparent background. Without one, such a file would show the
   * page through it and lose its contrast on the dark theme.
   */
  background?: string;
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
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={background ? { background } : undefined}
        /*
          No frame: the artwork carries its own edge, and a border around a
          photograph reads as a second, competing one. The figure fills the
          body column edge to edge.
        */
        className="block w-full"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm leading-relaxed text-fg-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
