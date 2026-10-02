"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Scroll-reveal trigger shared by every revealing element: one
 * IntersectionObserver per (threshold, margin) pair instead of one per
 * element, and each element is unobserved as soon as it has been seen.
 * The reveal itself is a CSS transition on opacity/transform ([data-reveal]
 * in globals.css), so it runs on the compositor with no per-frame script.
 */
const observers = new Map<string, IntersectionObserver>();
const callbacks = new WeakMap<Element, () => void>();

function observe(el: Element, amount: number, margin: string, onEnter: () => void) {
  const key = `${amount}|${margin}`;
  let io = observers.get(key);
  if (!io) {
    io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          obs.unobserve(e.target);
          callbacks.get(e.target)?.();
          callbacks.delete(e.target);
        }
      },
      { threshold: amount, rootMargin: margin }
    );
    observers.set(key, io);
  }
  callbacks.set(el, onEnter);
  io.observe(el);
  return () => {
    io!.unobserve(el);
    callbacks.delete(el);
  };
}

export function useReveal<T extends Element>(amount = 0.12, margin = "0px 0px -40px 0px"): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observe(el, amount, margin, () => setSeen(true));
  }, [amount, margin]);
  return [ref, seen];
}
