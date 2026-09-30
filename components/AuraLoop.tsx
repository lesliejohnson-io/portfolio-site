"use client";

import { useEffect, useRef } from "react";

/**
 * A silent looping clip, played only while it is on screen.
 *
 * Unlike the rebuilt pens this is a video file rather than a simulation, so
 * there is no work to pause — but leaving an off-screen video decoding is
 * still wasted battery, so the IntersectionObserver applies here too. Under
 * prefers-reduced-motion it holds the first frame instead of playing.
 */
export default function AuraLoop({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={`block bg-black object-cover ${className}`}
    />
  );
}
