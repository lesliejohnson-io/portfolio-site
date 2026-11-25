import type { Metadata } from "next";
import WorkRow from "@/components/WorkRow";
import { getWorkItems, type WorkItem, type WorkVisual } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work — Leslie Johnson",
  description:
    "Case studies in AI product design, service design, and design systems.",
};

/*
  The home row's still, when it sets one (e.g. Field Guide's field
  photograph instead of its device mockup). Its alt text falls back to
  heroAlt when the still is the hero image, as on the home page.
*/
function homeStill(item: WorkItem): WorkVisual | undefined {
  const image = item.home?.image;
  if (!image) return undefined;
  return {
    type: "image",
    src: image,
    alt:
      item.home?.imageAlt ?? (image === item.hero ? item.heroAlt : undefined),
  };
}

export default function WorkPage() {
  const items = getWorkItems();

  return (
    <div className="container-wide pb-24 pt-16 sm:pt-20">
      <header className="max-w-2xl">
        {/*
          Sized like the home page's section headings (h2 size), but still
          the page's h1: every page needs exactly one, and screen reader users
          jump to it to find where the content starts.
        */}
        <h1 className="font-display text-[clamp(28px,3.2vw,40px)] font-bold leading-tight tracking-[-0.02em] text-fg">
          Selected work
        </h1>
      </header>

      <div className="mt-12">
        {/*
          A study's shorter home-page title, summary and still (frontmatter
          `home:`) are used here too, so a study reads and looks the same on
          /work as on the home page. The case study page keeps its own.

          Rows alternate: every second one puts its visual on the left.
        */}
        {items.map((item, i) => (
          <WorkRow
            key={item.slug}
            flip={i % 2 === 1}
            item={{
              ...item,
              title: item.home?.title ?? item.title,
              summary: item.home?.summary ?? item.summary,
              visual: homeStill(item) ?? item.visual,
            }}
          />
        ))}
      </div>
    </div>
  );
}
