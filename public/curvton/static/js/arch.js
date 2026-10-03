/* Animated overlay on the paper's pipeline figure (Fig. 2). Coordinates are in the figure's pixel space (2000 x 1528). */
window.Arch = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const STAGES = [
    { t: "Cloth stream", c: "#15803d", box: [80, 56, 1210, 270],
      paths: ["M205,172 H440", "M590,172 H722", "M918,172 H1022", "M1125,245 V338 H1318 V698 H1125 V912 H1245"],
      p: "<b>Cloth stream.</b> An LLM turns keywords sampled from a 200-type garment dictionary into prompt variants (colour, material, pattern, cut, style), and FLUX.2 [klein] 9B renders about 43K in-shop garment images." },
    { t: "Person stream", c: "#0891b2", box: [80, 354, 1210, 254],
      paths: ["M205,457 H440", "M590,457 H722", "M918,457 H1022", "M1125,530 V653 H460 V880", "M683,658 V905"],
      p: "<b>Person stream.</b> Attributes sampled from a factorized dictionary (body shape, cultural style cues, accessories, assistive devices, background, photographic style) become prompts for 41K source persons at 1024&times;1024." },
    { t: "Difficulty editing", c: "#ea580c", box: [80, 612, 934, 842],
      paths: ["M212,688 L422,898", "M210,945 H405", "M212,1243 L422,995", "M505,945 H618", "M683,988 V1160", "M752,1215 H898 V1004", "M752,1278 H898 V1316"],
      p: "<b>Difficulty editing.</b> Easy, medium and hard dictionaries supply edit keywords; FLUX.2 [klein] 9B edits each person and a VLM accepts the edit or discards it, giving 300K edited persons (100K per tier)." },
    { t: "Try-on + VLM loop", c: "#7c3aed", box: [1036, 712, 940, 800],
      paths: ["M968,948 H1245", "M1315,830 V890", "M1382,930 H1456", "M1530,982 V1052", "M1080,948 V1157 H1450", "M1125,1097 H1450",
        "M1530,1198 V1243", "M1530,1320 V1376", "M1080,1157 V1425 H1456", "M1125,1097 V1390 H1456", "M1598,1415 H1670", "M1818,1415 H1918 V1155 H1608"],
      p: "<b>Try-on with closed-loop validation.</b> FLUX.2 [klein] 9B fuses person and garment from a base VTON prompt, and Qwen3-VL 32B checks garment faithfulness, artifacts, placement and semantics. A rejection produces an improved prompt and another round, up to 4." },
    { t: "Final dataset", c: "#0d9488", box: [1392, 332, 566, 786],
      paths: ["M1600,1097 H1768", "M1835,838 V515", "M1752,463 H1600"],
      p: "<b>Final dataset.</b> Accepted triplets enter the dataset, a share re-rendered from new viewpoints by a camera-angle control model. A ViT-S filter trained on 5K hand-labelled triplets then keeps scores &ge; 0.85: 205K training and 4.5K test triplets." }
  ];
  const STAGE_MS = 5200, SPEED = 520; // figure px per second
  let svg, hole, ring, gFlow, gDots, cur = -1, box = null, timer = 0, raf = 0, running = false, visible = false, manual = false, paused = false;
  let dots = [], reduce = false, last = 0, tweenRaf = 0;

  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function lut(path) {
    const L = path.getTotalLength(), n = Math.max(2, Math.ceil(L / 8)), a = new Float32Array((n + 1) * 2);
    for (let i = 0; i <= n; i++) { const p = path.getPointAtLength(L * i / n); a[2 * i] = p.x; a[2 * i + 1] = p.y; }
    return { L, a, n };
  }
  function at(l, t) { const f = t * l.n, i = Math.min(l.n - 1, Math.floor(f)), k = f - i; return [l.a[2 * i] + (l.a[2 * i + 2] - l.a[2 * i]) * k, l.a[2 * i + 1] + (l.a[2 * i + 3] - l.a[2 * i + 1]) * k]; }

  function build() {
    svg = document.getElementById("archSvg"); if (!svg) return false;
    const defs = el("defs", {}, svg);
    const mask = el("mask", { id: "archMask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 2000, height: 1528 }, defs);
    el("rect", { x: 0, y: 0, width: 2000, height: 1528, fill: "#fff" }, mask);
    hole = el("rect", { rx: 36, fill: "#000" }, mask);
    el("rect", { class: "veil", x: 0, y: 0, width: 2000, height: 1528, mask: "url(#archMask)" }, svg);
    ring = el("rect", { class: "ring", rx: 36 }, svg);
    gFlow = el("g", {}, svg); gDots = el("g", {}, svg);
    return true;
  }
  function setRect(r, b) { r.setAttribute("x", b[0]); r.setAttribute("y", b[1]); r.setAttribute("width", b[2]); r.setAttribute("height", b[3]); }
  function tweenTo(target) {
    cancelAnimationFrame(tweenRaf);
    const from = box || target, t0 = performance.now(), dur = reduce ? 0 : 650;
    const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    (function step(now) {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = ease(k);
      box = from.map((v, i) => v + (target[i] - v) * e);
      setRect(hole, box); setRect(ring, box);
      if (k < 1) tweenRaf = requestAnimationFrame(step);
    })(t0);
  }

  function setStage(i, fromUser) {
    cur = i; const st = STAGES[i];
    ring.style.stroke = st.c;
    tweenTo(st.box);
    // flows
    gFlow.querySelectorAll("path").forEach(p => { p.animate([{ opacity: 0.28 }, { opacity: 0 }], { duration: 250, fill: "forwards" }).onfinish = () => p.remove(); });
    gDots.innerHTML = ""; dots = [];
    st.paths.forEach((d, j) => {
      const p = el("path", { d, class: "flow", stroke: st.c }, gFlow);
      p.style.stroke = st.c; p.style.opacity = 0;
      p.animate([{ opacity: 0 }, { opacity: 0.28 }], { duration: 450, delay: 250, fill: "forwards" });
      const l = lut(p);
      if (!reduce) for (let k = 0; k < 2; k++) {
        const c = el("circle", { r: 13, class: "dot" }, gDots); c.style.fill = st.c; c.setAttribute("opacity", 0);
        dots.push({ c, l, t: (k / 2 + j * 0.17) % 1 });
      }
    });
    // ui
    const tag = document.getElementById("archTag");
    tag.querySelector(".n").textContent = i + 1; tag.querySelector(".n").style.background = st.c; tag.querySelector("span:last-child").textContent = st.t;
    document.querySelectorAll("#archSteps .step").forEach((b, j) => {
      b.setAttribute("aria-selected", j === i ? "true" : "false");
      b.classList.remove("active"); if (j === i) { void b.offsetWidth; b.classList.add("active"); }
    });
    const txt = document.getElementById("archText");
    txt.setAttribute("aria-live", fromUser ? "polite" : "off");
    txt.querySelectorAll("p").forEach((p, j) => p.classList.toggle("on", j === i));
    clearTimeout(timer);
    if (!manual && !paused && visible && !reduce) timer = setTimeout(() => setStage((cur + 1) % STAGES.length), STAGE_MS);
  }

  function frame(ts) {
    if (!running) return;
    const dt = Math.min(50, ts - (last || ts)); last = ts;
    for (const d of dots) {
      d.t += (SPEED * dt / 1000) / d.l.L; if (d.t >= 1) d.t -= 1;
      const [x, y] = at(d.l, d.t);
      d.c.setAttribute("cx", x.toFixed(1)); d.c.setAttribute("cy", y.toFixed(1));
      const fade = Math.min(1, d.t * 8, (1 - d.t) * 8);
      d.c.setAttribute("opacity", fade.toFixed(2));
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function paintBtn() {
    const b = document.getElementById("archPlay"), p = paused || manual;
    b.innerHTML = p ? '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg><span>Play</span>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg><span>Pause</span>';
    b.setAttribute("aria-label", p ? "Play the pipeline tour" : "Pause the pipeline tour");
    document.getElementById("archWrap").classList.toggle("paused", p);
  }

  function init() {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!build()) return;
    const wrap = document.getElementById("archWrap"), steps = document.getElementById("archSteps"), txt = document.getElementById("archText");
    steps.style.setProperty("--dur", STAGE_MS + "ms");
    steps.innerHTML = STAGES.map((s, i) => `<button class="step" type="button" role="tab" style="--sc:${s.c}"><div class="k">Stage ${i + 1}</div><div class="t">${s.t}</div></button>`).join("");
    txt.innerHTML = STAGES.map(s => `<p>${s.p}</p>`).join("");
    steps.querySelectorAll(".step").forEach((b, i) => b.addEventListener("click", () => { manual = true; wrap.classList.add("manual"); paintBtn(); setStage(i, true); }));
    document.getElementById("archPlay").addEventListener("click", () => {
      if (paused || manual) { paused = false; manual = false; wrap.classList.remove("manual"); start(); setStage((cur + 1) % STAGES.length); }
      else { paused = true; clearTimeout(timer); stop(); }
      paintBtn();
    });
    if (reduce) { paused = true; }
    setStage(0); paintBtn();
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      if (visible) { if (!paused) start(); if (!manual && !paused) setStage(cur); }
      else { stop(); clearTimeout(timer); }
    }), { threshold: 0.3 }).observe(document.getElementById("arch"));
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (visible && !paused) start(); });
  }
  return { init };
})();
