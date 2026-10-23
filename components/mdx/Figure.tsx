"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  expandable,
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
   * Adds a click target that opens the artwork at its intrinsic size, for a
   * diagram no page width can show in full.
   *
   * The trigger is a real link to the image file, so without JavaScript it
   * still works — it simply navigates to the image, and Back returns. With
   * JavaScript the click is intercepted and the modal opens instead. That
   * way there is never a control on the page that does nothing.
   */
  expandable?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  /*
    Only swallow the navigation if the modal can actually take over. If
    <dialog> is unsupported, the link is left to do its ordinary job.
  */
  const open = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    dialog.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const image = (
    /* eslint-disable-next-line @next/next/no-img-element */
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
  );

  return (
    <figure
      ref={ref}
      className="case-figure"
      data-animate={animate ? "true" : undefined}
      data-visible={visible ? "true" : undefined}
      data-width={full ? "full" : wide ? "wide" : undefined}
    >
      {expandable ? (
        <a href={src} className="figure-expand" onClick={open}>
          {image}
          {/*
            The link takes its accessible name from the image's alt text, so
            the hint is appended rather than replacing the description with a
            bare "Enlarge".
          */}
          <span className="sr-only"> — open at full size</span>
          <span aria-hidden="true" className="figure-expand-hint">
            Click to enlarge
          </span>
        </a>
      ) : (
        image
      )}

      {caption && (
        <figcaption className="mt-3 text-center text-sm leading-relaxed text-fg-secondary">
          {caption}
        </figcaption>
      )}

      {expandable && (
        <dialog
          ref={dialogRef}
          className="figure-dialog"
          /*
            Escape and the backdrop both close it. Escape is native to
            <dialog>; a click that lands on the dialog itself rather than on
            its contents is a click on the backdrop.
          */
          onClick={(event) => {
            if (event.target === dialogRef.current) close();
          }}
        >
          <div className="figure-dialog-inner">
            <button
              type="button"
              className="figure-dialog-close"
              onClick={close}
            >
              Close
            </button>
            {/*
              Scrolls at the artwork's own size rather than scaling to fit,
              which is the whole point of opening it.
            */}
            <div className="figure-dialog-scroll">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                style={background ? { background } : undefined}
                className="figure-dialog-img"
              />
            </div>
          </div>
        </dialog>
      )}
    </figure>
  );
}
