"use client";

import { sections } from "@/lib/content";
import { useActiveSection } from "@/lib/useActiveSection";

export default function SideNav() {
  const active = useActiveSection();

  return (
    <nav
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      aria-label="Section navigation"
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center gap-2.5"
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={`whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-wide transition-all duration-300 ${
                isActive
                  ? "translate-x-0 text-accent opacity-100"
                  : "translate-x-1 text-inkfaint opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block h-2 w-2 rounded-full border transition-all duration-300 ${
                isActive
                  ? "scale-125 border-accent bg-accent shadow-[0_0_0_4px_var(--accent-wash)]"
                  : "border-inkfaint bg-transparent group-hover:border-accent"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
