"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sections, repos, contactLinks } from "@/lib/content";
import { scrollToTarget } from "@/lib/lenisSingleton";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type Item = { label: string; hint: string; action: () => void };

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const reduceMotion = useSafeReducedMotion();

  const items: Item[] = useMemo(() => {
    const nav: Item[] = sections
      .filter((s) => s.idx)
      .map((s) => ({
        label: `Go to ${s.label}`,
        hint: "section",
        action: () => scrollToTarget(`#${s.id}`),
      }));
    const repoItems: Item[] = repos.map((r) => ({
      label: r.name,
      hint: "repository ↗",
      action: () => window.open(r.href, "_blank", "noopener"),
    }));
    const contact: Item[] = [
      { label: "Email — " + contactLinks.email, hint: "contact", action: () => (window.location.href = `mailto:${contactLinks.email}`) },
      { label: "GitHub profile", hint: "contact ↗", action: () => window.open(contactLinks.github, "_blank", "noopener") },
      { label: "LinkedIn profile", hint: "contact ↗", action: () => window.open(contactLinks.linkedin, "_blank", "noopener") },
    ];
    return [...nav, ...repoItems, ...contact];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 10);
  }, [items, query]);

  // Open: remember trigger, lock body scroll, focus the input.
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement as HTMLElement;
      setQuery("");
      setCursor(0);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Close: restore focus to whatever opened the palette.
  useEffect(() => {
    if (!open) lastFocused.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        filtered[cursor]?.action();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        // Trap focus inside the panel.
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
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, cursor, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 backdrop-blur-sm pt-[14vh]"
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
            aria-label="Command palette"
            className="w-[min(560px,92vw)] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="font-mono text-inkfaint">/</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                placeholder="Jump to a section, repo, or contact link…"
                aria-label="Search sections, repositories, and contact links"
                className="w-full rounded bg-transparent font-sans text-sm text-ink placeholder:text-inkfaint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
              <button
                onClick={onClose}
                aria-label="Close command palette"
                className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.62rem] text-inkfaint transition-colors hover:border-accent hover:text-accent"
              >
                esc
              </button>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto py-1.5">
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center font-mono text-xs text-inkfaint">No matches.</li>
              )}
              {filtered.map((item, i) => (
                <li key={item.label}>
                  <button
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] ${
                      i === cursor ? "bg-[var(--accent-wash)] text-ink" : "text-inksoft"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[0.68rem] text-inkfaint">{item.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
