import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getFeaturedWorkItems, type WorkItem } from "@/lib/work";

/**
 * "Some of the work I’ve shipped": the featured case studies as alternating
 * rows, image right then left, under a centred heading.
 *
 * What's featured comes from `featured: true` in each study's frontmatter,
 * and the copy from its optional `home:` block (falling back to the study's
 * own title and summary), so changing either is a content edit.
 */
export default function ShippedWork() {
  const items = getFeaturedWorkItems();
  if (!items.length) return null;

  return (
    <section id="work" aria-labelledby="shipped-work-title" className="container-wide scroll-mt-20 py-20 sm:py-28">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          Selected projects
        </p>
        <h2
          id="shipped-work-title"
          className="font-display text-[clamp(28px,3.2vw,40px)] font-bold leading-tight tracking-[-0.02em] text-fg"
        >
          Some of the work I’ve shipped.
        </h2>
      </header>

      <div className="mx-auto mt-14 flex max-w-[1200px] flex-col gap-20 sm:mt-20 sm:gap-28">
        {items.map((item, i) => (
          <ShippedRow key={item.slug} item={item} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

/**
 * One row. The whole row is clickable through the "stretched link" pattern,
 * as on WorkRow: the button's ::after covers the row, so it stays one tab
 * stop with a readable link name instead of a link wrapped around everything.
 *
 * `flip` puts the image on the left. On phones both orders stack text first,
 * then image, because the DOM order is text first and the flip is only a
 * grid placement from md up.
 */
function ShippedRow({ item, flip }: { item: WorkItem; flip: boolean }) {
  const home = item.home ?? {};
  const tag = home.tag ?? item.tag;
  const title = home.title ?? item.title;
  const summary = home.summary ?? item.summary;
  const visual = homeVisual(item);

  return (
    <article className="group relative grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className={flip ? "md:order-2" : undefined}>
        {tag && (
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            {tag}
          </p>
        )}

        <Reveal>
          <h3 className="font-display mt-4 text-[clamp(24px,2.3vw,30px)] font-bold leading-[1.25] tracking-[-0.01em] text-fg">
            {title}
          </h3>
        </Reveal>

        {summary && (
          <p className="mt-4 max-w-[58ch] leading-relaxed text-fg-secondary">{summary}</p>
        )}

        {home.outcome && <p className="mt-4 text-sm font-medium text-fg">{home.outcome}</p>}

        {/*
          Outlined at rest; the fill comes in on the row's hover (group-hover),
          not the button's, because the whole row is the click target.
        */}
        <Link
          href={`/work/${item.slug}`}
          className="mt-6 inline-flex items-center gap-3 rounded-md border border-accent px-4 py-2.5 text-[15px] font-medium text-fg transition-colors after:absolute after:inset-0 after:content-[''] group-hover:bg-accent group-hover:text-accent-fg motion-reduce:transition-none"
        >
          Read the case study
          <span
            aria-hidden="true"
            className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
          >
            →
          </span>
        </Link>
      </div>

      <div className={flip ? "md:order-1" : undefined}>
        {visual ? (
          /*
            A fixed 5:3 frame so the two rows' images line up. A photograph
            fills it (cover); a cut-out device mockup sits inside it on the
            surface tint (contain), the way the reference card does.
          */
          <div
            className={`relative aspect-[5/3] overflow-hidden rounded-lg ${
              visual.fit === "contain" ? "bg-surface" : ""
            }`}
          >
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              sizes="(min-width: 768px) 600px, 100vw"
              className={
                visual.fit === "contain"
                  ? "object-contain p-[6%]"
                  : "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
              }
            />
          </div>
        ) : (
          <div className="flex aspect-[5/3] items-center justify-center rounded-lg border border-border bg-surface font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
            Visual pending
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Which still the row shows: the `home.image` override if set, else the
 * study's own image visual. A video or live visual has no still here yet, so
 * the row shows the placeholder rather than guessing.
 *
 * Opaque formats (photographs) are cropped to fill the frame; a PNG or SVG is
 * treated as cut-out artwork and contained, so a device mockup is never
 * cropped through.
 */
function homeVisual(item: WorkItem) {
  const home = item.home ?? {};
  let src: string | undefined;
  let alt: string | undefined;

  if (home.image) {
    src = home.image;
    alt = home.imageAlt ?? (home.image === item.hero ? item.heroAlt : undefined);
  } else if (item.visual?.type === "image") {
    src = item.visual.src;
    alt = home.imageAlt ?? item.visual.alt;
  }
  if (!src) return null;

  const fit = /\.(png|svg)$/i.test(src) ? "contain" : "cover";
  return { src, alt: alt ?? "", fit } as const;
}
