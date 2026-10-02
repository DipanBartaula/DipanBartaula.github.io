"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

/**
 * Scroll-triggered reveal: a soft fade-and-rise once the element is in view.
 * Sets `data-inview` once visible so CSS (e.g. the eyebrow rule) can react too.
 * The motion is a compositor-only CSS transition ([data-reveal] in
 * globals.css); under prefers-reduced-motion the content is simply visible.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, seen] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      data-reveal=""
      data-inview={seen ? "true" : "false"}
      style={delay ? ({ "--rd": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
