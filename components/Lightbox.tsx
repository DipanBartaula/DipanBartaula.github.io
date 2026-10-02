"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import FlowFigure from "./FlowFigure";
import type { FlowSpec } from "@/lib/flows";

/** Fired on open/close so in-page animated figures can pause behind the viewer. */
export const LIGHTBOX_EVENT = "lightbox-toggle";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Lightbox({
  src,
  caption,
  flow,
  onClose,
}: {
  src: string | null;
  caption?: string;
  /** When given, the enlarged figure keeps its animation. */
  flow?: FlowSpec;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const reduceMotion = useSafeReducedMotion();
  // Rendered into <body> so no section's stacking context can sit above it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!src) return;
    lastFocused.current = document.activeElement as HTMLElement;
    window.dispatchEvent(new CustomEvent(LIGHTBOX_EVENT, { detail: true }));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.dispatchEvent(new CustomEvent(LIGHTBOX_EVENT, { detail: false }));
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [src, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/80 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : undefined}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={caption ?? "Figure viewer"}
            className={`relative overflow-hidden rounded-lg border border-line/40 ${flow ? "max-w-[94vw] bg-white p-3" : "max-h-[80vh] w-full max-w-4xl bg-surface"}`}
            style={flow ? { width: `min(94vw, 1400px, calc((100vh - 15rem) * ${flow.w / flow.h}))` } : undefined}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {flow ? (
              <FlowFigure spec={flow} src={src} alt={caption ?? "Figure"} standalone />
            ) : (
              <img src={src} alt={caption ?? "Figure"} className="h-auto max-h-[76vh] w-full object-contain" />
            )}
          </motion.div>
          {caption && (
            <p className="max-w-2xl text-center font-mono text-xs text-white/70">{caption}</p>
          )}
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="rounded-full border border-white/30 px-4 py-1.5 font-mono text-xs text-white/80 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close (esc)
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
