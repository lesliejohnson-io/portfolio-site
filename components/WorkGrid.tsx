import { getWorkItems } from "@/lib/work";
import WorkCard from "@/components/WorkCard";

export default function WorkGrid() {
  const items = getWorkItems();

  return (
    <section id="work" className="mx-auto max-w-5xl px-6 pb-24">
      <h2 className="sr-only">Selected Work</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <WorkCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}
