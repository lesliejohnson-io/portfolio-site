"use client";

import { useEffect, useRef, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

const EMAIL = "leslie@lesliejohnson.io";
const MAILTO = `mailto:${EMAIL}?subject=Portfolio%20Inquiry`;

export default function EmailAffordance({
  className = "",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      sendGAEvent("event", "email_copy");
      setCopied(true);
      // Show the "Copied" confirmation, then close the popover after 1s.
      setTimeout(() => {
        setOpen(false);
        setCopied(false);
      }, 1000);
    } catch {
      // Clipboard API unavailable — the mailto link below still works.
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Contact via email"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full p-2 text-fg-secondary transition-colors hover:text-accent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-border bg-bg-raised p-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-mono text-xs text-fg hover:bg-surface"
          >
            <span>{copied ? "Copied" : "Copy email"}</span>
          </button>
          <a
            role="menuitem"
            href={MAILTO}
            onClick={() => sendGAEvent("event", "email_click")}
            className="block rounded-md px-3 py-2 font-mono text-xs text-fg hover:bg-surface"
          >
            Send me an email
          </a>
        </div>
      )}
    </div>
  );
}
