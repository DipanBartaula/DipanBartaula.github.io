"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";
import { scrollToTarget, setLenisInstance } from "@/lib/lenisSingleton";

/**
 * Wraps the page in Lenis's inertia-scroll. Skipped entirely when the user
 * prefers reduced motion — native scroll (already fully functional) takes
 * over with no behavior change beyond losing the inertia feel.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    // lerp (rather than a fixed 1.25s duration) keeps the page glued to the
    // wheel: each frame closes ~14% of the remaining distance, so it feels
    // smooth without the floaty lag of a long timed ease.
    const lenis = new Lenis({
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
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
      scrollToTarget(el);
    };
    document.addEventListener("click", onAnchorClick);

    // Run Lenis's frame loop only while it is actually animating a scroll.
    // An always-on rAF loop makes the main thread produce every frame, which
    // forces the browser to re-style even compositor-only animations (the
    // research figures, marquee, orbit) on each one; idle, the page now costs
    // nothing. Every smooth scroll — wheel input and programmatic jumps alike —
    // goes through lenis.scrollTo, so that is where the loop is (re)started.
    let raf = 0;
    const clock = lenis as unknown as { time: number; animate: { isRunning: boolean } };
    function loop(time: number) {
      lenis.raf(time);
      // Keyed on the animation itself, not lenis.isScrolling: a timer left over
      // from an earlier native scroll can clear isScrolling mid-animation, which
      // would otherwise freeze a jump partway to its target.
      raf = clock.animate.isRunning ? requestAnimationFrame(loop) : 0;
    }
    const kick = () => {
      if (raf) return;
      clock.time = 0; // first frame after a pause advances by 0, not by the idle gap
      raf = requestAnimationFrame(loop);
    };
    const scrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = ((...args: Parameters<typeof lenis.scrollTo>) => {
      scrollTo(...args);
      kick();
    }) as typeof lenis.scrollTo;

    // Scroll shield (.scroll-shield in globals.css): up only while the page is
    // visibly moving, so hover states don't churn under a still cursor — and
    // dropped as soon as it slows to a crawl (or 120 ms after the last
    // movement), so clicks in the long easing tail are never swallowed.
    const root = document.documentElement;
    let moving = false;
    let idle = 0;
    const settle = () => {
      clearTimeout(idle);
      if (moving) {
        moving = false;
        delete root.dataset.moving;
      }
    };
    const offScroll = lenis.on("scroll", ({ velocity }: { velocity: number }) => {
      const fast = Math.abs(velocity) > 1.5;
      if (fast && !moving) {
        moving = true;
        root.dataset.moving = "";
      } else if (!fast && moving) settle();
      clearTimeout(idle);
      if (moving) idle = window.setTimeout(settle, 120);
    });

    // A press while the page is moving lands on the shield. Treat it like a
    // press on a native scroller: stop the momentum where it is, drop the
    // shield, and let the release activate whatever is under the pointer — so
    // a click during a scroll is never lost.
    const shield = document.querySelector<HTMLElement>(".scroll-shield");
    let pressed: { x: number; y: number } | null = null;
    const onShieldDown = (e: PointerEvent) => {
      pressed = { x: e.clientX, y: e.clientY };
      lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
      settle();
    };
    const onUp = (e: PointerEvent) => {
      if (!pressed) return;
      const near = Math.abs(e.clientX - pressed.x) < 6 && Math.abs(e.clientY - pressed.y) < 6;
      pressed = null;
      if (!near) return;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const target = hit?.closest<HTMLElement>('a, button, [role="button"], [role="tab"], summary, label, input, select, textarea');
      target?.click();
    };
    shield?.addEventListener("pointerdown", onShieldDown);
    window.addEventListener("pointerup", onUp, true);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      shield?.removeEventListener("pointerdown", onShieldDown);
      window.removeEventListener("pointerup", onUp, true);
      cancelAnimationFrame(raf);
      offScroll();
      settle();
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [reduceMotion]);

  return <>{children}</>;
}
