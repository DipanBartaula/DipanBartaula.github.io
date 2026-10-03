/* CURVTON-205K project page: UI behaviour */
(function () {
  const D = window.CV;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const tierName = { easy: "Easy", medium: "Medium", hard: "Hard" };
  const tierCls = { easy: "t-e", medium: "t-m", hard: "t-h" };
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function preload(srcs) { return Promise.all(srcs.map(s => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(res) : res()); i.src = s; }))); }

  /* ---------- theme ---------- */
  const sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>';
  function dark() { const t = document.documentElement.getAttribute("data-theme"); return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function paintThemeBtns() { $$(".theme-btn").forEach(b => { b.innerHTML = dark() ? sun : moon; b.setAttribute("aria-label", dark() ? "Switch to light mode" : "Switch to dark mode"); }); }
  $$(".theme-btn").forEach(b => b.addEventListener("click", () => {
    const next = dark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("curvton-theme", next); } catch (e) {}
    paintThemeBtns(); document.dispatchEvent(new Event("themechange"));
  }));
  paintThemeBtns();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintThemeBtns);

  /* ---------- nav, progress, reveal ---------- */
  const nav = $("#topnav"), prog = $("#progress"), hero = $(".hero");
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
      nav.classList.toggle("show", window.scrollY > hero.offsetHeight - 40);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const links = $$("#navlinks a");
  const inBand = new Set();
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) inBand.add(e.target.id); else inBand.delete(e.target.id);
    if (!inBand.size) { links.forEach(a => a.classList.remove("active")); return; }
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    const act = links.find(a => a.classList.contains("active"));
    if (act && nav.classList.contains("show")) { const box = $("#navlinks"); box.scrollTo({ left: act.offsetLeft - box.clientWidth / 2 + act.clientWidth / 2, behavior: "smooth" }); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["overview", "pipeline", "refine", "tiers", "diversity", "results", "gallery", "data", "cite"].forEach(id => { const s = document.getElementById(id); if (s) secIO.observe(s); });
  const revIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => revIO.observe(el));

  /* ---------- stats count-up ---------- */
  const statIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; statIO.disconnect();
    $$(".stat", e.target).forEach((s, k) => {
      const n = $(".num", s), to = parseFloat(n.dataset.to), dec = +(n.dataset.dec || 0), suf = n.dataset.suffix || "";
      const paint = v => { n.innerHTML = v.toFixed(dec) + (suf ? `<span class="u">${suf}</span>` : ""); };
      setTimeout(() => s.classList.add("in"), k * 90);
      if (reduce || n.dataset.static) return paint(to);
      const t0 = performance.now() + k * 90, dur = 1500;
      (function tick(now) { const p = Math.max(0, Math.min(1, (now - t0) / dur)); paint(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); })(t0);
    });
  }), { threshold: 0.3 });
  statIO.observe($("#stats"));

  /* ---------- compare slider ---------- */
  function Compare(root, onUser) {
    const layer = $(".cmp-layer", root), inner = $(".inner", layer), handle = $(".cmp-handle", root);
    const tagL = $(".cmp-tag.l", root), tagR = $(".cmp-tag.r", root), hint = $(".cmp-hint", root);
    let pos = 0.5, anim = 0, dragging = false;
    function set(p) {
      pos = Math.max(0, Math.min(1, p)); const pc = (pos * 100).toFixed(3);
      layer.style.transform = `translate3d(${pc}%,0,0)`; inner.style.transform = `translate3d(-${pc}%,0,0)`;
      handle.style.transform = `translate3d(${pc}%,0,0)`;
      tagL.style.opacity = pos > 0.2 ? 1 : 0; tagR.style.opacity = pos < 0.8 ? 1 : 0;
      root.setAttribute("aria-valuenow", Math.round(pos * 100));
      root.setAttribute("aria-valuetext", `${Math.round(pos * 100)}% source person`);
    }
    function stop() { cancelAnimationFrame(anim); anim = 0; }
    function to(target, dur) {
      stop();
      return new Promise(res => {
        if (reduce || dur <= 0) { set(target); return res(); }
        const from = pos, t0 = performance.now();
        const step = now => { const k = Math.min(1, (now - t0) / dur); set(from + (target - from) * easeIO(k)); if (k < 1) anim = requestAnimationFrame(step); else { anim = 0; res(); } };
        anim = requestAnimationFrame(step);
      });
    }
    function fromEvent(e) { const r = root.getBoundingClientRect(); return (e.clientX - r.left) / r.width; }
    root.addEventListener("pointerdown", e => {
      dragging = true; root.classList.add("dragging"); stop(); onUser && onUser();
      root.setPointerCapture(e.pointerId); set(fromEvent(e)); if (hint) hint.style.opacity = 0;
    });
    root.addEventListener("pointermove", e => { if (dragging) set(fromEvent(e)); });
    const end = () => { dragging = false; root.classList.remove("dragging"); };
    root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
    root.addEventListener("keydown", e => {
      const k = e.key; let d = 0;
      if (k === "ArrowLeft") d = -0.05; else if (k === "ArrowRight") d = 0.05;
      else if (k === "Home") { e.preventDefault(); onUser && onUser(); return set(0); } else if (k === "End") { e.preventDefault(); onUser && onUser(); return set(1); }
      if (d) { e.preventDefault(); e.stopPropagation(); stop(); onUser && onUser(); set(pos + d); }
    });
    set(pos);
    return { set, to, stop, get pos() { return pos; }, a: $(".cmp-a", root), b: $(".cmp-b", root) };
  }

  /* ---------- hero autoplay ---------- */
  const HERO_DUR = 6800;
  const stage = $("#stage"), rail = $("#heroRail"), playBtn = $("#heroPlay");
  const heroCmp = $("#heroCmp");
  let userPaused = reduce, heroVisible = true, idx = -1, token = 0;
  const hc = Compare(heroCmp, () => pauseHero(true));
  rail.style.setProperty("--dur", HERO_DUR + "ms");
  rail.innerHTML = D.hero.map((s, i) => `<button type="button" aria-label="${s.garment}, ${tierName[s.tier]} tier"><img src="${s.tryonSm}" alt="" loading="lazy"><span class="bar"><i></i></span></button>`).join("");
  const railBtns = $$("button", rail);
  railBtns.forEach((b, i) => b.addEventListener("click", () => { show(i, true); }));
  const gWrap = $("#heroGarment");
  function setGarment(s) {
    const old = $$("img", gWrap);
    const img = new Image(); img.alt = "Target garment: " + s.garment; img.src = s.cloth; img.className = "out";
    gWrap.appendChild(img);
    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("out")));
    old.forEach(o => { o.classList.add("out"); setTimeout(() => o.remove(), 700); });
    const info = [$("#heroName"), $("#heroTier"), $("#heroCount")], n = idx + 1;
    info.forEach(e => e.style.opacity = 0);
    clearTimeout(setGarment.t);
    setGarment.t = setTimeout(() => {
      $("#heroName").textContent = s.garment;
      $("#heroTier").innerHTML = `<i class="${tierCls[s.tier]}"></i>${tierName[s.tier]} · ${s.gender}`;
      $("#heroCount").textContent = `${n} / ${D.hero.length}`;
      info.forEach(e => e.style.opacity = 1);
    }, reduce ? 0 : 240);
  }
  async function show(i, fromUser) {
    const my = ++token; i = (i + D.hero.length) % D.hero.length;
    const s = D.hero[i];
    await preload([s.person, s.tryon, s.cloth]);
    if (my !== token) return;
    // cross-fade from what is on screen to the new source person
    const snap = document.createElement("img"); snap.className = "cmp-swap on"; snap.alt = "";
    const prev = idx >= 0 ? D.hero[idx] : null;
    if (prev) { snap.src = hc.pos < 0.5 ? prev.tryon : prev.person; heroCmp.insertBefore(snap, $(".cmp-handle", heroCmp)); }
    idx = i;
    hc.a.src = s.person; hc.b.src = s.tryon;
    railBtns.forEach((b, j) => { b.classList.toggle("active", j === i); const bar = $(".bar i", b); bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; });
    setGarment(s);
    const autoplay = !userPaused && heroVisible && !reduce;
    hc.set(autoplay ? 0.965 : 0.5);
    if (prev) { requestAnimationFrame(() => snap.classList.remove("on")); setTimeout(() => snap.remove(), 650); }
    if (!autoplay) return;
    await sleep(500); if (my !== token) return;
    await hc.to(0.035, 1700); if (my !== token) return;
    await sleep(1000); if (my !== token) return;
    await hc.to(0.5, 900); if (my !== token) return;
    await sleep(HERO_DUR - 500 - 1700 - 1000 - 900); if (my !== token) return;
    show(i + 1);
  }
  function pauseHero(byUser) {
    if (byUser) userPaused = true;
    token++; hc.stop();
    stage.classList.add("paused");
    paintPlay();
  }
  function resumeHero() {
    userPaused = false; stage.classList.remove("paused"); paintPlay();
    if (heroVisible) show(idx + 1);
  }
  function paintPlay() {
    const p = userPaused;
    playBtn.innerHTML = p ? '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg><span>Play</span>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg><span>Pause</span>';
    playBtn.setAttribute("aria-label", p ? "Resume autoplay" : "Pause autoplay");
  }
  playBtn.addEventListener("click", () => (userPaused ? resumeHero() : pauseHero(true)));
  new IntersectionObserver(es => es.forEach(e => {
    const was = heroVisible; heroVisible = e.isIntersecting;
    if (!heroVisible && was) { token++; hc.stop(); stage.classList.add("paused"); }
    else if (heroVisible && !was && !userPaused) { stage.classList.remove("paused"); show(idx); }
  }), { threshold: 0.35 }).observe(heroCmp);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { token++; hc.stop(); stage.classList.add("paused"); }
    else if (heroVisible && !userPaused) { stage.classList.remove("paused"); show(idx); }
  });
  if (reduce) stage.classList.add("paused");
  paintPlay();
  show(0);

  /* ---------- tiers ---------- */
  const tierPicks = {
    easy: ["easy_female_flamenco_dress", "easy_male_hakama"],
    medium: ["medium_female_muga_silk_saree", "medium_male_yukata"],
    hard: ["hard_female_limbu_mekhli", "hard_male_thobe"]
  };
  const tierText = {
    easy: "Near-frontal poses against studio or minimal backgrounds, with little occlusion. This is the baseline every model should get right.",
    medium: "Slight pose offsets, moderate occlusion and cluttered everyday backgrounds such as offices, streets, beaches and malls.",
    hard: "Challenging poses (kneeling, lying down, twisting), heavy occlusion and complex in-the-wild scenes, often with long-tail traditional garments."
  };
  let chartsApi = null;
  function setTier(t) {
    $$("#tierTabs .tier-tab").forEach(b => b.setAttribute("aria-selected", b.dataset.t === t ? "true" : "false"));
    $("#tierTitle").innerHTML = `<span class="sqd ${tierCls[t]}"></span>${tierName[t]} tier`;
    $("#tierText").textContent = tierText[t];
    const box = $("#tierTriplets");
    box.innerHTML = tierPicks[t].map((k, i) => {
      const s = D.byKey[k];
      return `<figure class="trip enter" style="animation-delay:${i * 90}ms" data-key="${k}" tabindex="0" role="button" aria-label="Open ${s.garment} comparison">
        <div class="cell"><img src="${s.personSm}" alt="Source person" loading="lazy"><span>Person</span></div><div class="cell"><img src="${s.clothSm}" alt="${s.garment}" loading="lazy"><span>Garment</span></div><div class="cell"><img src="${s.tryonSm}" alt="Try-on" loading="lazy"><span>Try-on</span></div>
        <figcaption><b>${s.garment}</b><span>${s.gender} · <span class="hover-only">click</span><span class="tap-only">tap</span> to compare</span></figcaption></figure>`;
    }).join("");
    if (chartsApi) chartsApi.setTier(t);
  }
  $("#tierTabs").addEventListener("click", e => { const b = e.target.closest(".tier-tab"); if (b) setTier(b.dataset.t); });
  $("#tierTabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = $$("#tierTabs .tier-tab"), i = tabs.findIndex(b => b.getAttribute("aria-selected") === "true");
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length]; n.focus(); setTier(n.dataset.t);
  });
  $("#tierTriplets").addEventListener("click", e => { const f = e.target.closest(".trip"); if (f) openLB(D.samples.indexOf(D.byKey[f.dataset.key]), D.samples); });
  $("#tierTriplets").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { const f = e.target.closest(".trip"); if (f) { e.preventDefault(); openLB(D.samples.indexOf(D.byKey[f.dataset.key]), D.samples); } } });

  function buildCoverage() {
  /* ---------- comparison matrix (Table 1) ---------- */
  const yes = '<span class="mk y" title="yes"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg></span>';
  const no = '<span class="mk n" title="no"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l6 6M11 5l-6 6"/></svg></span>';
  const covName = ["", "Limited", "Moderate", "Broad"];
  let k = 0;
  const mark = v => { const h = (v ? yes : no).replace('class="mk', `style="transition-delay:${(k++) * 35}ms" class="mk`); return h; };
  $("#matrix").innerHTML = `<thead><tr><th>Dataset</th><th class="mx-hide">Train</th><th class="mx-hide">Test</th><th class="mx-hide">Type</th><th>Mask-free</th><th>Diff. tiers</th><th>In-the-wild</th><th>Cloth pairs</th><th class="mx-hide">Diversity</th></tr></thead><tbody>` +
    D.datasets.map(d => `<tr class="${d.ours ? "ours" : ""}"><td>${d.name}<span class="mx-meta">${d.train} / ${d.test} · ${d.type} · ${covName[d.cov]} diversity</span></td><td class="mx-hide">${d.train}</td><td class="mx-hide">${d.test}</td><td class="mx-hide">${d.type}</td><td>${mark(d.mask)}</td><td>${mark(d.tiers)}</td><td>${mark(d.wild)}</td><td>${mark(d.pairs)}</td>
      <td class="mx-hide"><span class="cov"><span class="bars">${[1, 2, 3].map(i => `<i class="${i <= d.cov ? "on" : ""}"></i>`).join("")}</span><span class="lbl">${covName[d.cov]}</span></span></td></tr>`).join("") + "</tbody>";

  /* ---------- dataset strips ---------- */
  const strips = [
    { n: "VITON-HD", d: "studio · frontal · upper body", imgs: [0, 1, 2, 3, 4].map(i => `static/img/compare/vitonhd_${i}.jpg`) },
    { n: "DressCode", d: "studio · frontal · catalogue", imgs: ["ub_0", "lb_1", "dress_0", "ub_3", "dress_2"].map(i => `static/img/compare/dresscode_${i}.jpg`) },
    { n: "StreetTryOn", d: "in-the-wild · Western upper body", imgs: [0, 1, 2, 3, 4].map(i => `static/img/compare/streettryon_${i}.jpg`) },
    { n: "CURVTON-205K", d: "studio + in-the-wild · 200 garment types · 3 tiers", ours: true, imgs: ["hard_female_kitenge_dress", "medium_male_balochi_suit", "hard_male_pashtun_dress", "medium_female_muga_silk_saree", "easy_male_barong_tagalog"].map(k => D.byKey[k].tryonSm) }
  ];
  $("#strips").innerHTML = strips.map(s => `<div class="strip${s.ours ? " ours" : ""}"><div class="name">${s.n}<small>${s.d}</small></div><div class="imgs">${s.imgs.map(src => `<img src="${src}" alt="${s.n} sample" loading="lazy">`).join("")}</div></div>`).join("");

  }

  /* ---------- people marquee (lazy) ---------- */
  const mqA = $("#marqueeA"), mqB = $("#marqueeB");
  new IntersectionObserver((es, io) => es.forEach(e => {
    if (!e.isIntersecting) return; io.disconnect();
    const ppl = Array.from({ length: 24 }, (_, i) => `static/img/people/person_${String(i).padStart(2, "0")}.jpg`);
    const fill = (el, list) => { el.innerHTML = [...list, ...list].map((p, i) => `<img src="${p}" alt="${i < list.length ? "Sample source person" : ""}"${i >= list.length ? ' aria-hidden="true"' : ""} decoding="async">`).join(""); };
    fill(mqA, ppl.filter((_, i) => i % 2 === 0)); fill(mqB, ppl.filter((_, i) => i % 2 === 1));
  }), { rootMargin: "600px" }).observe(mqA);

  /* ---------- t-SNE tabs ---------- */
  const tsneNotes = [
    "CLIP t-SNE of the 43,324 garment images: upper-body, lower-body, dress, set and accessory items spread across the map instead of collapsing into a few modes.",
    "The same map coloured by tradition: 22,755 traditional and 20,569 modern garments sit on different sides with a mixed band between them, so traditional wear is not a small isolated pocket.",
    "Facial-appearance embeddings coloured by cultural group and marked by gender. A visual summary of coverage, not a fairness metric."
  ];
  $("#tsneTabs").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#tsneTabs button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    $$("#tsneStage img").forEach((im, i) => im.classList.toggle("on", i === +b.dataset.v));
    const n = $("#tsneNote"); n.textContent = tsneNotes[+b.dataset.v]; n.classList.remove("fade-swap"); void n.offsetWidth; n.classList.add("fade-swap");
  });

  function buildGallery() {
  /* ---------- gallery ---------- */
  const byTier = { easy: [], medium: [], hard: [] };
  D.samples.forEach(s => byTier[s.tier].push(s));
  const order = [];
  for (let i = 0; order.length < D.samples.length; i++) ["hard", "easy", "medium"].forEach(t => { if (byTier[t][i]) order.push(byTier[t][i]); });
  const gal = $("#gal");
  gal.innerHTML = order.map((s, i) => `<button class="gcard" type="button" data-i="${i}" data-tier="${s.tier}" data-gender="${s.gender}" aria-label="${s.garment}, ${tierName[s.tier]} tier, ${s.gender}. Open comparison">
      <img class="main" src="${s.tryonSm}" alt="" loading="lazy"><img class="alt" src="${s.personSm}" alt="" loading="lazy">
      <span class="gc-state"><span class="a">Try-on</span><span class="b">Source</span></span>
      <span class="gc-cloth"><img src="${s.clothSm}" alt="" loading="lazy"></span>
      <span class="gc-meta"><span><b>${s.garment}</b><small>${s.gender}</small></span><span class="chip" style="background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.35)"><i class="${tierCls[s.tier]}"></i>${tierName[s.tier]}</span></span>
    </button>`).join("");
  let gTier = "all", gGender = "all", gAll = false;
  const PAGE = 12, moreBtn = $("#galMore");
  function filterGal(animate = true) {
    let n = 0, total = 0;
    $$(".gcard", gal).forEach(c => {
      const match = (gTier === "all" || c.dataset.tier === gTier) && (gGender === "all" || c.dataset.gender === gGender);
      if (match) total++;
      const ok = match && (gAll || total <= PAGE);
      const wasHidden = c.classList.contains("hide");
      c.classList.toggle("hide", !ok);
      if (ok && animate && (wasHidden || !gAll)) { c.classList.remove("enter"); void c.offsetWidth; c.style.animationDelay = Math.min(n++, 12) * 35 + "ms"; c.classList.add("enter"); }
    });
    moreBtn.parentElement.style.display = total > PAGE && !gAll ? "" : "none";
    moreBtn.textContent = `Show all ${total} samples`;
  }
  moreBtn.addEventListener("click", () => { gAll = true; filterGal(); });
  filterGal(false);
  function galSeg(id, set) {
    $("#" + id).addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#" + id + " button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); set(b.dataset.v); filterGal(); });
  }
  galSeg("galTier", v => gTier = v); galSeg("galGender", v => gGender = v);
  gal.addEventListener("click", e => { const c = e.target.closest(".gcard"); if (!c) return; const vis = $$(".gcard:not(.hide)", gal); openLB(vis.indexOf(c), vis.map(v => order[+v.dataset.i])); });

  }

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox"); let lbList = [], lbIdx = 0, lbReturn = null;
  const lc = Compare($("#lbCmp"));
  async function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length; const s = lbList[lbIdx];
    await preload([s.person, s.tryon]);
    lc.a.src = s.person; lc.b.src = s.tryon; $("#lbCloth").src = s.clothSm; $("#lbCloth").alt = s.garment;
    $("#lbName").textContent = s.garment;
    $("#lbChips").innerHTML = `<span class="chip"><i class="${tierCls[s.tier]}"></i>${tierName[s.tier]} tier</span><span class="chip">${s.gender}</span>`;
    lc.set(1); lc.to(0.5, reduce ? 0 : 1100);
  }
  function openLB(i, list) { lbList = list; lbReturn = document.activeElement; lb.classList.add("open"); document.body.style.overflow = "hidden"; lbShow(i); setTimeout(() => $(".lb-close", lb).focus(), 50); }
  function closeLB() { lb.classList.remove("open"); document.body.style.overflow = ""; if (lbReturn) lbReturn.focus(); }
  $(".lb-close", lb).addEventListener("click", closeLB);
  $(".lb-nav.prev", lb).addEventListener("click", () => lbShow(lbIdx - 1));
  $(".lb-nav.next", lb).addEventListener("click", () => lbShow(lbIdx + 1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    else if (e.key === "ArrowRight" && document.activeElement.id !== "lbCmp") lbShow(lbIdx + 1);
    else if (e.key === "ArrowLeft" && document.activeElement.id !== "lbCmp") lbShow(lbIdx - 1);
    else if (e.key === "Tab") { const f = $$("button, [tabindex='0']", lb).filter(x => x.offsetParent); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });

  /* ---------- figure zoom ---------- */
  const zoom = $("#zoom"), zImg = $("img", zoom), zCap = $("figcaption", zoom), zClose = $(".zclose", zoom);
  let zReturn = null;
  function closeZoom() { zoom.classList.remove("open"); document.body.style.overflow = ""; if (zReturn) zReturn.focus(); }
  document.addEventListener("click", async e => {
    const im = e.target.closest(".paperimg"); if (!im) return;
    zReturn = im;
    const src = im.currentSrc || im.src, pre = new Image(); pre.src = src;
    try { await pre.decode(); } catch (err) {}
    zImg.src = src; zImg.alt = im.alt; zCap.textContent = im.alt;
    zoom.classList.add("open"); document.body.style.overflow = "hidden"; zClose.focus();
  });
  zoom.addEventListener("click", e => { if (e.target === zoom || e.target.closest(".zclose") || e.target === zImg) closeZoom(); });
  document.addEventListener("keydown", e => {
    if (!zoom.classList.contains("open")) return;
    if (e.key === "Escape") closeZoom();
    else if (e.key === "Tab") { e.preventDefault(); zClose.focus(); }
  });
  $$(".paperimg").forEach(im => { im.tabIndex = 0; im.setAttribute("role", "button"); im.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); im.click(); } }); });

  /* ---------- scrollable segmented controls: fade only when they overflow, keep the pressed one visible ---------- */
  function centerSeg(sg, smooth) {
    const b = sg.querySelector('button[aria-pressed="true"]'); if (!b || sg.scrollWidth <= sg.clientWidth + 1) return;
    sg.scrollTo({ left: b.offsetLeft - (sg.clientWidth - b.offsetWidth) / 2, behavior: smooth && !reduce ? "smooth" : "auto" });
  }
  function segState(sg) {
    const ovf = sg.scrollWidth > sg.clientWidth + 1;
    sg.classList.toggle("ovf", ovf);
    sg.classList.toggle("scrolled", ovf && sg.scrollLeft > 2);
    sg.classList.toggle("at-end", ovf && sg.scrollLeft + sg.clientWidth >= sg.scrollWidth - 2);
  }
  const segRO = new ResizeObserver(es => es.forEach(e => { segState(e.target); centerSeg(e.target, false); }));
  function watchSegs() { $$(".seg").forEach(sg => { if (sg.dataset.w) return; sg.dataset.w = 1; segRO.observe(sg); sg.addEventListener("scroll", () => segState(sg), { passive: true }); }); }
  watchSegs(); setTimeout(watchSegs, 1500);
  document.addEventListener("click", e => {
    const b = e.target.closest(".seg button"); if (!b) return;
    const sg = b.parentElement; requestAnimationFrame(() => { centerSeg(sg, true); segState(sg); });
  });

  /* ---------- copy buttons ---------- */
  $$("pre .copy").forEach(b => b.addEventListener("click", async () => {
    const txt = b.parentElement.innerText.replace(b.innerText, "").trim();
    try { await navigator.clipboard.writeText(txt); } catch (e) { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (_) {} ta.remove(); }
    b.textContent = "Copied"; b.classList.add("ok"); setTimeout(() => { b.textContent = "Copy"; b.classList.remove("ok"); }, 1600);
  }));

  /* ---------- boot modules ---------- */
  if (window.Pipeline) window.Pipeline.init();
  if (window.Charts) chartsApi = window.Charts.init();
  setTier("easy");
  const idle = window.requestIdleCallback || (f => setTimeout(f, 250));
  idle(() => { buildCoverage(); buildGallery(); }, { timeout: 1200 });
})();
