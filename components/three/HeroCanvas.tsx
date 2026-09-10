"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import ParticleCloth from "./ParticleCloth";

export default function HeroCanvas() {
  const { resolvedTheme } = useTheme();
  const color = resolvedTheme === "dark" ? "#8b93ff" : "#4f46e5";
  const pointerRef = useRef({ x: 0, y: 0 });
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const host = hostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    // Tracked on window (not the canvas) so the canvas itself can stay
    // pointer-events:none and let clicks pass through to the text above it.
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.75]}
        style={{ pointerEvents: "none" }}
      >
        <ParticleCloth color={color} pointerRef={pointerRef} />
      </Canvas>
    </div>
  );
}
