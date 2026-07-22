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
        <h3 className="font-serif text-xl leading-snug text-fg">
          {item.name},{" "}
          <span className="text-fg-secondary">{item.tag}</span>
        </h3>

        {item.result ? (
          <p className="mt-4 font-mono text-xs leading-relaxed text-fg-secondary">
            <span className="font-semibold text-fg">RESULT: </span>
            {item.result}
          </p>
        ) : item.summary ? (
          <p className="mt-4 text-sm leading-relaxed text-fg-secondary">
            {item.summary}
          </p>
        ) : null}

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
