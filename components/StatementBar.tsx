/**
 * A full-width dark bar carrying one line of point of view, between the work
 * and the rest of the page. Dark in both themes, like the hero, so it reads
 * as a deliberate pause rather than another content section.
 *
 * The headline is Archivo at 900, a step heavier than the section headings,
 * because it is a single statement meant to land at a glance.
 */
export default function StatementBar() {
  return (
    <section aria-label="Point of view" className="bg-statement-bg">
      <div className="container-wide flex flex-col items-center gap-2 py-12 text-center sm:py-14">
        <p className="font-display text-[clamp(26px,3vw,38px)] font-black leading-tight tracking-[-0.01em] text-hero-field-label">
          Attention is the bottleneck.
        </p>
        <p className="text-[clamp(15px,1.2vw,17px)] text-hero-field-subline">
          Autonomy scales. The number of people watching it does not.
        </p>
      </div>
    </section>
  );
}
