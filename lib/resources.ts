export type Resource = {
  /** "Paper", "Book", "Tool", … Omit it, with `meta`, to drop the caption line. */
  kind?: string;
  /** Authors and year, shown as one mono line. */
  meta?: string;
  title: string;
  /** Leslie's own note on why it matters. Never the source's abstract. */
  note: string;
  /** Outbound link. Omit it and the card renders as a designed placeholder. */
  href?: string;
  /**
   * Small brand mark, dark artwork on transparent. Rendered greyscale and
   * inverted on the dark theme. Optional — cards without one are text-only.
   */
  mark?: string;
  markAlt?: string;
  /**
   * When set, the card renders as a pull-quote instead of a note card.
   * Quotes are reproduced verbatim from a checkable source — never a
   * paraphrase presented as a quotation.
   */
  /** Banner across the top of the card, full bleed. */
  image?: string;
  imageAlt?: string;
  quote?: string;
  /** Who said or wrote it, and where. Shown under the quote. */
  attribution?: string;
};

/**
 * Placeholder entries until the real template and content land. They are
 * deliberately written as obvious placeholders rather than plausible-looking
 * citations, so nothing invented can ship by accident.
 */
export const resources: Resource[] = [
  {
    kind: "Paper",
    meta: "Author, Author · Year",
    title: "Title of the paper goes here, long enough to wrap to two lines",
    note: "One or two sentences in Leslie's voice on why this matters to the work, and where she would push back on it. Not the source's abstract.",
  },
  {
    kind: "Book",
    meta: "Author · Year",
    title: "Title of the book goes here",
    note: "One or two sentences on what this changed about how she designs for trust, autonomy, or the handoff between person and system.",
  },
  {
    kind: "Quote",
    meta: "After Joseph Schumpeter · 1942",
    title: "Progress comes from new systems replacing old ones. Every wave of technology destroys the way things were done before.",
    quote: "Progress comes from new systems replacing old ones. Every wave of technology destroys the way things were done before.",
    attribution: "After Joseph Schumpeter, Capitalism, Socialism and Democracy (1942)",
    note: "",
    href: "https://en.wikiquote.org/wiki/Joseph_Schumpeter",
  },
  {
    kind: "Tool",
    title: "Foxglove, the agentic data platform for Physical AI",
    note: "PLACEHOLDER — Leslie's note on why robot-data observability matters to designing the human side of autonomous systems.",
    href: "https://foxglove.dev",
    image: "/resources/foxglove-banner.webp",
    imageAlt: "Foxglove — the observability stack for Physical AI",
  },
  {
    kind: "Tool",
    title: "Laminar, open-source observability for AI agents",
    note: "PLACEHOLDER — Leslie's note on what agent traces and failure clustering reveal about designing for trust.",
    href: "https://laminar.sh",
    image: "/resources/laminar-banner.webp",
    imageAlt: "Laminar — ship reliable agents",
  },
];
