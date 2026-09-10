import { contactLinks } from "@/lib/content";
import Reveal from "./Reveal";
import SocialLinks from "./SocialLinks";
import ContactCTA from "./ContactCTA";
import Aurora from "./Aurora";

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line py-14 sm:py-16">
      <Aurora className="opacity-60" />
      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="eyebrow mb-3.5">
                <span className="idx">Appendix</span>Contact
              </div>
              <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-tight">
                Building something in
                <br />
                simulation, GenAI, or agents?
              </h2>
              <p className="mt-3 font-mono text-[0.8rem] text-inkfaint">{contactLinks.location}</p>
              <div className="mt-6">
                <ContactCTA size="lg" />
              </div>
            </div>
            <div className="max-w-[560px]">
              <SocialLinks />
            </div>
          </div>
        </Reveal>
        <div className="mt-9 flex flex-wrap justify-between gap-2.5 border-t border-line pt-5 font-mono text-[0.72rem] text-inkfaint">
          <span>&copy; 2026 Dipan Bartaula</span>
          <span>Built as a manuscript, not a brochure.</span>
        </div>
      </div>
    </footer>
  );
}
