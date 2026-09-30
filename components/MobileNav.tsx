"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import NavContact from "@/components/NavContact";

/**
 * Small-screen menu: a full-height panel that slides in from the left.
 *
 * Built as a modal dialog rather than a shown/hidden div, because that is what
 * it behaves like — it covers the page and takes the keyboard. So: Escape
 * closes it, focus moves into it on open and returns to the button on close,
 * the page behind it can't scroll, and the rest of the page is inert to
 * assistive tech while it is open.
 *
 * The panel is always mounted so the slide can animate both ways; it is
 * translated off-screen and made inert when closed. Under prefers-reduced-
 * motion it appears and disappears without the slide.
 *
 * It renders through a portal to <body> rather than in place, because the nav
 * bar has a backdrop-filter — and an ancestor with a filter or backdrop-filter
 * becomes the containing block for `position: fixed` children. Left in place,
 * the panel sizes itself against the bar instead of the viewport.
 */
export default function MobileNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Portals need a DOM; nothing to render into during SSR.
  useEffect(() => setMounted(true), []);

  /*
    Close if the viewport grows past the breakpoint. The button is hidden at
    md and up, but the panel renders through a portal to <body>, so the
    `md:hidden` on its parent doesn't reach it — left open, it would sit over
    the desktop layout with no visible way back to it.
  */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setOpen(false);
    };
    onChange(mq);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // Hold the page still behind the panel.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      buttonRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-fg-secondary transition-colors hover:text-accent"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Scrim. Click anywhere off the panel to dismiss. */}
            <div
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            <div
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              inert={!open}
              className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border bg-bg px-6 py-5 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-fg-secondary transition-colors hover:text-accent"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display rounded-md py-2 text-2xl font-bold tracking-[-0.01em] text-fg transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8">
                <NavContact />
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
