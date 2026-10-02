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
  /**
   * Border colour for a banner card, sampled from the banner's own background
   * so the frame reads as an extension of the artwork rather than a site
   * chrome colour. Content, not theme — hence a literal value here.
   */
  borderColor?: string;
  /**
   * A portrait cover. Shown contained on a tinted panel rather than bled to
   * the edges — cropping a book jacket to a banner destroys it.
   */
  cover?: string;
  coverAlt?: string;
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
    kind: "Book",
    meta: "Brian Christian · 2020",
    title: "The Alignment Problem",
    note: "Why getting AI systems to do what people actually intend is so hard, told through the researchers working on it. Context for why oversight and legibility matter.",
    href: "https://www.amazon.com/dp/0393868338",
    cover: "/resources/alignment-problem.webp",
    coverAlt: "The Alignment Problem: Machine Learning and Human Values by Brian Christian",
  },
  {
    kind: "Book",
    meta: "Josh Clark and Veronika Kindred · 2026",
    title: "Sentient Design",
    note: "The clearest current framework for designing with machine intelligence instead of around it. The principle that matters most for physical AI is deference: the system suggests, the person decides.",
    href: "https://rosenfeldmedia.com/books/sentient-design/",
    cover: "/resources/sentient-design.webp",
    coverAlt: "Sentient Design: Crafting Intelligent Interfaces with AI by Josh Clark and Veronika Kindred",
  },
  {
    kind: "Paper",
    meta: "Lisanne Bainbridge · Automatica, 1983",
    title: "Ironies of Automation",
    note: "Automation leaves people the hardest parts of the job: monitoring for rare failures and taking over when things go wrong, with skills that have gone rusty from disuse. Written in 1983 and still the clearest statement of the operator's dilemma.",
    href: "https://doi.org/10.1016/0005-1098(83)90046-8",
  },
  {
    kind: "Book",
    meta: "Mica Endsley and Debra Jones",
    title: "Designing for Situation Awareness",
    note: "A practical model with three levels: what's happening, what it means, and what happens next. A strong test for any operator display is whether it supports all three.",
    href: "https://www.amazon.com/dp/1420063553",
    cover: "/resources/situation-awareness.webp",
    coverAlt: "Designing for Situation Awareness: An Approach to User-Centered Design, second edition, by Mica R. Endsley and Debra G. Jones",
  },
  {
    kind: "Book",
    meta: "Nicholas Carr · 2014",
    title: "The Glass Cage",
    note: "When automation takes over a task, human skill and attention quietly erode. A reminder that every interface either keeps the operator sharp or lets them drift.",
    href: "https://www.amazon.com/dp/0393351637",
    cover: "/resources/glass-cage.webp",
    coverAlt: "The Glass Cage: Automation and Us by Nicholas Carr",
  },
  {
    kind: "Quote",
    meta: "After Joseph Schumpeter · 1942",
    title: "Progress comes from new systems replacing old ones. Every wave of technology destroys the way things were done before.",
    quote: "Progress comes from new systems replacing old ones. Every wave of technology destroys the way things were done before.",
    attribution: 'On "creative destruction", Joseph Schumpeter, Capitalism, Socialism and Democracy, 1942',
    note: "",
    href: "https://en.wikiquote.org/wiki/Joseph_Schumpeter",
  },
  {
    kind: "Tool",
    title: "Foxglove: robot data, made visible",
    note: "Before an operator can trust a robot, someone has to be able to reconstruct why it did what it did. Foxglove puts every sensor stream on one synchronized timeline. The same principle belongs in operator interfaces: show the moment, the data, and the decision side by side.",
    href: "https://foxglove.dev",
    image: "/resources/foxglove-banner.webp",
    borderColor: "#12161b",
    imageAlt: "Foxglove — the observability stack for Physical AI",
  },
  {
    kind: "Tool",
    title: "Laminar: agent traces, made readable",
    note: "A strong example of making machine behavior legible. The trace reads as a conversation instead of a tree of technical events, and failures can be described in plain language and tracked across every run. Trust in an agent means being able to follow what it did and why.",
    href: "https://laminar.sh",
    image: "/resources/laminar-banner.webp",
    borderColor: "#161616",
    imageAlt: "Laminar — ship reliable agents",
  },
];
