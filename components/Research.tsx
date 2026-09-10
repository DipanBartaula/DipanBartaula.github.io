"use client";

import { useState } from "react";
import { research } from "@/lib/content";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import TiltFigure from "./TiltFigure";
import Parallax from "./Parallax";

export default function Research() {
  const [box, setBox] = useState<{ src: string; caption?: string } | null>(null);

  return (
    <section id="research" className="border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§2</span>Research
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-prose text-inksoft">
            Two first-author papers under review &mdash; a large-scale dataset and an
            inverse-physics method.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-col gap-8">
          {research.map((r, i) => {
            const hasImages = r.images.length > 0;
            return (
              <Reveal key={r.id} delay={i * 0.08}>
                <article className="glow-card overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow)]">
                  <div className={`flex flex-col gap-6 p-6 sm:p-8 ${hasImages ? "lg:flex-row lg:items-end" : ""}`}>
                    <div className={hasImages ? "lg:w-[46%]" : "w-full"}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[0.74rem] tracking-wide text-inkfaint">{r.fig}</span>
                        <span
                          className="rounded-full border px-2.5 py-0.5 font-mono text-[0.64rem] font-semibold uppercase tracking-wide"
                          style={{
                            borderColor: (r.status.tone as string) === "accent" ? "var(--accent)" : "var(--accent2)",
                            color: (r.status.tone as string) === "accent" ? "var(--accent)" : "var(--accent2)",
                          }}
                        >
                          {r.status.label}
                        </span>
                        <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.64rem] text-inkfaint">
                          {r.role}
                        </span>
                        {r.compute && (
                          <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.64rem] text-inkfaint">
                            {r.compute}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-[1.28rem] font-semibold leading-snug">
                        {r.title}
                      </h3>
                      <div className="mt-4 flex flex-col gap-3">
                        {r.desc.map((para, pi) => (
                          <p key={pi} className="text-[0.95rem] text-inksoft">{para}</p>
                        ))}
                      </div>
                      {r.inlineImage && (
                        <TiltFigure
                          onClick={() => setBox({ src: r.inlineImage!.src, caption: r.inlineImage!.caption })}
                          className="group mt-5 w-full overflow-hidden rounded-lg border border-line text-left"
                        >
                          <div className="bg-[#f4f2ec] p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.inlineImage.src}
                              alt={r.inlineImage.caption}
                              className="block w-full rounded object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                              loading="lazy"
                            />
                          </div>
                          <div className="bg-surface2 px-3 py-2">
                            <p className="font-mono text-[0.66rem] text-inksoft">{r.inlineImage.caption}</p>
                          </div>
                        </TiltFigure>
                      )}
                    </div>

                    {hasImages && (
                      <Parallax amount={14} className="flex flex-col gap-3 lg:w-[54%]">
                        {r.images.map((img) => (
                          <TiltFigure
                            key={img.src}
                            onClick={() => setBox({ src: img.src, caption: img.caption })}
                            className="group overflow-hidden rounded-lg border border-line text-left"
                          >
                            {/* Fixed light "paper" mat: these are technical figures with their own
                                white background, drawn regardless of site theme so they read as
                                mounted plates rather than bare cutouts against a dark card. */}
                            <div className="bg-[#f4f2ec] p-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.src}
                                alt={img.caption}
                                className="block w-full rounded object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                                loading="lazy"
                              />
                            </div>
                            <div className="bg-surface2 px-3 py-2">
                              <p className="font-mono text-[0.68rem] text-inksoft">{img.caption}</p>
                            </div>
                          </TiltFigure>
                        ))}
                      </Parallax>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Lightbox src={box?.src ?? null} caption={box?.caption} onClose={() => setBox(null)} />
    </section>
  );
}
