"use client";

import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { CONTACT_MAILTO } from "@/lib/contact";

/**
 * The two closing calls to action on About. They sit in the reading column
 * with the prose, and borrow the nav Contact button's pill shape so a button
 * reads the same wherever it appears: the primary one filled in the accent,
 * the secondary one outlined.
 *
 * "Get in touch" is a plain mailto rather than the nav's copy-to-clipboard
 * affordance — at the end of a story the intent is to write, not to copy an
 * address for later. It fires `email_click`, tagged location: "about", so the
 * two kinds of contact can be told apart in GA4.
 *
 * This is a client component only for that event. The anchor is a real link
 * with a real href, so the mail client still opens if the handler never runs.
 */
export default function AboutCta() {
  return (
    <div className="about-cta">
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-accent-fg transition-opacity hover:opacity-90"
      >
        See the work
        <span aria-hidden="true">→</span>
      </Link>
      <a
        href={CONTACT_MAILTO}
        /*
          No preventDefault: the event is sent and the browser then follows the
          mailto as it normally would. Blocking navigation to wait on analytics
          would risk losing the click for the sake of recording it.
        */
        onClick={() => sendGAEvent("event", "email_click", { location: "about" })}
        className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-5 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-fg transition-colors hover:border-accent hover:text-accent"
      >
        Get in touch
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
