"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { createCloth } from "@/lib/cloth";

type Backend = {
  pointer(x: number, y: number): void;
  resize(w: number, h: number, dpr: number): void;
  color(c: string): void;
  active(a: boolean): void;
  destroy(): void;
};

/**
 * The hero's particle cloth (lib/cloth.ts). Where OffscreenCanvas is
 * available the canvas is handed to a Web Worker, so animating it costs the
 * page's main thread nothing — no frames, no layout, no paint. Elsewhere the
 * same renderer runs on the main thread. Calls `onFail` if WebGL is missing.
 */
export default function HeroCanvas({ active = true, onFail }: { active?: boolean; onFail?: () => void }) {
  const { resolvedTheme } = useTheme();
  const color = resolvedTheme === "dark" ? "#8b93ff" : "#4f46e5";
  const hostRef = useRef<HTMLDivElement>(null);
  const backend = useRef<Backend | null>(null);
  const state = useRef({ color, active, onFail });
  state.current = { color, active, onFail };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Created here (not in JSX) so every mount gets a fresh canvas: control of a
    // canvas can be transferred to a worker only once.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "display:block;width:100%;height:100%;pointer-events:none";
    host.appendChild(canvas);
    const dpr = () => Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5);
    const fail = () => state.current.onFail?.();

    let worker: Worker | null = null;
    if (typeof canvas.transferControlToOffscreen === "function" && typeof Worker !== "undefined") {
      try {
        const off = canvas.transferControlToOffscreen();
        const w = new Worker(new URL("./cloth.worker.ts", import.meta.url), { type: "module" });
        worker = w;
        w.onmessage = (e) => e.data?.type === "failed" && fail();
        w.onerror = fail;
        w.postMessage(
          { type: "init", canvas: off, width: host.clientWidth, height: host.clientHeight, dpr: dpr(), color: state.current.color, active: state.current.active },
          [off]
        );
        backend.current = {
          pointer: (x, y) => w.postMessage({ type: "pointer", x, y }),
          resize: (width, height, d) => w.postMessage({ type: "resize", width, height, dpr: d }),
          color: (c) => w.postMessage({ type: "color", color: c }),
          active: (a) => w.postMessage({ type: "active", active: a }),
          destroy: () => w.terminate(),
        };
      } catch {
        worker?.terminate();
        worker = null;
      }
    }
    if (!worker) {
      const cloth = createCloth(canvas, requestAnimationFrame, cancelAnimationFrame);
      if (!cloth) {
        canvas.remove();
        fail();
        return;
      }
      cloth.setColor(state.current.color);
      cloth.resize(host.clientWidth, host.clientHeight, dpr());
      cloth.setActive(state.current.active);
      backend.current = {
        pointer: (x, y) => cloth.setPointer(x, y),
        resize: (w, h, d) => cloth.resize(w, h, d),
        color: (c) => cloth.setColor(c),
        active: (a) => cloth.setActive(a),
        destroy: () => cloth.destroy(),
      };
    }

    // The host rect is re-read lazily (only on a pointer move after a scroll or
    // resize), so neither scrolling nor pointer moves force any layout work.
    let rect: DOMRect | null = null;
    const ro = new ResizeObserver(() => {
      rect = null;
      backend.current?.resize(host.clientWidth, host.clientHeight, dpr());
    });
    ro.observe(host);
    const onScroll = () => (rect = null);
    const onMove = (e: PointerEvent) => {
      // Tracked on window (not the canvas) so the canvas can stay
      // pointer-events:none and let clicks reach the text above it.
      const r = rect ?? (rect = host.getBoundingClientRect());
      backend.current?.pointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      backend.current?.destroy();
      backend.current = null;
      canvas.remove();
    };
  }, []);

  useEffect(() => backend.current?.color(color), [color]);
  useEffect(() => backend.current?.active(active), [active]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
