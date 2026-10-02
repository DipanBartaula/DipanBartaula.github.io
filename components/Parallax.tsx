"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { scroll } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * Gentle scroll-linked drift (a few px) so figures feel layered above the page.
 * Where the browser supports CSS scroll-driven animations, the drift runs as a
 * `view()` timeline on the compositor — no JavaScript per scroll frame. Other
 * browsers fall back to framer's imperative `scroll()` over the same range
 * (element top at viewport bottom → element bottom at viewport top).
 */
export default function Parallax({
  children,
  amount = 18,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useSafeReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    el.style.setProperty("--parallax", `${amount}px`);
    // view() tracks the nearest scroll container, so it only matches the page
    // scroll when no ancestor clips with overflow hidden/auto/scroll (`clip` is fine).
    const pageIsScroller = () => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (/(hidden|auto|scroll)/.test(cs.overflowX + cs.overflowY)) return false;
      }
      return true;
    };
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()") && pageIsScroller()) {
      el.classList.add("parallax-css");
      return () => el.classList.remove("parallax-css");
    }
    const stop = scroll(
      (p: number) => {
        el.style.transform = `translate3d(0, ${(amount - 2 * amount * p).toFixed(2)}px, 0)`;
      },
      { target: el, offset: ["start end", "end start"] }
    );
    return () => {
      stop();
      el.style.transform = "";
    };
  }, [amount, reduce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
