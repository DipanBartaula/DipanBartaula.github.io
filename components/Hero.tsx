"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import MeshCanvas from "./MeshCanvas";
import Aurora from "./Aurora";
import SocialLinks from "./SocialLinks";
import ContactCTA from "./ContactCTA";
import type { CSSProperties } from "react";
import { useInView } from "@/lib/useInView";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// The WebGL cloth (and its worker) is client-only.
const HeroCanvas = dynamic(() => import("./three/HeroCanvas"), { ssr: false });

// Entrance: a staggered fade-and-rise, done in CSS (.hero-rise in globals.css)
// so it plays from the very first paint instead of waiting for hydration.
const rise = (i: number): CSSProperties => ({ animationDelay: `${0.05 + i * 0.09}s` });

export default function Hero() {
  const reduceMotion = useSafeReducedMotion();
  const [glFailed, setGlFailed] = useState(false);
  const [sectionRef, inView] = useInView<HTMLElement>({ threshold: 0.05 });
  // Mount the background once the hero is first seen, then keep it mounted and
  // just pause it off-screen — remounting would rebuild the WebGL context (a
  // visible hitch) every time the visitor scrolls back up.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);
  const use3D = !reduceMotion && !glFailed;
  const spotFrame = useRef(0);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14"
      onPointerMove={
        reduceMotion
          ? undefined
          : (e) => {
              // One style write per frame, however fast the pointer events arrive.
              const el = e.currentTarget, x = e.clientX, y = e.clientY;
              if (spotFrame.current) return;
              spotFrame.current = requestAnimationFrame(() => {
                spotFrame.current = 0;
                const r = el.getBoundingClientRect();
                el.style.setProperty("--hx", `${x - r.left}px`);
                el.style.setProperty("--hy", `${y - r.top}px`);
              });
            }
      }
    >
      <Aurora />
      {armed && (use3D ? <HeroCanvas active={inView} onFail={() => setGlFailed(true)} /> : <MeshCanvas active={inView} />)}
      <div aria-hidden="true" className="hero-spot pointer-events-none absolute inset-0" />
      <div
        className="relative z-10 mx-auto grid max-w-content grid-cols-1 items-end gap-8 px-5 sm:px-8 md:grid-cols-[1.35fr_0.8fr] md:gap-14"
      >
        <div>
          <div className="hero-rise eyebrow mb-4" style={rise(0)}>
            <span className="idx">Pulchowk, Lalitpur, Nepal</span>
          </div>
          <h1
            style={rise(1)}
            className="hero-rise font-display text-[clamp(2.5rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-tight"
          >
            Dipan
            <br />
            <em className="gradient-text font-normal italic">
              Bartaula
              <i aria-hidden="true" className="gradient-text-fill" />
            </em>
          </h1>
          <p style={rise(2)} className="hero-rise mt-3.5 font-mono text-base text-inksoft">
            Data Scientist<span className="mx-1.5 text-inkfaint">·</span>AI Engineer
            <span className="mx-1.5 text-inkfaint">·</span>Researcher
          </p>
          <p style={rise(3)} className="hero-rise mt-5 max-w-[52ch] text-[1.06rem] text-inksoft">
            About 3 years across machine learning, generative AI, and agentic systems — architecting
            multi-agent orchestration, fine-tuning LLMs with verifiable reward signals, and
            building end-to-end pipelines that bridge language-driven reasoning with real-world
            execution.
          </p>
          <div style={rise(4)} className="hero-rise mt-7">
            <ContactCTA />
          </div>
          <div style={rise(5)} className="hero-rise mt-5">
            <SocialLinks compact />
          </div>
        </div>
        <div style={rise(6)} className="hero-rise flex flex-col items-start gap-2.5 md:items-end">
          <div className="aspect-square w-[min(280px,72vw)] overflow-hidden rounded-[10px] border border-line bg-surface2 shadow-[var(--shadow)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/headshot-560.webp"
              srcSet="/images/headshot-280.webp 280w, /images/headshot-560.webp 560w, /images/headshot.webp 900w"
              sizes="min(280px, 72vw)"
              width={560}
              height={560}
              fetchPriority="high"
              decoding="async"
              alt="Portrait of Dipan Bartaula"
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(0.28) sepia(0.14) saturate(1.25) contrast(1.04)" }}
            />
          </div>
          <div className="font-mono text-[0.72rem] text-inkfaint">
            FIG. 00 — D. Bartaula, IOE Pulchowk Campus
          </div>
        </div>
      </div>
    </section>
  );
}
