"use client";

import { competitions } from "@/lib/content";

/**
 * The four competitions arranged in a slow circular orbit around a centre
 * badge. Pure CSS rotation (paused on hover, frozen under reduced motion),
 * with each logo counter-rotated so it always reads upright.
 */
export default function CompetitionOrbit() {
  const n = competitions.length;
  return (
    <div className="orbit-wrap mx-auto w-full max-w-[400px]">
      {/* logos sit ~9% outside the square, so it's inset on every side to keep them clear of neighbours */}
      <div className="orbit relative mx-auto my-[9%] aspect-square w-[82%]">
        {/* rings */}
        <div className="absolute inset-[13%] rounded-full border border-dashed border-line" />
        <div className="absolute inset-[34%] rounded-full border border-line/70" />

        {/* centre badge */}
        <div className="absolute left-1/2 top-1/2 flex h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-line bg-surface text-center shadow-[var(--glow)]">
          <span className="font-display text-[1.6rem] font-semibold leading-none text-accent">4</span>
          <span className="mt-1 font-mono text-[0.58rem] uppercase tracking-wide text-inkfaint">competitions</span>
        </div>

        {/* rotating ring of logos */}
        <div className="orbit-ring absolute inset-0">
          {competitions.map((c, i) => {
            const angle = (360 / n) * i - 90;
            return (
              <div
                key={c.name}
                className="orbit-item absolute left-1/2 top-1/2 h-[26%] w-[26%]"
                style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -175%) rotate(${-angle}deg)` }}
              >
                <div
                  className="orbit-logo glow-card flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-line p-2.5 shadow-[var(--shadow)]"
                  style={{ background: c.bg }}
                  title={c.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logo} alt={c.name} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-y-1 text-center font-mono text-[0.66rem] text-inkfaint sm:grid-cols-2 sm:gap-x-4 sm:text-left">
        {competitions.map((c) => (
          <li key={c.name}>· {c.name}</li>
        ))}
      </ul>
    </div>
  );
}
