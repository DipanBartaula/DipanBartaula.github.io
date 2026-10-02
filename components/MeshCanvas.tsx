"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

type Point = { bx: number; by: number; i: number; j: number; ph: number; x?: number; y?: number };

export default function MeshCanvas({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0,
      H = 0,
      cols = 0,
      rows = 0;
    let pts: Point[] = [];
    let raf = 0;

    const accent = resolvedTheme === "dark" ? [139, 147, 255] : [79, 70, 229];

    function resize() {
      const host = canvas!.parentElement;
      if (!host) return;
      W = host.clientWidth;
      H = host.clientHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(6, Math.round(W / 90));
      rows = Math.max(4, Math.round(H / 90));
      pts = [];
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          pts.push({ bx: (i / cols) * W, by: (j / rows) * H, i, j, ph: Math.random() * Math.PI * 2 });
        }
      }
    }

    const idx = (i: number, j: number) => i * (rows + 1) + j;

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      const amp = 8;
      const speed = reduced ? 0 : 0.0009;
      for (const pt of pts) {
        let x = pt.bx + Math.sin(t * speed + pt.ph + pt.j * 0.6) * amp;
        let y = pt.by + Math.cos(t * speed * 1.15 + pt.ph + pt.i * 0.5) * amp;
        if (mouse.current.active) {
          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const r = 140;
          if (d < r) {
            const f = ((r - d) / r) * 26;
            x += (dx / (d || 1)) * f;
            y += (dy / (d || 1)) * f;
          }
        }
        pt.x = x;
        pt.y = y;
      }
      ctx!.lineWidth = 1;
      const [r, g, b] = accent;
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const a = pts[idx(i, j)];
          if (i < cols) {
            const nb = pts[idx(i + 1, j)];
            ctx!.strokeStyle = `rgba(${r},${g},${b},0.16)`;
            ctx!.beginPath();
            ctx!.moveTo(a.x!, a.y!);
            ctx!.lineTo(nb.x!, nb.y!);
            ctx!.stroke();
          }
          if (j < rows) {
            const nb = pts[idx(i, j + 1)];
            ctx!.strokeStyle = `rgba(${r},${g},${b},0.16)`;
            ctx!.beginPath();
            ctx!.moveTo(a.x!, a.y!);
            ctx!.lineTo(nb.x!, nb.y!);
            ctx!.stroke();
          }
        }
      }
      for (const q of pts) {
        ctx!.fillStyle = `rgba(${r},${g},${b},0.5)`;
        ctx!.beginPath();
        ctx!.arc(q.x!, q.y!, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => {
      mouse.current.active = false;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    if (reduced || !active) {
      draw(performance.now());
    } else {
      const loop = (t: number) => {
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [resolvedTheme, active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
}
