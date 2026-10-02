/// <reference lib="webworker" />
import { createCloth, type Cloth } from "@/lib/cloth";

/** Renders the hero cloth on an OffscreenCanvas, off the page's main thread. */
const scope = self as unknown as DedicatedWorkerGlobalScope;
const raf = scope.requestAnimationFrame ? scope.requestAnimationFrame.bind(scope) : (cb: (t: number) => void) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const caf = scope.cancelAnimationFrame ? scope.cancelAnimationFrame.bind(scope) : (id: number) => clearTimeout(id);

let cloth: Cloth | null = null;

scope.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === "init") {
    cloth = createCloth(m.canvas as OffscreenCanvas, raf, caf);
    if (!cloth) return scope.postMessage({ type: "failed" });
    cloth.setColor(m.color);
    cloth.resize(m.width, m.height, m.dpr);
    cloth.setActive(m.active);
    return;
  }
  if (!cloth) return;
  if (m.type === "pointer") cloth.setPointer(m.x, m.y);
  else if (m.type === "resize") cloth.resize(m.width, m.height, m.dpr);
  else if (m.type === "color") cloth.setColor(m.color);
  else if (m.type === "active") cloth.setActive(m.active);
  else if (m.type === "destroy") cloth.destroy();
};
