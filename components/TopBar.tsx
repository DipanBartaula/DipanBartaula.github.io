"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sections } from "@/lib/content";
import { useActiveSection } from "@/lib/useActiveSection";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [progress, setProgress] = useState(0);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-5 py-3.5 sm:gap-4 sm:px-8">
        <div className="min-w-0 truncate font-mono text-[0.78rem] tracking-wide">
          <b className="font-bold text-ink">D. BARTAULA</b>{" "}
          <span className="text-inkfaint">/ research &amp; engineering portfolio · v2.0</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {sections
            .filter((s) => s.idx)
            .map((s) => {
              const isActive = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`relative whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-wide transition-colors duration-300 ${
                    isActive ? "text-accent" : "text-inksoft hover:text-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-[var(--accent-wash)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {s.navLabel}
                </a>
              );
            })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenPalette}
            className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[0.7rem] text-inksoft shadow-sm transition-colors hover:border-accent hover:text-accent sm:flex"
            aria-label="Open command palette to jump to a section"
          >
            Jump to…
            <kbd className="rounded border border-line bg-surface2 px-1.5 py-0.5 text-[0.62rem]">/</kbd>
          </button>
          <button
            onClick={onOpenPalette}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-inksoft shadow-sm transition-colors hover:border-accent hover:text-accent sm:hidden"
            aria-label="Open navigation menu"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M2 4.5h12M2 8h12M2 11.5h12" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>
      <div className="h-[2px] w-full bg-line/60">
        <div
          className="h-full transition-[width] duration-200 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3))",
          }}
        />
      </div>
    </header>
  );
}
