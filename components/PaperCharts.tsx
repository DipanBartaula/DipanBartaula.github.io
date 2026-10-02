"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";
import {
  curriculumBudgets,
  curriculumMetrics,
  curriculumSeries,
  curriculumSplits,
  dcGroups,
  dcMetrics,
  diversityMetrics,
  diversityRows,
  fourthCorner,
  landscape,
  vtonDatasets,
  type Metric,
  type Row,
} from "@/lib/paperData";

/**
 * Interactive result panels built from the papers' tables. Every bar, dot and
 * line is laid out once per selection and animated with CSS transform/opacity
 * only (compositor work, no per-frame script); switching a tab or metric
 * re-keys the panel so it replays its entrance.
 */
type Panel = { key: string; tab: string; render: () => ReactNode };

export default function PaperCharts({ paper }: { paper: "curvton" | "dreamcloth" }) {
  const panels: Panel[] =
    paper === "curvton"
      ? [
          { key: "datasets", tab: "Dataset comparison", render: () => <DatasetMatrix /> },
          { key: "diversity", tab: "Task-free diversity", render: () => <MetricBars metrics={diversityMetrics} groups={[{ key: "all", label: "", note: "Higher spread = more diverse training signal", rows: diversityRows }]} grouped /> },
          { key: "curriculum", tab: "Curriculum ablation", render: () => <CurriculumChart /> },
        ]
      : [
          { key: "main", tab: "Held-out comparison", render: () => <MetricBars metrics={dcMetrics} groups={dcGroups} grouped /> },
          { key: "corner", tab: "Fourth-corner ablation", render: () => <FourthCorner /> },
          { key: "landscape", tab: "Where optimisations land", render: () => <Landscape /> },
        ];
  const [active, setActive] = useState(0);
  const [ref, seen] = useReveal<HTMLDivElement>(0.2, "0px");

  return (
    <div ref={ref} className="lb rounded-lg border border-line bg-surface2 p-3.5 sm:p-4" data-play={seen ? "true" : "false"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[0.7rem] uppercase tracking-wide text-inkfaint">Results · from the paper</div>
        <Pills items={panels.map((p) => p.tab)} active={active} onPick={setActive} label="Result" />
      </div>
      <div key={panels[active].key} className="mt-3">
        {panels[active].render()}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ pieces

function Pills({ items, active, onPick, label, small }: { items: string[]; active: number; onPick: (i: number) => void; label: string; small?: boolean }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1">
      {items.map((t, i) => (
        <button
          key={t}
          role="tab"
          aria-selected={i === active}
          onClick={() => onPick(i)}
          className={`rounded-full border font-mono transition-colors ${small ? "px-2 py-0.5 text-[0.62rem]" : "px-2.5 py-1 text-[0.66rem]"} ${
            i === active ? "border-accent bg-[var(--accent-wash)] text-accent" : "border-line text-inksoft hover:border-accent hover:text-accent"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

const fillClass = (tag?: Row["tag"]) =>
  tag === "ours" ? "lb-ours" : tag === "ourstier" ? "lb-tier" : tag === "capture" ? "lb-capture" : "lb-other";
const dirText = (m: Metric) => (m.dir === "up" ? "↑ higher is better" : m.dir === "down" ? "↓ lower is better" : "descriptive (no better direction)");
const fmt = (v: number, d: number) => v.toFixed(d);
const stagger = (i: number, base = 0): CSSProperties => ({ animationDelay: `${base + i * 55}ms` });

function Bar({ value, max, tag, i }: { value: number; max: number; tag?: Row["tag"]; i: number }) {
  return (
    <span className={`lb-track relative block h-2.5 w-full overflow-hidden rounded-full ${tag === "ours" ? "lb-track-ours" : ""}`}>
      <span className={`lb-fill absolute inset-0 origin-left rounded-full ${fillClass(tag)}`} style={{ transform: `scaleX(${Math.max(0.02, value / max)})`, ...stagger(i) }} />
    </span>
  );
}

// ------------------------------------------------------------- metric bars

function MetricBars({ metrics, groups, grouped }: { metrics: Metric[]; groups: { key: string; label: string; note: string; rows: Row[] }[]; grouped?: boolean }) {
  const [g, setG] = useState(0);
  const [m, setM] = useState(0);
  const metric = metrics[m];
  const group = groups[g];
  const rows = useMemo(() => {
    const r = [...group.rows];
    if (metric.dir !== "none") r.sort((a, b) => (metric.dir === "up" ? b.v[metric.key] - a.v[metric.key] : a.v[metric.key] - b.v[metric.key]));
    return r;
  }, [group, metric]);
  const max = Math.max(...rows.map((r) => r.v[metric.key]));
  const dims = grouped ? [...new Set(metrics.map((x) => x.group ?? ""))] : [""];

  return (
    <div>
      {groups.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Pills items={groups.map((x) => x.label)} active={g} onPick={setG} label="Dataset" small />
          <span className="font-mono text-[0.6rem] text-inkfaint">{group.note}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {dims.map((d) => (
          <div key={d} className="flex flex-wrap items-center gap-1">
            {d && <span className="mr-0.5 font-mono text-[0.58rem] uppercase tracking-wide text-inkfaint">{d}</span>}
            {metrics.map((x, i) =>
              (x.group ?? "") === d ? (
                <button
                  key={x.key}
                  onClick={() => setM(i)}
                  aria-pressed={i === m}
                  className={`rounded-md border px-1.5 py-0.5 font-mono text-[0.62rem] transition-colors ${
                    i === m ? "border-accent2 bg-[var(--accent2-wash)] text-accent2" : "border-line text-inksoft hover:border-accent2 hover:text-accent2"
                  }`}
                >
                  {x.label}
                  <span className="ml-0.5 opacity-70">{x.dir === "up" ? "↑" : x.dir === "down" ? "↓" : ""}</span>
                </button>
              ) : null
            )}
          </div>
        ))}
      </div>

      <ol key={`${group.key}-${metric.key}`} className="mt-3 flex flex-col gap-1.5" aria-label={`${group.label} ${metric.label}`}>
        {rows.map((r, i) => {
          const best = metric.dir !== "none" && i === 0;
          const strong = r.tag === "ours";
          return (
            <li key={r.name} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-2 text-[0.72rem] sm:grid-cols-[minmax(0,12.5rem)_1fr_auto] sm:gap-2.5 sm:text-[0.74rem]">
              <span className={`truncate ${strong ? "font-semibold text-ink" : r.tag === "ourstier" ? "text-ink" : "text-inksoft"}`} title={r.name}>
                {r.name}
                {r.tag === "capture" && <span className="ml-1.5 font-mono text-[0.58rem] text-inkfaint">capture</span>}
              </span>
              <Bar value={r.v[metric.key]} max={max} tag={r.tag} i={i} />
              <span className={`lb-val w-[4.2rem] text-right font-mono tabular-nums ${strong ? "font-bold text-accent" : "text-inkfaint"}`} style={stagger(i, 250)}>
                {best && <span className="mr-1 text-[0.58rem] text-accent3">best</span>}
                {fmt(r.v[metric.key], metric.digits)}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2.5 font-mono text-[0.6rem] text-inkfaint">
        {metric.hint ? `${metric.hint} · ` : ""}
        {dirText(metric)}
        {groups.length === 1 && ` · ${group.note}`}
        {groups === dcGroups && " · capture-based methods fit tracked garments; DreamCloth fits none"}
      </p>
    </div>
  );
}

// ------------------------------------------------------- dataset comparison

function DatasetMatrix() {
  const [by, setBy] = useState(0);
  const key = by === 0 ? "train" : "test";
  const max = Math.max(...vtonDatasets.map((d) => (d[key] ?? 0) as number));
  const caps: [keyof (typeof vtonDatasets)[number], string][] = [
    ["maskFree", "Mask-free"],
    ["tiers", "Tiers"],
    ["wild", "In-wild"],
    ["pairs", "Pairs"],
  ];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Pills items={["Train size", "Test size"]} active={by} onPick={setBy} label="Size" small />
        <span className="font-mono text-[0.6rem] text-inkfaint">samples, thousands · dots = mask-free · difficulty tiers · in-the-wild · cloth pairs</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[40rem]">
          <div className="grid grid-cols-[8.5rem_1fr_3.2rem_repeat(4,3rem)_4.6rem] items-end gap-2 pb-1.5 font-mono text-[0.58rem] uppercase leading-tight tracking-wide text-inkfaint">
            <span>Dataset</span>
            <span>{by === 0 ? "Train" : "Test"} size</span>
            <span>Type</span>
            {caps.map(([, l]) => (
              <span key={l} className="text-center">
                {l}
              </span>
            ))}
            <span className="text-right">Coverage</span>
          </div>
          <ol key={key} className="flex flex-col gap-1.5">
            {vtonDatasets.map((d, i) => {
              const v = d[key] as number | null;
              return (
                <li key={d.name} className={`grid grid-cols-[8.5rem_1fr_3.2rem_repeat(4,3rem)_4.6rem] items-center gap-2 rounded-md text-[0.72rem] ${d.ours ? "bg-[var(--accent-wash)] py-1" : ""}`}>
                  <span className={`truncate ${d.ours ? "pl-1 font-semibold text-ink" : "text-inksoft"}`}>{d.name}</span>
                  <span className="flex items-center gap-2">
                    {v == null ? (
                      <span className="font-mono text-[0.62rem] text-inkfaint">N/A</span>
                    ) : (
                      <>
                        <span className="flex-1">
                          <Bar value={v} max={max} tag={d.ours ? "ours" : undefined} i={i} />
                        </span>
                        <span className={`lb-val w-11 text-right font-mono tabular-nums ${d.ours ? "font-bold text-accent" : "text-inkfaint"}`} style={stagger(i, 250)}>
                          {d.approx ? "~" : ""}
                          {v}K
                        </span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[0.62rem] text-inkfaint">{d.type}</span>
                  {caps.map(([c]) => (
                    <span key={c as string} className="flex justify-center">
                      <span className={`pc-pop-c h-2.5 w-2.5 rounded-full ${d[c] ? (d.ours ? "bg-accent" : "bg-accent2") : "border border-line"}`} style={stagger(i, 120)} aria-label={d[c] ? "yes" : "no"} />
                    </span>
                  ))}
                  <span className={`text-right font-mono text-[0.62rem] ${d.coverage === "Broad" ? "font-bold text-accent" : d.coverage === "Moderate" ? "text-accent2" : "text-inkfaint"}`}>{d.coverage}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <p className="mt-2.5 text-[0.74rem] text-inksoft">
        <span className="font-semibold text-accent">The only dataset with all four</span> — and the largest training set, 2.3× the next.
      </p>
    </div>
  );
}

// ------------------------------------------------------ curriculum ablation

function CurriculumChart() {
  const [s, setS] = useState(3);
  const [m, setM] = useState(0);
  const metric = curriculumMetrics[m];
  const { none, curriculum } = curriculumSeries(s, metric.key);
  const all = [...none, ...curriculum];
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.18 || hi * 0.1;
  const y0 = lo - pad, y1 = hi + pad;
  const W = 900, H = 250, L = 58, R = 34, T = 18, B = 30;
  const X = (i: number) => L + (i * (W - L - R)) / 3;
  const Y = (v: number) => T + ((y1 - v) / (y1 - y0)) * (H - T - B);
  const line = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const better = (a: number, b: number) => (metric.dir === "up" ? b - a : a - b);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Pills items={[...curriculumSplits]} active={s} onPick={setS} label="Test split" small />
        <Pills items={curriculumMetrics.map((x) => x.label)} active={m} onPick={setM} label="Metric" small />
      </div>
      <div key={`${s}-${m}`} className="pc-fade mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-[56rem]" role="img" aria-label={`${metric.label} vs training budget, ${curriculumSplits[s]}`}>
          {[0, 1, 2, 3].map((k) => {
            const v = y0 + ((y1 - y0) * k) / 3;
            return (
              <g key={k}>
                <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="pc-grid" />
                <text x={L - 6} y={Y(v) + 3} textAnchor="end" className="pc-axis">
                  {fmt(v, metric.digits)}
                </text>
              </g>
            );
          })}
          {curriculumBudgets.map((b, i) => (
            <text key={b} x={X(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} className="pc-axis">
              {b} iters
            </text>
          ))}
          <path d={line(none)} className="pc-line pc-line-none" />
          <path d={line(curriculum)} className="pc-line pc-line-cur" />
          {none.map((v, i) => (
            <circle key={`n${i}`} cx={X(i)} cy={Y(v)} r={4} className="pc-pt-none" />
          ))}
          {curriculum.map((v, i) => (
            <g key={`c${i}`}>
              <circle cx={X(i)} cy={Y(v)} r={5} className="pc-pt-cur" />
              <text x={X(i) + (i === 0 ? 14 : i === 3 ? -14 : 0)} y={Y(v) + (metric.dir === "up" ? -11 : 19)} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} className="pc-delta">
                {better(none[i], v) > 0 ? "+" : better(none[i], v) < 0 ? "−" : "±"}
                {fmt(Math.abs(v - none[i]), metric.digits)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-mono text-[0.62rem] text-inksoft">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-full bg-accent" /> Standard curriculum
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-full bg-inkfaint opacity-60" /> No curriculum
          </span>
        </div>
        <span className="font-mono text-[0.6rem] text-inkfaint">Stable Diffusion finetuning · {dirText(metric)} · labels = curriculum gain</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------- fourth-corner ablation

function FourthCorner() {
  const [three, setThree] = useState(false);
  const cur = three ? fourthCorner.three : fourthCorner.four;
  const cells = [
    { sign: "+", label: "Clothed rollout", sub: "garment ✓ · motion ✓" },
    { sign: "−", label: "Static clothed frame", sub: "garment ✓ · motion ✗" },
    { sign: "−", label: "Garment-free moving body", sub: "garment ✗ · motion ✓" },
    { sign: "+", label: "Garment-free static body", sub: "garment ✗ · motion ✗", fourth: true },
  ];
  const maxCd = 0.45;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
      <div>
        <Pills items={["Four-branch (exact)", "Three-branch"]} active={three ? 1 : 0} onPick={(i) => setThree(i === 1)} label="Estimator" small />
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          {cells.map((c) => (
            <div
              key={c.label}
              className={`pc-cell rounded-md border p-2 ${c.sign === "+" ? "border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[var(--accent-wash)]" : "border-[color-mix(in_srgb,var(--accent3)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent3)_10%,transparent)]"}`}
              style={{ opacity: c.fourth && three ? 0.28 : 1 }}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[1rem] font-bold leading-none ${c.sign === "+" ? "text-accent" : "text-accent3"}`}>{c.sign}</span>
                {c.fourth && <span className="font-mono text-[0.56rem] uppercase tracking-wide text-inkfaint">{three ? "dropped" : "4th corner"}</span>}
              </div>
              <div className="mt-1 text-[0.72rem] font-semibold leading-tight text-ink">{c.label}</div>
              <div className="font-mono text-[0.58rem] text-inkfaint">{c.sub}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[0.7rem] text-inksoft">
          All four are scored under one noise draw; (+, −, −, +) cancels both main effects exactly and keeps the garment × motion interaction.
        </p>
      </div>
      <div>
        <div className="font-mono text-[0.6rem] uppercase tracking-wide text-inkfaint">Held-out CD ×10³ · 4D-DRESS s190 · ↓</div>
        <ol key={String(three)} className="mt-2 flex flex-col gap-2">
          {(["four", "three"] as const).map((k, i) => {
            const on = (k === "three") === three;
            const v = fourthCorner[k].cd;
            return (
              <li key={k} className={`grid grid-cols-[6.5rem_1fr_auto] items-center gap-2 text-[0.72rem] ${on ? "" : "opacity-50"}`}>
                <span className={on ? "font-semibold text-ink" : "text-inksoft"}>{k === "four" ? "Four-branch" : "Three-branch"}</span>
                <Bar value={v} max={maxCd} tag={k === "four" ? "ours" : undefined} i={i} />
                <span className={`lb-val w-11 text-right font-mono tabular-nums ${k === "four" ? "font-bold text-accent" : "text-inkfaint"}`} style={stagger(i, 250)}>
                  {v.toFixed(3)}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            ["ρ", cur.rho.toFixed(3), ""],
            ["κs", String(cur.ks), "Pa"],
            ["h", cur.h.toFixed(3), ""],
          ].map(([k, v, u]) => (
            <div key={k} className="rounded-md border border-line bg-surface px-2 py-1.5">
              <div className="font-mono text-[0.58rem] text-inkfaint">recovered {k}</div>
              <div key={v} className="pc-fade font-mono text-[0.86rem] font-semibold tabular-nums text-ink">
                {v}
                <span className="ml-0.5 text-[0.6rem] text-inkfaint">{u}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[0.7rem] text-inksoft">
          <span className="font-semibold text-accent">Dropping the 4th corner: +17% error</span> (0.362 → 0.422), same data and seed. Both runs end on a box
          constraint, so this compares objectives, not materials.
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------- landscape study

function Landscape() {
  const [p, setP] = useState(0);
  const params = [
    { key: "rho", label: "Density ρ", unit: "" },
    { key: "ks", label: "Stiffness κs", unit: "Pa" },
    { key: "h", label: "Thickness h", unit: "" },
  ] as const;
  const par = params[p];
  const [lo, hi] = landscape.bounds[par.key];
  const pct = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(2)}%`;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Pills items={params.map((x) => x.label)} active={p} onPick={setP} label="Parameter" small />
        <span className="font-mono text-[0.6rem] text-inkfaint">
          25 runs per sequence · axis = solver box [{lo}, {hi}] {par.unit}
        </span>
      </div>
      <ol key={par.key} className="mt-3 flex flex-col gap-2.5">
        {landscape.rows.map((r, i) => {
          const isH = par.key === "h";
          const [mean, sd, cv] = isH ? [r.h, 0, NaN] : (r[par.key] as number[]);
          const [a, b] = par.key === "ks" ? r.ksRange : [mean - sd, mean + sd];
          const atBound = par.key === "ks" && mean >= hi - 1;
          return (
            <li key={r.seq} className="grid grid-cols-[3.4rem_1fr_6.5rem] items-center gap-2.5 text-[0.72rem]">
              <span className="font-mono text-inksoft">
                {r.seq}
                {r.garment && <span className="block text-[0.56rem] text-inkfaint">{r.garment}</span>}
              </span>
              <span className="relative h-5">
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                <span className="absolute left-0 top-1 h-3 w-px bg-[color-mix(in_srgb,var(--ink-faint)_60%,transparent)]" />
                <span className="absolute right-0 top-1 h-3 w-px bg-[color-mix(in_srgb,var(--ink-faint)_60%,transparent)]" />
                {!isH && (
                  <span
                    className="pc-band absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent2)_35%,transparent)]"
                    style={{ left: pct(a), width: `max(3px, calc(${pct(b)} - ${pct(a)}))`, ...stagger(i) }}
                  />
                )}
                <span
                  className={`pc-pop absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${atBound ? "bg-accent3" : "bg-accent"}`}
                  style={{ left: pct(mean), ...stagger(i, 150) }}
                />
              </span>
              <span className="text-right font-mono tabular-nums text-inkfaint">
                <span className="text-ink">{mean}</span>
                {!isH && <span> ± {sd}</span>}
                <span className={`block text-[0.58rem] ${atBound ? "font-bold text-accent3" : ""}`}>{atBound ? "pinned at upper bound" : isH ? "single value" : `CV ${cv}%`}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2.5 text-[0.7rem] text-inksoft">
        <span className="font-semibold text-accent">s170 and s185 converge tightly</span>; s190 spreads along a density–stiffness basin; s191 piles up at the stiffness bound — so a
        small spread there says nothing about identifiability. Auxiliary geometric optimiser, not 25 FSD runs; no ground-truth material.
      </p>
    </div>
  );
}
