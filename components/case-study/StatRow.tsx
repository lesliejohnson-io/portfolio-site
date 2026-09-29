import type { WorkStat } from "@/lib/work";
import StatValue from "@/components/case-study/StatValue";

/**
 * A row of up to three measured outcomes. Used twice on a page — once under
 * the hero and again inside Outcomes & Impact — reading the same frontmatter
 * both times, so a number is written in exactly one place. Both instances
 * render identically and sit in the body column, so the page repeats one
 * treatment rather than two sizes of the same thing.
 *
 * A stat with no caption renders the value and label alone rather than
 * inventing a measurement note. The row is omitted entirely when a study has
 * no verified numbers; it is never padded to fill three columns.
 */
export default function StatRow({
  stats,
  showCaptions = true,
  id,
}: {
  stats?: WorkStat[];
  /** The strip under the hero hides captions; Outcomes & Impact carries them. */
  showCaptions?: boolean;
  /** Anchor target, so the strip can link down to the captioned row. */
  id?: string;
}) {
  if (!stats?.length) return null;

  // Static strings on purpose: Tailwind scans source text for class names, so
  // an interpolated `sm:grid-cols-${n}` would never be generated.
  const columns =
    { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[
      Math.min(stats.length, 3)
    ] ?? "sm:grid-cols-3";

  return (
    <dl
      id={id}
      /*
        -1 so following the anchor moves keyboard focus here rather than
        leaving it behind; scroll-mt clears the sticky nav.
      */
      tabIndex={id ? -1 : undefined}
      className={`grid gap-5 border-t border-border pt-6 scroll-mt-28 ${columns}`}
    >
      {stats.slice(0, 3).map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1.5">
          <dt className="sr-only">{stat.label}</dt>
          <dd className="contents">
            <span className="font-display text-3xl font-bold leading-none text-fg">
              <StatValue value={stat.value} />
            </span>
            <span className="text-sm text-fg-secondary">{stat.label}</span>
            {showCaptions && stat.caption && (
              <span className="mt-1 text-xs leading-relaxed text-fg-muted">
                {stat.caption}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
