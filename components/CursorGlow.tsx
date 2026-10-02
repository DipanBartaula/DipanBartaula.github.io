"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/** A soft orb that lags the cursor — desktop pointers only, off under reduced motion. */
export default function CursorGlow() {
  const reduce = useSafeReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden="true"
      // No mix-blend-mode / blur filter: a blended fixed layer forces the whole
      // page beneath it to be re-composited on every pointer move and scroll frame.
      className="pointer-events-none fixed left-0 top-0 z-[35] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        x: sx,
        y: sy,
        background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)",
        opacity: 0.28,
      }}
    />
  );
}
