import Link from "next/link";
import type { WorkItem } from "@/lib/work";

export default function WorkCard({ item }: { item: WorkItem }) {
  return (
    <article
      data-cursor="grow"
      className="group border border-border rounded-lg overflow-hidden bg-bg-raised transition-colors hover:border-border-strong"
    >
      <div className="relative flex aspect-video items-center justify-center border-b border-border bg-surface">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-fg-muted">
          Visual pending
        </span>
        <span className="absolute left-4 top-4 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
      </div>

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-2xl text-fg">{item.name}</h3>
        </div>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.06em] text-fg-muted">
          {item.tag}
        </p>

        <dl className="mt-5 space-y-2 font-mono text-xs leading-relaxed text-fg-secondary">
          <div>
            <dt className="inline font-semibold text-fg">WHO: </dt>
            <dd className="inline">{item.who}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-fg">WHAT: </dt>
            <dd className="inline">{item.what}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-fg">RESULT: </dt>
            <dd className="inline">{item.result}</dd>
          </div>
        </dl>

        <Link
          href={`/work/${item.slug}`}
          className="mt-6 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.06em] text-accent"
        >
          Full Case Study
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
