import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenisInstance(l: Lenis | null) {
  instance = l;
}

/** Scrolls to an element (or #id), using Lenis when it's active so the
 *  animation stays in sync with its own scroll tracking instead of fighting
 *  a native smooth-scroll running at the same time. Falls back to a plain
 *  (instant) scrollIntoView when Lenis is off — e.g. reduced motion. */
export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset: -8 });
  } else {
    el.scrollIntoView({ behavior: "auto" });
  }
}
