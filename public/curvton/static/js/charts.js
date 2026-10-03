/* d3 charts for the CURVTON-205K project page (selected results). Data: window.CV (data.js). */
window.Charts = (function () {
  const D = window.CV;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = reduce ? 0 : 800;
  const ease = d3.easeCubicOut;
  const TIERS = [["easy", "Easy", "var(--t-easy)"], ["medium", "Medium", "var(--t-med)"], ["hard", "Hard", "var(--t-hard)"]];
  const charts = [];
  const f2 = d3.format(".2f"), f1 = d3.format(".1f");
  const fv = (m, v) => (m === "FID" || m === "KID" ? f2(v) : f2(v).replace(/^0\./, "."));

  /* ---------- helpers ---------- */
  const tip = document.getElementById("tip");
  function showTip(html, ev) { tip.innerHTML = html; tip.classList.add("on"); moveTip(ev); }
  function moveTip(ev) {
    if (!ev || ev.clientX == null) return;
    const pad = 14, r = tip.getBoundingClientRect();
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
    tip.style.left = Math.max(8, x) + "px"; tip.style.top = Math.max(8, y) + "px";
  }
  function hideTip() { tip.classList.remove("on"); }
  const row = (sw, name, val) => `<div class="row"><span>${sw ? `<span class="sw" style="background:${sw}"></span>` : ""}${name}</span><b>${val}</b></div>`;
  function onVisible(el, fn) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting && el.offsetWidth > 0)) { io.disconnect(); fn(); } }, { threshold: 0.2 });
    io.observe(el);
  }
  function seg(id, onChange) {
    const s = document.getElementById(id); if (!s) return;
    s.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || !s.contains(b)) return;
      s.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      onChange(b.dataset.v);
    });
  }
  function svgFor(el, W, H) {
    let svg = d3.select(el).select("svg");
    if (svg.empty()) svg = d3.select(el).append("svg").attr("role", "img");
    return svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("height", H);
  }
  function layer(svg, cls) { let g = svg.select("g." + cls.split(" ").join(".")); if (g.empty()) g = svg.append("g").attr("class", cls); return g; }
  function vbar(x, y, w, h, r) {
    h = Math.max(h, 0.01); r = Math.max(0, Math.min(r, w / 2, h));
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  function hbar(x0, y, w, h, r) {
    w = Math.max(w, 0.01); r = Math.max(0, Math.min(r, h / 2, w));
    return `M${x0},${y}H${x0 + w - r}Q${x0 + w},${y} ${x0 + w},${y + r}V${y + h - r}Q${x0 + w},${y + h} ${x0 + w - r},${y + h}H${x0}Z`;
  }
  function tableInto(id, head, rows, oursFn) {
    const v = document.getElementById(id); if (!v) return;
    v.innerHTML = `<table><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr${oursFn && oursFn(i, r) ? ' class="ours"' : ""}>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  /* ---------- 1. closed-loop refinement (Table 6) ---------- */
  function refine() {
    const el = document.getElementById("refineChart");
    document.getElementById("refineLegend").innerHTML = TIERS.map(t => `<span><i class="line" style="background:${t[2]}"></i>${t[1]} tier</span>`).join("");
    document.getElementById("refineStats").innerHTML = TIERS.map(t => `<div class="st"><div class="k"><i style="background:${t[2]}"></i>${t[1]} tier</div><div class="v">${D.refine.train[t[0]][0]}% <small>&rarr;</small> ${D.refine.train[t[0]][4]}%</div></div>`).join("") +
      `<p class="hint" style="text-align:left;margin:2px 2px 0">Artifact rate on training candidates, before the first refinement and after round IV. Generated people and garments are separately filtered from 17/25/35% to 3/4.4/5.7% artifacts.</p>`;
    let first = true;
    function render(fromResize) {
      const W = el.clientWidth, H = W > 480 ? 300 : 260, m = { t: 16, r: 74, b: 40, l: 42 };
      const svg = svgFor(el, W, H).attr("aria-label", "Artifact rate by refinement round for each tier");
      const x = d3.scalePoint().domain(D.refine.iters).range([m.l + 6, W - m.r]);
      const y = d3.scaleLinear().domain([0, 66]).range([H - m.b, m.t]);
      layer(svg, "grid").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues([0, 20, 40, 60]).tickSize(-(W - m.l - m.r)).tickFormat(""));
      layer(svg, "axis y").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues([0, 20, 40, 60]).tickFormat(d => d + "%").tickSize(0).tickPadding(8)).call(g => g.select(".domain").remove());
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSize(0).tickPadding(10).tickFormat(d => d === "0" ? "initial" : "round " + d)).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      const line = d3.line().x((d, i) => x(D.refine.iters[i])).y(d => y(d)).curve(d3.curveMonotoneX);
      const series = TIERS.map(t => ({ id: t[0], name: t[1], c: t[2], v: D.refine.train[t[0]] }));
      const paths = layer(svg, "lines").selectAll("path").data(series, d => d.id).join(e => e.append("path").attr("fill", "none").attr("stroke-width", 2.4).attr("stroke-linecap", "round").style("stroke", d => d.c));
      paths.attr("d", d => line(d.v));
      if (first && DUR) paths.each(function () { const L = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", L).attr("stroke-dashoffset", L); })
        .transition().delay((d, i) => i * 160).duration(1300).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0).on("end interrupt", function () { d3.select(this).attr("stroke-dasharray", null).attr("stroke-dashoffset", null); });
      const pts = series.flatMap(s => s.v.map((v, i) => ({ k: s.id + i, s, i, v })));
      const c = layer(svg, "pts").selectAll("circle").data(pts, d => d.k).join(e => e.append("circle").attr("r", 4.5).style("fill", d => d.s.c).style("stroke", "#fff").attr("stroke-width", 2).attr("opacity", first && DUR ? 0 : 1));
      c.attr("cx", d => x(D.refine.iters[d.i])).attr("cy", d => y(d.v));
      if (first && DUR) c.transition().delay(d => 200 + d.i * 230 + TIERS.findIndex(t => t[0] === d.s.id) * 160).duration(300).attr("opacity", 1);
      const lo = d3.min(series, s => s.v[4]), hi = d3.max(series, s => s.v[4]);
      const end = layer(svg, "end").selectAll("g").data([1]).join(e => { const g = e.append("g"); g.append("text").attr("class", "a lbl-strong").style("font-size", "13px"); g.append("text").attr("class", "b lbl-muted").attr("dy", 14).style("font-size", "11px"); return g; });
      end.select(".a").text(`${lo}–${hi}%`); end.select(".b").text("after round IV");
      end.attr("transform", `translate(${x("IV") + 12},${y((lo + hi) / 2) + 2})`).attr("opacity", first && DUR ? 0 : 1);
      if (first && DUR) end.transition().delay(1500).duration(400).attr("opacity", 1);
      const st0 = layer(svg, "st").selectAll("text").data([1]).join("text").attr("class", "lbl-strong").style("font-size", "12px");
      st0.text(`hard tier starts at ${series[2].v[0]}%`).attr("x", x("0") + 10).attr("y", y(series[2].v[0]) - 8);
      let vline = layer(svg, "cross").selectAll("line").data([1]).join("line").style("stroke", "var(--axis)").attr("opacity", 0);
      let hit = svg.select("rect.hit"); if (hit.empty()) hit = svg.append("rect").attr("class", "hit");
      hit.attr("x", m.l - 20).attr("y", m.t).attr("width", W - m.l - m.r + 40).attr("height", H - m.t - m.b)
        .on("mousemove", ev => {
          const [mx] = d3.pointer(ev), xs = D.refine.iters.map(k => x(k)), i = d3.minIndex(xs, v => Math.abs(v - mx));
          vline.attr("x1", xs[i]).attr("x2", xs[i]).attr("y1", m.t).attr("y2", H - m.b).attr("opacity", 1);
          showTip(`<b>${i === 0 ? "Initial generation" : "After round " + D.refine.iters[i]}</b>` + series.slice().reverse().map(s => row(s.c, s.name, s.v[i] + "%")).join(""), ev);
        }).on("mouseleave", () => { vline.attr("opacity", 0); hideTip(); });
      first = false;
    }
    charts.push({ el, render });
    onVisible(el, () => render());
  }

  /* ---------- 2. in-domain benchmark (Tables 2 & 8) ---------- */
  function bench() {
    const el = document.getElementById("benchChart");
    const models = Object.keys(D.bench);
    document.getElementById("benchModel").innerHTML = models.map((m, i) => `<button aria-pressed="${i === 0}" data-v="${m}">${m.replace(" [klein] 9B", " (generator)")}</button>`).join("");
    let model = models[0], metric = "FID", first = true;
    seg("benchModel", v => { model = v; render(); });
    seg("benchMetric", v => { metric = v; render(); table(); });
    function take() {
      const b = D.bench[model], s = document.getElementById("benchTake");
      if (!b.tr) { s.innerHTML = model === "DCI-VTON" ? "<b>DCI-VTON</b> is reported zero-shot only, as an additional baseline." : "<b>FLUX.2 [klein] 9B</b> is the generator used to build CURVTON-205K, shown zero-shot as a reference."; return; }
      const z = b.zs[metric][0], tr = b.tr[metric][0], pct = Math.round(Math.abs(tr - z) / z * 100);
      s.innerHTML = `<b>${model}</b>: overall ${metric} ${fv(metric, z)} &rarr; <b>${fv(metric, tr)}</b> after training on CURVTON-205K (${metric === "SSIM" ? "+" : "&minus;"}${pct}%)` + (metric === "FID" ? `; hard tier ${f2(b.zs.FID[3])} &rarr; ${f2(b.tr.FID[3])}.` : ".");
    }
    function table() {
      const rows = [];
      Object.entries(D.bench).forEach(([mn, o]) => { rows.push([mn, "Zero-shot", ...o.zs[metric].map(v => fv(metric, v))]); if (o.tr) rows.push([mn, "CURVTON-trained", ...o.tr[metric].map(v => fv(metric, v))]); });
      tableInto("benchTable", ["Model", "Setting", ...D.subsets.map((s, i) => [0, 1, 2, 3].includes(i) ? s : D.subsetsShort[i])], rows, (i, r) => r[1] === "CURVTON-trained");
    }
    function render(fromResize) {
      const W = el.clientWidth, narrow = W < 620, H = narrow ? 290 : 330, m = { t: 30, r: 8, b: 36, l: 40 };
      const svg = svgFor(el, W, H).attr("aria-label", `${metric} by subset for ${model}`);
      const b = D.bench[model], series = b.tr ? ["zs", "tr"] : ["zs"];
      const maxV = metric === "SSIM" ? 1 : d3.max(Object.values(D.bench).flatMap(o => [...o.zs[metric], ...(o.tr ? o.tr[metric] : [])]));
      const y = d3.scaleLinear().domain([0, maxV * 1.06]).nice().range([H - m.b, m.t]);
      const gw = (W - m.l - m.r) / 10, gx = i => m.l + (i + (i >= 1 ? .5 : 0) + (i >= 4 ? .5 : 0)) * gw;
      const inner = gw * .78, bw = (inner - 2) / 2;
      const t = svg.transition().duration(fromResize || first ? 0 : DUR).ease(ease);
      layer(svg, "grid").attr("transform", `translate(${m.l},0)`).transition(t).call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r)).tickFormat(""));
      layer(svg, "axis y").attr("transform", `translate(${m.l},0)`).transition(t).call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8).tickFormat(metric === "FID" ? d3.format("d") : d3.format(".1f"))).call(g => g.select(".domain").remove());
      const lbls = W < 420 ? ["All", "E", "M", "H", "UB", "LB", "G", "Tr", "NTr"] : narrow ? D.subsetsShort : D.subsets.map((s, i) => [0, 1, 2, 3].includes(i) ? s : D.subsetsShort[i]);
      layer(svg, "xl").selectAll("text").data(lbls).join("text").attr("class", "lbl-muted").attr("text-anchor", "middle").style("font-size", narrow ? "10.5px" : "11.5px").attr("x", (d, i) => gx(i) + gw / 2).attr("y", H - m.b + 18).text(d => d);
      const heads = [{ t: "Difficulty tier", a: 1, b: 3 }, { t: "Garment type", a: 4, b: 8 }];
      const hd = layer(svg, "heads");
      hd.selectAll("line").data(heads).join("line").style("stroke", "var(--border-2)").attr("x1", d => gx(d.a) + gw * .1).attr("x2", d => gx(d.b) + gw * .9).attr("y1", m.t - 10).attr("y2", m.t - 10);
      hd.selectAll("text").data(heads).join("text").attr("class", "lbl-muted").attr("text-anchor", "middle").style("font-size", "11px").style("font-weight", 600).attr("x", d => (gx(d.a) + gx(d.b) + gw) / 2).attr("y", m.t - 15).text(d => d.t);
      const data = []; D.subsets.forEach((s, i) => series.forEach((k, j) => data.push({ key: i + k, i, k, j, v: b[k][metric][i] })));
      const off = series.length === 1 ? (inner - bw) / 2 : 0, bx = d => gx(d.i) + (gw - inner) / 2 + off + d.j * (bw + 2);
      const bars = layer(svg, "bars").selectAll("path").data(data, d => d.key).join(
        e => e.append("path").attr("d", d => vbar(bx(d), H - m.b, bw, 0, 4)).style("fill", d => d.k === "tr" ? "var(--curv)" : "var(--neutral)"),
        u => u, x => x.transition().duration(DUR / 2).attr("d", d => vbar(bx(d), H - m.b, bw, 0, 4)).remove());
      bars.on("mousemove", (ev, d) => showTip(`<b>${model} · ${D.subsets[d.i]}</b>` + row("var(--neutral)", "Zero-shot", fv(metric, b.zs[metric][d.i])) + (b.tr ? row("var(--curv)", "CURVTON-trained", fv(metric, b.tr[metric][d.i])) : ""), ev)).on("mouseleave", hideTip)
        .transition().delay(d => first && DUR ? d.i * 55 + d.j * 120 : 0).duration(fromResize ? 0 : DUR).ease(ease).attr("d", d => vbar(bx(d), y(d.v), bw, H - m.b - y(d.v), 4));
      const labels = data.filter(d => d.k === (b.tr ? "tr" : "zs"));
      layer(svg, "vals").selectAll("text").data(labels, d => d.i).join(e => e.append("text").attr("class", "lbl-strong").attr("text-anchor", "middle").attr("x", d => bx(d) + bw / 2).attr("y", d => y(d.v) - 5).attr("opacity", 0))
        .style("font-size", narrow ? "9px" : "10.5px").text(d => metric === "FID" ? f1(d.v) : f2(d.v).replace(/^0\./, "."))
        .transition().delay(d => first && DUR ? 700 + d.i * 55 : 0).duration(fromResize ? 0 : first ? 400 : DUR).ease(ease).attr("x", d => bx(d) + bw / 2).attr("y", d => y(d.v) - 5).attr("opacity", 1);
      layer(svg, "base").selectAll("line").data([1]).join("line").style("stroke", "var(--axis)").attr("x1", m.l).attr("x2", W - m.r).attr("y1", H - m.b + .5).attr("y2", H - m.b + .5);
      take(); first = false;
    }
    table(); take();
    charts.push({ el, render });
    onVisible(el, () => render());
  }

  /* ---------- 3. cross-dataset generalization (Table 3) ---------- */
  function cross() {
    const el = document.getElementById("crossChart"), cols = ["var(--real)", "var(--curv)", "var(--mix)"];
    let benchN = "StreetTryOn", metric = "FID", first = true;
    const msel = document.getElementById("crossMetric");
    function buildMetric() {
      const ms = Object.keys(D.cross.data[benchN]); if (!ms.includes(metric)) metric = "FID";
      msel.innerHTML = ms.map(k => `<button aria-pressed="${k === metric}" data-v="${k}">${k} ${k === "SSIM" ? "&uarr;" : "&darr;"}</button>`).join("");
    }
    buildMetric();
    seg("crossBench", v => { benchN = v; buildMetric(); render(); table(); });
    seg("crossMetric", v => { metric = v; render(); table(); });
    function take() {
      const dd = D.cross.data[benchN][metric], hi = metric === "SSIM"; let mixB = 0, mixT = 0, curvB = 0; const del = [];
      D.cross.models.forEach(mn => { const [r, c, x] = dd[mn]; if (x === r) mixT++; else if (hi ? x > r : x < r) mixB++; if (hi ? c > r : c < r) curvB++; del.push(x - r); });
      const n = D.cross.models.length, rng = metric === "FID" || metric === "KID" ? ` (&Delta; ${f2(d3.min(del))} to ${f2(d3.max(del))})` : "";
      let s = `<b>Real + CURVTON</b> beats real-only on ${benchN} ${metric} for <b>${mixB} of ${n}</b> models${mixT ? `, ${mixT} tied` : ""}${mixB + mixT < n ? `, ${n - mixB - mixT} slightly worse` : ""}${rng}. `;
      s += curvB === n ? "CURVTON alone also beats real-only for every model." : curvB === 0 ? "CURVTON alone trails real-only here: the synthetic-to-real gap on paired metrics." : `CURVTON alone beats real-only for ${curvB} of ${n}.`;
      document.getElementById("crossTake").innerHTML = s;
    }
    function table() {
      const dd = D.cross.data[benchN][metric], hi = metric === "SSIM";
      const rows = D.cross.models.map(mn => {
        const v = dd[mn], best = hi ? d3.max(v) : d3.min(v);
        return [mn, ...v.map(x => x === best ? `<b>${fv(metric, x)}</b>` : fv(metric, x))];
      });
      tableInto("crossTable", [`${benchN} · ${metric} ${hi ? "&uarr;" : "&darr;"}`, "Real baseline", "CURVTON-205K only", "Real + CURVTON"], rows);
    }
    function render(fromResize) {
      const W = el.clientWidth, rh = 56, m = { t: 8, r: 22, b: 40, l: W < 520 ? 104 : 150 };
      const H = m.t + D.cross.models.length * rh + m.b;
      const svg = svgFor(el, W, H).attr("aria-label", `${benchN} ${metric}`);
      const dd = D.cross.data[benchN][metric], all = D.cross.models.flatMap(mn => dd[mn]);
      const [lo, hi] = d3.extent(all), pad = (hi - lo) * .14 || .05;
      const x = d3.scaleLinear().domain([lo - pad, hi + pad]).range([m.l, W - m.r]).nice();
      const t = svg.transition().duration(fromResize || first ? 0 : DUR).ease(ease);
      const tv = W < 560 ? [...new Set([x.domain()[0], ...x.ticks(3), x.domain()[1]])] : x.ticks(7);
      layer(svg, "grid").attr("transform", `translate(0,${H - m.b})`).transition(t).call(d3.axisBottom(x).tickValues(tv).tickSize(-(H - m.b - m.t)).tickFormat(""));
      layer(svg, "axis x").attr("transform", `translate(0,${H - m.b})`).transition(t).call(d3.axisBottom(x).tickValues(tv).tickSize(0).tickPadding(9).tickFormat(metric === "SSIM" || metric === "LPIPS" ? d3.format(".2f") : d3.format(".1f"))).call(g => g.select(".domain").attr("stroke", "var(--axis)"));
      layer(svg, "xt").selectAll("text").data([1]).join("text").attr("class", "lbl-muted").attr("text-anchor", "end").style("font-size", "11px").attr("x", W - m.r).attr("y", H - 4).text(metric === "SSIM" ? "higher is better →" : "← lower is better");
      const rows = D.cross.models.map((mn, i) => ({ mn, i, v: dd[mn] }));
      const g = layer(svg, "rows").selectAll("g.r").data(rows, d => d.mn).join(e => {
        const r = e.append("g").attr("class", "r");
        r.append("text").attr("class", "lbl-strong").attr("y", 4).style("font-size", "12.5px").text(d => d.mn);
        r.append("text").attr("class", "delta lbl-muted").attr("y", 20).style("font-size", "11px");
        r.append("line").attr("class", "span").style("stroke", "var(--neutral-2)").attr("stroke-width", 6).attr("stroke-linecap", "round");
        [0, 1, 2].forEach(k => r.append("circle").attr("class", "d" + k).attr("r", 7.5).style("fill", cols[k]).style("stroke", "#fff").attr("stroke-width", 2.5));
        r.append("rect").attr("class", "hit").attr("y", -18).attr("height", 40);
        return r;
      }).attr("transform", d => `translate(0,${m.t + d.i * rh + 24})`);
      const off = (d, k) => [0, 1, 2].some(j => j !== k && d.v[j] === d.v[k]) ? (k - 1) * 6 : 0;
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
      take(); first = false;
    }
    table(); take();
    charts.push({ el, render });
    return { show() { if (!el.querySelector("svg")) render(); } };
  }

  /* ---------- 4. in-the-wild (Table 5) ---------- */
  function wild() {
    const el = document.getElementById("wildChart");
    const metrics = [
      { k: "q", name: "Quality", grp: "Human preference (%)", max: 40, pct: true },
      { k: "r", name: "Realism", grp: "Human preference (%)", max: 40, pct: true },
      { k: "clip", name: "CLIP-I ↑", grp: "Automatic metrics", max: 1, pct: false },
      { k: "vlm", name: "VLM score ↑", grp: "Automatic metrics", max: 1, pct: false }
    ];
    let first = true;
    tableInto("wildTable", ["Train data / system", "CLIP-I", "VLM", "Quality pref.", "Realism pref."], D.wild.map(d => [d.name, f2(d.clip), f2(d.vlm), d.q + "%", d.r + "%"]), i => D.wild[i].ours);
    function render(fromResize) {
      const W = el.clientWidth, per = W >= 720 ? 4 : 2, groups = d3.range(0, 4, per).map(i => metrics.slice(i, i + per));
      let host = el.querySelector(".host"); if (!host) { host = document.createElement("div"); host.className = "host"; el.appendChild(host); }
      if (host.childElementCount !== groups.length) { host.innerHTML = ""; groups.forEach(() => host.appendChild(document.createElement("div"))); }
      host.querySelectorAll(":scope > div").forEach((div, gi) => {
        const ms = groups[gi], rh = 34, m = { t: 48, r: 6, b: 8, l: W < 520 ? 100 : 134 };
        const H = m.t + D.wild.length * rh + m.b;
        const svg = svgFor(div, W, H).attr("aria-label", ms.map(x => x.name).join(", "));
        const pw = (W - m.l - m.r) / ms.length, gap = 18;
        svg.selectAll("text.nm").data(D.wild).join("text").attr("class", d => "nm " + (d.ours ? "lbl-strong" : "")).attr("x", 0).attr("y", (d, i) => m.t + i * rh + rh / 2 + 4).style("font-size", "12px").text(d => d.name);
        const grps = [...new Set(ms.map(d => d.grp))].map(gname => { const idx = ms.map((d, i) => d.grp === gname ? i : -1).filter(i => i >= 0); return { gname, a: idx[0], b: idx[idx.length - 1] }; });
        svg.selectAll("g.grp").data(grps, d => d.gname).join(e => { const g = e.append("g").attr("class", "grp"); g.append("text").attr("class", "lbl-strong").attr("y", 14).style("font-size", "12.5px"); g.append("line").style("stroke", "var(--border-2)"); return g; })
          .each(function (d) { const g = d3.select(this), x0 = m.l + d.a * pw, x1 = m.l + (d.b + 1) * pw - gap; g.select("text").attr("x", x0).text(d.gname); g.select("line").attr("x1", x0).attr("x2", x1).attr("y1", 21).attr("y2", 21); });
        const panels = svg.selectAll("g.p").data(ms, d => d.k).join(e => { const g = e.append("g").attr("class", "p"); g.append("text").attr("class", "pt lbl-muted").attr("y", 37).style("font-weight", 600); g.append("line").attr("class", "base").style("stroke", "var(--axis)"); return g; })
          .attr("transform", (d, i) => `translate(${m.l + i * pw},0)`);
        panels.select("text.pt").text(d => d.name);
        panels.select("line.base").attr("x1", 0).attr("x2", 0).attr("y1", m.t).attr("y2", H - m.b);
        panels.each(function (mt, pi) {
          const x = d3.scaleLinear().domain([0, mt.max]).range([0, pw - gap - 34]);
          const data = D.wild.map((d, i) => ({ ...d, i, v: d[mt.k] }));
          const gg = d3.select(this);
          gg.selectAll("path.bar").data(data).join(e => e.append("path").attr("class", "bar").attr("d", d => hbar(0, m.t + d.i * rh + 8, 0, rh - 16, 4)))
            .style("fill", d => d.ours ? "var(--curv)" : "var(--neutral)")
            .on("mousemove", (ev, d) => showTip(`<b>${d.name}</b>` + row(null, "CLIP-I", f2(d.clip)) + row(null, "VLM", f2(d.vlm)) + row(null, "Quality pref.", d.q + "%") + row(null, "Realism pref.", d.r + "%"), ev)).on("mouseleave", hideTip)
            .transition().delay(d => first && DUR ? pi * 160 + d.i * 60 : 0).duration(fromResize ? 0 : DUR).ease(ease).attr("d", d => hbar(0, m.t + d.i * rh + 8, x(d.v), rh - 16, 4));
          gg.selectAll("text.val").data(data).join(e => e.append("text").attr("class", "val").attr("opacity", 0))
            .attr("class", d => "val " + (d.ours ? "lbl-strong" : "lbl-muted")).style("font-size", "11.5px").attr("y", d => m.t + d.i * rh + rh / 2 + 4)
            .text(d => mt.pct ? d.v + "%" : f2(d.v).replace(/^0\./, ".")).attr("x", d => x(d.v) + 6)
            .transition().delay(d => first && DUR ? pi * 160 + d.i * 60 + DUR * .7 : 0).duration(fromResize ? 0 : 300).attr("opacity", 1);
        });
      });
      first = false;
    }
    charts.push({ el, render });
    return { show() { if (!el.querySelector("svg")) render(); } };
  }

  function init() {
    refine(); bench(); const cr = cross(), wi = wild();
    // results tabs
    const tabs = document.querySelectorAll("#resTabs .tab");
    tabs.forEach(b => b.addEventListener("click", () => {
      tabs.forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));
      document.querySelectorAll("#resTabs ~ .panel").forEach(p => p.classList.toggle("active", p.id === "p-" + b.dataset.p));
      if (b.dataset.p === "cross") cr.show(); else if (b.dataset.p === "wild") wi.show();
    }));
    let rt, lastW = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(rt); rt = setTimeout(() => charts.forEach(c => c.el.offsetWidth && c.el.querySelector("svg") && c.render(true)), 160); });
  }
  return { init };
})();
