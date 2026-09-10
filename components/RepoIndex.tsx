"use client";

import { useMemo, useState } from "react";
import { repoCategories, repos } from "@/lib/content";
import Reveal from "./Reveal";

type SortKey = "default" | "stars";

export default function RepoIndex() {
  const [filter, setFilter] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("default");

  const filtered = useMemo(() => {
    let list = filter === "All" ? repos : repos.filter((r) => r.category === filter);
    if (sort === "stars") list = [...list].sort((a, b) => b.stars - a.stars);
    return list;
  }, [filter, sort]);

  return (
    <section id="code" className="border-t border-line py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <div className="eyebrow">
            <span className="idx">§7</span>Repository Index
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-prose text-inksoft">
            A working sample from{" "}
            <a
              href="https://github.com/DipanBartaula"
              target="_blank"
              rel="noopener"
              className="text-accent underline underline-offset-2"
            >
              github.com/DipanBartaula
            </a>{" "}
            — simulation code, agentic systems, and a few architectures rebuilt from scratch to
            understand them properly. Filter by domain or sort by signal.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {["All", ...repoCategories].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.72rem] transition-colors ${
                  filter === c
                    ? "border-accent bg-[var(--accent-wash)] text-accent"
                    : "border-line text-inksoft hover:border-accent hover:text-accent"
                }`}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setSort((s) => (s === "stars" ? "default" : "stars"))}
              className={`ml-auto rounded-full border px-3 py-1.5 font-mono text-[0.72rem] transition-colors ${
                sort === "stars"
                  ? "border-accent2 bg-[var(--accent2-wash)] text-accent2"
                  : "border-line text-inksoft hover:border-accent2 hover:text-accent2"
              }`}
            >
              Sort by ★ {sort === "stars" ? "↓" : ""}
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface shadow-[var(--shadow)]">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr>
                  {["Repository", "What it does", "Stack", "Signal"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-line px-5 py-3.5 text-left font-mono text-[0.7rem] font-semibold uppercase tracking-wide text-inkfaint"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.name} className="border-b border-line last:border-none">
                    <td className="px-5 py-3.5 align-top">
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noopener"
                        className="font-semibold text-ink underline-offset-2 hover:text-accent hover:underline"
                      >
                        {r.name}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 align-top text-[0.92rem] text-inksoft">{r.desc}</td>
                    <td className="px-5 py-3.5 align-top">
                      <span className="whitespace-nowrap rounded-md bg-[var(--accent2-wash)] px-2 py-0.5 font-mono text-[0.7rem] text-accent2">
                        {r.lang}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 align-top font-mono text-[0.78rem] tabular-nums text-inkfaint">
                      {r.stars > 0 ? `★ ${r.stars}` : "—"} {r.forks > 0 ? ` ⑂ ${r.forks}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
