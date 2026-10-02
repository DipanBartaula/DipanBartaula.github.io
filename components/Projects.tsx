"use client";

import { useState } from "react";
import { projects } from "@/lib/content";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { srcSet } from "@/lib/img";
import TiltFigure from "./TiltFigure";
import Parallax from "./Parallax";
import FlowFigure from "./FlowFigure";
import { FLOWS, type FlowSpec } from "@/lib/flows";

export default function Projects() {
  const [box, setBox] = useState<{ src: string; caption?: string; flow?: FlowSpec } | null>(null);

  return (
    <section id="projects" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§4</span>Projects
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-prose text-inksoft">
            Applied systems built end to end — from architecture through training to deployment.
            Click any diagram to enlarge it.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-col gap-7">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <article
                className="glow-card accent-card overflow-clip rounded-2xl border border-line bg-surface shadow-[var(--shadow)]"
                style={{ ["--card-accent" as string]: p.accent }}
              >
                <div className="grid grid-cols-1 items-center gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
                  <div>
                    <div className="mb-3 flex items-center gap-2.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_color-mix(in_srgb,var(--card-accent)_22%,transparent)]"
                        style={{ background: p.accent }}
                      />
                      <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em]" style={{ color: p.accent }}>
                        Project {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-display text-[1.28rem] font-semibold leading-snug">{p.title}</h3>
                    <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wide text-inkfaint">{p.subtitle}</p>
                    <p className="mt-4 text-[0.94rem] leading-[1.7] text-inksoft">{p.summary}</p>
                  </div>
                  <Parallax>
                    {"flow" in p && p.flow ? (
                      <div className="w-full overflow-hidden rounded-xl border border-line">
                        <div className="bg-[#f6f7fb] p-2.5">
                          <FlowFigure
                            spec={FLOWS[p.flow]}
                            src={p.image}
                            srcSet={srcSet(p.image, p.imageW)}
                            sizes="(min-width: 1024px) 560px, 100vw"
                            alt={`${p.title} — architecture diagram`}
                            onOpen={() => setBox({ src: p.image, caption: `${p.title} — ${p.subtitle}`, flow: FLOWS[p.flow] })}
                          />
                        </div>
                        {"image2" in p && p.image2 && (
                          <div className="border-t border-line bg-[#f6f7fb] p-2.5">
                            <FlowFigure
                              spec={FLOWS[p.image2.flow]}
                              src={p.image2.src}
                              srcSet={srcSet(p.image2.src, p.image2.w)}
                              sizes="(min-width: 1024px) 560px, 100vw"
                              alt={`${p.title} — ${p.image2.caption} diagram`}
                              onOpen={() => setBox({ src: p.image2.src, caption: `${p.title} — ${p.image2.caption}`, flow: FLOWS[p.image2.flow] })}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                    <TiltFigure
                      onClick={() => setBox({ src: p.image, caption: `${p.title} — ${p.subtitle}` })}
                      className="group w-full overflow-hidden rounded-xl border border-line text-left"
                    >
                      <div className="bg-[#f6f7fb] p-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          width={p.imageW}
                          srcSet={srcSet(p.image, p.imageW)}
                          sizes="(min-width: 1024px) 560px, 100vw"
                          height={p.imageH}
                          alt={`${p.title} — architecture diagram`}
                          className="block h-auto w-full rounded-lg object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                          loading="lazy" decoding="async"
                        />
                      </div>
                    </TiltFigure>
                    )}
                  </Parallax>
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
