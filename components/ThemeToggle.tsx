"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const order = ["system", "light", "dark"] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-8 w-20" aria-hidden="true" />;

  const current = (theme as (typeof order)[number]) ?? "system";
  const next = order[(order.indexOf(current) + 1) % order.length];

  const label = current === "system" ? "Auto" : current === "light" ? "Light" : "Dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-inksoft shadow-sm transition-colors hover:border-accent hover:text-accent"
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label} (click to change)`}
    >
      {label}
    </button>
  );
}
