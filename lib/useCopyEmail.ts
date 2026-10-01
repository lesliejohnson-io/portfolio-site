"use client";

import { useEffect, useRef, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export const CONTACT_EMAIL = "leslie@lesliejohnson.io";

/**
 * Copies the contact address and holds a "copied" flag for 2s.
 *
 * Shared by the nav's Contact button and the footer's envelope so the two
 * behave identically — one copy path, one toast duration, one analytics event.
 * `location` tags the event so the two surfaces can be told apart in GA4.
 */
export function useCopyEmail(location: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The toast outlives the click, so clear it if the component goes away first.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      sendGAEvent("event", "email_copy", { location });
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable or blocked — nothing is claimed that didn't
      // happen, so no toast.
    }
  }

  return { copied, copy };
}
