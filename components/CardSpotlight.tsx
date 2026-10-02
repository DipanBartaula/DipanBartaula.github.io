"use client";

import { useEffect } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * One global pointer listener that feeds each hovered `.glow-card` its
 * cursor position as CSS variables, so a soft radial highlight can follow
 * the cursor across the card (see `.glow-card::before` in globals.css).
 */
export default function CardSpotlight() {
  const reduce = useSafeReducedMotion();
  useEffect(() => {
    if (reduce) return;
    // Coalesce pointer events to one layout read + style write per frame.
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const card = (e.target as HTMLElement | null)?.closest?.(".glow-card") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduce]);
  return null;
}
