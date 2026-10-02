import type Lenis from "lenis";

let instance: Lenis | null = null;
const listeners = new Set<(l: Lenis | null) => void>();

export function setLenisInstance(l: Lenis | null) {
  instance = l;
  listeners.forEach((fn) => fn(l));
}

/** Calls `fn` with the current Lenis instance (or null) now and whenever it
 *  changes — child components mount before SmoothScroll creates Lenis, so
 *  they subscribe instead of reading the instance once. */
export function subscribeLenis(fn: (l: Lenis | null) => void): () => void {
  listeners.add(fn);
  fn(instance);
  return () => {
    listeners.delete(fn);
  };
}

/** Scrolls to an element (or #id), using Lenis when it's active so the
 *  animation stays in sync with its own scroll tracking instead of fighting
 *  a native smooth-scroll running at the same time. Falls back to a plain
 *  (instant) scrollIntoView when Lenis is off — e.g. reduced motion. */
export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (instance) {
    const lenis = instance;
    // If content above the target changes size while travelling (a panel
    // opening, a late image), the destination moves; re-aim once on arrival.
    lenis.scrollTo(el, {
      offset: -8,
      duration: 0.9,
      onComplete: () => {
        if (Math.abs(el.getBoundingClientRect().top - 8) > 2) lenis.scrollTo(el, { offset: -8, duration: 0.35 });
      },
    });
  } else {
    el.scrollIntoView({ behavior: "auto" });
  }
}
