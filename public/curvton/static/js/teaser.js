/* Animated teaser: person + garment -> try-on (paper Fig. 1, then one example per difficulty tier). */
window.Teaser = (function () {
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const TN = { easy: "Easy", medium: "Medium", hard: "Hard" };
  let EX = [], reduce = false, idx = 0, token = 0, visible = false, paused = false, started = false;
  let el = {};

  function preload(list) { return Promise.all(list.map(s => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(res) : res()); i.src = s; }))); }
  function setRev(p) {
    el.rev.style.transform = `translate3d(0,${((p - 1) * 100).toFixed(3)}%,0)`;
    el.inner.style.transform = `translate3d(0,${((1 - p) * 100).toFixed(3)}%,0)`;
  }
  function paintDots() { el.dots.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", j === idx ? "true" : "false")); }
  function paintBtn() {
    el.play.innerHTML = paused ? '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg><span>Play</span>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg><span>Pause</span>';
    el.play.setAttribute("aria-label", paused ? "Play the teaser animation" : "Pause the teaser animation");
  }
  function setImages(ex) {
    el.P.src = ex.p; el.G.src = ex.g; el.base.src = ex.p; el.T.src = ex.t;
    el.P.alt = `Source person (${ex.name})`; el.G.alt = `In-shop garment: ${ex.garment}`; el.T.alt = `Synthesized try-on: ${ex.garment}`;
  }
  function setName(ex) {
    el.name.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 420 });
    setTimeout(() => { el.name.textContent = ex.name; }, 200);
  }
  function fly(ex) {
    const box = el.tz.getBoundingClientRect(), g = el.G.getBoundingClientRect(), o = el.out.getBoundingClientRect();
    const gh = el.ghost; gh.src = ex.g;
    gh.style.width = g.width + "px"; gh.style.height = g.height + "px";
    gh.style.left = (g.left - box.left) + "px"; gh.style.top = (g.top - box.top) + "px";
    const dx = (o.left + o.width / 2) - (g.left + g.width / 2), dy = (o.top + o.height / 2) - (g.top + g.height / 2);
    const sc = Math.max(.32, Math.min(.6, o.width / g.width * .45)), lift = Math.min(70, g.height * .22);
    return gh.animate([
      { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 0 },
      { offset: .12, transform: "translate(0,-6px) scale(1.03) rotate(0deg)", opacity: 1 },
      { offset: .6, transform: `translate(${dx * .6}px,${dy * .6 - lift}px) scale(${((1 + sc) / 2).toFixed(3)}) rotate(-4deg)`, opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(${sc.toFixed(3)}) rotate(0deg)`, opacity: 0 }
    ], { duration: 950, easing: "cubic-bezier(.45,0,.25,1)" }).finished.catch(() => {});
  }
  async function reveal() {
    const H = el.out.clientHeight, opt = { duration: 1350, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" };
    const a1 = el.rev.animate([{ transform: "translate3d(0,-100%,0)" }, { transform: "translate3d(0,0,0)" }], opt);
    const a2 = el.inner.animate([{ transform: "translate3d(0,100%,0)" }, { transform: "translate3d(0,0,0)" }], opt);
    el.beam.animate([{ transform: "translate3d(0,0,0)", opacity: 0 }, { offset: .06, opacity: 1 }, { offset: .9, opacity: 1 }, { transform: `translate3d(0,${H}px,0)`, opacity: 0 }], { duration: 1350, easing: "cubic-bezier(.65,0,.35,1)" });
    try { await Promise.all([a1.finished, a2.finished]); } catch (e) { return; }
    setRev(1); a1.cancel(); a2.cancel();
  }
  function fade(nodes, from, to, ms) { return Promise.all(nodes.map(n => n.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: "ease", fill: "forwards" }).finished.catch(() => {}))); }
  function clearFades(nodes) { nodes.forEach(n => n.getAnimations().forEach(a => a.cancel())); }

  async function run(i) {
    const my = ++token;
    idx = (i + EX.length) % EX.length; const ex = EX[idx];
    paintDots();
    await preload([ex.p, ex.g, ex.t]);
    if (my !== token) return;
    const animate = !paused && visible && !reduce;
    const boxes = [el.P.parentElement, el.G.parentElement, el.out];
    if (!animate) { clearFades(boxes); setImages(ex); el.name.textContent = ex.name; setRev(1); el.ok.classList.add("show"); return; }
    if (started) { el.ok.classList.remove("show"); await fade(boxes, 1, 0, 260); if (my !== token) return; }
    setImages(ex); setName(ex); setRev(0); el.ok.classList.remove("show");
    await preload([ex.p, ex.g, ex.t]);
    if (started) { await fade(boxes, 0, 1, 320); clearFades(boxes); } else clearFades(boxes);
    started = true;
    if (my !== token) return;
    await sleep(350); if (my !== token) return;
    const f = fly(ex);
    await sleep(620); if (my !== token) return;
    await reveal(); if (my !== token) return;
    el.ok.classList.add("show");
    await f;
    await sleep(3200); if (my !== token) return;
    run(idx + 1);
  }
  function stop() { token++; [el.rev, el.inner, el.beam, el.ghost].forEach(n => n.getAnimations().forEach(a => a.cancel())); setRev(1); el.ok.classList.add("show"); el.ghost.style.opacity = 0; }

  function init() {
    if (!$("tz")) return;
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const D = window.CV;
    EX = [{ p: "static/img/teaser/fig1_person.jpg", g: "static/img/teaser/fig1_garment.jpg", t: "static/img/teaser/fig1_tryon.jpg", name: "Paper Fig. 1 · Kimono", garment: "Kimono" }]
      .concat(["hard_female_tehuana_dress", "medium_female_kitenge_dress", "hard_male_lederhosen", "easy_male_dashiki"].map(k => {
        const s = D.byKey[k]; return { p: s.person, g: s.cloth, t: s.tryon, name: `${s.garment} · ${TN[s.tier]} tier`, garment: s.garment };
      }));
    el = { tz: $("tz"), P: $("tzP"), G: $("tzG"), base: $("tzBase"), T: $("tzT"), out: $("tzOut"), rev: $("tzRev"), inner: $("tzInner"), beam: $("tzBeam"), ok: $("tzOk"), ghost: $("tzGhost"), dots: $("tzDots"), name: $("tzName"), play: $("tzPlay") };
    el.dots.innerHTML = EX.map((e, i) => `<button type="button" aria-label="${e.name}" aria-pressed="${i === 0}"></button>`).join("");
    el.dots.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => run(i)));
    if (reduce) paused = true;
    el.play.addEventListener("click", () => {
      paused = !paused;
      if (!paused && reduce) { document.documentElement.classList.add("motion-ok"); document.dispatchEvent(new Event("motionok")); }
      paintBtn();
      if (paused) stop(); else run(idx);
    });
    document.addEventListener("motionok", () => { reduce = false; });
    paintBtn();
    if (!reduce) setRev(0); else { setRev(1); el.ok.classList.add("show"); el.name.textContent = EX[0].name; }
    new IntersectionObserver(es => es.forEach(e => {
      const was = visible; visible = e.isIntersecting;
      if (visible && !was && !paused) run(idx);
      else if (!visible && was && !paused) { token++; }
    }), { threshold: 0.3 }).observe(el.tz);
    document.addEventListener("visibilitychange", () => { if (document.hidden) token++; else if (visible && !paused) run(idx); });
  }
  return { init };
})();
