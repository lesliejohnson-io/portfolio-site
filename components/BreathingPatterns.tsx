"use client";

import { useEffect, useRef } from "react";

/**
 * Mirrored sine waves folding into each other, after VoXelo's "Breathing
 * Patterns" (codepen.io/VoXelo/pen/myVpoLm).
 *
 * Same maths as the original, rebuilt on a plain 2D canvas instead of p5.js —
 * the sketch only uses sin, cos and a linear map, so the ~900KB library was
 * paying for nothing. Each frame paints a translucent black wash rather than
 * clearing, which is what leaves the trails.
 *
 * Decorative, so it is hidden from assistive tech. It stops drawing when
 * scrolled out of view, and under prefers-reduced-motion it renders a single
 * accumulated still image and never animates.
 */
const LINES = 80;
const POINTS = 200;
const TAU = Math.PI * 2;

export default function BreathingPatterns({
  className = "",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
    };

    /** One frame of the sketch at a given time. */
    const frame = (time: number) => {
      // A wash instead of a clear — this is what leaves the trails.
      ctx.fillStyle = "rgba(0, 0, 0, 0.098)";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.039)";
      ctx.lineWidth = 1;

      /*
        The original is a full-window background, where its ~260px maximum
        excursion is comfortably inside the frame. In a card it would run past
        both edges, so the amplitude is scaled to the box: the widest point
        lands at 42% of the half-width, leaving a margin.
      */
      const amp = (width * 0.42) / 260;

      for (let i = 0; i < LINES; i++) {
        const linePhase = (i / LINES) * TAU;

        // Left, then its mirror. Same x, negated.
        for (const side of [-1, 1]) {
          ctx.beginPath();
          for (let j = 0; j <= POINTS; j++) {
            const pointPhase = j / POINTS;
            const y = (pointPhase - 0.5) * 2 * (height / 2.5);

            const envelope = Math.sin(pointPhase * Math.PI);
            const wave1 = Math.sin(time + linePhase) * 60;
            const wave2 = Math.sin(pointPhase * 8 + time * 2) * 40;
            const centerComplexity =
              Math.pow(Math.cos(pointPhase * Math.PI - Math.PI / 2), 2) * 100;
            const wave3 = Math.cos(linePhase * 4 - time) * centerComplexity;
            const x = envelope * (wave1 + wave2 + wave3 + 60);

            const px = side * x * amp;
            if (j === 0) ctx.moveTo(px, y);
            else ctx.lineTo(px, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      // Build the accumulated image in one pass, then leave it still.
      for (let f = 0; f < 140; f++) frame(f * 0.008);
      const ro = new ResizeObserver(() => {
        resize();
        for (let f = 0; f < 140; f++) frame(f * 0.008);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let raf = 0;
    let count = 0;
    let running = false;

    const loop = () => {
      frame(count++ * 0.008);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only burn frames while the canvas is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`block bg-black ${className}`}
    />
  );
}
