import { summary } from "@/lib/content";
import Reveal from "./Reveal";

// Split the CV summary at its natural hinge so the two ideas breathe.
const [lede, rest] = (() => {
  const marker = "Proven track record";
  const i = summary.indexOf(marker);
  return i > 0 ? [summary.slice(0, i).trim(), summary.slice(i).trim()] : [summary, ""];
})();

export default function About() {
  return (
    <section id="about" className="border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§0</span>Abstract
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal delay={0.05}>
            <div className="max-w-prose">
              <p className="text-[1.06rem] leading-[1.65] text-inksoft">{lede}</p>
              {rest && <p className="mt-4 text-[1.06rem] leading-[1.65] text-inksoft">{rest}</p>}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <figure className="glow-card overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/abstract-960.webp"
                srcSet="/images/abstract-640.webp 640w, /images/abstract-960.webp 960w, /images/abstract.webp 1280w"
                sizes="(min-width: 1024px) 470px, 100vw"
                width={1280}
                height={1024}
                alt="Stylised neural network radiating from a chip, surrounded by a particle field"
                className="block aspect-[5/4] h-auto w-full object-cover"
                loading="lazy" decoding="async"
              />
              <figcaption className="flex justify-end px-4 py-2 font-mono text-[0.66rem] text-inkfaint">
                <a
                  href="https://commons.wikimedia.org/wiki/File:Artificial_Neural_Network_with_Chip.jpg"
                  target="_blank"
                  rel="noopener"
                  className="underline-offset-2 hover:text-accent hover:underline"
                >
                  mikemacmarketing · CC BY 2.0
                </a>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
