import type { WorkItem } from "@/lib/work";

const VIDEO = /\.(mp4|webm)$/i;

/**
 * The wide visual directly under the case study header. Renders an image, a
 * silent looping clip, or — when no asset exists yet — the designed
 * placeholder at the same size, so the page's proportions are right long
 * before the artwork arrives. No caption, per the layout spec.
 */
export default function CaseStudyHero({
  src,
  alt,
  pending,
  bleed = false,
}: {
  src?: WorkItem["hero"];
  alt?: string;
  pending?: string;
  /**
   * True when the hero sits on a band matching the artwork's own background.
   * The frame then drops its border and rounding — both would draw a visible
   * edge through a field that is meant to read as continuous — and the image
   * is contained rather than cropped, so the composition stays intact.
   */
  bleed?: boolean;
}) {
  const frame = bleed
    ? "aspect-[16/9] w-full sm:aspect-[2/1]"
    : "aspect-[16/9] w-full overflow-hidden rounded-xl sm:aspect-[2/1]";

  if (!src) {
    return (
      <div
        className={`${frame} flex flex-col items-center justify-center gap-2 border border-dashed border-border-strong bg-surface px-8 text-center`}
      >
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
          Hero visual pending
        </span>
        {pending && (
          <span className="max-w-md text-sm text-fg-secondary">{pending}</span>
        )}
      </div>
    );
  }

  if (VIDEO.test(src)) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
        src={src}
        className={`${frame} border border-border bg-video-mat object-cover`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className={`${frame} ${
        bleed ? "object-contain" : "border border-border object-cover"
      }`}
    />
  );
}
