"use client";

import { logEntries } from "@/lib/content";
import Reveal from "./Reveal";
import { motion } from "framer-motion";

export default function Log() {
  return (
    <section id="log" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§3</span>Log &mdash; Experience
          </div>
        </Reveal>
        <div className="mt-6 flex flex-col gap-4">
          {logEntries.map((e, i) => (
            <Reveal key={e.role + e.org} delay={i * 0.05}>
              <motion.article
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="glow-card grid grid-cols-1 gap-5 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)] sm:grid-cols-[1fr_120px] sm:items-center sm:p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[0.76rem] tabular-nums text-inkfaint">
                    <span>{e.date}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[0.66rem] font-semibold text-white"
                      style={{ background: ["#7c3aed", "#0891b2", "#f97316", "#e11d48"][i % 4] }}
                    >
                      {e.duration}
                    </span>
                  </div>
                  <div className="mt-1 font-display text-[1.12rem] font-semibold leading-snug">
                    {e.role} <span className="text-accent">&middot; {e.org}</span>
                  </div>
                  <p className="mt-2 max-w-[68ch] text-[0.94rem] text-inksoft">{e.desc}</p>
                </div>
                <div
                  className="flex h-[88px] w-[120px] items-center justify-center justify-self-start overflow-hidden rounded-xl border border-line p-3 sm:justify-self-end"
                  style={{ background: e.logoBg }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.logo} alt={`${e.org} logo`} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
