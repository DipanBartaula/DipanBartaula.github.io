"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";
import { setLenisInstance } from "@/lib/lenisSingleton";

/**
 * Wraps the page in Lenis's inertia-scroll. Skipped entirely when the user
 * prefers reduced motion — native scroll (already fully functional) takes
 * over with no behavior change beyond losing the inertia feel.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // silky exponential ease-out
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });
    setLenisInstance(lenis);

    // All in-page anchors (#id) hand off to Lenis instead of the browser's
    // own jump, so the two scroll systems never fight each other.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector<HTMLElement>(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -8 });
    };
    document.addEventListener("click", onAnchorClick);

    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [reduceMotion]);

  return <>{children}</>;
}
