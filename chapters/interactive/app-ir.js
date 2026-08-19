/* Inversion recovery chapter figures, computed by qmrust (Rust → WebAssembly)
   and drawn with Plotly.js. Every number plotted here comes out of the Rust
   engine; JavaScript only marshals arguments and styles the result.

   Each simulated figure carries a parameter panel: editing a value and hitting
   "Recompute in Rust" re-runs that figure's qmrust calls from scratch. Figure
   2.5 has no panel — it fits a fixed acquisition, so there is nothing to vary
   short of supplying different data. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var PLOT_CONFIG = { showLink: false, displayModeBar: false, responsive: true };  // matches the notebook figures' own config
  var TNR = "Times New Roman";

  // ── qmrust plumbing ──────────────────────────────────────────────────────

  /** Inversion times from an integer-millisecond grid. Keeping TIs on whole
      milliseconds also keeps their decimal form short, which used to be load
      bearing: qmrust reads the recipe with serde_yaml and the measurement with
      serde_json, whose float parsers disagreed by 1 ulp on 17-digit decimals
      until `float_roundtrip` was enabled. Whole milliseconds are also simply
      what a protocol looks like. */
  function msGrid(startMs, stepMs, count) {
    var v = new Array(count);
    for (var i = 0; i < count; i++) { v[i] = (startMs + i * stepMs) / 1000; }
    return v;
  }

  function linspace(a, b, n) {
    var v = new Array(n), step = (b - a) / (n - 1);
    for (var i = 0; i < n; i++) { v[i] = a + step * i; }
    v[n - 1] = b;
    return v;
  }

  /** A qmrust recipe: the model, its fit options, and the TI list as protocol. */
  function recipe(ti, method, fitModel) {
    return "model: inversion_recovery\n" +
           "method: " + method + "\n" +
           (fitModel ? "fit_model: " + fitModel + "\n" : "") +
           "inversion_times: [" + ti.map(String).join(", ") + "]\n";
  }

  /** Noise-free signal from qmrust; returns the values in TI order. */
  function forward(cfg, t1, a, b) {
    var samples = JSON.parse(wasm_bindgen.forward(cfg, new Float64Array([t1, a, b]), "", ""));
    return samples.map(function (s) { return s.value; });
  }

  /** Fit one voxel; returns the model's outputs (T1, b, a, res[, idx]). */
  function fitVoxel(cfg, ti, values) {
    var meas = JSON.stringify(ti.map(function (t, i) {
      return { params: { InversionTime: t }, value: values[i] };
    }));
    return wasm_bindgen.fit_voxel(cfg, meas, "", "");
  }

  /** qMRLab `ComputeRaRb` for ideal 180°/90° pulses: the general equation
      (MOOC Eq. 2.1) written in the a/b parameterization qmrust fits. */
  function raRb(m0, tr, t1) {
    return { a: m0 * (1 + Math.exp(-tr / t1)), b: -2 * m0 };
  }

  // ── Parameter panels ─────────────────────────────────────────────────────

  /** Read a numeric input, with bounds. Throws a message naming the field. */
  function num(id, label, lo, hi, integer) {
    var v = parseFloat($(id).value);
    if (!isFinite(v)) { throw new Error(label + " must be a number"); }
    if (integer) { v = Math.round(v); }
    if (v < lo || v > hi) {
      throw new Error(label + " must be between " + lo + " and " + hi);
    }
    return v;
  }

  /** Wire a panel's button: read params, rebuild, report timing or error. */
  function wirePanel(buttonId, statusId, build) {
    var btn = $(buttonId);
    btn.addEventListener("click", function () {
      var status = $(statusId);
      btn.disabled = true;
      status.className = "figstatus";
      status.textContent = "Running qmrust…";
      // Yield once so the button state and message actually paint before the
      // synchronous wasm call blocks the main thread.
      setTimeout(function () {
        var t0 = performance.now();
        try {
          build(function (msg) { status.textContent = msg; });
          status.textContent = "Recomputed in Rust in " +
            ((performance.now() - t0) / 1000).toFixed(2) + " s";
        } catch (e) {
          status.className = "figstatus err";
          status.textContent = (e && e.message) ? e.message : String(e);
        } finally {
          btn.disabled = false;
        }
      }, 30);
    });
  }

  // ── Shared Plotly styling ────────────────────────────────────────────────

  function axisTitle(text, x, y, size, rotate) {
    var ann = { x: x, y: y, showarrow: false, text: text,
                font: { family: TNR, size: size }, xref: "paper", yref: "paper" };
    if (rotate) { ann.textangle = -90; }
    return ann;
  }
  var PLAIN_AXIS = { showgrid: false, linecolor: "black", linewidth: 2 };
  function axis(extra) { return Object.assign({}, PLAIN_AXIS, extra || {}); }
  function legendBox(x, y) {
    return { x: x, y: y, traceorder: "normal",
             font: { family: TNR, size: 12, color: "#000" },
             bordercolor: "#000000", borderwidth: 2 };
  }
  /** A Plotly slider whose steps toggle one trace per group. */
  function buildSlider(prefix, active, labels, nTraces, groups) {
    var steps = labels.map(function (lab, i) {
      var vis = new Array(nTraces);
      for (var t = 0; t < nTraces; t++) { vis[t] = false; }
      groups.forEach(function (g) { vis[g[i]] = true; });
      return { method: "restyle", label: lab, args: ["visible", vis] };
    });
    return [{ x: 0, y: -0.02, active: active,
              currentvalue: { prefix: prefix },
              pad: { t: 50, b: 10 }, steps: steps }];
  }
  /** Indices 0..n-1 offset by `base` — one slider group. */
  function group(base, n) {
    var g = new Array(n);
    for (var i = 0; i < n; i++) { g[i] = base + i; }
    return g;
  }
  function fmt1(v) {
    var s = v.toFixed(3).replace(/0+$/, "");
    return s.charAt(s.length - 1) === "." ? s + "0" : s;
  }

  // ── Figure 2.2 — recovery curves for three tissues ───────────────────────

  var FIG22_TISSUES = [
    { key: "t1wm",  label: "White Matter" },
    { key: "t1gm",  label: "Grey Matter" },
    { key: "t1csf", label: "Cerebrospinal Fluid" }
  ];

  function buildFig22() {
    var TR = num("f22tr", "TR", 0.002, 100);
    var N = num("f22n", "TI points", 10, 20000, true);
    var C = num("f22c", "Signal constant C", -1e6, 1e6);
    var ti = linspace(0.001, TR, N);
    // Long-TR approximation (Eq. 2.3) == a + b*exp(-TI/T1) with a = C, b = -2C.
    var cfg = recipe(ti, "complex");
    var traces = FIG22_TISSUES.map(function (t) {
      var T1 = num(t.key, "T1 for " + t.label, 1e-4, 100);
      var name = "T<sub>1</sub> = " + fmt1(T1) + " s (" + t.label + ")";
      return { x: ti, y: forward(cfg, T1, C, -2 * C), name: name, text: name,
               hoverinfo: "x+y+text", mode: "lines" };
    });
    Plotly.react("fig22", traces, {
      width: 600, height: 350, margin: { l: 100, r: 50, b: 60, t: 0 },
      annotations: [
        axisTitle("Inversion Time – TI (s)", 0.5004254919715793, -0.175, 22, false),
        axisTitle("Long. Magnetization (M<sub>z</sub>)", -0.15, 0.5, 22, true)
      ],
      xaxis: axis(), yaxis: axis(), legend: legendBox(0.55, 0.15),
      plot_bgcolor: "white", paper_bgcolor: "white"
    }, PLOT_CONFIG);
  }

  // ── Figure 2.3 — general equation vs long-TR approximation ───────────────

  function buildFig23() {
    var TR = num("f23tr", "TR", 0.002, 100);
    var N = num("f23n", "TI points", 10, 20000, true);
    var t1Start = num("f23t1start", "T1 start", 1e-4, 100);
    var t1Step = num("f23t1step", "T1 step", 1e-4, 100);
    var t1Count = num("f23t1count", "T1 values", 2, 200, true);

    var ti = linspace(0.001, TR, N);
    var cfg = recipe(ti, "magnitude");           // the figure plots |signal|
    var t1Values = [];
    for (var k = 0; k < t1Count; k++) { t1Values.push(t1Start + k * t1Step); }

    var traces = [];
    // Long-TR approximation: a = 1, b = -2. (Source chapter's Eq. 2.3; the
    // legend text below drops that numbering, which means nothing in this book.)
    t1Values.forEach(function (T1) {
      traces.push({ visible: false, x: ti, y: forward(cfg, T1, 1.0, -2.0), mode: "lines",
                    name: "Long TR approximation",
                    text: "Long TR approximation", hoverinfo: "x+y+text" });
    });
    // General equation with ideal pulses (qMRLab ComputeRaRb). Source
    // chapter's Eq. 2.1; legend numbering dropped, as above.
    t1Values.forEach(function (T1) {
      var ab = raRb(1.0, TR, T1);
      traces.push({ visible: false, x: ti, y: forward(cfg, T1, ab.a, ab.b), mode: "lines",
                    line: { color: "rgb(22, 96, 167)", dash: "dash" },
                    name: "General equation",
                    text: "General equation", hoverinfo: "x+y+text" });
    });

    var n = t1Values.length;
    var active = Math.min(3, n - 1);              // T1 = 1.0 s in the published defaults
    traces[active].visible = true;
    traces[n + active].visible = true;
    var sliders = buildSlider("T<sub>1</sub> value (s): <b>", active, t1Values.map(fmt1),
                              traces.length, [group(0, n), group(n, n)]);
    sliders[0].y = 0.0;

    Plotly.newPlot("fig23", traces, {
      width: 580, height: 400, margin: { l: 80, r: 40, b: 60, t: 10 },
      annotations: [
        axisTitle("Inversion Time – TI (s)", 0.5004254919715793, -0.2, 22, false),
        axisTitle("Signal (magnitude)", -0.14, 0.5, 22, true)
      ],
      xaxis: axis({ autorange: false, range: [0, TR] }),
      yaxis: axis({ autorange: false, range: [0, 1] }),
      legend: legendBox(0.5, 0.5), sliders: sliders,
      plot_bgcolor: "white", paper_bgcolor: "white"
    }, PLOT_CONFIG);
  }

  // ── Figure 2.4 — RD-NLS vs long-TR Levenberg-Marquardt across TR ─────────

  function buildFig24(report) {
    var T1 = num("f24t1", "True T1", 1, 20000, true) / 1000;
    var tiStart = num("f24tistart", "TI start", 1, 20000, true);
    var tiStep = num("f24tistep", "TI step", 1, 20000, true);
    var tiCount = num("f24ticount", "TI count", 3, 500, true);
    var trStart = num("f24trstart", "TR start", 1, 60000, true);
    var trStep = num("f24trstep", "TR step", 1, 60000, true);
    var trCount = num("f24trcount", "TR count", 1, 400, true);

    var ti = msGrid(tiStart, tiStep, tiCount);
    var trs = msGrid(trStart, trStep, trCount);
    var cfgSigned = recipe(ti, "complex");
    var cfgMag = recipe(ti, "magnitude");
    var cfgLm = recipe(ti, "complex", "long_tr_lm");

    var data = [], lmFit = [], barralFit = [];
    trs.forEach(function (TR, i) {
      if (report && i % 10 === 0) { report("Fitting TR " + (i + 1) + " of " + trs.length + "…"); }
      // Simulated data: the general equation (Eq. 2.1), ideal pulses.
      var ab = raRb(1.0, TR, T1);
      var signed = forward(cfgSigned, T1, ab.a, ab.b);
      data.push(signed.map(Math.abs));
      // Fit the same signed data two ways. Outputs: [T1, b, a, res].
      var lm = fitVoxel(cfgLm, ti, signed);
      var barral = fitVoxel(cfgSigned, ti, signed);
      // Re-evaluate each fitted model over TI, as magnitude, for the curves.
      lmFit.push({ t1: lm[0], y: forward(cfgMag, lm[0], lm[2], lm[1]) });
      barralFit.push({ t1: barral[0], y: forward(cfgMag, barral[0], barral[2], barral[1]) });
    });

    var n = trs.length;
    var active = Math.min(10, n - 1);             // TR = 2000 ms in the published defaults
    var traces = [];
    trs.forEach(function (TR, i) {
      traces.push({ visible: i === active, mode: "markers", x: ti, y: data[i],
                    name: "Simulated data", text: "Simulated data", hoverinfo: "x+y+text" });
    });
    trs.forEach(function (TR, i) {
      traces.push({ visible: i === active, mode: "lines", x: ti, y: lmFit[i].y,
                    name: "[C(1-2e<sup>-TI/T<sub>1</sub></sup>)] Fitted T<sub>1</sub>: <b>" +
                          Math.round(lmFit[i].t1 * 1000) + " ms",
                    text: "[C(1-2e<sup>-TI/T<sub>1</sub></sup>)]", hoverinfo: "x+y+text" });
    });
    trs.forEach(function (TR, i) {
      traces.push({ visible: i === active, mode: "lines", x: ti, y: barralFit[i].y,
                    name: "[<i>a</i>+<i>b</i>e<sup>-TI/T<sub>1</sub></sup>] Fitted T<sub>1</sub>: <b>" +
                          Math.round(barralFit[i].t1 * 1000) + " ms",
                    text: "[<i>a</i>+<i>b</i>e<sup>-TI/T<sub>1</sub></sup>]", hoverinfo: "x+y+text" });
    });

    var sliders = buildSlider("TR value (ms): <b>", active,
                              trs.map(function (t) { return String(Math.round(t * 1000)); }),
                              traces.length, [group(0, n), group(n, n), group(2 * n, n)]);

    Plotly.newPlot("fig24", traces, {
      width: 580, height: 450, margin: { l: 80, r: 40, b: 60, t: 10 },
      annotations: [
        axisTitle("Inversion Time – TI (s)", 0.5004254919715793, -0.18, 22, false),
        axisTitle("Signal (magnitude)", -0.14, 0.5, 22, true)
      ],
      xaxis: axis({ autorange: false, range: [0, ti[ti.length - 1]] }),
      yaxis: axis({ autorange: false, range: [0, 1] }),
      legend: legendBox(0.2, 0.9), sliders: sliders,
      plot_bgcolor: "white", paper_bgcolor: "white"
    }, PLOT_CONFIG);
  }

  // ── Figure 2.5 — T1 map of a real inversion recovery brain acquisition ───
  //
  // No parameter panel: this figure fits a fixed acquisition (the qMRLab OSF
  // ir_brain dataset), so there is nothing to vary short of different data.

  var FIG25_TI = [0.030, 0.530, 1.030, 1.530];

  function decodeBase64(b64) {
    var bin = atob(b64), n = bin.length, out = new Uint8Array(n);
    for (var i = 0; i < n; i++) { out[i] = bin.charCodeAt(i); }
    return out;
  }

  /** Flat C-order [nx,ny] slab → Plotly heatmap z (rows of y). */
  function toGrid(flat, nx, ny, offset, stride) {
    var z = new Array(nx);
    for (var i = 0; i < nx; i++) {
      var row = new Array(ny);
      for (var j = 0; j < ny; j++) { row[j] = flat[offset + (i * ny + j) * stride]; }
      z[i] = row;
    }
    return z;
  }

  /** Rotate a grid 180 degrees in-plane (reverse rows and columns). */
  function rot180(z) {
    return z.slice().reverse().map(function (row) { return row.slice().reverse(); });
  }

  /** Rotate a grid 90° counter-clockwise (numpy `rot90`), to match the
      orientation the images are shown in in the book. `.mat` row/column order
      carries no orientation of its own, so this is display only — it happens
      after the fit and cannot affect any fitted value. */
  function rot90ccw(z) {
    var rows = z.length, cols = z[0].length;
    var out = new Array(cols);
    for (var i = 0; i < cols; i++) {
      var row = new Array(rows);
      for (var j = 0; j < rows; j++) { row[j] = z[j][cols - 1 - i]; }
      out[i] = row;
    }
    return out;
  }

  function buildFig25() {
    var nx = BRAIN.dims[0], ny = BRAIN.dims[1], nt = BRAIN.dims[3];
    var data = new Float64Array(new Float32Array(decodeBase64(BRAIN.data).buffer));
    var mask = decodeBase64(BRAIN.mask);

    var cfg = recipe(FIG25_TI, "magnitude");
    var ids = JSON.stringify(FIG25_TI.map(function (t) { return { InversionTime: t }; }));
    var maps = wasm_bindgen.fit_volume(
      cfg, data, new Uint32Array([nx, ny, 1, nt]), ids, mask, "", "");
    var t1Flat = (maps instanceof Map) ? maps.get("T1") : maps.T1;

    // Seconds → ms for display, matching the published figure's colour bar.
    var t1Ms = new Array(t1Flat.length);
    for (var v = 0; v < t1Flat.length; v++) {
      t1Ms[v] = Number.isFinite(t1Flat[v]) ? t1Flat[v] * 1000 : null;
    }
    var fitted = t1Ms.filter(function (x) { return x !== null; });

    // Net orientation: 90 degrees counter-clockwise, i.e. the book's in-plane
    // orientation for this acquisition. Note this figure's y axis is already
    // `autorange: "reversed"`, which is why it needs a different net transform
    // from the VFA/MP2RAGE brains. Display only — applied after the fit, so it
    // cannot affect any fitted value.
    var orient = function (z) { return rot90ccw(z); };
    var images = FIG25_TI.map(function (_, k) { return orient(toGrid(data, nx, ny, k, nt)); });
    var t1Grid = orient(toGrid(t1Ms, nx, ny, 0, 1));

    // Explicit black→white ramp: Plotly's named "Greys" runs light→dark, which
    // would render the images as negatives.
    var GRAY = [[0, "rgb(0,0,0)"], [1, "rgb(255,255,255)"]];
    var traces = images.map(function (z, k) {
      return { type: "heatmap", z: z, colorscale: GRAY, showscale: false,
               visible: k === 2, name: "Signal", hoverinfo: "skip",
               xaxis: "x", yaxis: "y" };
    });
    traces.push({ type: "heatmap", z: t1Grid, colorscale: "Portland", visible: true,
                  name: "T1 (ms)", zmin: 0, zmax: 3000, xaxis: "x2", yaxis: "y2",
                  colorbar: { title: { text: "T<sub>1</sub> (ms)", side: "top",
                                       font: { family: TNR, size: 16 } },
                              thickness: 12, len: 0.9, x: 1.02 },
                  hovertemplate: "T<sub>1</sub> = %{z:.0f} ms<extra></extra>" });

    var blank = { showgrid: false, zeroline: false, showticklabels: false, ticks: "" };
    Plotly.newPlot("fig25", traces, {
      width: 620, height: 470, margin: { t: 40, r: 90, b: 60, l: 30 },
      annotations: [
        axisTitle("MR Image", 0.10, 1.10, 22, false),
        axisTitle("T<sub>1</sub> map", 0.66, 1.10, 22, false)
      ],
      xaxis: Object.assign({ domain: [0, 0.46] }, blank),
      yaxis: Object.assign({ domain: [0, 1], scaleanchor: "x", autorange: "reversed" }, blank),
      xaxis2: Object.assign({ domain: [0.52, 0.98], anchor: "y2" }, blank),
      yaxis2: Object.assign({ domain: [0, 1], anchor: "x2", scaleanchor: "x2",
                              autorange: "reversed" }, blank),
      updatemenus: [{
        active: 2, x: 0.10, xanchor: "left", y: -0.14, yanchor: "bottom", direction: "up",
        font: { family: TNR, size: 15 },
        buttons: FIG25_TI.map(function (t, k) {
          return { label: Math.round(t * 1000) + " ms", method: "update",
                   args: [{ visible: [0, 1, 2, 3].map(function (j) { return j === k; }).concat([true]) }] };
        })
      }],
      plot_bgcolor: "white", paper_bgcolor: "white"
    }, PLOT_CONFIG);

    return fitted.length;
  }

  // ── Figure 2.6 — Monte Carlo precision against TR ────────────────────────

  /** `seed` varies per TR so each TR is an independent set of realizations;
      reusing one seed would correlate the noise across the sweep and put
      structure in the mean-T1 curve that is an artefact of the RNG. */
  function monteCarlo(tr, ti, t1, m0, snr, trials, seed) {
    var ab = raRb(m0, tr, t1);
    var cfg = recipe(ti, "magnitude") +
      "sim:\n" +
      "  params: { T1: " + t1 + ", a: " + ab.a + ", b: " + ab.b + " }\n" +
      "  noise: { type: rician, snr: " + snr + " }\n" +
      "  trials: " + trials + "\n" +
      "  seed: " + seed + "\n";
    var r = JSON.parse(wasm_bindgen.sim("single-voxel", cfg));
    var t1Stat = r.stats.filter(function (s) { return s.name === "T1"; })[0];
    return { mean: r.signal_mean, std: r.signal_std, t1Mean: t1Stat.mean, t1Std: t1Stat.std };
  }

  function buildFig26(report) {
    var T1 = num("f26t1", "T1", 1, 20000, true) / 1000;
    var SNR = num("f26snr", "SNR", 0.1, 10000);
    var TRIALS = num("f26trials", "Trials", 2, 20000, true);
    var NTI = num("f26nti", "TIs per TR", 3, 200, true);
    var trStart = num("f26trstart", "TR start", 1, 60000, true);
    var trStep = num("f26trstep", "TR step", 1, 60000, true);
    var trCount = num("f26trcount", "TR count", 1, 200, true);
    var M0 = 1;

    var trs = msGrid(trStart, trStep, trCount);
    var lowres = [], highres = [], noiseless = [], mc = [];
    trs.forEach(function (TR, i) {
      if (report) { report("Monte Carlo: TR " + (i + 1) + " of " + trs.length + "…"); }
      // qMRLab: TI_lowres = linspace(0.05, TR, 6) — in ms, so 0.05 ms up to TR.
      var tiLow = linspace(0.00005, TR, NTI);
      var tiHigh = linspace(0.00005, TR, 500);
      lowres.push(tiLow);
      highres.push(tiHigh);
      var ab = raRb(M0, TR, T1);
      noiseless.push(forward(recipe(tiHigh, "magnitude"), T1, ab.a, ab.b));
      mc.push(monteCarlo(TR, tiLow, T1, M0, SNR, TRIALS, i + 1));
    });

    var n = trs.length;
    var active = Math.min(28, n - 1);             // TR = 3800 ms in the published defaults
    var traces = [];
    trs.forEach(function (TR, i) {
      traces.push({ visible: i === active, x: highres[i], y: noiseless[i], mode: "lines",
                    line: { color: "rgb(247, 152, 19)" },
                    name: "Noiseless signal", text: "Noiseless signal", hoverinfo: "x+y+text" });
    });
    trs.forEach(function (TR, i) {
      traces.push({ visible: i === active, x: lowres[i], y: mc[i].mean, mode: "markers",
                    error_y: { type: "data", color: "rgb(22, 96, 167)", array: mc[i].std, visible: true },
                    line: { color: "rgb(22, 96, 167)", dash: "dot" },
                    marker: { color: "rgb(22, 96, 167)" },
                    name: "Monte Carlo simulated signal", text: "Monte Carlo simulated signal",
                    hoverinfo: "x+y+text" });
    });
    // The summary panel is the same at every slider step: it is the sweep.
    traces.push({ visible: true, x: trs, y: mc.map(function (m) { return m.t1Mean * 1000; }),
                  name: "Mean T<sub>1</sub> (ms)", text: "Mean T<sub>1</sub> (ms)",
                  hoverinfo: "x+y+text", xaxis: "x2", yaxis: "y2" });
    traces.push({ visible: true, x: trs, y: mc.map(function (m) { return m.t1Std * 1000; }),
                  line: { color: "rgb(222, 22, 22)" },
                  name: "STD T<sub>1</sub> (ms)", text: "STD T<sub>1</sub> (ms)",
                  hoverinfo: "x+y+text", xaxis: "x2", yaxis: "y3" });

    var sliders = buildSlider("TR value (ms): <b>", active,
                              trs.map(function (t) { return String(Math.round(t * 1000)); }),
                              traces.length, [group(0, n), group(n, n)]);
    sliders[0].steps.forEach(function (step) {
      step.args[1][2 * n] = true;
      step.args[1][2 * n + 1] = true;
    });

    var trMax = trs[trs.length - 1];
    // The TR sweep is an inset inside the signal plot, as published.
    var inset = { showgrid: false, mirror: true, ticks: "inside", showline: true,
                  linecolor: "black", tickfont: { size: 10 } };
    Plotly.newPlot("fig26", traces, {
      width: 560, height: 620, margin: { t: 115, r: 30, b: 100, l: 80 },
      annotations: [
        axisTitle("Inversion Time – TI (s)", 0.5004254919715793, -0.17, 22, false),
        axisTitle("Signal (magnitude)", -0.15, 0.5, 22, true),
        axisTitle("<b>TR (s)</b>", 0.70, 0.78, 13, false),
        axisTitle("<b>Mean T<sub>1</sub> (ms)</b>", 0.40, 0.34, 13, true),
        axisTitle("<b>STD T<sub>1</sub> (ms)</b>", 1.00, 0.34, 13, true)
      ],
      xaxis: axis({ autorange: false, range: [0, trMax] }),
      yaxis: axis({ autorange: false, range: [0, 1] }),
      xaxis2: Object.assign({ domain: [0.5, 0.90], anchor: "y2", side: "top" }, inset),
      yaxis2: Object.assign({ domain: [0.05, 0.65], anchor: "x2" }, inset),
      yaxis3: Object.assign({ domain: [0.05, 0.65], anchor: "x2",
                              overlaying: "y2", side: "right" },
                            inset, { mirror: false }),
      legend: Object.assign(legendBox(0.28, 1.03), { yanchor: "bottom" }),
      sliders: sliders, plot_bgcolor: "white", paper_bgcolor: "white"
    }, PLOT_CONFIG);
  }

  // ── Boot ─────────────────────────────────────────────────────────────────

  // Registered with the shared runner in the page shell, which initialises the
  // wasm module once and drives every figure on the page in order.
  // page 2's `wirePanel` takes the panel id too; match that shape.
  window.QMRUST_WIRE_PANEL = window.QMRUST_WIRE_PANEL || function (panelId, buttonId, statusId, build) {
    document.getElementById(panelId).hidden = false;
    wirePanel(buttonId, statusId, build);
  };
  window.QMRUST_FIGURES = (window.QMRUST_FIGURES || []).concat([
    ["2.2", buildFig22, "f22panel", "f22run", "f22status"],
    ["2.3", buildFig23, "f23panel", "f23run", "f23status"],
    ["2.4", buildFig24, "f24panel", "f24run", "f24status"],
    ["2.5", function () {
      var voxels = buildFig25();
      $("fig25note").textContent =
        voxels + " masked voxels fitted with Barral RD-NLS in the browser.";
    }, null, null, null],
    ["2.6", buildFig26, "f26panel", "f26run", "f26status"]
  ]);
})();
