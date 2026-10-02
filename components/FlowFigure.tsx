"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DOT_COLORS, type DotKind, type FlowSpec } from "@/lib/flows";

const NS = "http://www.w3.org/2000/svg";
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const TRAIL_MS = 90;

type Trace = { key: string; kind: DotKind; windows: [number, number][] };

/**
 * A figure with an animated data-flow overlay (see lib/flows.ts).
 *
 * Every moving part is a Web Animations API animation of `transform` or
 * `opacity` only, so the browser runs it on the compositor — no per-frame
 * JavaScript and no repaints:
 *  - tokens travel along each arrow, with a short comet trail;
 *  - the arrow a token is on lights up (a pre-drawn glow that fades in/out);
 *  - stage boxes pulse as they are reached;
 *  - a stepper under the figure follows the stages and jumps to one on click.
 * Path geometry is sampled once on mount. The overlay plays only while the
 * figure is on screen (off-screen it leaves rendering entirely), has a
 * Pause/Play control, and is skipped under prefers-reduced-motion.
 */
export default function FlowFigure({
  spec,
  src,
  srcSet,
  sizes,
  alt,
  onOpen,
  standalone,
}: {
  spec: FlowSpec;
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  onOpen?: () => void;
  /** Rendered inside the lightbox: never pauses for it. */
  standalone?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);
  const coveredRef = useRef(false);
  const animsRef = useRef<Animation[]>([]);

  // One glow trace per path, carrying every time window a token is on it.
  const traces = useMemo<Trace[]>(() => {
    const m = new Map<string, Trace>();
    for (const [path, start, dur, kind] of spec.dots) {
      const t = m.get(path) ?? { key: path, kind, windows: [] };
      t.windows.push([start, start + dur]);
      m.set(path, t);
    }
    return [...m.values()];
  }, [spec]);

  const chipLabels = useMemo(() => stageNumbers(spec.steps.map(([, l]) => l)), [spec]);

  // Scale the figure-space layer to the rendered width (one style write per resize).
  useEffect(() => {
    const root = rootRef.current, layer = layerRef.current;
    if (!root || !layer) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (!width) return;
      const s = width / spec.w;
      layer.style.transform = `scale(${s})`;
      layer.style.setProperty("--inv", String(1 / s));
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [spec.w]);

  // Build the compositor animations once.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = layerRef.current, bar = barRef.current, root = rootRef.current;
    if (!layer || !bar || !root || typeof layer.animate !== "function") return;

    const L = spec.loop;
    const off = (t: number) => Math.min(1, Math.max(0, t / L));
    const timing: KeyframeAnimationOptions = { duration: L * 1000, iterations: Infinity, easing: "linear" };

    // Sample every path once (getPointAtLength needs the path in the document).
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    document.body.appendChild(svg);
    const samples: Record<string, [number, number][]> = {};
    const linear: Record<string, [number, number][]> = {};
    const N = 24;
    for (const [key, d] of Object.entries(spec.paths)) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
      const len = p.getTotalLength();
      const at = (u: number) => {
        const pt = p.getPointAtLength(u * len);
        return [pt.x, pt.y] as [number, number];
      };
      samples[key] = Array.from({ length: N + 1 }, (_, i) => at(ease(i / N)));
      linear[key] = Array.from({ length: N + 1 }, (_, i) => at(i / N));
    }
    svg.remove();

    // Marks first: anims[0] must have no delay (it is the clock sync() reads).
    const anims: Animation[] = [];
    const tr = ([x, y]: [number, number]) => `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

    layer.querySelectorAll<HTMLElement>("[data-mark]").forEach((el, i) => {
      const [, start, dur] = spec.marks[i];
      const kf: Keyframe[] = [{ offset: 0, opacity: 0, transform: "scale(0.97)" }];
      if (start > 0) kf.push({ offset: off(start), opacity: 0, transform: "scale(0.97)" });
      for (let j = 1; j < 8; j++) {
        const v = Math.sin((Math.PI * j) / 8);
        kf.push({ offset: off(start + (j / 8) * dur), opacity: +v.toFixed(3), transform: `scale(${(0.97 + 0.03 * v).toFixed(4)})` });
      }
      kf.push({ offset: off(start + dur), opacity: 0, transform: "scale(0.97)" });
      if (start + dur < L) kf.push({ offset: 1, opacity: 0, transform: "scale(0.97)" });
      anims.push(el.animate(dedupe(kf), timing));
    });

    layer.querySelectorAll<HTMLElement>("[data-trace]").forEach((el, i) => {
      const wins = mergeWindows(traces[i].windows.map(([s, e]) => [s, e + 0.45] as [number, number]));
      const kf: Keyframe[] = [{ offset: 0, opacity: 0 }];
      for (const [s, e] of wins) {
        kf.push({ offset: off(s), opacity: 0 }, { offset: off(s + 0.18), opacity: 1 }, { offset: off(e - 0.45), opacity: 1 }, { offset: off(e), opacity: 0 });
      }
      kf.push({ offset: 1, opacity: 0 });
      anims.push(el.animate(dedupe(kf), timing));
    });

    const dotKeyframes = (i: number) => {
      const [path, start, dur, , lin] = spec.dots[i];
      const pts = (lin ? linear : samples)[path];
      const kf: Keyframe[] = [];
      const edge = 0.0006; // linear tokens switch on/off sharply so consecutive segments read as one playhead
      if (start > 0) kf.push({ offset: 0, opacity: 0, transform: tr(pts[0]) });
      if (lin && start > 0) kf.push({ offset: Math.max(0, off(start) - edge), opacity: 0, transform: tr(pts[0]) });
      pts.forEach((pt, j) => {
        const u = j / N;
        const opacity = lin ? 1 : u < 0.08 ? u / 0.08 : u > 0.92 ? (1 - u) / 0.08 : 1;
        kf.push({ offset: off(start + u * dur), opacity, transform: tr(pt) });
      });
      if (lin && start + dur < L) kf.push({ offset: Math.min(1, off(start + dur) + edge), opacity: 0, transform: tr(pts[N]) });
      if (start + dur < L) kf.push({ offset: 1, opacity: 0, transform: tr(pts[N]) });
      return dedupe(kf);
    };
    layer.querySelectorAll<HTMLElement>("[data-dot]").forEach((el, i) => anims.push(el.animate(dotKeyframes(i), timing)));
    layer.querySelectorAll<HTMLElement>("[data-trail]").forEach((el, i) => anims.push(el.animate(dotKeyframes(i), { ...timing, delay: TRAIL_MS })));

    // Captions + stepper highlights share each stage's window. Hand-off is a
    // quick fade-out then fade-in (never two captions overlapping); the loop
    // wraps from the last stage straight back to the first.
    const stageKeyframes = (i: number): Keyframe[] => {
      const start = spec.steps[i][0];
      const end = i + 1 < spec.steps.length ? spec.steps[i + 1][0] : L;
      const f = 0.14;
      const first = i === 0, last = i === spec.steps.length - 1;
      return dedupe(
        first
          ? [{ offset: 0, opacity: 1 }, { offset: off(end - f), opacity: 1 }, { offset: off(end), opacity: 0 }, { offset: 1, opacity: 0 }]
          : [
              { offset: 0, opacity: 0 },
              { offset: off(start), opacity: 0 },
              { offset: off(start + f), opacity: 1 },
              ...(last ? [{ offset: 1, opacity: 1 }] : [{ offset: off(end - f), opacity: 1 }, { offset: off(end), opacity: 0 }, { offset: 1, opacity: 0 }]),
            ]
      );
    };
    bar.querySelectorAll<HTMLElement>("[data-step]").forEach((el, i) => anims.push(el.animate(stageKeyframes(i), timing)));
    bar.querySelectorAll<HTMLElement>("[data-chip-on]").forEach((el, i) => anims.push(el.animate(stageKeyframes(i), timing)));

    anims.forEach((a) => a.pause());
    animsRef.current = anims;
    setAnimated(true);

    // Run only while on screen. Starting a figure means bringing ~100
    // animations into the render tree, so it waits until the figure has stayed
    // in view for a moment — scrolling straight past one costs nothing.
    let settle = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(settle);
        if (entry.isIntersecting) {
          settle = window.setTimeout(() => {
            visibleRef.current = true;
            sync();
          }, 220);
        } else if (visibleRef.current) {
          visibleRef.current = false;
          sync();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(root);
    layer.style.display = "none";
    const onLightbox = (e: Event) => {
      if (standalone) return;
      coveredRef.current = (e as CustomEvent<boolean>).detail;
      sync();
    };
    window.addEventListener("lightbox-toggle", onLightbox);
    return () => {
      clearTimeout(settle);
      io.disconnect();
      window.removeEventListener("lightbox-toggle", onLightbox);
      anims.forEach((a) => a.cancel());
      animsRef.current = [];
    };
    // spec is a static module constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync(seekTo?: number) {
    const anims = animsRef.current;
    if (!anims.length) return;
    // Off-screen, the overlay leaves rendering entirely: paused animations
    // still hold a GPU layer each, and every frame's commit walks all of them.
    // Coming back, it resumes exactly where it stopped.
    const shown = visibleRef.current && !coveredRef.current;
    const layer = layerRef.current;
    if (layer) layer.style.display = shown ? "" : "none";
    const t = seekTo ?? anims[0].currentTime ?? 0;
    const run = shown && !pausedRef.current;
    anims.forEach((a) => {
      a.currentTime = t;
      if (run) a.play();
      else a.pause();
    });
  }

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    sync();
  };

  const jump = (i: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    pausedRef.current = false;
    setPaused(false);
    sync(Math.max(0, spec.steps[i][0]) * 1000 + 1);
  };

  return (
    <div className="w-full">
      <div
        ref={rootRef}
        className="flow-figure relative w-full overflow-hidden rounded"
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={onOpen ? `Enlarge: ${alt}` : undefined}
        onClick={onOpen}
        onKeyDown={onOpen ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen()) : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          width={spec.w}
          height={spec.h}
          alt={alt}
          className="block h-auto w-full"
          loading="lazy"
          decoding="async"
        />

        {/* figure-space overlay, scaled to the rendered width */}
        <div
          ref={layerRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{ width: spec.w, height: spec.h, visibility: animated ? "visible" : "hidden" }}
        >
          {traces.map((t) => (
            <TracePath key={t.key} d={spec.paths[t.key]} color={DOT_COLORS[t.kind]} />
          ))}
          {spec.marks.map(([box], i) => {
            const [x, y, w, h] = spec.boxes[box];
            return <span key={`m${i}`} data-mark className="flow-mark" style={{ left: x, top: y, width: w, height: h }} />;
          })}
          {spec.dots.map(([, , , kind], i) => (
            <span key={`t${i}`} data-trail className="flow-dot-track">
              <span className="flow-dot flow-dot-trail" style={{ ["--dot" as string]: DOT_COLORS[kind] }} />
            </span>
          ))}
          {spec.dots.map(([, , , kind], i) => (
            <span key={`d${i}`} data-dot className="flow-dot-track">
              <span className="flow-dot" style={{ ["--dot" as string]: DOT_COLORS[kind] }} />
            </span>
          ))}
        </div>
      </div>

      {/* stage caption, stepper and control sit under the figure, so nothing covers the artwork */}
      <div ref={barRef} className="mt-2 flex flex-col gap-1.5" style={{ display: animated ? undefined : "none" }}>
        <div aria-hidden="true" className="grid min-h-[1.65rem] min-w-0 items-center">
          {spec.steps.map(([, label], i) => (
            <span key={i} data-step className="flow-step">
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Jump to a stage">
            {spec.steps.map(([, label], i) => (
              <button key={i} type="button" onClick={jump(i)} className="flow-chip" title={label} aria-label={`Jump to stage: ${label}`}>
                <span>{chipLabels[i]}</span>
                <span data-chip-on aria-hidden="true" className="flow-chip-on">
                  {chipLabels[i]}
                </span>
              </button>
            ))}
          </div>
          <button type="button" onClick={toggle} className="flow-toggle shrink-0" aria-label={paused ? "Play animation" : "Pause animation"}>
            {paused ? "▶ Play" : "❚❚ Pause"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The arrow glow: a soft wide stroke under a crisp core, pre-drawn once and only faded. */
function TracePath({ d, color }: { d: string; color: string }) {
  const box = useMemo(() => pathBox(d), [d]);
  const pad = 14;
  const [x, y, w, h] = [box[0] - pad, box[1] - pad, box[2] - box[0] + 2 * pad, box[3] - box[1] + 2 * pad];
  return (
    <svg data-trace className="flow-trace" style={{ left: x, top: y, width: w, height: h }} viewBox={`${x} ${y} ${w} ${h}`}>
      <path d={d} className="flow-trace-halo" style={{ stroke: color }} />
      <path d={d} className="flow-trace-core" style={{ stroke: color }} />
    </svg>
  );
}

/** Bounding box of a path's coordinates (control points included — a safe superset). */
function pathBox(d: string): [number, number, number, number] {
  const n = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < n.length; i += 2) {
    x0 = Math.min(x0, n[i]);
    x1 = Math.max(x1, n[i]);
    y0 = Math.min(y0, n[i + 1]);
    y1 = Math.max(y1, n[i + 1]);
  }
  return [x0, y0, x1, y1];
}

/** "3 · Something" → "3"; a number used by several stages (e.g. retry rounds) becomes 5a, 5b, 5c. */
function stageNumbers(labels: string[]) {
  const nums = labels.map((l, i) => l.split("·")[0].trim() || String(i + 1));
  const seen = new Map<string, number>();
  return nums.map((n) => {
    const total = nums.filter((m) => m === n).length;
    if (total === 1) return n;
    const k = seen.get(n) ?? 0;
    seen.set(n, k + 1);
    return n + "abcdefgh"[k];
  });
}

function mergeWindows(w: [number, number][]): [number, number][] {
  const s = [...w].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const cur of s) {
    const prev = out[out.length - 1];
    if (prev && cur[0] <= prev[1] + 0.05) prev[1] = Math.max(prev[1], cur[1]);
    else out.push([cur[0], cur[1]]);
  }
  return out;
}

/** WAAPI rejects keyframes whose offsets go backwards; drop exact duplicates. */
function dedupe(kf: Keyframe[]): Keyframe[] {
  const out: Keyframe[] = [];
  for (const k of kf) {
    const prev = out[out.length - 1];
    if (prev && (k.offset as number) < (prev.offset as number)) continue;
    if (prev && k.offset === prev.offset) out[out.length - 1] = k;
    else out.push(k);
  }
  return out;
}
