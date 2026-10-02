import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type WorkItem = {
  slug: string;
  order: number;
  name: string;
  tag: string;
  role?: string;
  title: string;
  /**
   * A phrase inside `title` to set in the accent colour on the work row.
   * Matched case-insensitively; ignored if it isn't found, so a typo degrades
   * to a plain title rather than breaking the row.
   */
  titleHighlight?: string;
  who: string;
  what: string;
  /** A hard-metric result line, e.g. "84% decrease in…" — shown as a RESULT: row. */
  result?: string;
  /** A one-line descriptive card blurb, used when there's no hard metric to lead with. */
  summary?: string;
  /** Shown in the "Selected case studies" set on the home page. */
  featured?: boolean;
  /**
   * The row's visual. Omit it and the row shows the "Visual pending"
   * placeholder, so rows can be filled in one at a time as assets arrive.
   */
  visual?: WorkVisual;
  /**
   * Partner / funder marks shown under the case study title. Supply white
   * artwork on a transparent background — the strip tints it per theme.
   */
  logos?: WorkLogo[];
  /**
   * Opt in to the CASE_STUDY_LAYOUT.md page template. Omit it and the study
   * keeps the original layout, so studies migrate one at a time.
   */
  layout?: "v2";
  /**
   * A short note on where the work stands, shown directly under the title.
   * Only for studies still in progress — omit it and nothing renders.
   */
  status?: string;
  /**
   * The hero's surrounding band colour, sampled from the artwork's own
   * background so the two read as one continuous field running the full width
   * of the page. Content, not theme — hence a literal value in frontmatter
   * rather than a token. Omit it and the hero keeps its bordered frame.
   */
  heroBackground?: string;
  /** Pill label above the title, e.g. "Health Research". One per study. */
  category?: string;
  /** Wide hero directly under the header. Image, or .mp4/.webm for a clip. */
  hero?: string;
  heroAlt?: string;
  /** What the hero will show, used by the placeholder until the asset exists. */
  heroPending?: string;
  /** Up to three measured outcomes. Only real numbers; never padded. */
  stats?: WorkStat[];
};

export type WorkStat = {
  value: string;
  label: string;
  /** How the number was measured. Shown verbatim; never invented. */
  caption?: string;
};

export type WorkLogo = {
  src: string;
  /** The organisation's name. Used as the mark's alt text. */
  alt: string;
  /**
   * Optional size multiplier for this mark alone, e.g. 0.85. Supplied artwork
   * has different amounts of padding baked in, so marks that fill their canvas
   * read larger than ones that don't even at the same box size. This evens
   * them up as a content edit rather than a per-study rule in the component.
   */
  scale?: number;
};

/**
 * A looping, silent video for a work row. `sources` is ordered by preference —
 * the browser picks the first format it can play, so list webm before mp4.
 * `orientation: "portrait"` letterboxes the clip on a dark mat inside the
 * row's landscape frame instead of cropping it.
 */
/**
 * A work row's visual. A still and a clip are the same slot, discriminated by
 * `type`, so a row can start as an export and become a moving one later
 * without the row component or the frontmatter shape changing around it.
 */
export type WorkVisual =
  | {
      type: "video";
      poster: string;
      sources: string[];
      orientation?: "portrait" | "landscape";
      /** Describes what the clip shows, for the poster's alt text. */
      alt?: string;
    }
  | {
      type: "image";
      src: string;
      orientation?: "portrait" | "landscape";
      alt?: string;
    };

const WORK_DIR = path.join(process.cwd(), "content", "work");

export function getWorkItems(): WorkItem[] {
  const files = fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));

  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data } = matter(raw);
    return data as WorkItem;
  });

  return items.sort((a, b) => a.order - b.order);
}

/**
 * The home page's "Selected case studies" set. Driven by `featured: true` in
 * each file's frontmatter, so changing what's featured is a content edit — no
 * hardcoded slug list in the components.
 */
export function getFeaturedWorkItems(): WorkItem[] {
  return getWorkItems().filter((item) => item.featured);
}
