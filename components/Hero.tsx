"use client";

import dynamic from "next/dynamic";
import MeshCanvas from "./MeshCanvas";
import Aurora from "./Aurora";
import SocialLinks from "./SocialLinks";
import ContactCTA from "./ContactCTA";
import { motion, type Variants } from "framer-motion";
import { useInView } from "@/lib/useInView";
import { useWebglSupported } from "@/lib/useWebglSupported";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Three.js/R3F touch the DOM/WebGL at module scope — never render on the server.
const HeroCanvas = dynamic(() => import("./three/HeroCanvas"), { ssr: false });

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  const reduceMotion = useSafeReducedMotion();
  const webglOk = useWebglSupported();
  const [sectionRef, inView] = useInView<HTMLElement>({ threshold: 0.05 });
  const use3D = !reduceMotion && webglOk && inView;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14"
      onPointerMove={
        reduceMotion
          ? undefined
          : (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--hx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--hy", `${e.clientY - r.top}px`);
            }
      }
    >
      <Aurora />
      {use3D ? <HeroCanvas /> : <MeshCanvas />}
      <div aria-hidden="true" className="hero-spot pointer-events-none absolute inset-0" />
      <motion.div
        variants={container}
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-10 mx-auto grid max-w-content grid-cols-1 items-end gap-8 px-5 sm:px-8 md:grid-cols-[1.35fr_0.8fr] md:gap-14"
      >
        <div>
          <motion.div variants={item} className="eyebrow mb-4">
            <span className="idx">Pulchowk, Lalitpur, Nepal</span>
          </motion.div>
          <motion.h1
            variants={item}
            className="font-display text-[clamp(2.5rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-tight"
          >
            Dipan
            <br />
            <em className="gradient-text font-normal italic">Bartaula</em>
          </motion.h1>
          <motion.p variants={item} className="mt-3.5 font-mono text-base text-inksoft">
            Data Scientist<span className="mx-1.5 text-inkfaint">·</span>AI Engineer
            <span className="mx-1.5 text-inkfaint">·</span>Researcher
          </motion.p>
          <motion.p variants={item} className="mt-5 max-w-[52ch] text-[1.06rem] text-inksoft">
            2+ years across machine learning, generative AI, and agentic systems — architecting
            multi-agent orchestration, fine-tuning LLMs with verifiable reward signals, and
            building end-to-end pipelines that bridge language-driven reasoning with real-world
            execution.
          </motion.p>
          <motion.div variants={item} className="mt-7">
            <ContactCTA />
          </motion.div>
          <motion.div variants={item} className="mt-5">
            <SocialLinks compact />
          </motion.div>
        </div>
        <motion.div variants={item} className="flex flex-col items-start gap-2.5 md:items-end">
          <div className="aspect-square w-[min(280px,72vw)] overflow-hidden rounded-[10px] border border-line bg-surface2 shadow-[var(--shadow)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/headshot.jpg"
              alt="Portrait of Dipan Bartaula"
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(0.28) sepia(0.14) saturate(1.25) contrast(1.04)" }}
            />
          </div>
          <div className="font-mono text-[0.72rem] text-inkfaint">
            FIG. 00 — D. Bartaula, IOE Pulchowk Campus
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
