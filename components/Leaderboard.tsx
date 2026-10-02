"use client";

import { useEffect, useRef, useState } from "react";

type Row = { name: string; value: number; tag?: "ours" | "backbone" | "human" };
type Board = { key: string; tab: string; metric: string; max: number; lead: string; rest: string; rows: Row[] };

/** Numbers from the Foresight paper's result tables (top entries per benchmark). */
const BOARDS: Board[] = [
  {
    key: "omni",
    tab: "OmniPro Online",
    metric: "Mean joint F1 (%)",
    max: 25,
    lead: "Best overall, training-free",
    rest: " — 9.5 points above the strongest trained baseline.",
    rows: [
      { name: "Foresight (8B)", value: 23.0, tag: "ours" },
      { name: "MiniCPM-o 4.5 (9B)", value: 13.5 },
      { name: "MMDuet2 (3B)", value: 11.3 },
      { name: "QueryStream (8B)", value: 6.7 },
      { name: "StreamAgent (8B)", value: 5.0 },
      { name: "LiveStar (8B)", value: 3.6 },
      { name: "Dispider† (7B)", value: 2.8 },
    ],
  },
  {
    key: "sb",
    tab: "StreamingBench",
    metric: "Overall accuracy (%)",
    max: 70,
    lead: "+6.7 over its frozen backbone",
    rest: " (Qwen3-VL-8B), with adaptive frame sampling.",
    rows: [
      { name: "Foresight", value: 66.0, tag: "ours" },
      { name: "MiniCPM-o 4.5", value: 62.7 },
      { name: "StreamForest‡", value: 60.8 },
      { name: "Qwen3-VL-8B-Instruct*", value: 59.3, tag: "backbone" },
      { name: "TimeChat-Online‡", value: 58.11 },
      { name: "StreamAgent", value: 57.02 },
      { name: "StreamBridge, Qwen2-VL + Stream-IT", value: 55.39 },
      { name: "StreamBridge, Qwen2-VL", value: 55.09 },
    ],
  },
  {
    key: "ovo",
    tab: "OVO-Bench",
    metric: "Overall accuracy (%)",
    max: 100,
    lead: "+15.4 over the backbone",
    rest: " — within 0.4 of a model trained with Stream-IT.",
    rows: [
      { name: "Human", value: 92.8, tag: "human" },
      { name: "StreamBridge, Qwen2-VL-7B + Stream-IT", value: 62.57 },
      { name: "Foresight", value: 62.16, tag: "ours" },
      { name: "MiniCPM-o 4.5", value: 59.7 },
      { name: "StreamForest", value: 55.57 },
      { name: "StreamAgent", value: 49.4 },
      { name: "QueryStream", value: 47.51 },
      { name: "Qwen3-VL-8B-Instruct*", value: 46.8, tag: "backbone" },
    ],
  },
];

/**
 * Animated leaderboard for the Foresight results. Bars grow with a CSS
 * `transform: scaleX` animation (compositor-only) once the board scrolls into
 * view, and replay when switching benchmark tabs.
 */
export default function Leaderboard() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const board = BOARDS[active];
  const digits = board.key === "omni" ? 1 : 2;

  return (
    <div ref={ref} className="lb rounded-lg border border-line bg-surface2 p-3.5 sm:p-4" data-play={seen ? "true" : "false"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[0.7rem] uppercase tracking-wide text-inkfaint">Leaderboard</div>
        <div role="tablist" aria-label="Benchmark" className="flex flex-wrap gap-1">
          {BOARDS.map((b, i) => (
            <button
              key={b.key}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[0.66rem] transition-colors ${
                i === active ? "border-accent bg-[var(--accent-wash)] text-accent" : "border-line text-inksoft hover:border-accent hover:text-accent"
              }`}
            >
              {b.tab}
            </button>
          ))}
        </div>
      </div>

      <ol key={board.key} className="mt-3 flex flex-col gap-1.5" aria-label={`${board.tab} — ${board.metric}`}>
        {board.rows.map((r, i) => {
          const ours = r.tag === "ours";
          return (
            <li key={r.name} className="grid grid-cols-[minmax(0,7.25rem)_1fr_auto] items-center gap-2 text-[0.72rem] sm:grid-cols-[minmax(0,11.5rem)_1fr_auto] sm:gap-2.5 sm:text-[0.74rem]">
              <span className={`truncate ${ours ? "font-semibold text-ink" : "text-inksoft"}`} title={r.name}>
                {r.name}
                {r.tag === "backbone" && <span className="ml-1.5 font-mono text-[0.6rem] text-inkfaint">backbone</span>}
              </span>
              <span className={`lb-track relative h-2.5 overflow-hidden rounded-full ${ours ? "lb-track-ours" : ""}`}>
                <span
                  className={`lb-fill absolute inset-0 origin-left rounded-full ${ours ? "lb-ours" : r.tag === "human" ? "lb-human" : "lb-other"}`}
                  style={{ transform: `scaleX(${r.value / board.max})`, animationDelay: `${i * 60}ms` }}
                />
              </span>
              <span
                className={`lb-val w-11 text-right font-mono tabular-nums ${ours ? "font-bold text-accent" : "text-inkfaint"}`}
                style={{ animationDelay: `${250 + i * 60}ms` }}
              >
                {r.value.toFixed(digits)}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[0.74rem] text-inksoft">
          <span className="font-semibold text-accent">{board.lead}</span>
          {board.rest}
        </p>
        <span className="font-mono text-[0.6rem] text-inkfaint">{board.metric} · top entries · from the paper</span>
      </div>
    </div>
  );
}
