/**
 * The hero's particle "cloth", rendered with raw WebGL so it can run inside a
 * Web Worker on an OffscreenCanvas (components/three/cloth.worker.ts) — the
 * page's main thread then never produces a frame for it.
 *
 * It reproduces the previous three.js / react-three-fiber scene exactly:
 * a 22×14 mass-spring grid, PerspectiveCamera(fov 42, z = 8, near 0.1, far
 * 1000), a group tilted toward the cursor, square size-attenuated points
 * (PointsMaterial size 0.05, opacity 0.95) plus grid lines (opacity 0.28),
 * normal alpha blending with depth test/write, and R3F's colour pipeline
 * (sRGB → linear → ACES Filmic tone mapping → sRGB output).
 */

const COLS = 22;
const ROWS = 14;
const SPACING = 0.62;
const REST_Z_NOISE = 0.18;
const FOV = 42;
const CAM_Z = 8;

type Surface = HTMLCanvasElement | OffscreenCanvas;

export type Cloth = {
  resize(width: number, height: number, dpr: number): void;
  setPointer(x: number, y: number): void;
  setColor(hex: string): void;
  setActive(active: boolean): void;
  destroy(): void;
};

// ---- colour: replicate three's ColorManagement + ACESFilmicToneMapping ----
const toLinear = (c: number) => (c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4));
const toSRGB = (c: number) => (c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055);
const fit = (v: number) => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
function displayColor(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255) / 0.6);
  // column-major mat3 from three's GLSL (ACESInputMat / ACESOutputMat)
  const i = [0.59719, 0.076, 0.0284, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777];
  const o = [1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602];
  const mul = (m: number[], v: number[]) => [0, 1, 2].map((r) => m[r] * v[0] + m[3 + r] * v[1] + m[6 + r] * v[2]);
  const out = mul(o, mul(i, lin).map(fit)).map((c) => toSRGB(Math.min(1, Math.max(0, c))));
  return [out[0], out[1], out[2]];
}

const VS = `
attribute vec3 position;
uniform mat4 mvp;
uniform mat4 mv;
uniform float pointScale;
void main() {
  vec4 mvPos = mv * vec4(position, 1.0);
  gl_Position = mvp * vec4(position, 1.0);
  gl_PointSize = pointScale / -mvPos.z;
}`;
const FS = `
precision mediump float;
uniform vec4 color;
void main() { gl_FragColor = color; }`;

export function createCloth(canvas: Surface, raf: (cb: (t: number) => void) => number, caf: (id: number) => void): Cloth | null {
  const ctx = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true, depth: true, powerPreference: "low-power" }) as WebGLRenderingContext | null;
  if (!ctx) return null;
  const gl = ctx;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const uMvp = gl.getUniformLocation(prog, "mvp");
  const uMv = gl.getUniformLocation(prog, "mv");
  const uScale = gl.getUniformLocation(prog, "pointScale");
  const uColor = gl.getUniformLocation(prog, "color");
  const aPos = gl.getAttribLocation(prog, "position");

  // ---- particles ----
  const N = COLS * ROWS;
  const rest = new Float32Array(N * 3), pos = new Float32Array(N * 3), vel = new Float32Array(N * 3);
  const w0 = (COLS - 1) * SPACING, h0 = (ROWS - 1) * SPACING;
  for (let i = 0; i < COLS; i++)
    for (let j = 0; j < ROWS; j++) {
      const k = (i * ROWS + j) * 3;
      rest[k] = i * SPACING - w0 / 2;
      rest[k + 1] = j * SPACING - h0 / 2;
      rest[k + 2] = (Math.sin(i * 0.7) + Math.cos(j * 0.9)) * REST_Z_NOISE * 0.5;
    }
  pos.set(rest);
  const idx: number[] = [];
  for (let i = 0; i < COLS; i++)
    for (let j = 0; j < ROWS; j++) {
      const a = i * ROWS + j;
      if (i < COLS - 1) idx.push(a, a + ROWS);
      if (j < ROWS - 1) idx.push(a, a + 1);
    }
  const indices = new Uint16Array(idx);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, pos.byteLength, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.depthMask(true);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let W = 1, H = 1, dpr = 1;
  let rgb: [number, number, number] = displayColor("#8b93ff");
  const raw = { x: 0, y: 0 }, sm = { x: 0, y: 0 };
  let active = true, frame = 0, last = 0, t0 = 0, dead = false;

  const proj = new Float32Array(16), mv = new Float32Array(16), mvp = new Float32Array(16);
  function project() {
    const f = 1 / Math.tan((FOV * Math.PI) / 360), near = 0.1, far = 1000, aspect = W / H;
    proj.fill(0);
    proj[0] = f / aspect;
    proj[5] = f;
    proj[10] = -(far + near) / (far - near);
    proj[11] = -1;
    proj[14] = (-2 * far * near) / (far - near);
  }
  function modelView(rx: number, ry: number) {
    // view = translate(0,0,-8); model = Rx · Ry (three's Euler 'XYZ'); column-major
    const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    mv[0] = cy; mv[1] = sx * sy; mv[2] = -cx * sy; mv[3] = 0;
    mv[4] = 0; mv[5] = cx; mv[6] = sx; mv[7] = 0;
    mv[8] = sy; mv[9] = -sx * cy; mv[10] = cx * cy; mv[11] = 0;
    mv[12] = 0; mv[13] = 0; mv[14] = -CAM_Z; mv[15] = 1;
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += proj[k * 4 + r] * mv[c * 4 + k];
        mvp[c * 4 + r] = s;
      }
  }

  function step(now: number) {
    frame = 0;
    if (dead || !active) return;
    if (!t0) t0 = now;
    const dt = Math.min(last ? (now - last) / 1000 : 0, 1 / 30);
    last = now;
    const t = (now - t0) / 1000;

    sm.x += (raw.x - sm.x) * Math.min(1, dt * 4);
    sm.y += (raw.y - sm.y) * Math.min(1, dt * 4);
    const vh = 2 * Math.tan((FOV * Math.PI) / 360) * CAM_Z, vw = vh * (W / H);
    const px = (sm.x * vw) / 2, py = (sm.y * vh) / 2, pz = 0.6, radius = 1.6;

    for (let k = 0; k < N * 3; k += 3) {
      const rx = rest[k], ry = rest[k + 1], rz = rest[k + 2];
      let ax = (rx - pos[k]) * 6.5 - vel[k] * 2.6 + Math.sin(t * 0.6 + rx * 1.3) * 0.05;
      let ay = (ry - pos[k + 1]) * 6.5 - vel[k + 1] * 2.6 + Math.cos(t * 0.5 + ry * 1.1) * 0.05;
      let az = (rz - pos[k + 2]) * 6.5 - vel[k + 2] * 2.6 + Math.sin(t * 0.4 + rx * 0.7 + ry * 0.7) * 0.08;
      const dx = pos[k] - px, dy = pos[k + 1] - py, dz = pos[k + 2] - pz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < radius && d > 1e-6) {
        const s = ((1 - d / radius) * 4.2) / d;
        ax += dx * s;
        ay += dy * s;
        az += dz * s;
      }
      vel[k] += ax * dt;
      vel[k + 1] += ay * dt;
      vel[k + 2] += az * dt;
      pos[k] += vel[k] * dt;
      pos[k + 1] += vel[k + 1] * dt;
      pos[k + 2] += vel[k + 2] * dt;
    }

    modelView(-0.18 + sm.y * 0.12, 0.24 + sm.x * 0.16);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    gl.uniformMatrix4fv(uMvp, false, mvp);
    gl.uniformMatrix4fv(uMv, false, mv);
    gl.uniform1f(uScale, 0.05 * dpr * (H * 0.5));
    gl.uniform4f(uColor, rgb[0], rgb[1], rgb[2], 0.95);
    gl.drawArrays(gl.POINTS, 0, N);
    gl.uniform4f(uColor, rgb[0], rgb[1], rgb[2], 0.28);
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);

    frame = raf(step);
  }
  const kick = () => {
    if (!frame && active && !dead) {
      last = 0;
      frame = raf(step);
    }
  };

  return {
    resize(width, height, ratio) {
      W = Math.max(1, width);
      H = Math.max(1, height);
      dpr = ratio;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      project();
      kick();
    },
    setPointer(x, y) {
      raw.x = x;
      raw.y = y;
    },
    setColor(hex) {
      rgb = displayColor(hex);
    },
    setActive(a) {
      active = a;
      if (a) kick();
      else if (frame) {
        caf(frame);
        frame = 0;
      }
    },
    destroy() {
      dead = true;
      if (frame) caf(frame);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
