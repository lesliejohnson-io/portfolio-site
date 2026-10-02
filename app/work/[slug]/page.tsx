import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/case-study";
import { caseStudyComponents } from "@/components/mdx/caseStudyComponents";
import LogoStrip from "@/components/LogoStrip";
import CaseStudyHero from "@/components/case-study/CaseStudyHero";
import StatRow from "@/components/case-study/StatRow";
import ScrollReveal from "@/components/case-study/ScrollReveal";
import RelatedStudies, {
  pickRelated,
} from "@/components/case-study/RelatedStudies";
import { getWorkItems } from "@/lib/work";

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.meta.title} — Leslie Johnson`,
    description: study.meta.result ?? study.meta.summary,
  };
}

export default async function CaseStudyPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const { meta, content } = study;

  const body = (
    <MDXRemote
      source={content}
      components={caseStudyComponents(meta)}
      options={{ mdxOptions: { remarkPlugins: [remarkBreaks, remarkGfm] } }}
    />
  );

  // Studies opt in to the new template one at a time via `layout: "v2"`;
  // everything else keeps the original page until it is migrated.
  if (meta.layout === "v2") {
    return (
      <>
        <article>
          {/*
            The pill and headline sit at the body measure, sharing the same
            left and right margins as every paragraph below them. The logo
            strip and hero still run the full page column.
          */}
          <header className="mx-auto max-w-[680px] px-6 pt-12 sm:pt-16">
            {meta.category && (
              <p className="mb-5">
                <span className="inline-block rounded-full bg-accent-soft px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-accent">
                  {meta.category}
                </span>
              </p>
            )}
            {/*
              A title written as more than one sentence breaks at the sentence,
              not wherever the measure happens to run out — otherwise a line
              can end on a dangling number. Each sentence is its own block, so
              a long one still wraps normally inside itself. A single-sentence
              title is unaffected.
            */}
            <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-[-0.02em] text-fg sm:text-[3.375rem]">
              {meta.title
                .split(/(?<=\.)\s+/)
                .map((sentence) => (
                  <span key={sentence} className="block">
                    {sentence}
                  </span>
                ))}
            </h1>

            {/* Only for work still in progress; most studies omit it. */}
            {meta.status && (
              <p className="mt-5 leading-relaxed text-fg-secondary">
                <strong className="font-semibold text-fg">Status:</strong>{" "}
                {meta.status}
              </p>
            )}
          </header>

          {/* The marks run the full container, one row, directly above the hero. */}
          {meta.logos && (
            <div className="container-wide mt-10">
              <LogoStrip logos={meta.logos} />
            </div>
          )}

          {/*
            With `heroBackground` the band runs the full width of the viewport
            in the artwork's own colour, so the image's background continues
            to both edges instead of stopping at a frame. The image itself
            stays at the page column — stretching it edge to edge would blow
            up a composition made to be read at this size.
          */}
          <div
            className="mt-10"
            style={
              meta.heroBackground
                ? { backgroundColor: meta.heroBackground }
                : undefined
            }
          >
            <div className="container-wide">
              <CaseStudyHero
                src={meta.hero}
                alt={meta.heroAlt}
                pending={meta.heroPending}
                bleed={Boolean(meta.heroBackground)}
              />
            </div>
          </div>

          {meta.stats && (
            /* Same measure as the body, so both stat rows line up with the text. */
            <div className="mx-auto mt-12 max-w-[680px] px-6">
              <StatRow stats={meta.stats} showCaptions={false} />
              {/*
                The captions live with the Outcomes & Impact row, so the strip
                links down to them rather than repeating them here.
              */}
              <a
                href="#how-we-measured"
                className="mt-5 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.06em] text-accent hover:underline"
              >
                See how we measured this
                <span aria-hidden="true">→</span>
              </a>
            </div>
          )}

          <ScrollReveal className="prose-v2 mx-auto max-w-[680px] px-6 pb-4">
            {body}
          </ScrollReveal>
        </article>

        <div className="mt-24 pb-24 sm:mt-32">
          <RelatedStudies items={pickRelated(getWorkItems(), meta.slug)} />
        </div>
      </>
    );
  }

  return (
    <article className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <Link
        href="/#work"
        className="font-mono text-xs uppercase tracking-[0.06em] text-fg-secondary hover:text-accent"
      >
        ← All work
      </Link>

      <header className="mt-8">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-fg sm:text-4xl">
          {meta.title}
        </h1>

        {meta.logos && <LogoStrip logos={meta.logos} />}
      </header>

      <div className="prose-case mt-4">
        {body}
      </div>
    </article>
  );
}
