"use client";

import { CONTACT_EMAIL, useCopyEmail } from "@/lib/useCopyEmail";

/**
 * The nav's Contact button. It copies the address rather than opening a mail
 * client, matching the footer's envelope — same copy, same 2s toast, same
 * `email_copy` event, tagged location: "nav" so the two surfaces can be told
 * apart in GA4.
 */
export default function NavContact({
  /*
    Where the toast opens. The desktop bar sits at the top of the page, so its
    toast drops below the button. In the mobile panel the button is pinned to
    the bottom-left corner, where "below and right-aligned" lands off both the
    bottom and the left edge of the screen.
  */
  toastPlacement = "below",
}: {
  toastPlacement?: "below" | "above";
}) {
  const { copied, copy } = useCopyEmail("nav");

  const toastPosition =
    toastPlacement === "above"
      ? "bottom-full left-0 mb-2"
      : "top-full right-0 mt-2";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy email address, ${CONTACT_EMAIL}`}
        className="rounded-full border border-border-strong px-4 py-1.5 font-mono text-xs uppercase tracking-[0.06em] text-fg transition-colors hover:border-accent hover:text-accent"
      >
        Contact
      </button>

      {copied && (
        <div
          role="status"
          className={`pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-accent px-3 py-2 font-mono text-xs normal-case text-accent-fg shadow-lg ${toastPosition}`}
        >
          Email copied!
        </div>
      )}
    </div>
  );
}
