"use client";

import { useEffect, useState } from "react";
import type { WorkVisual } from "@/lib/work";

/**
 * A work row's visual: a silent looping clip, or the styled "Visual pending"
 * placeholder when a row has no asset yet.
 *
 * Under prefers-reduced-motion the <video> is never rendered at all — the
 * poster is shown as a plain image instead. Rendering the video with autoPlay
 * removed would still download it and still show a first frame that some
 * browsers animate; not mounting it is the only way to guarantee stillness,
 * and it saves the download too.
 *
 * The decision is made in an effect rather than during render because the
 * server has no media queries: the first client paint must match the server's
 * HTML or React logs a hydration mismatch. Starting at "motion allowed" and
 * correcting after mount keeps the common case free of a flash.
 */
export default function WorkRowVisual({ visual }: { visual?: WorkVisual }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!visual) {
    return (
      <div className="relative flex aspect-video items-center justify-center rounded-lg border border-border bg-surface transition-colors group-hover:border-border-strong">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
          Visual pending
        </span>
        <span
          className="absolute left-4 top-4 h-2 w-2 rounded-full bg-accent"
          aria-hidden="true"
        />
      </div>
    );
  }

  const portrait = visual.orientation === "portrait";

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-video-mat transition-colors group-hover:border-border-strong">
      {reduceMotion ? (
        <img
          src={visual.poster}
          alt={visual.alt ?? ""}
          className={
            portrait
              ? "mx-auto h-full w-auto object-contain"
              : "h-full w-full object-cover"
          }
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={visual.poster}
          aria-label={visual.alt}
          className={
            portrait
              ? "mx-auto h-full w-auto object-contain"
              : "h-full w-full object-cover"
          }
        >
          {visual.sources.map((src) => (
            <source
              key={src}
              src={src}
              type={src.endsWith(".webm") ? "video/webm" : "video/mp4"}
            />
          ))}
        </video>
      )}
    </div>
  );
}
