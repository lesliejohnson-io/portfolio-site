"use client";

import { CONTACT_EMAIL, useCopyEmail } from "@/lib/useCopyEmail";

/**
 * One-click copy of the contact address.
 *
 * The button used to open a menu offering "Copy email" and "Send me an email".
 * It now does the copying itself — the mail option lives on the nav's Contact
 * button, so the menu was a step in front of the only thing left to do here.
 */
export default function EmailAffordance({
  className = "",
}: {
  className?: string;
}) {
  const { copied, copy } = useCopyEmail("footer");

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`Copy email address, ${CONTACT_EMAIL}`}
        onClick={copy}
        className="flex items-center justify-center rounded-full p-2 text-fg-secondary transition-colors hover:text-accent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-[22px] w-[22px]"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </button>

      {/*
        Anchored above the button rather than fixed to the viewport: the
        affordance lives in the footer, so a toast below it would open off the
        bottom of the page. role="status" announces it once to screen readers
        without stealing focus.
      */}
      {copied && (
        <div
          role="status"
          className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 whitespace-nowrap rounded-md bg-accent px-3 py-2 font-mono text-xs text-accent-fg shadow-lg"
        >
          Email copied!
        </div>
      )}
    </div>
  );
}
