"use client";

import { hobbies } from "@/lib/content";
import Reveal from "./Reveal";
import TiltFigure from "./TiltFigure";

export default function Hobbies() {
  return (
    <section id="hobbies" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§9</span>Off the Clock
          </div>
        </Reveal>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hobbies.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.06}>
              <TiltFigure className="glow-card flex h-full w-full flex-col content-start items-stretch overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[var(--shadow)]">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.image} alt={h.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <div className="font-display text-[1.05rem] font-semibold">{h.title}</div>
                  <div className="mt-0.5 text-[0.85rem] text-inksoft">{h.sub}</div>
                  {h.credit && (
                    <a
                      href={h.credit.href}
                      target="_blank"
                      rel="noopener"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-block font-mono text-[0.62rem] text-inkfaint underline-offset-2 hover:text-accent hover:underline"
                    >
                      {h.credit.text}
                    </a>
                  )}
                </div>
              </TiltFigure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
