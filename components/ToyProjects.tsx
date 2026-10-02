"use client";

import { useState } from "react";
import { toyProjects } from "@/lib/content";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import FlowFigure from "./FlowFigure";
import { srcSet } from "@/lib/img";
import { FLOWS, type FlowSpec } from "@/lib/flows";

export default function ToyProjects() {
  const [box, setBox] = useState<{ src: string; caption?: string; flow?: FlowSpec } | null>(null);

  return (
    <section id="toys" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§5</span>Toy Projects
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-prose text-inksoft">
            Smaller, self-contained builds — finished for the fun of it, and on GitHub. Click a diagram to enlarge it.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {toyProjects.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.06}>
              <article
                className="glow-card accent-card flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow)]"
                style={{ ["--card-accent" as string]: i === 0 ? "#10b981" : "#f97316" }}
              >
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${i === 0 ? "#10b981" : "#f97316"}, var(--accent2), transparent)` }} />
                {"flow" in t && t.flow ? (
                  <div className="border-b border-line bg-white p-2.5">
                    <FlowFigure
                      spec={FLOWS[t.flow]}
                      src={t.image}
                      srcSet={srcSet(t.image, 2400)}
                      sizes="(min-width: 1024px) 520px, 100vw"
                      alt={`${t.title} — system diagram`}
                      onOpen={() => setBox({ src: t.image, caption: `${t.title} — ${t.subtitle}`, flow: FLOWS[t.flow] })}
                    />
                  </div>
                ) : (
                <button
                  type="button"
                  onClick={() => setBox({ src: t.image, caption: `${t.title} — ${t.subtitle}` })}
                  className="group block w-full cursor-zoom-in overflow-hidden border-b border-line bg-white"
                  aria-label={`Enlarge the ${t.title} diagram`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={`${t.title} — system diagram`}
                    className="block aspect-[16/9] w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                    loading="lazy" decoding="async"
                  />
                </button>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-[1.15rem] font-semibold leading-snug">{t.title}</h3>
                  <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wide text-inkfaint">{t.subtitle}</p>
                  <p className="mt-3 flex-1 text-[0.93rem] leading-[1.65] text-inksoft">{t.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {t.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-[var(--accent2-wash)] px-2 py-0.5 font-mono text-[0.68rem] text-accent2">
                        {tag}
                      </span>
                    ))}
                    <a
                      href={t.href}
                      target="_blank"
                      rel="noopener"
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[0.72rem] text-inksoft transition-colors hover:border-accent hover:text-accent"
                    >
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
                      View on GitHub
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox src={box?.src ?? null} caption={box?.caption} flow={box?.flow} onClose={() => setBox(null)} />
    </section>
  );
}
