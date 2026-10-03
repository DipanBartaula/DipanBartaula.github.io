/* Animated CURVTON-205K pipeline diagram (SVG + requestAnimationFrame particles) */
window.Pipeline = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const W = 150, H = 84;
  const C = { g: "var(--accent)", p: "var(--real)", d: "var(--violet)", m: "var(--mix)", r: "var(--reject)", f: "var(--accent)" };

  const nodes = [
    { id: "gdict", x: 14, y: 24, s: "g", cap: "Dictionary", title: "Garment types", sub: ["200 types, incl.", "traditional wear"], icon: "book" },
    { id: "gllm", x: 186, y: 24, s: "g", cap: "LLM", title: "Prompt variants", sub: ["colour · material", "pattern · cut"], icon: "spark" },
    { id: "ggen", x: 358, y: 24, s: "g", cap: "Generator", title: "FLUX.2 [klein]", sub: ["9B, text-to-image"], icon: "image" },
    { id: "gout", x: 530, y: 24, s: "g", cap: "Output", num: "≈43K", sub: ["in-shop garments"], icon: "stack" },
    { id: "pdict", x: 14, y: 150, s: "p", cap: "Dictionary", title: "Person attributes", sub: ["body · culture · aids", "background · style"], icon: "book" },
    { id: "pllm", x: 186, y: 150, s: "p", cap: "LLM", title: "Person prompts", sub: ["factorized sampling", "50% studio · 50% wild"], icon: "spark" },
    { id: "pgen", x: 358, y: 150, s: "p", cap: "Generator", title: "FLUX.2 [klein]", sub: ["9B, 1024 × 1024"], icon: "image" },
    { id: "pout", x: 530, y: 150, s: "p", cap: "Output", num: "41K", sub: ["source persons"], icon: "stack" },
    { id: "ddict", x: 14, y: 276, s: "d", cap: "Dictionaries", title: "Difficulty edits", sub: ["easy · medium · hard"], icon: "book" },
    { id: "dedit", x: 186, y: 276, s: "d", cap: "Editor", title: "FLUX.2 edit", sub: ["pose · occlusion", "clutter · viewpoint"], icon: "image" },
    { id: "dqc", x: 358, y: 276, s: "d", cap: "Check", title: "VLM gate", sub: ["accept or discard"], icon: "eye" },
    { id: "dout", x: 530, y: 276, s: "d", cap: "Output", num: "300K", sub: ["edited persons", "100K per tier"], icon: "stack" },
    { id: "pair", x: 720, y: 150, w: 140, s: "m", cap: "Merge", title: "Pairing policy", sub: ["balances garment", "category × tier"], icon: "merge" },
    { id: "tryon", x: 896, y: 150, w: 140, s: "m", cap: "Generator", title: "Try-on synthesis", sub: ["FLUX.2 [klein] 9B", "I_p + I_c → I_t"], icon: "image" },
    { id: "judge", x: 1072, y: 150, w: 190, s: "m", cap: "Assessor", title: "Qwen3-VL 32B", sub: ["fidelity · artifacts ·", "placement · semantics"], icon: "eye" },
    { id: "refine", x: 980, y: 24, s: "r", cap: "Feedback", title: "Refine prompt", sub: ["from failure reason", "up to 4 rounds"], icon: "loop" },
    { id: "cand", x: 720, y: 290, s: "m", cap: "Accepted", num: "≥209.5K", sub: ["candidate triplets"], icon: "stack" },
    { id: "filt", x: 906, y: 290, w: 170, s: "m", cap: "Screening", title: "ViT-S filter", sub: ["trained on 5K labels", "keep score ≥ 0.85"], icon: "funnel" },
    { id: "final", x: 1112, y: 282, h: 100, s: "f", cap: "CURVTON-205K", num: "205K", sub: ["training triplets", "+ 4.5K test"], icon: "shield", big: true }
  ];
  const byId = {}; nodes.forEach(n => { n.w = n.w || W; n.h = n.h || H; byId[n.id] = n; });

  const edges = [
    { id: "g1", d: "M164,66 H186", s: "g" }, { id: "g2", d: "M336,66 H358", s: "g" }, { id: "g3", d: "M508,66 H530", s: "g" },
    { id: "g4", d: "M680,66 C704,66 696,178 720,178", s: "g" },
    { id: "p1", d: "M164,192 H186", s: "p" }, { id: "p2", d: "M336,192 H358", s: "p" }, { id: "p3", d: "M508,192 H530", s: "p" },
    { id: "p4", d: "M680,192 H720", s: "p" },
    { id: "pd", d: "M605,234 V247 Q605,255 597,255 H269 Q261,255 261,263 V276", s: "p" },
    { id: "d1", d: "M164,318 H186", s: "d" }, { id: "d2", d: "M336,318 H358", s: "d" }, { id: "d3", d: "M508,318 H530", s: "d" },
    { id: "d4", d: "M680,318 C704,318 696,206 720,206", s: "d" },
    { id: "dx", d: "M433,360 V392", s: "r" },
    { id: "m1", d: "M860,192 H896", s: "m" }, { id: "m2", d: "M1036,192 H1072", s: "m" },
    { id: "r1", d: "M1222,150 V74 Q1222,66 1214,66 H1130", s: "r", label: ["reject", 1232, 112, "start"] },
    { id: "r2", d: "M980,66 H974 Q966,66 966,74 V150", s: "r" },
    { id: "m3", d: "M1110,234 V254 Q1110,262 1102,262 H803 Q795,262 795,270 V290", s: "m", label: ["accept", 1118, 254, "start"] },
    { id: "m4", d: "M870,332 H906", s: "m" }, { id: "m5", d: "M1076,332 H1112", s: "m" }
  ];
  const edgeById = {}; edges.forEach(e => edgeById[e.id] = e);

  const stages = [
    { n: 1, t: "Garments", c: C.g, nodes: ["gdict", "gllm", "ggen", "gout"], edges: ["g1", "g2", "g3", "g4"],
      h: "Garment stream", p: "An LLM expands each of the 200 garment types (common, long-tail and traditional) into prompt variants that vary colour, material, pattern, cut and style. FLUX.2 [klein] 9B renders about 43,000 in-shop garment images." },
    { n: 2, t: "People", c: C.p, nodes: ["pdict", "pllm", "pgen", "pout"], edges: ["p1", "p2", "p3", "p4", "pd"],
      h: "Person stream", p: "Each person is drawn from a factorized attribute distribution: body shape, geographic and cultural style cues, accessories, visible disabilities and assistive devices such as wheelchairs, background and photographic style (50% studio, 50% in-the-wild). 41,000 source persons at 1024 × 1024." },
    { n: 3, t: "Difficulty edits", c: C.d, nodes: ["ddict", "dedit", "dqc", "dout"], edges: ["d1", "d2", "d3", "d4", "dx", "pd"],
      h: "Difficulty stream", p: "Tier dictionaries supply edit keywords that raise pose deviation, occlusion, clutter and viewpoint change. Each person gets several edited variants and a VLM discards failed edits: 300,000 edited persons, 100,000 per tier." },
    { n: 4, t: "Try-on + VLM loop", c: C.m, nodes: ["pair", "tryon", "judge", "refine"], edges: ["g4", "p4", "d4", "m1", "m2", "r1", "r2"],
      h: "Merging stream with closed-loop validation", p: "A pairing policy matches the 341K persons with garments while balancing garment categories and tiers. FLUX.2 [klein] 9B synthesizes the try-on and Qwen3-VL 32B checks garment faithfulness, artifacts, placement and semantic consistency. A rejection becomes a refined prompt and the image is regenerated, up to T = 4 times." },
    { n: 5, t: "Quality screening", c: C.f, nodes: ["cand", "filt", "final"], edges: ["m3", "m4", "m5"],
      h: "Two-stage quality screening", p: "5,000 triplets are hand-labelled with a 10-question artifact rubric and used to train a ViT-Small filter on the channel-concatenated triplet. Keeping candidates that score ≥ 0.85 leaves 205,000 training and 4,500 test triplets; the test split is also checked by hand." }
  ];

  const icons = {
    book: "M2 3h5a2 2 0 0 1 2 2v9a1.5 1.5 0 0 0-1.5-1.5H2zM16 3h-5a2 2 0 0 0-2 2v9a1.5 1.5 0 0 1 1.5-1.5H16z",
    spark: "M9 1.5v4M9 12.5v4M1.5 9h4M12.5 9h4M4 4l2.2 2.2M11.8 11.8L14 14M14 4l-2.2 2.2M6.2 11.8L4 14",
    image: "M2.5 3h13v12h-13zM2.5 12l3.5-3.5 3 3 2-2 4.5 4.5M11.5 6.5h.01",
    stack: "M9 2l7 3.8-7 3.8-7-3.8zM2 9.2l7 3.8 7-3.8M2 12.6l7 3.8 7-3.8",
    eye: "M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9zM9 11.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z",
    merge: "M3 3v3.5a4 4 0 0 0 4 4h8M3 15v-4.5M12 7.5l3 3-3 3",
    loop: "M14.5 6.5A6 6 0 0 0 3.6 5M3 2v3.2h3.2M3.5 11.5a6 6 0 0 0 10.9 1.5M15 16v-3.2h-3.2",
    funnel: "M2 3h14l-5.5 6.5V15l-3 1.5V9.5z",
    shield: "M9 1.5l6.5 2.7v4.6c0 3.8-2.8 6.6-6.5 7.7-3.7-1.1-6.5-3.9-6.5-7.7V4.2zM6.2 9l2 2 3.8-3.8"
  };

  let svg, gEdges, gParticles, gNodes, nodeEls = {}, edgeEls = {}, edgeLen = {}, edgeLut = {};
  let particles = [], running = false, visible = false, raf = 0, last = 0, spawnAcc = 0;
  let current = 0, stageTimer = 0, manual = false, reduce = false, counted = false, userScrolled = false;
  const STAGE_MS = 5600;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) {
      const v = attrs[k];
      if ((k === "fill" || k === "stroke") && String(v).startsWith("var(")) e.style[k] = v;
      else e.setAttribute(k, v);
    }
    if (parent) parent.appendChild(e);
    return e;
  }

  function build() {
    svg = document.getElementById("pipeSvg");
    if (!svg) return false;
    svg.setAttribute("viewBox", "0 0 1280 412");
    const defs = el("defs", {}, svg);
    const glow = el("filter", { id: "pglow", x: "-200%", y: "-200%", width: "500%", height: "500%" }, defs);
    el("feGaussianBlur", { stdDeviation: "3.2" }, glow);
    const mk = el("marker", { id: "parrow", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M1 1.5L8 5 1 8.5", fill: "none", stroke: "var(--axis)", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" }, mk);

    gEdges = el("g", {}, svg);
    gNodes = el("g", {}, svg);
    gParticles = el("g", {}, svg);

    edges.forEach(e => {
      const p = el("path", { d: e.d, class: "edge", "marker-end": "url(#parrow)" }, gEdges);
      edgeEls[e.id] = p;
      const L = p.getTotalLength(); edgeLen[e.id] = L;
      const n = Math.max(2, Math.ceil(L / 2)), lut = new Float32Array((n + 1) * 2);
      for (let i = 0; i <= n; i++) { const pt = p.getPointAtLength(L * i / n); lut[2 * i] = pt.x; lut[2 * i + 1] = pt.y; }
      edgeLut[e.id] = lut;
      if (e.label) {
        const t = el("text", { x: e.label[1], y: e.label[2], class: "edge-label", "text-anchor": e.label[3] }, gEdges);
        t.textContent = e.label[0];
        e.labelEl = t;
      }
    });
    const dxl = el("text", { x: 433, y: 406, class: "edge-label", "text-anchor": "middle" }, gEdges);
    dxl.textContent = "✕ discarded";

    nodes.forEach(n => {
      const g = el("g", { class: "node", transform: `translate(${n.x},${n.y})` }, gNodes);
      el("rect", { class: "box", width: n.w, height: n.h, rx: 12 }, g);
      el("rect", { class: "accentbar", x: 12, y: 0, width: n.w - 24, height: 3, rx: 1.5, fill: C[n.s] }, g);
      const ic = el("path", { d: icons[n.icon], transform: "translate(12,11) scale(.78)", fill: "none", stroke: C[n.s], "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      const cap = el("text", { x: 30, y: 22, style: "font-size:9.5px;font-weight:700;letter-spacing:.09em;fill:var(--muted)" }, g);
      cap.textContent = n.cap.toUpperCase();
      let y = 42;
      if (n.num) {
        const t = el("text", { x: 12, y: n.big ? 52 : 44, class: "num", style: n.big ? "font-size:26px" : "" }, g);
        t.textContent = n.num; t.setAttribute("data-num", n.num); n.numEl = t;
        y = n.big ? 72 : 61;
      } else {
        const t = el("text", { x: 12, y: 40, class: "t1" }, g);
        t.textContent = n.title; y = 57;
      }
      n.sub.forEach((s, i) => { const t = el("text", { x: 12, y: y + i * 14, class: "t2" }, g); t.textContent = s; });
      const pulse = el("rect", { width: n.w, height: n.h, rx: 12, fill: "none", stroke: C[n.s], "stroke-width": 2, opacity: 0 }, g);
      n.pulse = pulse; n.ic = ic;
      nodeEls[n.id] = g;
    });
    return true;
  }

  /* routes: arrays of edge ids; a particle walks them in order */
  function route() {
    const r = Math.random();
    if (r < 0.2) return ["g1", "g2", "g3", "g4"];
    if (r < 0.36) return ["p1", "p2", "p3", "p4"];
    if (r < 0.52) return ["p1", "p2", "p3", "pd", "d2", Math.random() < 0.18 ? "dx" : "d3", "d4"];
    if (r < 0.62) return ["d1", "d2", "d3", "d4"];
    const rej = Math.random() < 0.38;
    return rej ? ["m1", "m2", "r1", "r2", "m2", "m3", "m4", "m5"] : ["m1", "m2", "m3", "m4", "m5"];
  }

  function spawn() {
    const rt = route();
    const g = el("g", {}, gParticles);
    const halo = el("circle", { r: 7.5, opacity: 0.22 }, g);
    const dot = el("circle", { r: 3.6 }, g);
    const p = { rt, i: 0, t: 0, g, halo, dot, speed: 150 + Math.random() * 40, dead: false };
    paint(p);
    particles.push(p);
  }
  function paint(p) {
    const e = edgeById[p.rt[p.i]];
    const col = C[e.s];
    p.halo.style.fill = col; p.dot.style.fill = col;
  }
  function arrive(nodeId) {
    const n = byId[nodeId]; if (!n || !stages[current].nodes.includes(nodeId)) return;
    n.pulse.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 650, easing: "ease-out" });
  }
  const edgeTarget = { g1: "gllm", g2: "ggen", g3: "gout", g4: "pair", p1: "pllm", p2: "pgen", p3: "pout", p4: "pair", pd: "dedit", d1: "dedit", d2: "dqc", d3: "dout", d4: "pair", m1: "tryon", m2: "judge", r1: "refine", r2: "tryon", m3: "cand", m4: "filt", m5: "final" };

  function step(ts) {
    if (!running) return;
    const dt = Math.min(48, ts - (last || ts)); last = ts;
    spawnAcc += dt;
    if (spawnAcc > 340 && particles.length < 22) { spawnAcc = 0; spawn(); }
    const st = stages[current];
    for (const p of particles) {
      const id = p.rt[p.i], L = edgeLen[id];
      p.t += (p.speed * dt / 1000) / L;
      if (p.t >= 1) {
        arrive(edgeTarget[id]);
        if (id === "dx") { p.dead = true; continue; }
        p.i++; p.t = 0;
        if (p.i >= p.rt.length) { p.dead = true; continue; }
        paint(p);
      }
      const cur = p.rt[p.i], lut = edgeLut[cur], n = lut.length / 2 - 1;
      const f = p.t * n, i0 = Math.min(n - 1, Math.floor(f)), k = f - i0;
      const px = lut[2 * i0] + (lut[2 * i0 + 2] - lut[2 * i0]) * k, py = lut[2 * i0 + 1] + (lut[2 * i0 + 3] - lut[2 * i0 + 1]) * k;
      p.g.setAttribute("transform", `translate(${px.toFixed(1)},${py.toFixed(1)})`);
      const on = !st || st.edges.includes(cur);
      const fadeIn = Math.min(1, p.t * 6), fadeOut = cur === "dx" ? 1 - p.t : 1;
      p.g.setAttribute("opacity", ((on ? 1 : 0.18) * Math.min(fadeIn, 1) * fadeOut).toFixed(2));
    }
    particles = particles.filter(p => { if (p.dead) p.g.remove(); return !p.dead; });
    raf = requestAnimationFrame(step);
  }

  function start() { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(step); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function setStage(i, fromUser) {
    current = i;
    const st = stages[i];
    nodes.forEach(n => {
      const on = st.nodes.includes(n.id);
      nodeEls[n.id].classList.toggle("dim", !on);
      nodeEls[n.id].classList.toggle("hot", on);
      nodeEls[n.id].querySelector("rect.box").style.stroke = on ? C[n.s] : "";
    });
    edges.forEach(e => {
      const on = st.edges.includes(e.id);
      edgeEls[e.id].classList.toggle("dim", !on);
      edgeEls[e.id].classList.toggle("hot", on);
      edgeEls[e.id].style.stroke = on ? C[e.s] : "";
      if (e.labelEl) e.labelEl.style.opacity = on ? 1 : 0.3;
    });
    document.querySelectorAll("#steps .step").forEach((b, j) => {
      b.classList.toggle("active", j === i);
      b.setAttribute("aria-selected", j === i ? "true" : "false");
      if (j === i) { b.classList.remove("active"); void b.offsetWidth; b.classList.add("active"); }
    });
    const det = document.getElementById("stepDetail");
    det.style.setProperty("--sc", st.c);
    det.setAttribute("aria-live", fromUser ? "polite" : "off");
    det.querySelector(".badge").textContent = st.n;
    det.querySelectorAll(".stack > div").forEach((d, j) => { d.classList.toggle("on", j === i); d.setAttribute("aria-hidden", j === i ? "false" : "true"); });
    // keep the active region visible when the diagram is scrolled (narrow screens)
    const sc = document.getElementById("pipeScroll");
    if (sc && (fromUser || visible) && sc.scrollWidth > sc.clientWidth + 4) {
      if (!fromUser && userScrolled) { /* respect the reader's own swipe */ }
      else {
        const xs = st.nodes.map(id => byId[id]).map(n => [n.x, n.x + n.w]).flat();
        const x0 = Math.min(...xs) / 1280 * svg.clientWidth, x1 = Math.max(...xs) / 1280 * svg.clientWidth;
        const left = x1 - x0 <= sc.clientWidth - 24 ? x0 - 12 : x0 - 12;
        sc.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
      }
    }
    clearTimeout(stageTimer);
    if (!manual && visible && !reduce) stageTimer = setTimeout(() => setStage((current + 1) % stages.length), STAGE_MS);
  }

  function countUp() {
    if (counted) return; counted = true;
    nodes.filter(n => n.numEl).forEach(n => {
      const txt = n.num, m = txt.match(/([\d.]+)/); if (!m) return;
      const to = parseFloat(m[1]), dec = (m[1].split(".")[1] || "").length;
      if (reduce) return;
      const t0 = performance.now(), dur = 1400;
      (function tick(now) {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        n.numEl.textContent = txt.replace(m[1], (to * e).toFixed(dec));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  function init() {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!build()) return;
    const wrap = document.getElementById("pipe");
    const stepsEl = document.getElementById("steps");
    stepsEl.style.setProperty("--dur", STAGE_MS + "ms");
    stages.forEach((st, i) => {
      const b = document.createElement("button");
      b.className = "step"; b.type = "button"; b.setAttribute("role", "tab");
      b.style.setProperty("--sc", st.c);
      b.innerHTML = `<div class="n">Stage ${st.n}</div><div class="t">${st.t}</div>`;
      b.addEventListener("click", () => { manual = true; wrap.classList.add("manual"); setStage(i, true); });
      stepsEl.appendChild(b);
    });
    const det = document.getElementById("stepDetail");
    det.innerHTML = `<div class="badge">1</div><div class="stack">${stages.map(st => `<div><h3>${st.h}</h3><p>${st.p}</p></div>`).join("")}</div>`;
    const sc = document.getElementById("pipeScroll");
    ["pointerdown", "wheel", "touchstart"].forEach(ev => sc.addEventListener(ev, () => { userScrolled = true; }, { passive: true }));
    setStage(0);
    const io = new IntersectionObserver(es => {
      es.forEach(en => {
        visible = en.isIntersecting;
        if (visible) { countUp(); start(); if (!manual) setStage(current); }
        else { stop(); clearTimeout(stageTimer); }
      });
    }, { threshold: 0.25 });
    io.observe(wrap);
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (visible) start(); });
  }
  return { init };
})();
