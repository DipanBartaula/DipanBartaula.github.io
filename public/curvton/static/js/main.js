/* CURVTON-205K project page: UI behaviour */
(function () {
  const D = window.CV;
  let reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("motionok", () => { reduce = false; });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  if (reduce) $$(".motion-note").forEach(n => n.hidden = false);
  const tierName = { easy: "Easy", medium: "Medium", hard: "Hard" };
  const tierCls = { easy: "t-e", medium: "t-m", hard: "t-h" };
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function preload(srcs) { return Promise.all(srcs.map(s => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => (i.decode ? i.decode().catch(() => {}).then(res) : res()); i.src = s; }))); }

  /* ---------- reveal on scroll ---------- */
  const revIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
  $$(".reveal").forEach(el => revIO.observe(el));

  /* ---------- count-up numbers ---------- */
  function countUp(el, to, dec = 0, suffix = "", dur = 1300) {
    const fmt = v => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + suffix;
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    (function tick(now) { const k = Math.min(1, (now - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); })(t0);
  }
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return; o.disconnect();
    $$(".hl .num", e.target).forEach((n, i) => setTimeout(() => countUp(n, parseFloat(n.dataset.to), +(n.dataset.dec || 0), n.dataset.suffix || ""), i * 90));
  }), { threshold: 0.4 }).observe($("#highlights"));

  /* ---------- compare slider ---------- */
  function Compare(root, onUser) {
    const layer = $(".cmp-layer", root), inner = $(".inner", layer), handle = $(".cmp-handle", root);
    const tagL = $(".cmp-tag.l", root), tagR = $(".cmp-tag.r", root), hint = $(".cmp-hint", root);
    let pos = 0.5, anim = 0, dragging = false;
    function set(p) {
      pos = Math.max(0, Math.min(1, p)); const pc = (pos * 100).toFixed(3);
      layer.style.transform = `translate3d(${pc}%,0,0)`; inner.style.transform = `translate3d(-${pc}%,0,0)`;
      handle.style.transform = `translate3d(${pc}%,0,0)`;
      if (tagL) tagL.style.opacity = pos > 0.2 ? 1 : 0; if (tagR) tagR.style.opacity = pos < 0.8 ? 1 : 0;
      root.setAttribute("aria-valuenow", Math.round(pos * 100));
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
    const fromEvent = e => { const r = root.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
    root.addEventListener("pointerdown", e => { dragging = true; root.classList.add("dragging"); stop(); onUser && onUser(); root.setPointerCapture(e.pointerId); set(fromEvent(e)); if (hint) hint.style.opacity = 0; });
    root.addEventListener("pointermove", e => { if (dragging) set(fromEvent(e)); });
    const end = () => { dragging = false; root.classList.remove("dragging"); };
    root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
    root.addEventListener("keydown", e => {
      let d = 0; if (e.key === "ArrowLeft") d = -0.05; else if (e.key === "ArrowRight") d = 0.05;
      if (d) { e.preventDefault(); e.stopPropagation(); stop(); onUser && onUser(); set(pos + d); }
    });
    set(pos);
    return { set, to, stop, get pos() { return pos; }, a: $(".cmp-a", root), b: $(".cmp-b", root) };
  }
  const cmpMarkup = `<img class="cmp-a" alt="Source person" draggable="false"><div class="cmp-layer"><div class="inner"><img class="cmp-b" alt="Synthesized try-on" draggable="false"></div></div><div class="cmp-handle"><span class="cmp-knob"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg></span></div><span class="cmp-tag l">Person</span><span class="cmp-tag r">Try-on</span>`;

  /* ---------- hero autoplay ---------- */
  const HERO_DUR = 6800;
  const stage = $("#stage"), rail = $("#heroRail"), playBtn = $("#heroPlay"), heroCmp = $("#heroCmp");
  let userPaused = reduce, heroVisible = true, idx = -1, token = 0;
  const hc = Compare(heroCmp, () => pauseHero(true));
  rail.style.setProperty("--dur", HERO_DUR + "ms");
  rail.innerHTML = D.hero.map(s => `<button type="button" aria-label="${s.garment}, ${tierName[s.tier]} tier"><img src="${s.tryonSm}" alt="" loading="lazy"><span class="bar"><i></i></span></button>`).join("");
  const railBtns = $$("button", rail);
  railBtns.forEach((b, i) => b.addEventListener("click", () => show(i)));
  const gWrap = $("#heroGarment");
  function setGarment(s) {
    const old = $$("img", gWrap), img = new Image(); img.alt = "Target garment: " + s.garment; img.src = s.cloth; img.className = "out";
    gWrap.appendChild(img); requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("out")));
    old.forEach(o => { o.classList.add("out"); setTimeout(() => o.remove(), 700); });
    const info = [$("#heroName"), $("#heroTier"), $("#heroCount")], n = idx + 1;
    info.forEach(e => e.style.opacity = 0);
    clearTimeout(setGarment.t);
    setGarment.t = setTimeout(() => {
      $("#heroName").textContent = s.garment;
      $("#heroTier").innerHTML = `<i class="${tierCls[s.tier]}"></i>${tierName[s.tier]} tier`;
      $("#heroCount").textContent = `${n} / ${D.hero.length}`;
      info.forEach(e => e.style.opacity = 1);
    }, reduce ? 0 : 240);
  }
  async function show(i) {
    const my = ++token; i = (i + D.hero.length) % D.hero.length;
    const s = D.hero[i];
    await preload([s.person, s.tryon, s.cloth]);
    if (my !== token) return;
    const prev = idx >= 0 ? D.hero[idx] : null, snap = document.createElement("img");
    snap.className = "cmp-swap on"; snap.alt = "";
    if (prev) { snap.src = hc.pos < 0.5 ? prev.tryon : prev.person; heroCmp.insertBefore(snap, $(".cmp-handle", heroCmp)); }
    idx = i; hc.a.src = s.person; hc.b.src = s.tryon;
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
    await sleep(HERO_DUR - 4100); if (my !== token) return;
    show(i + 1);
  }
  function paintPlay() {
    playBtn.innerHTML = userPaused ? '<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg><span>Play</span>' : '<svg viewBox="0 0 16 16"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg><span>Pause</span>';
    playBtn.setAttribute("aria-label", userPaused ? "Resume autoplay" : "Pause autoplay");
  }
  function pauseHero(byUser) { if (byUser) userPaused = true; token++; hc.stop(); stage.classList.add("paused"); paintPlay(); }
  playBtn.addEventListener("click", () => { if (userPaused) { if (reduce) { document.documentElement.classList.add("motion-ok"); document.dispatchEvent(new Event("motionok")); } userPaused = false; stage.classList.remove("paused"); paintPlay(); show(idx + 1); } else pauseHero(true); });
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
  paintPlay(); show(0);

  /* ---------- three tiers, each with its own looping comparison ---------- */
  const tierPick = [
    ["easy", "easy_female_flamenco_dress", "Near-frontal poses against studio or minimal backgrounds, with little occlusion."],
    ["medium", "medium_female_muga_silk_saree", "Pose offsets, moderate occlusion and cluttered everyday scenes such as offices, streets and beaches."],
    ["hard", "hard_male_thobe", "Extreme poses (kneeling, lying, twisting), heavy occlusion and complex in-the-wild scenes."]
  ];
  const tiersEl = $("#tiers");
  tiersEl.innerHTML = tierPick.map(([t, k, txt]) => {
    const s = D.byKey[k];
    return `<div class="tier"><div class="cmp" role="slider" tabindex="0" aria-label="${tierName[t]} tier example: compare person and try-on" aria-valuemin="0" aria-valuemax="100">${cmpMarkup}</div>
      <div class="body" data-key="${k}" role="button" tabindex="0" aria-label="Open ${s.garment} comparison"><div class="row"><img src="${s.clothSm}" alt="${s.garment}" loading="lazy"><div><h4><span class="sq ${tierCls[t]}"></span>${tierName[t]} tier</h4><div class="g">${s.garment} · ${s.gender}</div></div></div><p>${txt}</p></div></div>`;
  }).join("");
  const tierCmps = $$(".tier .cmp", tiersEl).map((root, i) => {
    const s = D.byKey[tierPick[i][1]], c = Compare(root, () => { c.user = true; });
    c.a.loading = c.b.loading = "lazy"; c.a.decoding = c.b.decoding = "async";
    c.a.src = s.person; c.b.src = s.tryon; c.set(0.5); return c;
  });
  let tierLoop = 0, tierOn = false;
  async function tierCycle(my) {
    while (tierOn && my === tierLoop) {
      for (let i = 0; i < tierCmps.length; i++) {
        const c = tierCmps[i]; if (c.user) continue;
        (async () => { await sleep(i * 380); if (my !== tierLoop || c.user) return; await c.to(0.94, 900); if (my !== tierLoop || c.user) return; await c.to(0.06, 1700); if (my !== tierLoop || c.user) return; await sleep(500); if (my !== tierLoop || c.user) return; await c.to(0.5, 900); })();
      }
      await sleep(6800);
    }
  }
  new IntersectionObserver(es => es.forEach(e => {
    tierOn = e.isIntersecting && !reduce; tierLoop++;
    if (tierOn) tierCycle(tierLoop); else tierCmps.forEach(c => c.stop());
  }), { threshold: 0.35 }).observe(tiersEl);
  document.addEventListener("motionok", () => { const r = tiersEl.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { tierOn = true; tierLoop++; tierCycle(tierLoop); } });
  tiersEl.addEventListener("click", e => { const b = e.target.closest(".body"); if (b) openLB(D.samples.indexOf(D.byKey[b.dataset.key]), D.samples); });
  tiersEl.addEventListener("keydown", e => { const b = e.target.closest(".body"); if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); b.click(); } });

  /* ---------- Table 1 ---------- */
  const yes = '<span class="mk y" title="yes"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg></span>';
  const no = '<span class="mk n" title="no"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l6 6M11 5l-6 6"/></svg></span>';
  const covName = ["", "Limited", "Moderate", "Broad"];
  $("#matrix").innerHTML = `<thead><tr><th>Dataset</th><th>Train</th><th>Test</th><th>Type</th><th>Mask-free</th><th>Diff. tiers</th><th>In-the-wild</th><th>Cloth pairs</th><th>Diversity</th></tr></thead><tbody>` +
    D.datasets.map(d => `<tr class="${d.ours ? "ours" : ""}"><td>${d.name}</td><td>${d.train}</td><td>${d.test}</td><td>${d.type}</td><td>${d.mask ? yes : no}</td><td>${d.tiers ? yes : no}</td><td>${d.wild ? yes : no}</td><td>${d.pairs ? yes : no}</td><td>${covName[d.cov]}</td></tr>`).join("") + "</tbody>";

  /* ---------- gallery ---------- */
  const byTier = { easy: [], medium: [], hard: [] }; D.samples.forEach(s => byTier[s.tier].push(s));
  const order = []; for (let i = 0; order.length < D.samples.length; i++) ["hard", "easy", "medium"].forEach(t => { if (byTier[t][i]) order.push(byTier[t][i]); });
  const gal = $("#gal"), moreBtn = $("#galMore"), PAGE = 8;
  gal.innerHTML = order.map((s, i) => `<button class="gcard" type="button" data-i="${i}" data-tier="${s.tier}" aria-label="${s.garment}, ${tierName[s.tier]} tier. Open comparison">
      <img class="main" src="${s.tryonSm}" alt="" loading="lazy"><img class="alt" src="${s.personSm}" alt="" loading="lazy">
      <span class="gc-cloth"><img src="${s.clothSm}" alt="" loading="lazy"></span>
      <span class="gc-meta"><b>${s.garment}</b><i class="${tierCls[s.tier]}" title="${tierName[s.tier]} tier"></i></span></button>`).join("");
  let gTier = "all", gAll = false;
  function filterGal(animate) {
    let n = 0, total = 0;
    $$(".gcard", gal).forEach(c => {
      const match = gTier === "all" || c.dataset.tier === gTier; if (match) total++;
      const ok = match && (gAll || total <= PAGE), was = c.classList.contains("hide");
      c.classList.toggle("hide", !ok);
      if (ok && animate && (was || !gAll)) { c.classList.remove("enter"); void c.offsetWidth; c.style.animationDelay = Math.min(n++, 10) * 35 + "ms"; c.classList.add("enter"); }
    });
    moreBtn.parentElement.style.display = total > PAGE && !gAll ? "" : "none";
    moreBtn.textContent = `Show all ${total} examples`;
  }
  $("#galTier").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#galTier button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); gTier = b.dataset.v; filterGal(true); });
  moreBtn.addEventListener("click", () => { gAll = true; filterGal(true); });
  filterGal(false);
  gal.addEventListener("click", e => { const c = e.target.closest(".gcard"); if (!c) return; const vis = $$(".gcard:not(.hide)", gal); openLB(vis.indexOf(c), vis.map(v => order[+v.dataset.i])); });

  /* ---------- gallery tabs ---------- */
  $$("#galTabs .tab").forEach(b => b.addEventListener("click", () => {
    $$("#galTabs .tab").forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
    $$(".gpanel").forEach(p => p.classList.toggle("active", p.id === "g-" + b.dataset.g));
  }));

  /* ---------- garment wall: every garment opens the try-on it was used for ---------- */
  const MODERN = new Set(["Lace dress", "Mom jeans", "Ruffle top", "Blazer", "Sweatshirt", "Fair Isle sweater", "Little black dress", "Cape coat", "Tuxedo", "Jeans", "Tracksuit", "Bomber jacket", "Jumpsuit"]);
  const gmOrder = order.slice();
  const gms = $("#gms"), gmMore = $("#gmMore"), GPAGE = 18;
  gms.innerHTML = gmOrder.map((s, i) => `<button class="gm" type="button" data-i="${i}" data-kind="${MODERN.has(s.garment) ? "mod" : "trad"}" aria-label="${s.garment}: open the try-on">
      <img src="${s.clothSm}" alt="${s.garment}" loading="lazy"><span class="peek"><img src="${s.tryonSm}" alt="" loading="lazy"></span>
      <span class="cap"><span>${s.garment}</span><i class="${tierCls[s.tier]}" title="${tierName[s.tier]} tier"></i></span></button>`).join("");
  let gmKind = "all", gmAll = false;
  function filterGm(animate) {
    let n = 0, total = 0;
    $$(".gm", gms).forEach(c => {
      const match = gmKind === "all" || c.dataset.kind === gmKind; if (match) total++;
      const ok = match && (gmAll || total <= GPAGE), was = c.classList.contains("hide");
      c.classList.toggle("hide", !ok);
      if (ok && animate && (was || !gmAll)) { c.classList.remove("enter"); void c.offsetWidth; c.style.animationDelay = Math.min(n++, 12) * 30 + "ms"; c.classList.add("enter"); }
    });
    gmMore.parentElement.style.display = total > GPAGE && !gmAll ? "" : "none";
    gmMore.textContent = `Show all ${total} garments`;
  }
  $("#gmKind").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#gmKind button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); gmKind = b.dataset.v; filterGm(true); });
  gmMore.addEventListener("click", () => { gmAll = true; filterGm(true); });
  filterGm(false);
  gms.addEventListener("click", e => { const c = e.target.closest(".gm"); if (!c) return; const vis = $$(".gm:not(.hide)", gms); openLB(vis.indexOf(c), vis.map(v => gmOrder[+v.dataset.i])); });

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox"); let lbList = [], lbIdx = 0, lbReturn = null;
  const lc = Compare($("#lbCmp"));
  async function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length; const s = lbList[lbIdx];
    await preload([s.person, s.tryon]);
    lc.a.src = s.person; lc.b.src = s.tryon; $("#lbCloth").src = s.clothSm; $("#lbCloth").alt = s.garment;
    $("#lbName").textContent = s.garment;
    $("#lbChips").innerHTML = `<span class="chip"><i class="${tierCls[s.tier]}"></i>${tierName[s.tier]} tier</span><span class="chip">${s.gender}</span>`;
    lc.set(0.96); lc.to(0.5, reduce ? 0 : 1100);
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

  /* ---------- enlarge the pipeline figure ---------- */
  const zoom = $("#zoom"), zImg = $("img", zoom), zClose = $(".zclose", zoom); let zReturn = null;
  function closeZoom() { zoom.classList.remove("open"); document.body.style.overflow = ""; if (zReturn) zReturn.focus(); }
  $("#arch").addEventListener("click", async e => {
    if (e.target.closest("button")) return;
    zReturn = document.activeElement; const src = $("#arch img").currentSrc || $("#arch img").src, pre = new Image(); pre.src = src;
    try { await pre.decode(); } catch (err) {}
    zImg.src = src; zImg.alt = $("#arch img").alt; zoom.classList.add("open"); document.body.style.overflow = "hidden"; zClose.focus();
  });
  $("#arch").style.cursor = "zoom-in";
  zoom.addEventListener("click", closeZoom);
  document.addEventListener("keydown", e => { if (!zoom.classList.contains("open")) return; if (e.key === "Escape") closeZoom(); else if (e.key === "Tab") { e.preventDefault(); zClose.focus(); } });

  /* ---------- live Hugging Face download stats ---------- */
  (async () => {
    try {
      const ctl = new AbortController(); setTimeout(() => ctl.abort(), 6000);
      const r = await fetch("https://huggingface.co/api/datasets/curvton2/curvton2?expand%5B%5D=downloads&expand%5B%5D=downloadsAllTime", { signal: ctl.signal });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      if (typeof j.downloadsAllTime !== "number") throw new Error("no stats");
      const run = () => { countUp($("#hfAll"), j.downloadsAllTime, 0, "", 1400); countUp($("#hfMonth"), j.downloads || 0, 0, "", 1400); };
      const box = $(".dstats");
      new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); run(); } }, { threshold: 0.3 }).observe(box);
      const live = $("#hfLive"); live.classList.remove("stale");
      $("span", live).innerHTML = `Live from <a href="https://huggingface.co/datasets/curvton2/curvton2" target="_blank" rel="noopener">Hugging Face</a>`;
    } catch (e) { /* keep the snapshot values already in the page */ }
  })();

  /* ---------- copy buttons ---------- */
  $$("pre .copy").forEach(b => b.addEventListener("click", async () => {
    const txt = b.parentElement.innerText.replace(b.innerText, "").trim();
    try { await navigator.clipboard.writeText(txt); } catch (e) { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (_) {} ta.remove(); }
    b.textContent = "Copied"; b.classList.add("ok"); setTimeout(() => { b.textContent = "Copy"; b.classList.remove("ok"); }, 1600);
  }));

  /* ---------- boot ---------- */
  if (window.Teaser) window.Teaser.init();
  if (window.Arch) window.Arch.init();
  if (window.Loop) window.Loop.init();
  if (window.Charts) window.Charts.init();
})();
