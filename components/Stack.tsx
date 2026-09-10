"use client";

import { stackGroups, type StackItem } from "@/lib/content";
import Reveal from "./Reveal";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const groupHue = ["#7c3aed", "#0891b2", "#f97316", "#10b981"];

function Monogram({ name }: { name: string }) {
  const letters = name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <span
      className="flex h-full w-full items-center justify-center font-mono text-[0.72rem] font-bold text-white"
      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}
    >
      {letters}
    </span>
  );
}

function Skill({ item, index, reduce }: { item: StackItem; index: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -3, scale: 1.03 }}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface2 px-3 py-2.5 transition-colors hover:border-accent/50"
    >
      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line bg-white p-1.5">
        {item.icon ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.icon} alt="" className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <Monogram name={item.name} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.88rem] font-semibold leading-tight">{item.name}</span>
        {item.note && (
          <span className="mt-0.5 block font-mono text-[0.64rem] leading-snug text-inkfaint">{item.note}</span>
        )}
      </span>
    </motion.div>
  );
}

function LogoMarquee() {
  const icons = stackGroups.flatMap((g) => g.items.filter((i) => i.icon).map((i) => ({ icon: i.icon!, name: i.name })));
  const loop = [...icons, ...icons];
  return (
    <div className="marquee relative mt-6 overflow-hidden rounded-2xl border border-line bg-surface py-3 shadow-[var(--shadow)]" aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-8 px-4">
        {loop.map((it, i) => (
          <span key={`${it.name}-${i}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-white p-2" title={it.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.icon} alt="" className="h-full w-full object-contain" loading="lazy" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Stack() {
  const reduce = useSafeReducedMotion();
  return (
    <section id="stack" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§6</span>Stack
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <LogoMarquee />
        </Reveal>
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {stackGroups.map((g, gi) => (
            <Reveal key={g.title} delay={gi * 0.06}>
              <div
                className="glow-card accent-card h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow)]"
                style={{ ["--card-accent" as string]: groupHue[gi % groupHue.length] }}
              >
                <div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${groupHue[gi % groupHue.length]}, var(--accent2), transparent)` }}
                />
                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-[1.15rem] font-semibold">{g.title}</h3>
                  <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-wide text-inkfaint">{g.tagline}</p>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {g.items.map((it, i) => (
                      <Skill key={it.name} item={it} index={i} reduce={reduce} />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
