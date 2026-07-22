import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/case-study";
import { caseStudyComponents } from "@/components/mdx/caseStudyComponents";

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

  return (
    <article className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <Link
        href="/#work"
        className="font-mono text-xs uppercase tracking-[0.06em] text-fg-secondary hover:text-accent"
      >
        ← All work
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
          {meta.name} · {meta.tag}
        </p>
        {meta.role && (
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
            {meta.role}
          </p>
        )}
        <h1 className="mt-4 font-serif text-3xl leading-tight text-fg sm:text-4xl">
          {meta.title}
        </h1>
      </header>

      <div className="prose-case mt-4">
        <MDXRemote
          source={content}
          components={caseStudyComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkBreaks, remarkGfm] } }}
        />
      </div>
    </article>
  );
}
