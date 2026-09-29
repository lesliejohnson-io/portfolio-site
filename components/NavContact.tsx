"use client";

import { sendGAEvent } from "@next/third-parties/google";

const MAILTO = "mailto:leslie@lesliejohnson.io?subject=Portfolio%20Inquiry";

/**
 * The nav's Contact button. A plain mailto link styled as a button — it fires
 * the same `email_click` conversion event as the footer affordance, tagged
 * with location: "nav" so the two surfaces can be told apart in GA4.
 */
export default function NavContact() {
  return (
    <a
      href={MAILTO}
      onClick={() => sendGAEvent("event", "email_click", { location: "nav" })}
      className="rounded-full border border-border-strong px-4 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-fg transition-colors hover:border-accent hover:text-accent"
    >
      Contact
    </a>
  );
}
