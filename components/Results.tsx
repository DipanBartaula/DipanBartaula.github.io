"use client";

import { useState } from "react";
import { results, certificates } from "@/lib/content";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import TiltFigure from "./TiltFigure";
import CompetitionOrbit from "./CompetitionOrbit";

export default function Results() {
  const [box, setBox] = useState<{ src: string; caption?: string } | null>(null);
  const [missing, setMissing] = useState<Record<string, boolean>>({});

  return (
    <section id="results" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§5</span>Results
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            {results.map((r, i) => (
              <Reveal key={r.metric} delay={i * 0.05}>
                <div className={`flex gap-4 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
                  <div
                    className="min-w-[84px] whitespace-nowrap pt-0.5 font-mono text-[0.85rem] font-bold tabular-nums"
                    style={{ color: ["#7c3aed", "#0891b2", "#e11d48", "#f97316", "#10b981"][i % 5] }}
                  >
                    {r.metric}
                  </div>
                  <p className="text-[0.95rem] text-inksoft">{r.body}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.2}>
              <CompetitionOrbit />
            </Reveal>
          </div>

          <div className="flex flex-col gap-4">
            <Reveal>
              <div className="font-mono text-[0.7rem] uppercase tracking-wide text-inkfaint">Certificates</div>
            </Reveal>
            {certificates.map((c, i) => (
              <Reveal key={c.src} delay={0.05 + i * 0.06}>
                <TiltFigure
                  onClick={() => setBox({ src: c.src, caption: c.title })}
                  className="glow-card group w-full overflow-hidden rounded-xl border border-line bg-surface text-left shadow-[var(--shadow)]"
                >
                  <div className="bg-[#f6f5f1] p-2.5">
                    {missing[c.src] ? (
                      <div className="flex aspect-[1.41] w-full items-center justify-center rounded border border-dashed border-line font-mono text-[0.7rem] text-inkfaint">
                        certificate image pending &mdash; add {c.src.replace("/images/", "public/images/")}
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={c.src}
                        alt={c.title}
                        className="block w-full rounded object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                        onError={() => setMissing((m) => ({ ...m, [c.src]: true }))}
                      />
                    )}
                  </div>
                  <div className="px-3.5 py-2.5">
                    <div className="text-[0.9rem] font-semibold">{c.title}</div>
                    <div className="mt-0.5 font-mono text-[0.68rem] text-inkfaint">{c.sub}</div>
                  </div>
                </TiltFigure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <Lightbox src={box?.src ?? null} caption={box?.caption} onClose={() => setBox(null)} />
    </section>
  );
}
