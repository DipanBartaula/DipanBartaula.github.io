import { education } from "@/lib/content";
import Reveal from "./Reveal";

export default function Education() {
  return (
    <section id="education" className="relative border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§1</span>Education
          </div>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={i * 0.05}>
              <div className="glow-card flex h-full items-center gap-5 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)]">
                <div
                  className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line p-2"
                  style={{ background: e.logoBg }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.logo} alt={`${e.school} logo`} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[0.74rem] tabular-nums text-inkfaint">{e.yr}</div>
                  <div className="mt-0.5 font-display text-[1.05rem] font-semibold leading-snug">{e.school}</div>
                  <div className="mt-0.5 text-[0.92rem] text-inksoft">{e.deg}</div>
                  {e.extra && <div className="mt-1 font-mono text-[0.72rem] text-inkfaint">{e.extra}</div>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
