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
    A text entry leads with a document glyph instead of artwork. `kind` stays
    in the data for filtering later but is never printed — the icon says it is
    a document, and the source line underneath says the rest.
  */
  const isTextEntry = !item.quote && !item.cover && !item.image;

  const inner = (
    <>
      {isTextEntry && (
        <span aria-hidden="true" className="mb-4 block text-fg-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6" />
            <path d="M9 17h4" />
          </svg>
        </span>
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
          {/* A cover card shows the jacket instead — the title is already on it. */}
          {!item.cover && (
            <h3 className="font-display text-lg font-bold leading-snug text-fg group-hover:text-accent">
              {item.title}
            </h3>
          )}
          {/* Author, publication and year sit under the title, not above it. */}
          {!item.cover && item.meta && (
            <p className="mt-1.5 font-mono text-xs text-fg">
              {item.meta}
            </p>
          )}
          {item.note && (
            <p className={`text-sm leading-relaxed text-fg-secondary ${item.cover ? "" : "mt-3"}`}>
              {item.note}
            </p>
          )}
        </>
      )}
    </>
  );

  const cover = item.cover && (
    <div className="flex justify-center px-5 pt-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.cover}
        alt={item.coverAlt ?? ""}
        className="h-48 w-auto rounded-sm shadow-[0_14px_28px_-10px_rgba(0,0,0,0.45)]"
      />
    </div>
  );

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
      /* A banner card is framed in its own artwork colour, so the border
         continues the image rather than cutting across it. */
      style={
        item.borderColor ? { borderColor: item.borderColor } : undefined
      }
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-md transition-colors ${
        item.borderColor ? "border" : ""
      } ${cover ? "bg-bg-raised" : "bg-surface hover:bg-bg-raised"} ${
        banner || cover ? "" : "p-5 pb-12"
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
      {cover}
      {banner || cover ? <div className="p-5 pb-12">{inner}</div> : inner}
      <OutboundArrow />
    </article>
  );
}
