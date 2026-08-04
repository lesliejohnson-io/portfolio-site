import { getWorkItems } from "@/lib/work";
import WorkCardStack from "@/components/WorkCardStack";

export default function WorkGrid() {
  const items = getWorkItems();

  return (
    <section id="work" className="mx-auto max-w-4xl px-6 pb-24">
      <h2 className="sr-only">Selected Work</h2>
      <WorkCardStack items={items} />
    </section>
  );
}
