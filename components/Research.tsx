"use client";

import { useState } from "react";
import { research } from "@/lib/content";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { srcSet } from "@/lib/img";
import TiltFigure from "./TiltFigure";
import Parallax from "./Parallax";
import FlowFigure from "./FlowFigure";
import Leaderboard from "./Leaderboard";
import PaperCharts from "./PaperCharts";
import { FLOWS, type FlowName, type FlowSpec } from "@/lib/flows";

type Fig = { src: string; w: number; h: number; caption: string; flow?: FlowName };

export default function Research() {
  const [box, setBox] = useState<{ src: string; caption?: string; flow?: FlowSpec } | null>(null);
  // Results (stat tiles + charts) are built only once a reader asks for them.
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // A render function, not a nested component: a component defined in here would be a new
  // type on every render, remounting (and rebuilding) each animated figure.
  /** One mounted plate per figure: animated when it has a flow spec, static otherwise. */
  const figure = (img: Fig, sizes: string) =>
    img.flow ? (
      <div key={img.src} className="overflow-hidden rounded-lg border border-line">
        <div className="bg-[#f4f2ec] p-2.5">
          <FlowFigure
            spec={FLOWS[img.flow]}
            src={img.src}
            srcSet={srcSet(img.src, img.w)}
            sizes={sizes}
            alt={img.caption}
            onOpen={() => setBox({ src: img.src, caption: img.caption, flow: FLOWS[img.flow!] })}
          />
        </div>
        <div className="flex items-center justify-between gap-3 bg-surface2 px-3 py-2">
          <p className="font-mono text-[0.68rem] text-inksoft">{img.caption}</p>
          <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-wide text-accent2">animated</span>
        </div>
      </div>
    ) : (
      <TiltFigure key={img.src} onClick={() => setBox({ src: img.src, caption: img.caption })} className="group overflow-hidden rounded-lg border border-line text-left">
        {/* Fixed light "paper" mat: technical figures with their own white background,
            drawn regardless of site theme so they read as mounted plates. */}
        <div className="bg-[#f4f2ec] p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            width={img.w}
            srcSet={srcSet(img.src, img.w)}
            sizes={sizes}
            height={img.h}
            alt={img.caption}
            className="block h-auto w-full rounded object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="bg-surface2 px-3 py-2">
          <p className="font-mono text-[0.68rem] text-inksoft">{img.caption}</p>
        </div>
      </TiltFigure>
    );

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
            Three first-author papers &mdash; a large-scale dataset, an inverse-physics method, and
            training-free anticipatory computation for streaming vision-language models. The
            architecture figures are animated; click any figure to enlarge it.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-col gap-8">
          {research.map((r, i) => {
            const hasImages = r.images.length > 0;
            // CURVTON-style cards: the inline strip pairs with the second figure in its own row.
            const pair = r.inlineImage && r.images.length > 1 ? [{ ...r.inlineImage, wide: false }, r.images[1]] : null;
            const right = pair ? r.images.slice(0, 1).concat(r.images.slice(2)) : r.images;
            return (
              <Reveal key={r.id} delay={i * 0.08}>
                <article className="glow-card overflow-clip rounded-2xl border border-line bg-surface shadow-[var(--shadow)]">
                  <div className={`flex flex-col gap-6 p-6 sm:p-8 ${hasImages ? "lg:flex-row lg:items-start" : ""}`}>
                    <div className={hasImages ? "lg:w-[46%]" : "w-full"}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[0.74rem] tracking-wide text-inkfaint">{r.fig}</span>
                        <span
                          className="rounded-full border px-2.5 py-0.5 font-mono text-[0.64rem] font-semibold uppercase tracking-wide"
                          style={{
                            borderColor: r.status.tone === "accent" ? "var(--accent)" : "var(--accent2)",
                            color: r.status.tone === "accent" ? "var(--accent)" : "var(--accent2)",
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
                      {r.links && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {r.links.map((l) => (
                            <a
                              key={l.href}
                              href={l.href}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[0.7rem] text-inksoft transition-colors hover:border-accent hover:text-accent"
                            >
                              {l.label}
                              <span aria-hidden="true">↗</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {right.length > 0 && (
                      <Parallax amount={14} className="flex flex-col gap-3 lg:w-[54%]">
                        {right.map((img) => figure(img, "(min-width: 1024px) 540px, 100vw"))}
                      </Parallax>
                    )}
                  </div>
                  {pair && (
                    // Second row: the iterative try-on strip beside the try-on triplet,
                    // vertically centred on each other (no parallax, so they stay aligned).
                    <div className="grid grid-cols-1 gap-6 px-6 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:items-center">
                      {pair.map((img) => figure(img, "(min-width: 1024px) 520px, 100vw"))}
                    </div>
                  )}
                  {(r.leaderboard || r.charts || r.stats) && (
                    <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                      <button
                        type="button"
                        onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                        aria-expanded={!!open[r.id]}
                        aria-controls={`results-${r.id}`}
                        className="results-toggle group flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface2 px-4 py-2.5 text-left transition-colors hover:border-accent"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="font-mono text-[0.72rem] uppercase tracking-wide text-ink">{open[r.id] ? "Hide" : "Show"} results &amp; metrics</span>
                          <span className="hidden font-mono text-[0.62rem] text-inkfaint sm:inline">
                            {r.leaderboard ? "leaderboards on 3 benchmarks" : r.charts === "curvton" ? "dataset comparison · diversity · curriculum ablation" : "held-out comparison · ablation · landscape"}
                          </span>
                        </span>
                        <span aria-hidden="true" className={`results-chev text-accent ${open[r.id] ? "results-chev-open" : ""}`}>
                          ▾
                        </span>
                      </button>
                      {open[r.id] && (
                        <div id={`results-${r.id}`} className="results-panel mt-3 flex flex-col gap-3">
                          {r.stats && (
                            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {r.stats.map((st) => (
                                <div key={st.label} className="rounded-lg border border-line bg-surface2 px-3 py-2.5">
                                  <dt className="sr-only">{st.label}</dt>
                                  <dd className="font-display text-[1.25rem] font-semibold leading-none text-accent">{st.value}</dd>
                                  <dd className="mt-1.5 font-mono text-[0.6rem] leading-snug text-inkfaint">{st.label}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          {r.leaderboard ? <Leaderboard /> : r.charts ? <PaperCharts paper={r.charts} /> : null}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Lightbox src={box?.src ?? null} caption={box?.caption} flow={box?.flow} onClose={() => setBox(null)} />
    </section>
  );
}
