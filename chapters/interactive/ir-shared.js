/* Shared scaffolding for the inversion-recovery figures in ch10.
 *
 * Two figures on that page draw the same brain from the same fitted T1 map, so
 * the recalibration below has to agree between them. It lived inside one
 * figure's IIFE originally; a second copy would have meant two ANCHOR tables
 * that could drift apart and put the two images on the page in disagreement
 * about what tissue a voxel is.
 *
 * Depends on qmrust_wasm.js (for wasm_bindgen) and data-t1map.js (for T1MAP),
 * both of which the page must have loaded first.
 *
 * Licences for the vendored qMRust and Plotly files in this directory, and for
 * the mOOC material the ch10 text draws on, are in THIRD-PARTY-NOTICES.md.
 */
window.IR = (function () {
  "use strict";

  /* The VFA fit of this dataset reads high, and not by a constant factor:
     k-means (k=3) over its 4668 fitted voxels gives 1.12 / 1.85 / 3.57 s where
     3 T literature is about 0.90 / 1.35 / 4.00 s. VFA's bias grows with T1, so
     a single multiplier cannot fix both ends -- it would leave CSF near 2.9 s.
     Instead the map is warped through those three control points with a
     monotonic piecewise-linear curve, which is what a T1-dependent calibration
     actually looks like. The curve values below are the anchors themselves, so
     the nulls on the curves still mark where the image goes dark.
     This is a pedagogical recalibration, not the raw fit. */
  var ANCHOR = [                    // [fitted, target] in seconds
    [0.00, 0.00],
    [1.12, 0.90],                   // white matter
    [1.85, 1.35],                   // grey matter
    [3.57, 4.00]                    // CSF
  ];

  function remapT1(x) {
    for (var i = 1; i < ANCHOR.length; i++) {
      if (x <= ANCHOR[i][0]) {
        var x0 = ANCHOR[i-1][0], y0 = ANCHOR[i-1][1];
        var x1 = ANCHOR[i][0],   y1 = ANCHOR[i][1];
        return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
      }
    }
    var n = ANCHOR.length - 1;      // extrapolate along the last segment
    var sx0 = ANCHOR[n-1][0], sy0 = ANCHOR[n-1][1];
    var sx1 = ANCHOR[n][0],   sy1 = ANCHOR[n][1];
    return sy1 + (sy1 - sy0) / (sx1 - sx0) * (x - sx1);
  }

  var TISSUES = [
    { label: "White matter",        T1: ANCHOR[1][1] },
    { label: "Grey matter",         T1: ANCHOR[2][1] },
    { label: "Cerebrospinal fluid", T1: ANCHOR[3][1] }
  ];

  /* ---- thin qmrust wrappers (recipe/forward are private to app-ir.js) ------
     `method` is "complex" for signed longitudinal magnetization and
     "magnitude" for its absolute value -- the difference the reader is being
     shown when a magnitude image folds the recovery upward. */
  function recipe(ti, method) {
    return "model: inversion_recovery\nmethod: " + method + "\n" +
           "inversion_times: [" + ti.map(String).join(", ") + "]\n";
  }
  function forward(cfg, t1, a, b) {
    return JSON.parse(wasm_bindgen.forward(cfg, new Float64Array([t1, a, b]), "", ""))
             .map(function (s) { return s.value; });
  }

  function decodeBase64(b64) {
    var bin = atob(b64), n = bin.length, out = new Uint8Array(n);
    for (var i = 0; i < n; i++) { out[i] = bin.charCodeAt(i); }
    return out;
  }

  function grid(flat, nx, ny, offset, stride) {
    var out = new Array(ny);
    for (var i = 0; i < ny; i++) {
      var row = new Array(nx);
      for (var j = 0; j < nx; j++) { row[j] = flat[offset + (j * ny + (ny - 1 - i)) * stride]; }
      out[i] = row;
    }
    return out.reverse().map(function (r) { return r.reverse(); });
  }

  function linspace(a, b, n) {
    var o = new Array(n), d = (b - a) / (n - 1);
    for (var i = 0; i < n; i++) { o[i] = a + i * d; }
    return o;
  }

  function axis(extra) {
    return Object.assign({ showline: true, linecolor: "black", mirror: false,
      ticks: "outside", tickfont: { family: "Times New Roman", size: 13 },
      zeroline: false }, extra || {});
  }

  /* The acquisition FOV is mostly empty around the head. Crop to the mask's
     bounding box so the brain fills the panel rather than a black border. */
  function computeBBox(maskArr, nx, ny) {
    var m = grid(maskArr, nx, ny, 0, 1), pad = 2;
    var r0 = 1e9, r1 = -1, c0 = 1e9, c1 = -1;
    for (var i = 0; i < m.length; i++) {
      for (var j = 0; j < m[i].length; j++) {
        if (m[i][j]) {
          if (i < r0) r0 = i;
          if (i > r1) r1 = i;
          if (j < c0) c0 = j;
          if (j > c1) c1 = j;
        }
      }
    }
    if (r1 < 0) { return null; }
    return { r0: Math.max(0, r0 - pad), r1: Math.min(m.length - 1, r1 + pad),
             c0: Math.max(0, c0 - pad), c1: Math.min(m[0].length - 1, c1 + pad) };
  }

  /* The VFA fit is not redone here. utility/precompute-t1map.js runs the same
     qMRust fit_volume offline and writes interactive/data-t1map.js, so the page
     loads 47 kB of fitted T1 rather than 277 kB of raw VFA volume. It arrives as
     raw fitted T1 in seconds, float32, masked voxels only in flat-index order;
     the recalibration above stays in this file, where it is visible and can be
     retuned for both figures at once. */
  function loadT1Map() {
    var nx = T1MAP.dims[0], ny = T1MAP.dims[1];
    var maskArr = decodeBase64(T1MAP.mask);
    var fit = new Float32Array(decodeBase64(T1MAP.t1).buffer);
    var T1map = new Float64Array(nx * ny);
    for (var v = 0, k = 0; v < T1map.length; v++) {
      if (maskArr[v]) { T1map[v] = remapT1(fit[k++]); }
    }
    return { T1map: T1map, mask: maskArr, nx: nx, ny: ny,
             bbox: computeBBox(maskArr, nx, ny) };
  }

  function cropGrid(g, bbox) {
    if (!bbox) { return g; }
    return g.slice(bbox.r0, bbox.r1 + 1).map(function (row) {
      return row.slice(bbox.c0, bbox.c1 + 1);
    });
  }

  return { ANCHOR: ANCHOR, remapT1: remapT1, TISSUES: TISSUES,
           recipe: recipe, forward: forward,
           decodeBase64: decodeBase64, grid: grid, cropGrid: cropGrid,
           linspace: linspace, axis: axis,
           loadT1Map: loadT1Map, computeBBox: computeBBox };
})();
