"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor="grow"]';
const NATIVE = 'input, textarea, select, [contenteditable="true"]';

/**
 * Custom dot cursor, built from scratch (no libraries). It is pure decoration
 * layered on top of the real cursor — focus states and hit targets are never
 * touched. It only activates on fine-pointer devices and stays disabled under
 * prefers-reduced-motion, so touch and motion-sensitive users get the native
 * cursor untouched. Over text inputs it hides itself and restores the caret.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ grow: false, native: false, visible: false });

  // 1. Capability check only. Kept separate so the second effect runs *after*
  //    the dot has actually rendered (dotRef is null on the first pass).
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (finePointer && !reducedMotion) setEnabled(true);
  }, []);

  // 2. Once enabled (and the dot is in the DOM), hide the native cursor and
  //    wire up movement. Cleanup restores the native cursor.
  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    document.documentElement.classList.add("custom-cursor-active");

    function apply() {
      const { grow, native, visible } = stateRef.current;
      dot!.dataset.grow = String(grow);
      dot!.style.opacity = visible && !native ? "1" : "0";
    }

    function onMove(e: MouseEvent) {
      dot!.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      const target = e.target as Element | null;
      const el = target && "closest" in target ? target : null;
      stateRef.current.visible = true;
      stateRef.current.native = !!el?.closest(NATIVE);
      stateRef.current.grow = !!el?.closest(INTERACTIVE);
      apply();
    }
    function onLeave() {
      stateRef.current.visible = false;
      apply();
    }
    function onEnter() {
      stateRef.current.visible = true;
      apply();
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} className="custom-cursor" aria-hidden="true">
      <span className="cc-ring" />
      <span className="cc-dot" />
    </div>
  );
}
