"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 22;
const ROWS = 14;
const SPACING = 0.62;
const REST_Z_NOISE = 0.18;

type Particle = {
  rest: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
};

/**
 * A small mass-spring "cloth" of particles — a lightweight stand-in for the
 * Material Point Method grids used in the actual research: each point is
 * pulled back to its rest position by a spring, damped, nudged by ambient
 * turbulence, and pushed away by the cursor (a simple Coulomb-like contact).
 */
export default function ParticleCloth({
  color,
  pointerRef,
}: {
  color: string;
  /** Normalized [-1, 1] cursor position, tracked outside R3F's own hit-testing
   *  so the canvas can stay `pointer-events: none` (letting clicks reach the
   *  text/links above it) while still reacting to the cursor. */
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointer3D = useRef(new THREE.Vector3(9999, 9999, 0));
  const smoothed = useRef({ x: 0, y: 0 });

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    const w = (COLS - 1) * SPACING;
    const h = (ROWS - 1) * SPACING;
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const x = i * SPACING - w / 2;
        const y = j * SPACING - h / 2;
        const z = (Math.sin(i * 0.7) + Math.cos(j * 0.9)) * REST_Z_NOISE * 0.5;
        const rest = new THREE.Vector3(x, y, z);
        arr.push({ rest: rest.clone(), pos: rest.clone(), vel: new THREE.Vector3() });
      }
    }
    return arr;
  }, []);

  const positions = useMemo(() => new Float32Array(particles.length * 3), [particles]);

  const lineIndices = useMemo(() => {
    const idx: number[] = [];
    const at = (i: number, j: number) => i * ROWS + j;
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        if (i < COLS - 1) idx.push(at(i, j), at(i + 1, j));
        if (j < ROWS - 1) idx.push(at(i, j), at(i, j + 1));
      }
    }
    return new Uint16Array(idx);
  }, []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = clock.elapsedTime;

    // Smooth the externally-tracked 2D pointer, then project it into local space.
    const raw = pointerRef.current;
    const p = smoothed.current;
    p.x += (raw.x - p.x) * Math.min(1, dt * 4);
    p.y += (raw.y - p.y) * Math.min(1, dt * 4);
    pointer3D.current.set((p.x * viewport.width) / 2, (p.y * viewport.height) / 2, 0.6);

    const posAttr = pointsRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const spring = particle.rest.clone().sub(particle.pos).multiplyScalar(6.5);
      const damping = particle.vel.clone().multiplyScalar(-2.6);
      const turbulence = new THREE.Vector3(
        Math.sin(t * 0.6 + particle.rest.x * 1.3) * 0.05,
        Math.cos(t * 0.5 + particle.rest.y * 1.1) * 0.05,
        Math.sin(t * 0.4 + particle.rest.x * 0.7 + particle.rest.y * 0.7) * 0.08
      );

      const toParticle = particle.pos.clone().sub(pointer3D.current);
      const dist = toParticle.length();
      const radius = 1.6;
      let repulsion = new THREE.Vector3();
      if (dist < radius) {
        const strength = (1 - dist / radius) * 4.2;
        repulsion = toParticle.normalize().multiplyScalar(strength);
      }

      const accel = spring.add(damping).add(turbulence).add(repulsion);
      particle.vel.addScaledVector(accel, dt);
      particle.pos.addScaledVector(particle.vel, dt);

      positions[i * 3] = particle.pos.x;
      positions[i * 3 + 1] = particle.pos.y;
      positions[i * 3 + 2] = particle.pos.z;
    }

    if (posAttr) {
      posAttr.needsUpdate = true;
    }
    if (lineRef.current) {
      (lineRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    // Gentle camera-less parallax: tilt the whole cloth toward the cursor.
    if (groupRef.current) {
      groupRef.current.rotation.x = -0.18 + p.y * 0.12;
      groupRef.current.rotation.y = 0.24 + p.x * 0.16;
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.18, 0.24, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.05} sizeAttenuation transparent opacity={0.95} />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="index" args={[lineIndices, 1]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}
