/* Animated overlay on the paper's pipeline figure (Fig. 2). Coordinates are in the figure's pixel space (2000 x 1528).
   Everything that moves is compositor-only: stage spotlights are pre-drawn layers that crossfade (opacity), and the
   flow particles are small elements animated with the Web Animations API on transform/opacity along precomputed paths. */
window.Arch = (function () {
  const NS = "http://www.w3.org/2000/svg", FW = 2000, FH = 1528;
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
  const STAGE_MS = 5600, SPEED = 430, DOT = 24; // speed in figure px per second, dot diameter in figure px
  let arch, layers = [], dotsHost, dotsBox = null, kf = [], cur = -1, timer = 0, visible = false, manual = false, paused = false, reduce = false;

  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  /* one static, pre-drawn spotlight layer per stage (veil with a rounded hole, outline ring, dashed flow traces) */
  function buildLayers() {
    const host = document.createElement("div"); host.className = "arch-layers"; arch.insertBefore(host, document.getElementById("archSvg"));
    document.getElementById("archSvg").remove();
    STAGES.forEach((st, i) => {
      const s = el("svg", { viewBox: `0 0 ${FW} ${FH}`, preserveAspectRatio: "none", class: "arch-layer", "aria-hidden": "true" });
      const defs = el("defs", {}, s), m = el("mask", { id: "archMask" + i, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: FW, height: FH }, defs);
      el("rect", { x: 0, y: 0, width: FW, height: FH, fill: "#fff" }, m);
      const [x, y, w, h] = st.box;
      el("rect", { x, y, width: w, height: h, rx: 36, fill: "#000" }, m);
      el("rect", { class: "veil", x: 0, y: 0, width: FW, height: FH, mask: `url(#archMask${i})` }, s);
      const ring = el("rect", { class: "ring", x, y, width: w, height: h, rx: 36 }, s); ring.style.stroke = st.c;
      st.paths.forEach(d => { const p = el("path", { d, class: "flow" }, s); p.style.stroke = st.c; });
      host.appendChild(s); layers.push(s);
    });
  }

  /* precompute constant-speed keyframes (transform + opacity) for every path */
  function buildKeyframes() {
    const probe = el("svg", { width: 0, height: 0, style: "position:absolute;width:0;height:0;overflow:hidden" });
    document.body.appendChild(probe);
    kf = STAGES.map(st => st.paths.map(d => {
      const p = el("path", { d }, probe), L = p.getTotalLength(), n = Math.max(8, Math.ceil(L / 18)), frames = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, pt = p.getPointAtLength(L * t), o = Math.max(0, Math.min(1, t / 0.07, (1 - t) / 0.07));
        frames.push({ offset: t, transform: `translate3d(${(pt.x - DOT / 2).toFixed(1)}px,${(pt.y - DOT / 2).toFixed(1)}px,0)`, opacity: +o.toFixed(3) });
      }
      return { frames, dur: L / SPEED * 1000 };
    }));
    probe.remove();
  }

  function fitDots() { if (!dotsHost) return; const k = arch.clientWidth / FW; dotsHost.style.transform = `scale(${k})`; }

  function swapDots(i) {
    const old = dotsBox;
    if (old) {
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease", fill: "forwards" }).finished.then(() => old.remove()).catch(() => old.remove());
    }
    dotsBox = null;
    if (reduce) return;
    const box = document.createElement("div"); box.className = "arch-dotset"; box.style.opacity = 0;
    const st = STAGES[i];
    kf[i].forEach((k, j) => {
      for (let n = 0; n < 2; n++) {
        const d = document.createElement("span"); d.className = "arch-dot"; d.style.background = st.c;
        box.appendChild(d);
        const a = d.animate(k.frames, { duration: k.dur, iterations: Infinity, easing: "linear" });
        a.currentTime = k.dur * ((n / 2 + j * 0.17) % 1);
        if (!visible || paused) a.pause();
      }
    });
    dotsHost.appendChild(box); dotsBox = box;
    box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 180, easing: "ease", fill: "forwards" });
  }
  function playDots(on) { if (!dotsBox) return; dotsBox.querySelectorAll(".arch-dot").forEach(d => d.getAnimations().forEach(a => on ? a.play() : a.pause())); }

  function setStage(i, fromUser) {
    if (i === cur && !fromUser) { schedule(); return; }
    cur = i; const st = STAGES[i];
    layers.forEach((l, j) => l.classList.toggle("on", j === i));
    swapDots(i);
    const tag = document.getElementById("archTag");
    tag.querySelector(".n").textContent = i + 1; tag.querySelector(".n").style.background = st.c; tag.querySelector("span:last-child").textContent = st.t;
    document.querySelectorAll("#archSteps .step").forEach((b, j) => {
      b.setAttribute("aria-selected", j === i ? "true" : "false");
      b.classList.remove("active"); if (j === i) { void b.offsetWidth; b.classList.add("active"); }
    });
    const txt = document.getElementById("archText");
    txt.setAttribute("aria-live", fromUser ? "polite" : "off");
    txt.querySelectorAll("p").forEach((p, j) => p.classList.toggle("on", j === i));
    schedule();
  }
  function schedule() { clearTimeout(timer); if (!manual && !paused && visible && !reduce) timer = setTimeout(() => setStage((cur + 1) % STAGES.length), STAGE_MS); }

  function paintBtn() {
    const b = document.getElementById("archPlay"), p = paused || manual;
    b.innerHTML = p ? '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg><span>Play</span>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg><span>Pause</span>';
    b.setAttribute("aria-label", p ? "Play the pipeline tour" : "Pause the pipeline tour");
    document.getElementById("archWrap").classList.toggle("paused", p);
  }

  function init() {
    arch = document.getElementById("arch"); if (!arch || !document.getElementById("archSvg")) return;
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = document.getElementById("archWrap"), steps = document.getElementById("archSteps"), txt = document.getElementById("archText");
    buildLayers(); buildKeyframes();
    const dw = document.createElement("div"); dw.className = "arch-dots-wrap"; dotsHost = document.createElement("div"); dotsHost.className = "arch-dots";
    dw.appendChild(dotsHost); arch.insertBefore(dw, document.getElementById("archTag"));
    fitDots(); new ResizeObserver(fitDots).observe(arch);
    steps.style.setProperty("--dur", STAGE_MS + "ms");
    steps.innerHTML = STAGES.map((s, i) => `<button class="step" type="button" role="tab" style="--sc:${s.c}"><div class="k">Stage ${i + 1}</div><div class="t">${s.t}</div></button>`).join("");
    txt.innerHTML = STAGES.map(s => `<p>${s.p}</p>`).join("");
    steps.querySelectorAll(".step").forEach((b, i) => b.addEventListener("click", () => { manual = true; wrap.classList.add("manual"); paintBtn(); setStage(i, true); }));
    document.getElementById("archPlay").addEventListener("click", () => {
      if (paused || manual) {
        if (reduce) { reduce = false; document.documentElement.classList.add("motion-ok"); document.dispatchEvent(new Event("motionok")); swapDots(cur); }
        paused = false; manual = false; wrap.classList.remove("manual"); playDots(true); setStage((cur + 1) % STAGES.length);
      } else { paused = true; clearTimeout(timer); playDots(false); }
      paintBtn();
    });
    document.addEventListener("motionok", () => { if (reduce) { reduce = false; if (cur >= 0) swapDots(cur); } });
    if (reduce) paused = true;
    setStage(0); paintBtn();
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      playDots(visible && !paused);
      if (visible) schedule(); else clearTimeout(timer);
    }), { threshold: 0.25 }).observe(arch);
    document.addEventListener("visibilitychange", () => { if (document.hidden) { playDots(false); clearTimeout(timer); } else if (visible) { playDots(!paused); schedule(); } });
  }
  return { init };
})();
