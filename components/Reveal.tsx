"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered reveal: a soft rise with a touch of de-blur. Sets
 * `data-inview` once visible so CSS (e.g. the eyebrow rule) can react too.
 * Renders a plain, fully visible div under prefers-reduced-motion.
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
  const reduceMotion = useSafeReducedMotion();
  const [seen, setSeen] = useState(false);

  if (reduceMotion) {
    return (
      <div className={className} data-inview="true">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      data-inview={seen ? "true" : "false"}
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      onViewportEnter={() => setSeen(true)}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
}
