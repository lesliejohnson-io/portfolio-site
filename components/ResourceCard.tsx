import type { Resource } from "@/lib/resources";

/** Outbound arrow, the only link affordance on a card. */
function OutboundArrow() {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-4 right-4 text-accent transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
    >
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M3.5 8.5 8.5 3.5" />
        <path d="M4.25 3.5H8.5V7.75" />
      </svg>
    </span>
  );
}

/**
 * One entry in the Working Library: what it is, who wrote it, and Leslie's own
 * note on why it matters. Entries link out rather than reproducing the source,
 * which keeps the page clear of other people's copyrighted text.
 *
 * Quote cards drop the caption line entirely — an attribution already sits
 * under the quote, and repeating it above competes with the voice.
 */
export default function ResourceCard({ item }: { item: Resource }) {
  const isPlaceholder = !item.href;
  /*
    `kind` stays in the data for filtering later, but a banner card already
    says what it is — the label would just repeat the artwork.
  */
  const showKind = Boolean(item.kind) && !item.image;

  const inner = (
    <>
      {!item.quote && (showKind || item.meta || item.mark) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {item.mark && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.mark}
              alt={item.markAlt ?? ""}
              className="resource-mark h-6 w-6 shrink-0 object-contain"
            />
          )}
          {(showKind || item.meta) && (
            <span className="font-mono text-xs uppercase tracking-[0.06em] text-fg-muted">
              {showKind && item.kind}
              {showKind && item.meta && (
                <span aria-hidden="true" className="mx-2 text-border-strong">
                  ·
                </span>
              )}
              {item.meta}
            </span>
          )}
        </div>
      )}

      {item.quote ? (
        <blockquote>
          <p className="font-serif text-2xl font-medium italic leading-tight text-fg">
            {item.quote}
          </p>
          {item.attribution && (
            <cite className="mt-4 block font-mono text-xs not-italic leading-relaxed text-fg-muted">
              {item.attribution}
            </cite>
          )}
        </blockquote>
      ) : (
        <>
          <h3 className={`font-display text-lg font-bold leading-snug text-fg group-hover:text-accent ${showKind || item.meta || item.mark ? "mt-3" : ""}`}>
            {item.title}
          </h3>
          {item.note && (
            <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
              {item.note}
            </p>
          )}
        </>
      )}
    </>
  );

  if (isPlaceholder) {
    return (
      <article className="mb-4 break-inside-avoid rounded-md border border-dashed border-border-strong p-5">
        {inner}
      </article>
    );
  }

  const banner = item.image && (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={item.image}
      alt={item.imageAlt ?? ""}
      className="block w-full object-cover"
    />
  );

  return (
    /* pb leaves room for the arrow, which sits in the corner rather than in flow. */
    <article
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-md bg-surface transition-colors hover:bg-bg-raised ${
        banner ? "" : "p-5 pb-12"
      }`}
    >
      {/* Stretched link: the whole card is clickable, but one tab stop. */}
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 rounded-md"
      >
        <span className="sr-only">{item.title} (opens in a new tab)</span>
      </a>
      {banner}
      {banner ? <div className="p-5 pb-12">{inner}</div> : inner}
      <OutboundArrow />
    </article>
  );
}
