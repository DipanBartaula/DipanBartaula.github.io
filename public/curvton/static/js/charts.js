/* d3 charts for the CURVTON-205K project page. Data: window.CV (data.js). */
window.Charts = (function () {
  const D = window.CV;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = reduce ? 0 : 850;
  const ease = d3.easeCubicOut;
  const TIERS = [["easy", "Easy", "var(--t-easy)"], ["medium", "Medium", "var(--t-med)"], ["hard", "Hard", "var(--t-hard)"]];
  const charts = [];

  /* ---------------- helpers ---------------- */
  const tip = document.getElementById("tip");
  function showTip(html, ev) { tip.innerHTML = html; tip.classList.add("on"); moveTip(ev); }
  function moveTip(ev) {
    let cx, cy;
    if (ev && ev.clientX != null) { cx = ev.clientX; cy = ev.clientY; }
    else if (ev && ev.target && ev.target.getBoundingClientRect) { const r = ev.target.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top; }
    else return;
    const pad = 14, r = tip.getBoundingClientRect();
    let x = cx + pad, y = cy + pad;
    if (x + r.width > window.innerWidth - 8) x = cx - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = cy - r.height - pad;
    tip.style.left = Math.max(8, x) + "px"; tip.style.top = Math.max(8, y) + "px";
  }
  function hideTip() { tip.classList.remove("on"); }
  function row(sw, name, val) { return `<div class="row"><span>${sw ? `<span class="sw" style="background:${sw}"></span>` : ""}${name}</span><b>${val}</b></div>`; }
  function isDark() {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function onVisible(el, fn) {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(); } }); }, { threshold: 0.2 });
    io.observe(el);
  }
  function seg(id, onChange) {
    const s = document.getElementById(id); if (!s) return () => null;
    s.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || !s.contains(b)) return;
      s.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      onChange(b.dataset.v);
    });
    return () => { const b = s.querySelector('button[aria-pressed="true"]'); return b ? b.dataset.v : null; };
  }
  function svgFor(el, W, H) {
    let svg = d3.select(el).select("svg");
    if (svg.empty()) svg = d3.select(el).append("svg").attr("role", "img");
    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("height", H);
    return svg;
  }
  function layer(svg, cls) { let g = svg.select("g." + cls.split(" ").join(".")); if (g.empty()) g = svg.append("g").attr("class", cls); return g; }
  // vertical bar with rounded top (data end) anchored to the baseline
  function vbar(x, y, w, h, r) {
    h = Math.max(h, 0.01); r = Math.max(0, Math.min(r, w / 2, h));
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  // horizontal bar with rounded right end anchored at x0
  function hbar(x0, y, w, h, r) {
    w = Math.max(w, 0.01); r = Math.max(0, Math.min(r, h / 2, w));
    return `M${x0},${y}H${x0 + w - r}Q${x0 + w},${y} ${x0 + w},${y + r}V${y + h - r}Q${x0 + w},${y + h} ${x0 + w - r},${y + h}H${x0}Z`;
  }
  function table(card, head, rows, oursIdx) {
    const v = card.querySelector(".tbl-view"); if (!v) return;
    v.innerHTML = `<table class="data"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr${oursIdx && oursIdx(i, r) ? ' class="ours"' : ""}>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  const f2 = d3.format(".2f"), f1 = d3.format(".1f"), f3 = d3.format(".3f");
  const strip0 = t => t.replace(/^0\./, ".");
  function fmtDiv(id, v) { if (id === "phi" || id === "theta") return strip0(f3(v)); if (v < 1) return strip0(f2(v)); return f2(v + 1e-9); }
  const fv = (m, v) => (m === "FID" ? f2(v) : m === "KID" ? f2(v) : f2(v).replace(/^0/, ""));
  function register(c) { charts.push(c); }

  /* ---------------- 1. refinement line chart (Table 6) ---------------- */
  function refine() {
    const card = document.getElementById("refineCard"), el = document.getElementById("refineChart");
    let split = "train", first = true;
    document.getElementById("refineLegend").innerHTML = TIERS.map(t => `<span><i class="line" style="background:${t[2]}"></i>${t[1]}</span>`).join("");
    const getSplit = seg("refineSplit", v => { split = v; render(); });
    function render(fromResize) {
      const W = el.clientWidth, H = W > 480 ? 372 : 300, m = { t: 20, r: 78, b: 42, l: 44 };
      const svg = svgFor(el, W, H).attr("aria-label", "Artifact rate by refinement round for each tier");
      const x = d3.scalePoint().domain(D.refine.iters).range([m.l, W - m.r]);
      const y = d3.scaleLinear().domain([0, 66]).range([H - m.b, m.t]);
      const t = svg.transition().duration(fromResize || first ? 0 : DUR).ease(ease);
      layer(svg, "grid").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues([0, 20, 40, 60]).tickSize(-(W - m.l - m.r)).tickFormat("")).attr("class", "grid");
      layer(svg, "axis y").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues([0, 20, 40, 60]).tickFormat(d => d + "%").tickSize(0).tickPadding(8)).call(g => g.select(".domain").remove());
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSize(0).tickPadding(10).tickFormat(d => d === "0" ? "0 · initial" : d)).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      let xt = svg.select("text.xt"); if (xt.empty()) xt = svg.append("text").attr("class", "xt lbl-muted").attr("text-anchor", "middle").style("font-size", "11px");
      xt.attr("x", (m.l + W - m.r) / 2).attr("y", H - 6).text("refinement round (regenerate with refined prompt)");
      const line = d3.line().x((d, i) => x(D.refine.iters[i])).y(d => y(d)).curve(d3.curveMonotoneX);
      const series = TIERS.map(tt => ({ id: tt[0], name: tt[1], c: tt[2], v: D.refine[split][tt[0]] }));
      const gl = layer(svg, "lines");
      const paths = gl.selectAll("path").data(series, d => d.id).join(enter => enter.append("path").attr("fill", "none").attr("stroke-width", 2.2).attr("stroke-linecap", "round").style("stroke", d => d.c));
      if (first && DUR) {
        paths.attr("d", d => line(d.v)).each(function () { const L = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", L).attr("stroke-dashoffset", L); })
          .transition().delay((d, i) => i * 160).duration(1300).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0).on("end interrupt", function () { d3.select(this).attr("stroke-dasharray", null).attr("stroke-dashoffset", null); });
      } else paths.interrupt().attr("stroke-dasharray", null).attr("stroke-dashoffset", null).transition(t).attr("d", d => line(d.v));
      const pts = series.flatMap(s => s.v.map((v, i) => ({ k: s.id + i, s, i, v })));
      const gp = layer(svg, "pts");
      const c = gp.selectAll("circle").data(pts, d => d.k).join(enter => enter.append("circle").attr("r", 4.5).style("fill", d => d.s.c).style("stroke", "var(--surface)").attr("stroke-width", 2).attr("cx", d => x(D.refine.iters[d.i])).attr("cy", d => y(d.v)).attr("opacity", first && DUR ? 0 : 1));
      if (first && DUR) c.transition().delay(d => 200 + d.i * 230 + TIERS.findIndex(tt => tt[0] === d.s.id) * 160).duration(300).attr("opacity", 1);
      else c.interrupt().attr("opacity", 1).transition(t).attr("cx", d => x(D.refine.iters[d.i])).attr("cy", d => y(d.v));
      const gl2 = layer(svg, "labels");
      const lo = d3.min(series, s => s.v[4]), hi = d3.max(series, s => s.v[4]);
      const ends = gl2.selectAll("g.end").data([1]).join(e => { const g = e.append("g").attr("class", "end"); g.append("text").attr("class", "a lbl-strong").style("font-size", "13px"); g.append("text").attr("class", "b lbl-muted").attr("dy", 14).style("font-size", "11px"); return g; });
      ends.select("text.a").text(`${lo}–${hi}%`); ends.select("text.b").text("after round IV");
      ends.attr("opacity", first && DUR ? 0 : 1).transition(t).attr("transform", `translate(${x("IV") + 12},${y((lo + hi) / 2) + 2})`);
      if (first && DUR) ends.transition().delay(1500).duration(400).attr("opacity", 1);
      const hi0 = series[2].v[0];
      const st0 = gl2.selectAll("text.st").data([1]).join("text").attr("class", "st lbl-strong").style("font-size", "12px");
      st0.text(`hard tier starts at ${hi0}%`).transition(t).attr("x", x("0") + 10).attr("y", y(hi0) - 8);
      const rs = document.getElementById("refineStats");
      if (rs) rs.innerHTML = series.map(s => `<div class="rs"><div class="k"><i style="background:${s.c}"></i>${s.name}</div><div class="v">${s.v[0]}% <small>&rarr;</small> ${s.v[4]}%</div></div>`).join("");
      // crosshair
      const cross = layer(svg, "cross");
      let vline = cross.select("line"); if (vline.empty()) vline = cross.append("line").attr("stroke", "var(--axis)").attr("stroke-width", 1).attr("opacity", 0);
      let hit = svg.select("rect.hit"); if (hit.empty()) hit = svg.append("rect").attr("class", "hit");
      hit.attr("x", m.l - 20).attr("y", m.t).attr("width", W - m.l - m.r + 40).attr("height", H - m.t - m.b)
        .on("mousemove", ev => {
          const [mx] = d3.pointer(ev); const xs = D.refine.iters.map(k => x(k));
          const i = d3.minIndex(xs, v => Math.abs(v - mx));
          vline.attr("x1", xs[i]).attr("x2", xs[i]).attr("y1", m.t).attr("y2", H - m.b).attr("opacity", 1);
          gp.selectAll("circle").attr("r", d => d.i === i ? 6 : 4.5);
          showTip(`<b>Round ${D.refine.iters[i]}${i === 0 ? " (initial)" : ""}</b>` + series.slice().reverse().map(s => row(s.c, s.name, s.v[i] + "%")).join(""), ev);
        })
        .on("mouseleave", () => { vline.attr("opacity", 0); gp.selectAll("circle").attr("r", 4.5); hideTip(); });
      table(card, ["Round", "Easy", "Medium", "Hard"], D.refine.iters.map((k, i) => [k, ...series.map(s => s.v[i] + "%")]));
      first = false;
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 2. robustness dumbbell (Table 7) ---------------- */
  function robust() {
    const card = document.getElementById("robustCard"), el = document.getElementById("robustChart");
    let tier = 2, first = true;
    seg("robustTier", v => { tier = +v; render(); });
    const rows = []; let lastGen = null;
    D.robust.forEach(r => { if (r.gen !== lastGen) { rows.push({ head: true, gen: r.gen, cost: r.cost }); lastGen = r.gen; } rows.push(r); });
    function render(fromResize) {
      const W = el.clientWidth, m = { t: 8, r: 40, b: 34, l: 34 };
      let yy = m.t; rows.forEach(r => { r.y = yy; yy += r.head ? 24 : 36; });
      const H = yy + m.b;
      const svg = svgFor(el, W, H).attr("aria-label", "Artifact rate before and after refinement for each generator and evaluator");
      const x = d3.scaleLinear().domain([0, 90]).range([m.l, W - m.r]);
      const t = svg.transition().duration(fromResize ? 0 : DUR).ease(ease);
      layer(svg, "grid").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([0, 20, 40, 60, 80]).tickSize(-(H - m.b - m.t)).tickFormat("")).attr("class", "grid");
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([0, 20, 40, 60, 80]).tickFormat(d => d + "%").tickSize(0).tickPadding(9)).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      const g = layer(svg, "rows");
      const sel = g.selectAll("g.r").data(rows, (d, i) => i).join(enter => {
        const e = enter.append("g").attr("class", "r");
        e.filter(d => d.head).append("text").attr("class", "lbl-strong").style("font-size", "12.5px").attr("x", 0).attr("y", 15).html(d => `${d.gen} <tspan class="lbl-muted" style="font-weight:500">· est. ${d.cost}</tspan>`);
        const b = e.filter(d => !d.head);
        b.append("text").attr("class", "ev").attr("x", m.l).attr("y", 9).style("font-size", "11.5px").html(d => d.ev + (d.optional ? ` <tspan class="lbl-muted" style="font-style:italic">(optional)</tspan>` : "") + (d.primary ? ` <tspan style="fill:var(--accent-ink);font-weight:700">· CURVTON config</tspan>` : ""));
        b.append("line").attr("class", "conn").attr("y1", 23).attr("y2", 23).style("stroke", "var(--neutral)").attr("stroke-width", 2.5).attr("stroke-linecap", "round");
        b.append("circle").attr("class", "c0").attr("cy", 23).attr("r", 5.5).style("fill", "var(--neutral)").style("stroke", "var(--surface)").attr("stroke-width", 2);
        b.append("circle").attr("class", "c4").attr("cy", 23).attr("r", 6.5).style("fill", "var(--accent)").style("stroke", "var(--surface)").attr("stroke-width", 2);
        b.append("text").attr("class", "v4 lbl-strong").attr("y", 27).attr("text-anchor", "end").style("font-size", "11.5px");
        b.append("text").attr("class", "v0 lbl-muted").attr("y", 27).style("font-size", "11px");
        b.append("rect").attr("class", "hit").attr("y", 0).attr("height", 34);
        return e;
      });
      sel.attr("transform", d => `translate(0,${d.y})`);
      const b = sel.filter(d => !d.head);
      b.select("rect.hit").attr("x", 0).attr("width", W)
        .on("mousemove", (ev, d) => showTip(`<b>${d.gen}</b><div class="muted">${d.ev} · ${["Easy", "Medium", "Hard"][tier]} tier</div>` + row("var(--neutral)", "Round 0", d.it0[tier] + "%") + row("var(--accent)", "Round IV", d.it4[tier] + "%") + row(null, "Reduction", "−" + (d.it0[tier] - d.it4[tier]) + " pts"), ev))
        .on("mouseleave", hideTip);
      if (first && DUR) {
        b.select("line.conn").attr("x1", d => x(d.it0[tier])).attr("x2", d => x(d.it0[tier]));
        b.select("circle.c0").attr("cx", d => x(d.it0[tier]));
        b.select("circle.c4").attr("cx", d => x(d.it0[tier]));
        b.select("text.v4").attr("x", d => x(d.it0[tier]) - 11).attr("opacity", 0).text(d => d.it4[tier] + "%");
        b.select("text.v0").attr("x", d => x(d.it0[tier]) + 10).attr("opacity", 0).text(d => d.it0[tier] + "%").transition().delay((d, j) => 150 + j * 90).duration(500).attr("opacity", 1);
        const tt = (s, i) => s.transition().delay((d, j) => 150 + j * 90).duration(1100).ease(d3.easeCubicInOut);
        tt(b.select("line.conn")).attr("x1", d => x(d.it4[tier]));
        tt(b.select("circle.c4")).attr("cx", d => x(d.it4[tier]));
        tt(b.select("text.v4")).attr("x", d => x(d.it4[tier]) - 11).attr("opacity", 1);
      } else {
        b.select("line.conn").transition(t).attr("x1", d => x(d.it4[tier])).attr("x2", d => x(d.it0[tier]));
        b.select("circle.c0").transition(t).attr("cx", d => x(d.it0[tier]));
        b.select("circle.c4").transition(t).attr("cx", d => x(d.it4[tier]));
        b.select("text.v4").text(d => d.it4[tier] + "%").transition(t).attr("x", d => x(d.it4[tier]) - 11).attr("opacity", 1);
        b.select("text.v0").text(d => d.it0[tier] + "%").transition(t).attr("x", d => x(d.it0[tier]) + 10).attr("opacity", 1);
      }
      table(card, ["Generator", "Evaluator", "Round 0 (E/M/H)", "Round IV (E/M/H)"], D.robust.map(r => [r.gen, r.ev, r.it0.join(" / "), r.it4.join(" / ")]), (i, r) => D.robust[i].primary);
      first = false;
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 3. tier fingerprint small multiples (Table 4) ---------------- */
  const FP = [["pose", "Pose variance σ²"], ["occl", "Occlusion complexity"], ["vis", "Person visibility ↓"], ["shape", "Body-shape variance σ²"], ["phi", "Camera azimuth σφ"], ["theta", "Camera elevation σθ"]];
  let fpTier = "easy";
  function fingerprint() {
    const grid = document.getElementById("fpGrid");
    grid.innerHTML = FP.map(f => `<div class="fp"><div class="fp-t">${f[1]}</div><div class="fpc" data-id="${f[0]}"></div></div>`).join("");
    function render(fromResize) {
      grid.querySelectorAll(".fpc").forEach(div => {
        const col = D.divCols.find(c => c.id === div.dataset.id);
        const vals = [col.v[4], col.v[5], col.v[6]];
        const W = Math.max(60, div.clientWidth), H = 66, top = 16;
        const svg = svgFor(div, W, H).attr("aria-label", col.label);
        const y = d3.scaleLinear().domain([0, d3.max(vals) * 1.05]).range([H - 4, top]);
        const bw = (W - 8) / 3 - 4;
        const data = TIERS.map((tt, i) => ({ id: tt[0], c: tt[2], v: vals[i], i }));
        const fmt = v => fmtDiv(col.id, v);
        svg.selectAll("path.b").data(data).join(e => e.append("path").attr("class", "b").attr("d", d => vbar(4 + d.i * (bw + 4), H - 4, bw, 0, 3)))
          .style("fill", d => d.c)
          .on("mousemove", (ev, d) => showTip(`<b>${col.label}</b>` + row(d.c, TIERS[d.i][1], fmt(d.v)), ev)).on("mouseleave", hideTip)
          .transition().duration(fromResize ? 0 : DUR).ease(ease)
          .attr("d", d => vbar(4 + d.i * (bw + 4), y(d.v), bw, H - 4 - y(d.v), 3))
          .attr("opacity", d => d.id === fpTier ? 1 : 0.32);
        svg.selectAll("text.v").data(data.filter(d => d.id === fpTier), d => "v").join("text").attr("class", "v lbl-strong").attr("text-anchor", "middle").style("font-size", "11px")
          .transition().duration(fromResize ? 0 : DUR).ease(ease)
          .attr("x", d => 4 + d.i * (bw + 4) + bw / 2).attr("y", d => y(d.v) - 4).text(d => fmt(d.v));
        let base = svg.select("line.base"); if (base.empty()) base = svg.append("line").attr("class", "base").style("stroke", "var(--axis)");
        base.attr("x1", 0).attr("x2", W).attr("y1", H - 3.5).attr("y2", H - 3.5);
      });
    }
    register({ el: grid, render, lazy: true });
    return { setTier(t) { fpTier = t; render(); } };
  }

  /* ---------------- 4. diversity explorer (Table 4) ---------------- */
  function diversity() {
    const card = document.getElementById("divCard"), el = document.getElementById("divChart");
    const dims = [...new Set(D.divCols.map(c => c.dim))];
    const notes = {
      "Pose": "StreetTryOn has the largest pose variance overall. CURVTON's medium and hard tiers come close; the easy tier is deliberately near-frontal.",
      "Occlusion": "CURVTON's hard tier has the highest occlusion complexity; StreetTryOn keeps the lowest person visibility overall.",
      "Background": "CURVTON has by far the most background objects. StreetTryOn's texture and semantic entropy are slightly higher than CURVTON overall.",
      "Illumination": "CURVTON has the largest luminance variance, led by its easy tier. IGM is reported without a preferred direction.",
      "Body shape": "CURVTON has the widest body-shape variation, and it grows with the tier (hard: 1.02).",
      "Garment": "CURVTON leads on both garment variance and garment diversity by a wide margin, in every tier.",
      "Camera": "CURVTON spans far more camera azimuth and elevation, driven by its medium and hard tiers."
    };
    const segEl = document.getElementById("divDim");
    segEl.innerHTML = dims.map((d, i) => `<button aria-pressed="${i === 0}" data-v="${d}">${d}</button>`).join("");
    let dim = dims[0], sub = 0;
    const subEl = document.createElement("div"); subEl.className = "seg div-sub"; subEl.id = "divSub";
    el.parentNode.insertBefore(subEl, el);
    subEl.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; sub = +b.dataset.v; render(false, true); });
    seg("divDim", v => { dim = v; sub = 0; render(false, true); });
    const order = [0, 1, 2, 3, 7, 4, 5, 6];
    const names = ["VITON-HD", "DressCode", "StreetTryOn", "Dress-ED", "CURVTON-205K", "↳ easy tier", "↳ medium tier", "↳ hard tier"];
    const colors = ["var(--neutral)", "var(--neutral)", "var(--neutral)", "var(--neutral)", "var(--accent)", "var(--t-easy)", "var(--t-med)", "var(--t-hard)"];
    function render(fromResize, rebuild) {
      const allCols = D.divCols.filter(c => c.dim === dim);
      const narrowDiv = el.clientWidth <= 700;
      const cols = narrowDiv ? [allCols[Math.min(sub, allCols.length - 1)]] : allCols;
      subEl.innerHTML = allCols.length > 1 ? allCols.map((c, i) => `<button aria-pressed="${i === Math.min(sub, allCols.length - 1)}" data-v="${i}">${c.label}</button>`).join("") : "";
      subEl.style.display = narrowDiv ? "flex" : "none"; subEl.style.visibility = allCols.length > 1 ? "visible" : "hidden";
      let gridEl = el.querySelector(".div-grid");
      if (!gridEl) { gridEl = document.createElement("div"); gridEl.className = "div-grid"; gridEl.style.display = "grid"; gridEl.style.gap = "14px 28px"; el.appendChild(gridEl); }
      if (rebuild || gridEl.childElementCount !== cols.length) {
        gridEl.innerHTML = "";
        cols.forEach(c => { const p = document.createElement("div"); p.dataset.id = c.id; gridEl.appendChild(p); });
      }
      const wide = el.clientWidth > 700;
      gridEl.style.gridTemplateColumns = wide ? `repeat(${cols.length}, minmax(0,1fr))` : "1fr";
      const noteEl = document.getElementById("divNote");
      if (noteEl.textContent !== notes[dim]) { noteEl.textContent = notes[dim]; noteEl.classList.remove("fade-swap"); void noteEl.offsetWidth; noteEl.classList.add("fade-swap"); }
      gridEl.querySelectorAll(":scope > div").forEach((p, pi) => {
        const col = cols[pi];
        const W = p.clientWidth, rh = 25, m = { t: 30, r: 46, b: 6, l: 112 };
        const H = m.t + order.length * rh + 8 + m.b;
        const svg = svgFor(p, W, H).attr("aria-label", col.label);
        const vals = order.map(i => col.v[i]);
        const x = d3.scaleLinear().domain([0, d3.max(vals) * 1.04]).range([m.l, W - m.r]);
        let ttl = svg.select("text.ttl"); if (ttl.empty()) ttl = svg.append("text").attr("class", "ttl lbl-strong").attr("x", 0).attr("y", 14).style("font-size", "12.5px");
        ttl.text(col.label);
        let dir = svg.select("text.dir"); if (dir.empty()) dir = svg.append("text").attr("class", "dir lbl-muted").attr("y", 14).attr("text-anchor", "end").style("font-size", "11px");
        dir.attr("x", W).text(col.dir === 1 ? "higher = more diverse ↑" : col.dir === -1 ? "lower = more occluded ↓" : "no preferred direction");
        const data = order.map((i, k) => ({ k, name: names[k], c: colors[k], v: col.v[i], y: m.t + k * rh + (k >= 4 ? 8 : 0) }));
        const sep = svg.selectAll("line.sep").data([1]).join("line").attr("class", "sep").style("stroke", "var(--line)");
        sep.attr("x1", 0).attr("x2", W).attr("y1", m.t + 4 * rh + 3).attr("y2", m.t + 4 * rh + 3);
        svg.selectAll("text.nm").data(data).join("text").attr("class", d => "nm " + (d.k === 4 ? "lbl-strong" : d.k > 4 ? "lbl-muted" : "")).attr("x", 0).attr("y", d => d.y + 14).style("font-size", d => d.k > 4 ? "11px" : "12px").attr("xml:space", "preserve").text(d => d.name);
        const bars = svg.selectAll("path.bar").data(data).join(e => e.append("path").attr("class", "bar").attr("d", d => hbar(m.l, d.y + 4, 0, rh - 9, 4)));
        bars.style("fill", d => d.c)
          .on("mousemove", (ev, d) => showTip(`<b>${col.label}</b>` + row(d.c, d.name.replace("↳ ", "CURVTON "), fmtDiv(col.id, d.v)), ev)).on("mouseleave", hideTip)
          .transition().delay(d => fromResize ? 0 : d.k * 40).duration(fromResize ? 0 : DUR).ease(ease)
          .attr("d", d => hbar(m.l, d.y + 4, x(d.v) - m.l, rh - 9, 4));
        svg.selectAll("text.val").data(data).join(e => e.append("text").attr("class", "val").attr("opacity", 0))
          .attr("y", d => d.y + 14.5).style("font-size", "11px").attr("class", d => "val " + (d.k === 4 ? "lbl-strong" : "lbl-muted"))
          .text(d => fmtDiv(col.id, d.v)).attr("x", d => x(d.v) + 6)
          .attr("opacity", fromResize ? 1 : 0)
          .transition().delay(d => fromResize ? 0 : d.k * 40 + DUR * 0.75).duration(fromResize ? 0 : 300).attr("opacity", 1);
        svg.selectAll("line.base").data([1]).join("line").attr("class", "base").style("stroke", "var(--axis)").attr("x1", m.l).attr("x2", m.l).attr("y1", m.t).attr("y2", H - m.b);
      });
      table(card, ["Dataset", ...D.divCols.map(c => c.label)], D.divRows.map((r, i) => [r, ...D.divCols.map(c => c.v[i])]), i => i >= 4);
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 5. benchmark grouped bars (Tables 2 & 8) ---------------- */
  function bench() {
    const card = document.getElementById("benchCard"), el = document.getElementById("benchChart");
    const models = Object.keys(D.bench);
    document.getElementById("benchModel").innerHTML = models.map((m, i) => `<button aria-pressed="${i === 0}" data-v="${m}">${m.replace(" [klein] 9B", "")}</button>`).join("");
    let model = models[0], metric = "FID", first = true;
    seg("benchModel", v => { model = v; render(); if (spreadApi) spreadApi.highlight(model); });
    seg("benchMetric", v => { metric = v; render(); });
    function take() {
      const b = D.bench[model], s = document.querySelector("#benchTake span");
      if (!b.tr) {
        s.innerHTML = model === "DCI-VTON" ? "<b>DCI-VTON</b> is reported zero-shot only, as an extra baseline (Table 8)."
          : "<b>FLUX.2 [klein] 9B</b> is the generator used to build CURVTON-205K, shown zero-shot as a reference point.";
        return;
      }
      const z = b.zs[metric][0], tr = b.tr[metric][0];
      const pct = Math.round(Math.abs(tr - z) / z * 100);
      const better = metric === "SSIM" ? tr > z : tr < z;
      s.innerHTML = `<b>${model}</b>: overall ${metric} ${fv(metric, z)} &rarr; <b>${fv(metric, tr)}</b> after training on CURVTON-205K (${better ? (metric === "SSIM" ? "+" : "−") : ""}${pct}%). ` +
        (metric === "FID" ? `Hard-tier FID ${f2(b.zs.FID[3])} &rarr; ${f2(b.tr.FID[3])}.` : "");
    }
    function render(fromResize) {
      const W = el.clientWidth, narrow = W < 620, H = narrow ? 300 : 340, m = { t: 34, r: 10, b: 40, l: 46 };
      const svg = svgFor(el, W, H).attr("aria-label", `${metric} by subset for ${model}`);
      const b = D.bench[model];
      const series = b.tr ? ["zs", "tr"] : ["zs"];
      const maxV = metric === "SSIM" ? 1 : d3.max(Object.values(D.bench).flatMap(o => [...o.zs[metric], ...(o.tr ? o.tr[metric] : [])]));
      const y = d3.scaleLinear().domain([0, maxV * 1.06]).nice().range([H - m.b, m.t]);
      const gw = (W - m.l - m.r) / 10;
      const gx = i => m.l + (i + (i >= 1 ? 0.5 : 0) + (i >= 4 ? 0.5 : 0)) * gw;
      const inner = gw * 0.78, bw = (inner - 2) / 2;
      const t = svg.transition().duration(fromResize || first ? 0 : DUR).ease(ease);
      layer(svg, "grid").attr("transform", `translate(${m.l},0)`).transition(t).call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r)).tickFormat("")).attr("class", "grid");
      layer(svg, "axis y").attr("transform", `translate(${m.l},0)`).transition(t).call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8).tickFormat(metric === "FID" ? d3.format("d") : d3.format(".1f"))).call(g => g.select(".domain").remove());
      const xl = layer(svg, "xl");
      const shortLbl = W < 420 ? ["All", "E", "M", "H", "UB", "LB", "G", "Tr", "NTr"] : D.subsetsShort;
      xl.selectAll("text").data(narrow ? shortLbl : D.subsets.map((s, i) => [0, 1, 2, 3].includes(i) ? s : D.subsetsShort[i])).join("text").attr("class", "lbl-muted").attr("text-anchor", "middle").style("font-size", narrow ? "10.5px" : "11.5px")
        .attr("x", (d, i) => gx(i) + gw / 2).attr("y", H - m.b + 18).text(d => d);
      const hd = layer(svg, "heads");
      const heads = [{ t: "Difficulty tier", a: 1, b: 3 }, { t: "Garment type", a: 4, b: 8 }];
      hd.selectAll("line").data(heads).join("line").style("stroke", "var(--line-2)").attr("x1", d => gx(d.a) + gw * 0.1).attr("x2", d => gx(d.b) + gw * 0.9).attr("y1", m.t - 10).attr("y2", m.t - 10);
      hd.selectAll("text").data(heads).join("text").attr("class", "lbl-muted").attr("text-anchor", "middle").style("font-size", "11px").style("font-weight", 600)
        .attr("x", d => (gx(d.a) + gx(d.b) + gw) / 2).attr("y", m.t - 16).text(d => d.t);
      const data = [];
      D.subsets.forEach((s, i) => series.forEach((k, j) => data.push({ key: i + k, i, k, j, v: b[k][metric][i] })));
      const off = series.length === 1 ? (inner - bw) / 2 : 0;
      const bx = d => gx(d.i) + (gw - inner) / 2 + off + d.j * (bw + 2);
      const gb = layer(svg, "bars");
      const bars = gb.selectAll("path").data(data, d => d.key).join(
        enter => enter.append("path").attr("d", d => vbar(bx(d), H - m.b, bw, 0, 4)).style("fill", d => d.k === "tr" ? "var(--accent)" : "var(--neutral)"),
        update => update,
        exit => exit.transition().duration(DUR / 2).attr("d", d => vbar(bx(d), H - m.b, bw, 0, 4)).remove());
      bars.on("mousemove", (ev, d) => {
        const zs = b.zs[metric][d.i], tr = b.tr ? b.tr[metric][d.i] : null;
        showTip(`<b>${model} · ${D.subsets[d.i]}</b>` + row("var(--neutral)", "Zero-shot", fv(metric, zs)) + (tr != null ? row("var(--accent)", "CURVTON-trained", fv(metric, tr)) : ""), ev);
      }).on("mouseleave", hideTip);
      bars.transition().delay(d => first && DUR ? d.i * 55 + d.j * 120 : 0).duration(fromResize ? 0 : DUR).ease(ease)
        .attr("d", d => vbar(bx(d), y(d.v), bw, H - m.b - y(d.v), 4));
      const lb = layer(svg, "vals");
      const labels = data.filter(d => d.k === (b.tr ? "tr" : "zs"));
      lb.selectAll("text").data(labels, d => d.i).join(enter => enter.append("text").attr("class", "lbl-strong").attr("text-anchor", "middle").style("font-size", narrow ? "9px" : "10.5px").attr("x", d => bx(d) + bw / 2).attr("y", d => y(d.v) - 5).attr("opacity", 0))
        .text(d => metric === "FID" ? f1(d.v) : f2(d.v).replace(/^0/, ""))
        .transition().delay(d => first && DUR ? 700 + d.i * 55 : 0).duration(fromResize ? 0 : first ? 400 : DUR).ease(ease)
        .attr("x", d => bx(d) + bw / 2).attr("y", d => y(d.v) - 5).attr("opacity", 1);
      let base = svg.select("line.base"); if (base.empty()) base = svg.append("line").attr("class", "base").style("stroke", "var(--axis)");
      base.attr("x1", m.l).attr("x2", W - m.r).attr("y1", H - m.b + 0.5).attr("y2", H - m.b + 0.5);
      take();
      const head = ["Model", "Setting", ...D.subsets];
      const rowsT = [];
      Object.entries(D.bench).forEach(([mn, o]) => { rowsT.push([mn, "Zero-shot", ...o.zs[metric].map(v => fv(metric, v))]); if (o.tr) rowsT.push([mn, "CURVTON-trained", ...o.tr[metric].map(v => fv(metric, v))]); });
      table(card, head, rowsT, (i, r) => r[1] === "CURVTON-trained");
      first = false;
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 6. category spread (Table 2) ---------------- */
  let spreadApi = null;
  function spread() {
    let sel = "OOTDiffusion";
    const el = document.getElementById("spreadChart");
    const models = ["OOTDiffusion", "CatVTON", "IDM-VTON"];
    const rng = (a) => { const v = a.slice(4); return [d3.min(v), d3.max(v)]; };
    const data = models.map(mn => ({ m: mn, zs: rng(D.bench[mn].zs.FID), tr: rng(D.bench[mn].tr.FID) }));
    let first = true;
    function render(fromResize) {
      const W = el.clientWidth, m = { t: 6, r: 78, b: 32, l: 2 }, rh = 74;
      const H = m.t + data.length * rh + m.b;
      const svg = svgFor(el, W, H).attr("aria-label", "Range of FID across garment types, zero-shot vs trained");
      const x = d3.scaleLinear().domain([0, 34]).range([m.l, W - m.r]);
      layer(svg, "grid").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([0, 10, 20, 30]).tickSize(-(H - m.b - m.t)).tickFormat("")).attr("class", "grid");
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([0, 10, 20, 30]).tickSize(0).tickPadding(9)).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      let xt = svg.select("text.xt"); if (xt.empty()) xt = svg.append("text").attr("class", "xt lbl-muted").attr("text-anchor", "end").style("font-size", "11px");
      xt.text("");
      const g = layer(svg, "rows").selectAll("g.r").data(data).join(e => {
        const r = e.append("g").attr("class", "r");
        r.append("text").attr("class", "lbl-strong").attr("x", m.l).attr("y", 13).style("font-size", "12.5px").text(d => d.m);
        r.append("rect").attr("class", "zs").attr("y", 22).attr("height", 10).attr("rx", 5).style("fill", "var(--neutral)");
        r.append("rect").attr("class", "tr").attr("y", 42).attr("height", 10).attr("rx", 5).style("fill", "var(--accent)");
        r.append("text").attr("class", "lz lbl-muted").attr("y", 31).style("font-size", "11px");
        r.append("text").attr("class", "lt lbl-strong").attr("y", 51).style("font-size", "11px");
        r.append("rect").attr("class", "hit").attr("y", 16).attr("height", 42);
        return r;
      }).attr("transform", (d, i) => `translate(0,${m.t + i * rh})`);
      const known = data.some(d => d.m === sel);
      const op = d => !known ? 0.5 : d.m === sel ? 1 : 0.28;
      g.selectAll("rect.zs, rect.tr").transition().duration(fromResize ? 0 : 350).attr("opacity", function () { return op(d3.select(this.parentNode).datum()); });
      g.select("text.lbl-strong").attr("class", d => d.m === sel ? "lbl-strong" : "lbl-strong lbl-dim");
      const nt = document.getElementById("spreadNote");
      if (nt) nt.textContent = known ? `FID only · ${sel} highlighted` : `FID only · ${sel} has no CURVTON-trained run`;
      g.select("rect.hit").attr("x", 0).attr("width", W).on("mousemove", (ev, d) => showTip(`<b>${d.m}</b> · FID over 5 garment types` + row("var(--neutral)", "Zero-shot", `${f2(d.zs[0])}–${f2(d.zs[1])}`) + row("var(--accent)", "CURVTON-trained", `${f2(d.tr[0])}–${f2(d.tr[1])}`) + row(null, "Range", `${f2(d.zs[1] - d.zs[0])} → ${f2(d.tr[1] - d.tr[0])}`), ev)).on("mouseleave", hideTip);
      g.select("rect.zs").attr("x", d => x(d.zs[0])).attr("width", d => x(d.zs[1]) - x(d.zs[0]));
      g.select("text.lz").attr("x", d => x(d.zs[1]) + 8).text(d => `range ${f2(d.zs[1] - d.zs[0])}`);
      const T = s => s.transition().delay((d, i) => i * 140 + 150).duration(fromResize ? 0 : 1200).ease(d3.easeCubicInOut);
      if (first && DUR) {
        g.select("rect.tr").attr("x", d => x(d.zs[0])).attr("width", d => x(d.zs[1]) - x(d.zs[0]));
        g.select("text.lt").attr("x", d => x(d.zs[1]) + 8).attr("opacity", 0);
      }
      T(g.select("rect.tr")).attr("x", d => x(d.tr[0])).attr("width", d => x(d.tr[1]) - x(d.tr[0]));
      T(g.select("text.lt")).attr("x", d => x(d.tr[1]) + 8).attr("opacity", 1).text(d => `range ${f2(d.tr[1] - d.tr[0])}`);
      first = false;
    }
    spreadApi = { highlight(mn) { sel = mn; if (el.querySelector("svg")) render(false); } };
    register({ el, render, lazy: true });
  }

  /* ---------------- 7. in-the-wild (Table 5) ---------------- */
  function wild() {
    const card = document.getElementById("wildCard"), el = document.getElementById("wildChart");
    const metrics = [
      { k: "q", name: "Quality", grp: "Human preference (%)", max: 40, pct: true },
      { k: "r", name: "Realism", grp: "Human preference (%)", max: 40, pct: true },
      { k: "clip", name: "CLIP-I ↑", grp: "Automatic metrics", max: 1, pct: false },
      { k: "vlm", name: "VLM score ↑", grp: "Automatic metrics", max: 1, pct: false }
    ];
    let first = true;
    function render(fromResize) {
      const W = el.clientWidth, per = W >= 760 ? 4 : 2, groups = d3.range(0, 4, per).map(i => metrics.slice(i, i + per));
      let host = el.querySelector(".wild-host"); if (!host) { host = document.createElement("div"); host.className = "wild-host"; el.appendChild(host); }
      if (host.childElementCount !== groups.length) { host.innerHTML = ""; groups.forEach(() => host.appendChild(document.createElement("div"))); }
      host.querySelectorAll(":scope > div").forEach((div, gi) => {
        const ms = groups[gi], rh = 34, m = { t: 48, r: 6, b: 10, l: W < 520 ? 104 : 136 };
        const H = m.t + D.wild.length * rh + m.b;
        const svg = svgFor(div, W, H).attr("aria-label", ms.map(x => x.name).join(", "));
        const pw = (W - m.l - m.r) / ms.length, gap = 18;
        svg.selectAll("text.nm").data(D.wild).join("text").attr("class", d => "nm " + (d.ours ? "lbl-strong" : "")).attr("x", 0).attr("y", (d, i) => m.t + i * rh + rh / 2 + 4).style("font-size", "12px").text(d => d.name);
        const panels = svg.selectAll("g.p").data(ms, d => d.k).join(e => { const g = e.append("g").attr("class", "p"); g.append("text").attr("class", "pt lbl-strong").attr("y", 14).style("font-size", "12px"); g.append("line").attr("class", "base").style("stroke", "var(--axis)"); return g; })
          .attr("transform", (d, i) => `translate(${m.l + i * pw},0)`);
        panels.select("text.pt").attr("x", 0).attr("y", 36).style("font-weight", 600).attr("class", "pt lbl-muted").text(d => d.name);
        const grps = [...new Set(ms.map(d => d.grp))].map(gname => { const idx = ms.map((d, i) => d.grp === gname ? i : -1).filter(i => i >= 0); return { gname, a: idx[0], b: idx[idx.length - 1] }; });
        svg.selectAll("g.grp").data(grps, d => d.gname).join(e => { const g = e.append("g").attr("class", "grp"); g.append("text").attr("class", "lbl-strong").attr("y", 14).style("font-size", "12.5px"); g.append("line").style("stroke", "var(--line-2)"); return g; })
          .each(function (d) { const g = d3.select(this), x0 = m.l + d.a * pw, x1 = m.l + (d.b + 1) * pw - gap; g.select("text").attr("x", x0).text(d.gname); g.select("line").attr("x1", x0).attr("x2", x1).attr("y1", 21).attr("y2", 21); });
        panels.select("line.base").attr("x1", 0).attr("x2", 0).attr("y1", m.t).attr("y2", H - m.b);
        panels.each(function (mt, pi) {
          const x = d3.scaleLinear().domain([0, mt.max]).range([0, pw - gap - 34]);
          const data = D.wild.map((d, i) => ({ ...d, i, v: d[mt.k] }));
          const g = d3.select(this);
          g.selectAll("path.bar").data(data).join(e => e.append("path").attr("class", "bar").attr("d", d => hbar(0, m.t + d.i * rh + 8, 0, rh - 16, 4)))
            .style("fill", d => d.ours ? "var(--accent)" : "var(--neutral)")
            .on("mousemove", (ev, d) => showTip(`<b>${d.name}</b>` + row(null, "CLIP-I", f2(d.clip)) + row(null, "VLM", f2(d.vlm)) + row(null, "Quality pref.", d.q + "%") + row(null, "Realism pref.", d.r + "%"), ev)).on("mouseleave", hideTip)
            .transition().delay(d => first && DUR ? pi * 160 + d.i * 60 : 0).duration(fromResize ? 0 : DUR).ease(ease)
            .attr("d", d => hbar(0, m.t + d.i * rh + 8, x(d.v), rh - 16, 4));
          g.selectAll("text.val").data(data).join(e => e.append("text").attr("class", "val").attr("x", 4).attr("y", d => m.t + d.i * rh + rh / 2 + 4).attr("opacity", first && DUR ? 0 : 1))
            .attr("class", d => "val " + (d.ours ? "lbl-strong" : "lbl-muted")).style("font-size", "11.5px")
            .text(d => mt.pct ? d.v + "%" : f2(d.v).replace(/^0/, ""))
            .transition().delay(d => first && DUR ? pi * 160 + d.i * 60 : 0).duration(fromResize ? 0 : DUR).ease(ease).attr("x", d => x(d.v) + 6).attr("opacity", 1);
        });
      });
      table(card, ["System", "CLIP-I", "VLM", "Quality pref.", "Realism pref."], D.wild.map(d => [d.name, f2(d.clip), f2(d.vlm), d.q + "%", d.r + "%"]), i => D.wild[i].ours);
      first = false;
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 8. cross-dataset dot plot (Table 3) ---------------- */
  function cross() {
    const card = document.getElementById("crossCard"), el = document.getElementById("crossChart");
    const cols = ["var(--real)", "var(--accent)", "var(--mix)"];
    let benchN = "StreetTryOn", metric = "FID", first = true;
    const msel = document.getElementById("crossMetric");
    function buildMetric() {
      const ms = Object.keys(D.cross.data[benchN]);
      if (!ms.includes(metric)) metric = "FID";
      msel.innerHTML = ms.map(k => `<button aria-pressed="${k === metric}" data-v="${k}">${k} ${k === "SSIM" ? "↑" : "↓"}</button>`).join("");
    }
    buildMetric();
    seg("crossBench", v => { benchN = v; buildMetric(); render(); });
    seg("crossMetric", v => { metric = v; render(); });
    function take() {
      const dd = D.cross.data[benchN][metric], hiBetter = metric === "SSIM";
      let mixB = 0, mixT = 0, curvB = 0; const deltas = [];
      D.cross.models.forEach(mn => {
        const [r, c, x] = dd[mn];
        if (x === r) mixT++; else if (hiBetter ? x > r : x < r) mixB++;
        if (hiBetter ? c > r : c < r) curvB++;
        deltas.push(x - r);
      });
      const n = D.cross.models.length;
      const rngTxt = metric === "SSIM" || metric === "LPIPS" ? "" : ` (Δ ${f2(d3.min(deltas))} to ${f2(d3.max(deltas))})`;
      let s = `<b>Real + CURVTON</b> beats real-only on ${benchN} ${metric} for <b>${mixB} of ${n}</b> models${mixT ? `, ${mixT} tied` : ""}${mixB + mixT < n ? `, ${n - mixB - mixT} slightly worse` : ""}${rngTxt}. `;
      s += curvB === n ? "CURVTON alone also beats real-only for every model: the gain transfers out of the generator's own distribution."
        : curvB === 0 ? "CURVTON alone trails real-only here, the remaining synthetic-to-real gap on in-domain paired metrics." : `CURVTON alone beats real-only for ${curvB} of ${n}.`;
      document.querySelector("#crossTake span").innerHTML = s;
    }
    function render(fromResize) {
      const W = el.clientWidth, rh = 58, m = { t: 10, r: 24, b: 40, l: W < 520 ? 104 : 150 };
      const H = m.t + D.cross.models.length * rh + m.b;
      const svg = svgFor(el, W, H).attr("aria-label", `${benchN} ${metric}`);
      const dd = D.cross.data[benchN][metric];
      const all = D.cross.models.flatMap(mn => dd[mn]);
      const [lo, hi] = d3.extent(all), pad = (hi - lo) * 0.14 || 0.05;
      const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([m.l, W - m.r]).nice();
      const t = svg.transition().duration(fromResize || first ? 0 : DUR).ease(ease);
      layer(svg, "grid").attr("transform", `translate(0,${H - m.b})`).transition(t).call(d3.axisBottom(x).ticks(W < 560 ? 4 : 7).tickSize(-(H - m.b - m.t)).tickFormat("")).attr("class", "grid");
      const tv = W < 560 ? [...new Set([x.domain()[0], ...x.ticks(3), x.domain()[1]])] : x.ticks(7);
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).transition(t).call(d3.axisBottom(x).tickValues(tv).tickSize(0).tickPadding(9).tickFormat(metric === "SSIM" || metric === "LPIPS" ? d3.format(".2f") : d3.format(".1f"))).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      let xt = svg.select("text.xt"); if (xt.empty()) xt = svg.append("text").attr("class", "xt lbl-muted").attr("text-anchor", "end").style("font-size", "11px");
      xt.attr("x", W - m.r).attr("y", H - 4).text(metric === "SSIM" ? "SSIM, higher is better →" : `← lower is better, ${metric}`);
      const rows = D.cross.models.map((mn, i) => ({ mn, i, v: dd[mn] }));
      const g = layer(svg, "rows").selectAll("g.r").data(rows, d => d.mn).join(e => {
        const r = e.append("g").attr("class", "r");
        r.append("text").attr("class", "lbl-strong").attr("x", 0).attr("y", 4).style("font-size", "12.5px").text(d => d.mn);
        r.append("line").attr("class", "span").style("stroke", "var(--neutral-2)").attr("stroke-width", 6).attr("stroke-linecap", "round");
        [0, 1, 2].forEach(k => r.append("circle").attr("class", "d" + k).attr("r", 7.5).style("fill", cols[k]).style("stroke", "var(--surface)").attr("stroke-width", 2.5));
        r.append("text").attr("class", "delta lbl-muted").attr("x", 0).attr("y", 20).style("font-size", "11px");
        r.append("rect").attr("class", "hit").attr("y", -18).attr("height", 40);
        return r;
      }).attr("transform", d => `translate(0,${m.t + d.i * rh + 26})`);
      const off = (d, k) => { const v = d.v; const same = [0, 1, 2].filter(j => j !== k && v[j] === v[k]); if (!same.length) return 0; return (k - 1) * 6; };
      [0, 1, 2].forEach(k => {
        const c = g.select("circle.d" + k);
        if (first && DUR) {
          if (k === 0) c.attr("cx", d => x(d.v[0])).attr("cy", d => off(d, 0)).attr("opacity", 0).transition().delay(d => 100 + d.i * 90).duration(350).attr("opacity", 1);
          else if (k === 2) c.attr("cx", d => x(d.v[0])).attr("cy", d => off(d, 2)).attr("opacity", 0).transition().delay(d => 500 + d.i * 110).duration(120).attr("opacity", 1).transition().duration(900).ease(d3.easeCubicInOut).attr("cx", d => x(d.v[2]));
          else c.attr("cx", d => x(d.v[1])).attr("cy", d => off(d, 1)).attr("opacity", 0).transition().delay(d => 1500 + d.i * 90).duration(400).attr("opacity", 1);
        } else c.transition(t).attr("cx", d => x(d.v[k])).attr("cy", d => off(d, k)).attr("opacity", 1);
      });
      const sp = g.select("line.span");
      (first && DUR ? sp.attr("x1", d => x(d.v[0])).attr("x2", d => x(d.v[0])).transition().delay(d => 620 + d.i * 110).duration(900).ease(d3.easeCubicInOut) : sp.transition(t))
        .attr("x1", d => x(d3.min(d.v))).attr("x2", d => x(d3.max(d.v))).attr("y1", 0).attr("y2", 0);
      g.select("text.delta").text(d => { const dl = d.v[2] - d.v[0]; return `${W < 520 ? "Δ" : "Real+CURVTON Δ"} ${dl > 0 ? "+" : dl < 0 ? "−" : "±"}${f2(Math.abs(dl))}`; });
      g.select("rect.hit").attr("x", 0).attr("width", W).on("mousemove", (ev, d) => showTip(`<b>${d.mn} · ${benchN}</b>` + D.cross.settings.map((s, k) => row(cols[k], s.name, fv(metric, d.v[k]))).join(""), ev)).on("mouseleave", hideTip);
      take();
      const head = ["Model", "Train data", ...Object.keys(D.cross.data[benchN])];
      const rowsT = [];
      D.cross.models.forEach(mn => D.cross.settings.forEach((s, k) => rowsT.push([mn, s.name, ...Object.keys(D.cross.data[benchN]).map(mm => fv(mm, D.cross.data[benchN][mm][mn][k]))])));
      table(card, head, rowsT, (i, r) => r[1] === "Real + CURVTON");
      first = false;
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 9. curriculum lines (Table 10) ---------------- */
  function curriculum() {
    const card = document.getElementById("currCard"), el = document.getElementById("currChart");
    let split = "Hard", first = true;
    seg("currSplit", v => { split = v; render(); });
    const C = D.curriculum, lbls = C.budgets.map(b => b + "k");
    function render(fromResize) {
      const W = el.clientWidth, H = 270, m = { t: 18, r: 112, b: 40, l: 40 };
      const svg = svgFor(el, W, H).attr("aria-label", `FID vs training budget on the ${split} split`);
      const nc = C.nc[split].map(r => r[2]), sc = C.sc[split].map(r => r[2]);
      const x = d3.scalePoint().domain(lbls).range([m.l + 8, W - m.r]);
      const [lo, hi] = d3.extent([...nc, ...sc]);
      const y = d3.scaleLinear().domain([Math.floor(lo - 1.5), Math.ceil(hi + 1.5)]).range([H - m.b, m.t]).nice();
      const t = svg.transition().duration(fromResize || first ? 0 : DUR).ease(ease);
      layer(svg, "grid").attr("transform", `translate(${m.l},0)`).transition(t).call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r + 8)).tickFormat("")).attr("class", "grid");
      layer(svg, "axis y").attr("transform", `translate(${m.l},0)`).transition(t).call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8)).call(g => g.select(".domain").remove());
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSize(0).tickPadding(10)).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      let xt = svg.select("text.xt"); if (xt.empty()) xt = svg.append("text").attr("class", "xt lbl-muted").attr("text-anchor", "middle").style("font-size", "11px");
      xt.attr("x", (m.l + W - m.r) / 2).attr("y", H - 6).text("training iterations · FID ↓");
      const line = d3.line().x((d, i) => x(lbls[i])).y(d => y(d)).curve(d3.curveMonotoneX);
      const area = d3.area().x((d, i) => x(lbls[i])).y0((d, i) => y(nc[i])).y1(d => y(d)).curve(d3.curveMonotoneX);
      let ar = svg.select("path.gap"); if (ar.empty()) ar = svg.insert("path", "g.lines").attr("class", "gap").style("fill", "var(--mix)").attr("opacity", 0);
      ar.transition(t).attr("d", area(sc)).attr("opacity", first && DUR ? 0 : 0.14);
      if (first && DUR) ar.attr("d", area(sc)).transition().delay(1100).duration(600).attr("opacity", 0.14);
      const series = [{ id: "nc", name: "No curriculum", c: "var(--real)", v: nc }, { id: "sc", name: "Curriculum", c: "var(--mix)", v: sc }];
      const gl = layer(svg, "lines");
      const p = gl.selectAll("path").data(series, d => d.id).join(e => e.append("path").attr("fill", "none").attr("stroke-width", 2.2).attr("stroke-linecap", "round").style("stroke", d => d.c));
      if (first && DUR) p.attr("d", d => line(d.v)).each(function () { const L = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", L).attr("stroke-dashoffset", L); }).transition().delay((d, i) => i * 200).duration(1200).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0).on("end interrupt", function () { d3.select(this).attr("stroke-dasharray", null).attr("stroke-dashoffset", null); });
      else p.interrupt().attr("stroke-dasharray", null).attr("stroke-dashoffset", null).transition(t).attr("d", d => line(d.v));
      const pts = series.flatMap(s => s.v.map((v, i) => ({ k: s.id + i, s, i, v })));
      const gp = layer(svg, "pts");
      const c = gp.selectAll("circle").data(pts, d => d.k).join(e => e.append("circle").attr("r", 4.5).style("fill", d => d.s.c).style("stroke", "var(--surface)").attr("stroke-width", 2).attr("cx", d => x(lbls[d.i])).attr("cy", d => y(d.v)).attr("opacity", first && DUR ? 0 : 1));
      if (first && DUR) c.transition().delay(d => 200 + d.i * 280 + (d.s.id === "sc" ? 200 : 0)).duration(300).attr("opacity", 1);
      else c.interrupt().attr("opacity", 1).transition(t).attr("cx", d => x(lbls[d.i])).attr("cy", d => y(d.v));
      // end labels with collision avoidance
      let ya = y(nc[3]), yb = y(sc[3]);
      if (Math.abs(ya - yb) < 30) { const mid = (ya + yb) / 2; if (ya <= yb) { ya = mid - 15; yb = mid + 15; } else { ya = mid + 15; yb = mid - 15; } }
      const ends = [{ k: "nc", y: ya, a: "No curriculum", v: nc[3] }, { k: "sc", y: yb, a: "Curriculum", v: sc[3] }];
      const ge = layer(svg, "ends");
      const et = ge.selectAll("g").data(ends, d => d.k).join(e => { const g = e.append("g"); g.append("text").attr("class", "a").style("font-size", "11px"); g.append("text").attr("class", "b lbl-strong").attr("dy", 14).style("font-size", "12px"); return g; });
      et.select("text.a").attr("class", "a lbl-muted").text(d => d.a);
      et.select("text.b").text(d => f1(d.v));
      et.transition(t).attr("transform", d => `translate(${x(lbls[3]) + 12},${d.y - 2})`);
      const cr = layer(svg, "cross");
      let vline = cr.select("line"); if (vline.empty()) vline = cr.append("line").style("stroke", "var(--axis)").attr("opacity", 0);
      let hit = svg.select("rect.hit"); if (hit.empty()) hit = svg.append("rect").attr("class", "hit");
      hit.attr("x", m.l).attr("y", m.t).attr("width", W - m.l - m.r + 20).attr("height", H - m.t - m.b)
        .on("mousemove", ev => {
          const [mx] = d3.pointer(ev), xs = lbls.map(k => x(k)), i = d3.minIndex(xs, v => Math.abs(v - mx));
          vline.attr("x1", xs[i]).attr("x2", xs[i]).attr("y1", m.t).attr("y2", H - m.b).attr("opacity", 1);
          const a = C.nc[split][i], b = C.sc[split][i];
          showTip(`<b>${C.budgetNames[i]} budget · ${lbls[i]} iters</b><div class="muted">${split} test split</div>` + row("var(--real)", "No curriculum FID", f1(a[2])) + row("var(--mix)", "Curriculum FID", f1(b[2])) + row(null, "SSIM", `${f2(a[0])} → ${f2(b[0])}`) + row(null, "LPIPS", `${f2(a[1])} → ${f2(b[1])}`), ev);
        })
        .on("mouseleave", () => { vline.attr("opacity", 0); hideTip(); });
      const rowsT = [];
      C.budgets.forEach((bgt, i) => { rowsT.push([`${C.budgetNames[i]} (${bgt}k)`, "No curriculum", ...C.nc[split][i].map(v => v)]); rowsT.push([`${C.budgetNames[i]} (${bgt}k)`, "Curriculum", ...C.sc[split][i].map(v => v)]); });
      table(card, ["Budget", "Strategy", "SSIM", "LPIPS", "FID", "KID"], rowsT, (i, r) => r[1] === "Curriculum");
      first = false;
    }
    register({ el: card, render, lazy: true });
  }

  /* ---------------- 10. tier composition heatmap (Table 9) ---------------- */
  function composition() {
    const card = document.getElementById("compCard"), el = document.getElementById("compChart");
    const splits = ["Easy", "Medium", "Hard", "All mixed"];
    let first = true;
    function render(fromResize) {
      const W = el.clientWidth, m = { t: 26, r: 4, b: 4, l: 122 }, rh = 30;
      const rows = D.composition;
      const H = m.t + rows.length * rh + 8 + m.b;
      const svg = svgFor(el, W, H).attr("aria-label", "FID by training tier mix and test split");
      const cw = (W - m.l - m.r) / 4;
      const all = rows.flatMap(r => r.v.map(v => v[2]));
      const [lo, hi] = d3.extent(all);
      const ramp = isDark() ? ["#184f95", "#2a78d6", "#5598e7", "#9ec5f4", "#cde2fb"] : ["#cde2fb", "#9ec5f4", "#5598e7", "#256abf", "#104281"];
      const col = d3.scaleSequential(d3.interpolateRgbBasis(ramp)).domain([lo, hi]);
      const textCol = v => { const c = d3.lab(col(v)); return c.l > 58 ? "#141217" : "#ffffff"; };
      const cn = document.getElementById("compNote"); if (cn) cn.textContent = isDark() ? "Brighter = higher FID (worse)." : "Darker = higher FID (worse).";
      svg.selectAll("text.ch").data(splits).join("text").attr("class", "ch lbl-muted").attr("text-anchor", "middle").style("font-size", "11px").style("font-weight", 600)
        .attr("x", (d, i) => m.l + i * cw + cw / 2).attr("y", 14).text(d => d + " test");
      const best = splits.map((s, j) => d3.minIndex(rows, r => r.v[j][2]));
      const ry = i => m.t + i * rh + (i >= 5 ? 8 : 0);
      svg.selectAll("text.rh").data(rows).join("text").attr("class", (d, i) => "rh " + (i === 8 ? "lbl-strong" : "")).style("font-size", "11.5px").attr("x", 0).attr("y", (d, i) => ry(i) + rh / 2 + 4).text(d => d.name);
      const cells = rows.flatMap((r, i) => r.v.map((v, j) => ({ i, j, r, v, best: best[j] === i })));
      const g = layer(svg, "cells");
      const cg = g.selectAll("g.c").data(cells, d => d.i + "-" + d.j).join(e => {
        const c = e.append("g").attr("class", "c");
        c.append("rect").attr("rx", 5);
        c.append("text").attr("text-anchor", "middle").style("font-size", "11.5px").style("font-variant-numeric", "tabular-nums");
        return c;
      });
      cg.attr("transform", d => `translate(${m.l + d.j * cw},${ry(d.i)})`)
        .on("mousemove", (ev, d) => showTip(`<b>Train: ${d.r.name}</b><div class="muted">${splits[d.j]} test${d.best ? " · best in column" : ""}</div>` + row(null, "FID", f2(d.v[2])) + row(null, "KID", f2(d.v[3])) + row(null, "SSIM", f2(d.v[0])) + row(null, "LPIPS", f2(d.v[1])), ev)).on("mouseleave", hideTip);
      cg.select("rect").attr("x", 1).attr("y", 1).attr("width", cw - 2).attr("height", rh - 2).style("fill", d => col(d.v[2]))
        .style("stroke", d => d.best ? "var(--ink)" : "none").attr("stroke-width", 2);
      cg.select("text").attr("x", cw / 2).attr("y", rh / 2 + 4).style("fill", d => textCol(d.v[2])).style("font-weight", d => d.best ? 800 : 500).text(d => f2(d.v[2]));
      if (first && DUR) cg.attr("opacity", 0).transition().delay(d => d.i * 70 + d.j * 40).duration(450).attr("opacity", 1);
      table(card, ["Train data", ...splits.map(s => s + " FID"), ...splits.map(s => s + " KID")], rows.map(r => [r.name, ...r.v.map(v => f2(v[2])), ...r.v.map(v => f2(v[3]))]), i => i === 8);
      first = false;
    }
    register({ el: card, render, lazy: true, themed: true });
  }

  /* ---------------- boot ---------------- */
  function init() {
    refine(); robust(); const fp = fingerprint(); diversity(); bench(); spread(); wild(); cross(); curriculum(); composition();
    charts.forEach(c => {
      c.ready = false;
      onVisible(c.el, () => { c.ready = true; c.render(false); });
    });
    // table toggles
    document.querySelectorAll(".chart-card .tbl-toggle").forEach(b => b.addEventListener("click", () => {
      const card = b.closest(".chart-card"), on = !card.classList.contains("show-table");
      card.classList.toggle("show-table", on); b.setAttribute("aria-pressed", on);
      b.textContent = on ? "Chart" : "Table";
      if (!on) charts.filter(c => c.el === card).forEach(c => c.render(true));
    }));
    let rt; let lastW = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(rt); rt = setTimeout(() => charts.forEach(c => c.ready && c.render(true)), 160); });
    document.addEventListener("themechange", () => charts.forEach(c => c.ready && c.themed && c.render(true)));
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => document.dispatchEvent(new Event("themechange")));
    return { setTier: fp.setTier };
  }
  return { init };
})();
