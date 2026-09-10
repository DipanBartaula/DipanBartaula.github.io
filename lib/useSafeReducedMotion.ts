"use client";

import { useEffect, useState } from "react";

/**
 * Like framer-motion's `useReducedMotion`, but SSR/hydration-safe: always
 * returns `false` on the server and on the client's first (hydrating) render
 * — matching each other exactly — then corrects to the real value in an
 * effect once mounted. Reading `matchMedia` synchronously during render (as
 * some versions of the framer-motion hook do) returns a different answer on
 * the server than on the client's very first paint, which React's hydration
 * flags as a mismatch; deferring to an effect avoids that at the cost of a
 * brief (sub-frame, non-jarring) delay before the reduced state applies.
 */
export function useSafeReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
