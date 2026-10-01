"use client";

import { useEffect, useState } from "react";

/**
 * The mobile menu's status block: availability, then place and local time.
 *
 * The clock renders empty on the server and fills in after mount — formatting
 * a time during SSR would bake the build machine's clock into the HTML and
 * mismatch on hydration. It only ticks while the menu is open, so a closed
 * menu costs nothing.
 */
export default function MenuStatus({ active }: { active: boolean }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    const format = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="mt-8 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">
      <p className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]"
        />
        Status · <span className="text-fg-secondary">Open to roles</span>
      </p>
      <p className="mt-2">
        Pittsburgh, PA ·{" "}
        {/* Reserve the slot so the line doesn't reflow when the clock lands. */}
        <span className="inline-block min-w-[3.5em] tabular-nums">
          {time ?? ""}
        </span>{" "}
        ET
      </p>
    </div>
  );
}
