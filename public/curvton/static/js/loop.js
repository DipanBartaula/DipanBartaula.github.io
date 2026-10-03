/* Animated VLM feedback loop, using the successive generations shown in the paper's Figs. 13 and 15. */
window.Loop = (function () {
  const EX = [
    { k: "hoodie", n: "Hoodie" }, { k: "mini_skirt", n: "Mini skirt" }, { k: "chakma_dress", n: "Chakma dress" },
    { k: "jamdani_saree", n: "Jamdani saree" }, { k: "ghalek", n: "Ghalek" }, { k: "power_suit", n: "Power suit" }
  ];
  const N = 4, NS = "http://www.w3.org/2000/svg";
  const src = (k, s) => `static/img/loop/${k}_${s}.jpg`;
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  const V = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  let reduce = false, ex = 0, token = 0, visible = false, paused = false, front = "A";
  let el = {}, wires = {}, slots = [];

  function preload(list) { return Promise.all(list.map(s => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(res) : res()); i.src = s; }))); }

  /* ---------- wires (desktop only) ---------- */
  function wiresVisible() { return getComputedStyle(el.wires).display !== "none"; }
  function layoutWires() {
    if (!wiresVisible()) return;
    const S = el.stage.getBoundingClientRect(), r = e => { const b = e.getBoundingClientRect(); return { l: b.left - S.left, r: b.right - S.left, t: b.top - S.top, b: b.bottom - S.top, cx: (b.left + b.right) / 2 - S.left, cy: (b.top + b.bottom) / 2 - S.top }; };
    const pi = r(el.person.parentElement), ga = r(el.garment.parentElement), g = r(el.gen), o = r(el.out), v = r(el.vlm), h = r(el.hist);
    el.wires.setAttribute("viewBox", `0 0 ${S.width} ${S.height}`);
    const yb = S.height - 18, rr = 12;
    const d = {
      inP: `M${pi.r},${pi.cy} C${(pi.r + g.l) / 2},${pi.cy} ${(pi.r + g.l) / 2},${g.cy - 8} ${g.l},${g.cy - 8}`,
      inG: `M${ga.r},${ga.cy} C${(ga.r + g.l) / 2},${ga.cy} ${(ga.r + g.l) / 2},${g.cy + 8} ${g.l},${g.cy + 8}`,
      gen: `M${g.r},${g.cy} H${o.l}`,
      chk: `M${o.r},${o.cy} H${v.l}`,
      out: `M${v.r},${v.cy} H${h.l}`,
      ret: `M${v.cx},${v.b} V${yb - rr} Q${v.cx},${yb} ${v.cx - rr},${yb} H${g.cx + rr} Q${g.cx},${yb} ${g.cx},${yb - rr} V${g.b}`
    };
    for (const k in d) wires[k].setAttribute("d", d[k]);
    wires.lbl.setAttribute("x", (v.cx + g.cx) / 2); wires.lbl.setAttribute("y", yb - 8);
  }
  function buildWires() {
    const mk = (cls, extra) => { const p = document.createElementNS(NS, "path"); p.setAttribute("class", cls); if (extra) p.setAttribute("marker-end", extra); el.wires.appendChild(p); return p; };
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = '<marker id="lpArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1.5L8 5 1 8.5" fill="none" stroke="#adb5bd" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker><marker id="lpArrowR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1.5L8 5 1 8.5" fill="none" stroke="#e03131" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>';
    el.wires.appendChild(defs);
    wires.inP = mk("w", "url(#lpArrow)"); wires.inG = mk("w", "url(#lpArrow)"); wires.gen = mk("w", "url(#lpArrow)");
    wires.chk = mk("w", "url(#lpArrow)"); wires.out = mk("w", "url(#lpArrow)"); wires.ret = mk("ret", "url(#lpArrowR)");
    const t = document.createElementNS(NS, "text"); t.setAttribute("class", "lbl"); t.setAttribute("text-anchor", "middle"); t.textContent = "rejected → refined prompt, regenerate"; el.wires.appendChild(t); wires.lbl = t;
    const c = document.createElementNS(NS, "circle"); c.setAttribute("r", 6); c.setAttribute("class", "pk"); c.setAttribute("opacity", 0); el.wires.appendChild(c); wires.dot = c;
  }
  function travel(path, color, ms, my) {
    if (reduce || !wiresVisible()) return sleep(Math.min(ms, 250));
    const L = path.getTotalLength(), c = wires.dot, t0 = performance.now();
    c.style.fill = color; c.setAttribute("opacity", 1); path.classList.add("on");
    return new Promise(res => {
      (function step(now) {
        if (my !== token) { c.setAttribute("opacity", 0); path.classList.remove("on"); return res(); }
        const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, p = path.getPointAtLength(L * e);
        c.setAttribute("cx", p.x); c.setAttribute("cy", p.y);
        if (k < 1) requestAnimationFrame(step); else { c.setAttribute("opacity", 0); setTimeout(() => path.classList.remove("on"), 250); res(); }
      })(t0);
    });
  }

  /* ---------- state helpers ---------- */
  function showAttempt(i) {
    const A = el.imgA, B = el.imgB, next = front === "A" ? B : A, cur = front === "A" ? A : B;
    next.src = src(EX[ex].k, "a" + (i + 1)); next.alt = `${EX[ex].n}: attempt ${i + 1} of ${N}`;
    next.classList.remove("hide"); cur.classList.add("hide"); front = front === "A" ? "B" : "A";
    el.out.classList.remove("empty");
    el.att.textContent = `Attempt ${i + 1} of ${N}`;
  }
  function resetChecks() { el.checks.forEach(li => li.className = ""); }
  function stamp(kind) {
    el.stamp.className = "stamp " + kind; el.stamp.innerHTML = kind === "rej" ? X + "Rejected" : V + "Accepted";
    requestAnimationFrame(() => el.stamp.classList.add("show"));
  }
  function fillSlot(i, kind) { const s = slots[i]; s.className = "lp-slot fill " + kind; s.querySelector("img").src = src(EX[ex].k, "a" + (i + 1)); s.querySelector("b").innerHTML = kind === "rej" ? "&#10005;" : "&#10003;"; }
  function resetExample() {
    slots.forEach(s => { s.className = "lp-slot"; s.querySelector("b").innerHTML = ""; });
    resetChecks(); el.verdict.textContent = ""; el.verdict.className = "lp-verdict"; el.stamp.className = "stamp"; el.out.classList.remove("accepted");
    el.prompt.textContent = "Base VTON prompt"; el.prompt.classList.remove("refined");
    el.gen.classList.remove("busy"); el.vlm.classList.remove("vbusy");
    el.person.src = src(EX[ex].k, "person"); el.garment.src = src(EX[ex].k, "garment");
    el.person.alt = `Source person (${EX[ex].n} example)`; el.garment.alt = `Target garment: ${EX[ex].n}`;
    document.querySelectorAll("#lpPick button").forEach((b, j) => b.setAttribute("aria-pressed", j === ex ? "true" : "false"));
  }
  function finalState() {
    resetExample(); showAttempt(N - 1);
    for (let i = 0; i < N - 1; i++) fillSlot(i, "rej"); fillSlot(N - 1, "acc");
    el.checks.forEach(li => li.className = "ok"); el.verdict.textContent = "✓ Accepted into CURVTON-205K"; el.verdict.className = "lp-verdict acc";
    stamp("acc"); el.out.classList.add("accepted");
  }

  /* ---------- the loop ---------- */
  async function play(i0) {
    const my = ++token;
    ex = (i0 + EX.length) % EX.length;
    await preload([src(EX[ex].k, "person"), src(EX[ex].k, "garment"), ...[1, 2, 3, 4].map(n => src(EX[ex].k, "a" + n))]);
    if (my !== token) return;
    if (reduce || paused || !visible) { finalState(); return; }
    resetExample(); layoutWires();
    el.out.classList.add("empty"); el.imgA.classList.add("hide"); el.imgB.classList.add("hide"); el.att.textContent = `Attempt 1 of ${N}`;
    const ok = () => my === token;
    await Promise.all([travel(wires.inP, "#868e96", 500, my), travel(wires.inG, "#868e96", 500, my)]); if (!ok()) return;
    for (let i = 0; i < N; i++) {
      const last = i === N - 1;
      el.verdict.textContent = ""; el.verdict.className = "lp-verdict"; resetChecks();
      el.gen.classList.add("busy");
      if (i > 0) { el.prompt.textContent = `Refined prompt #${i}`; el.prompt.classList.add("refined"); }
      await sleep(350); if (!ok()) return;
      await travel(wires.gen, "#e8590c", 450, my); if (!ok()) return;
      el.stamp.className = "stamp"; showAttempt(i); el.gen.classList.remove("busy");
      await sleep(450); if (!ok()) return;
      await travel(wires.chk, "#4c6ef5", 380, my); if (!ok()) return;
      el.vlm.classList.add("vbusy"); el.verdict.textContent = "Checking…"; el.verdict.className = "lp-verdict";
      el.scan.classList.remove("go"); void el.scan.offsetWidth; el.scan.classList.add("go");
      for (const li of el.checks) { li.className = "chk"; await sleep(230); if (!ok()) return; }
      el.vlm.classList.remove("vbusy");
      if (!last) {
        resetChecks();
        el.verdict.textContent = "✕ Rejected · regenerate"; el.verdict.className = "lp-verdict rej";
        stamp("rej"); fillSlot(i, "rej");
        wires.ret.classList.add("on");
        await travel(wires.ret, "#e03131", 900, my); if (!ok()) return;
        wires.ret.classList.remove("on");
      } else {
        for (const li of el.checks) { li.className = "ok"; await sleep(110); if (!ok()) return; }
        el.verdict.textContent = "✓ Accepted into CURVTON-205K"; el.verdict.className = "lp-verdict acc";
        stamp("acc"); el.out.classList.add("accepted");
        await travel(wires.out, "#2b8a3e", 450, my); if (!ok()) return;
        fillSlot(i, "acc");
      }
      await sleep(last ? 2600 : 250); if (!ok()) return;
    }
    play(ex + 1);
  }

  function paintBtn() {
    const b = $("lpPlay");
    b.innerHTML = paused ? '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg><span>Play</span>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg><span>Pause</span>';
    b.setAttribute("aria-label", paused ? "Play the feedback-loop animation" : "Pause the feedback-loop animation");
  }

  function init() {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!$("loop")) return;
    el = { stage: $("lpStage"), wires: $("lpWires"), person: $("lpPerson"), garment: $("lpGarment"), gen: $("lpGen"), prompt: $("lpPrompt"), out: $("lpOut"), imgA: $("lpImgA"), imgB: $("lpImgB"), att: $("lpAtt"), scan: $("lpScan"), stamp: $("lpStamp"), vlm: $("lpVlm"), checks: Array.from(document.querySelectorAll("#lpChecks li")), verdict: $("lpVerdict"), hist: $("lpHist") };
    for (let i = 0; i < N; i++) { const s = document.createElement("div"); s.className = "lp-slot"; s.innerHTML = '<img alt=""><b></b>'; el.hist.appendChild(s); slots.push(s); }
    $("lpPick").innerHTML = EX.map((e, i) => `<button type="button" aria-pressed="${i === 0}"><img src="${src(e.k, "garment")}" alt="" loading="lazy">${e.n}</button>`).join("");
    document.querySelectorAll("#lpPick button").forEach((b, i) => b.addEventListener("click", () => { play(i); }));
    $("lpPlay").addEventListener("click", () => { paused = !paused; paintBtn(); if (paused) { token++; finalState(); } else play(ex); });
    buildWires();
    if (reduce) paused = true;
    paintBtn(); finalState();
    new ResizeObserver(() => layoutWires()).observe(el.stage);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutWires);
    new IntersectionObserver(es => es.forEach(e => {
      const was = visible; visible = e.isIntersecting;
      if (visible && !was && !paused) play(ex);
      else if (!visible && was) token++;
    }), { threshold: 0.35 }).observe($("loop"));
  }
  return { init };
})();
