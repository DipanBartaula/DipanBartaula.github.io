"use client";

import type { ReactElement } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { contactLinks } from "@/lib/content";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type Item = { key: string; label: string; href: string; icon: ReactElement; color: string };

function build(): Item[] {
  const items: Item[] = [
    { key: "github", label: "GitHub", href: contactLinks.github, color: "#181717", icon: <GithubIcon /> },
    { key: "linkedin", label: "LinkedIn", href: contactLinks.linkedin, color: "#0A66C2", icon: <LinkedinIcon /> },
    { key: "instagram", label: "Instagram", href: contactLinks.instagram, color: "#E4405F", icon: <InstagramIcon /> },
  ];
  if (contactLinks.facebook) {
    items.push({ key: "facebook", label: "Facebook", href: contactLinks.facebook, color: "#0866FF", icon: <FacebookIcon /> });
  }
  items.push(
    { key: "gmail", label: contactLinks.email, href: `mailto:${contactLinks.email}`, color: "#EA4335", icon: <GmailIcon /> },
    { key: "campus", label: contactLinks.emailAlt, href: `mailto:${contactLinks.emailAlt}`, color: "#4f46e5", icon: <CampusIcon /> }
  );
  return items;
}

export default function SocialLinks({ compact = false }: { compact?: boolean }) {
  const reduce = useSafeReducedMotion();
  return (
    <div className="flex flex-wrap gap-2.5">
      {build().map((it) => (
        <Pill key={it.key} item={it} compact={compact} magnetic={!reduce} />
      ))}
    </div>
  );
}

function Pill({ item, compact, magnetic }: { item: Item; compact: boolean; magnetic: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });
  const external = item.href.startsWith("http");
  return (
    <motion.a
      href={item.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      aria-label={item.label}
      title={item.label}
      style={magnetic ? { x: sx, y: sy } : undefined}
      onMouseMove={
        magnetic
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              x.set((e.clientX - r.left - r.width / 2) * 0.3);
              y.set((e.clientY - r.top - r.height / 2) * 0.3);
            }
          : undefined
      }
      onMouseLeave={magnetic ? () => { x.set(0); y.set(0); } : undefined}
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3.5 font-mono text-[0.76rem] text-ink shadow-[var(--shadow)] transition-colors hover:border-accent"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110"
        style={{ background: item.color }}
      >
        <span className="h-3.5 w-3.5">{item.icon}</span>
      </span>
      {!compact && <span className="max-w-[34ch] truncate">{item.label}</span>}
    </motion.a>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.75 5.5h2.1v8H2.75v-8ZM3.8 4.5a1.22 1.22 0 1 1 0-2.44 1.22 1.22 0 0 1 0 2.44ZM7 5.5h2.02v1.1h.03c.28-.53 1-1.1 2.05-1.1 2.19 0 2.6 1.44 2.6 3.32V13.5h-2.1V9.24c0-1.02-.02-2.32-1.42-2.32-1.42 0-1.64 1.1-1.64 2.25v4.33H7v-8Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="11.6" cy="4.4" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M9.3 15.5v-6h2l.3-2.4H9.3V5.6c0-.7.2-1.2 1.2-1.2h1.2V2.3c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8H4.9v2.4h2v6h2.4Z" />
    </svg>
  );
}
function GmailIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M1.75 4.25v7.5h2.5V7.3L8 10l3.75-2.7v4.45h2.5v-7.5L8 8.9 1.75 4.25Z" />
    </svg>
  );
}
function CampusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M1.5 6 8 3l6.5 3L8 9 1.5 6Z" />
      <path d="M4 7.3v3.2c0 1 1.8 2 4 2s4-1 4-2V7.3" />
      <path d="M14.5 6v3.5" />
    </svg>
  );
}
