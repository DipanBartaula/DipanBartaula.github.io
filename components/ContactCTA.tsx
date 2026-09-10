"use client";

import { motion } from "framer-motion";
import { contactLinks } from "@/lib/content";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const mailto = `mailto:${contactLinks.email}?subject=${encodeURIComponent("Hello Dipan — reaching out from your portfolio")}`;

export default function ContactCTA({ size = "md" }: { size?: "md" | "lg" }) {
  const reduce = useSafeReducedMotion();
  const pad = size === "lg" ? "px-6 py-3.5 text-[0.95rem]" : "px-5 py-3 text-[0.88rem]";
  const hover = reduce ? {} : { y: -2, scale: 1.02 };
  const tap = reduce ? {} : { scale: 0.98 };

  return (
    <div className="flex flex-wrap gap-3">
      <motion.a
        href={mailto}
        whileHover={hover}
        whileTap={tap}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className={`cta-primary inline-flex items-center gap-2.5 rounded-full font-semibold text-white shadow-[0_14px_34px_-14px_rgba(79,70,229,0.7)] ${pad}`}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <rect x="1.5" y="3" width="13" height="10" rx="1.8" />
          <path d="M2 4.2 8 9l6-4.8" />
        </svg>
        Email me
      </motion.a>
      <motion.a
        href={contactLinks.linkedin}
        target="_blank"
        rel="noopener"
        whileHover={hover}
        whileTap={tap}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className={`inline-flex items-center gap-2.5 rounded-full border-2 border-[#0A66C2] bg-surface font-semibold text-[#0A66C2] transition-colors hover:bg-[#0A66C2] hover:text-white ${pad}`}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
          <path d="M2.75 5.5h2.1v8H2.75v-8ZM3.8 4.5a1.22 1.22 0 1 1 0-2.44 1.22 1.22 0 0 1 0 2.44ZM7 5.5h2.02v1.1h.03c.28-.53 1-1.1 2.05-1.1 2.19 0 2.6 1.44 2.6 3.32V13.5h-2.1V9.24c0-1.02-.02-2.32-1.42-2.32-1.42 0-1.64 1.1-1.64 2.25v4.33H7v-8Z" />
        </svg>
        Message me on LinkedIn
      </motion.a>
    </div>
  );
}
