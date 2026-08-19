#!/usr/bin/env node
/* Input data lives beside this script rather than in chapters/interactive/,
   which Quarto publishes wholesale: data-vfa.js is only ever read here, so
   shipping its 277 kB to every reader bought nothing.

   Precompute the VFA T1 map that chapters/includes/fig-qmrlab-demo.qmd used to
   fit in the browser on every page load.

   The figure only ever needs the fitted T1 per voxel, so the fit is done once
   here -- with the same qMRust WebAssembly build the page loads -- and written
   as a small lookup table the page reads directly. This drops the 284 kB VFA
   volume from the page and removes the per-load fit.

   Usage:  node utility/precompute-t1map.js
   Writes: chapters/interactive/data-t1map.js  (override with argv[2])

   The fitted values are stored raw, in seconds. The pedagogical
   recalibration onto literature T1 values stays in the figure's own script,
   where it is visible and easy to retune without re-running this.            */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INTERACTIVE = path.join(ROOT, "chapters", "interactive");
const OUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(INTERACTIVE, "data-t1map.js");

/** Evaluate a browser <script> file in Node and hand back one of its globals. */
function loadScript(file, symbol) {
  const src = fs.readFileSync(file, "utf8");
  return new Function(src + "\n;return " + symbol + ";")();
}

function decodeBase64(b64) {
  const bin = atob(b64), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) { out[i] = bin.charCodeAt(i); }
  return out;
}

(async function main() {
  const wasm_bindgen = loadScript(path.join(INTERACTIVE, "qmrust_wasm.js"), "wasm_bindgen");
  const VFA = loadScript(path.join(__dirname, "data-vfa.js"), "VFA");

  await wasm_bindgen({
    module_or_path: fs.readFileSync(path.join(INTERACTIVE, "qmrust_wasm_bg.wasm"))
  });

  /* --- identical to the fit the page used to run ------------------------- */
  const nx = VFA.dims[0], ny = VFA.dims[1], nt = VFA.dims[3];
  const data = new Float64Array(new Float32Array(decodeBase64(VFA.data).buffer));
  const b1   = new Float64Array(new Float32Array(decodeBase64(VFA.b1).buffer));
  const mask = decodeBase64(VFA.mask);
  const cfg  = "model: vfa_t1\nflip_angles: [" + VFA.flip_angles.join(", ") +
               "]\nrepetition_time: " + VFA.tr + "\n";
  const ids  = JSON.stringify(VFA.flip_angles.map((a) => ({ FlipAngle: a })));

  const t0 = performance.now();
  const maps = wasm_bindgen.fit_volume(cfg, data, new Uint32Array([nx, ny, 1, nt]), ids,
                                       mask, JSON.stringify({ B1map: Array.from(b1) }), "");
  const T1 = (maps instanceof Map) ? maps.get("T1") : maps.T1;
  const ms = performance.now() - t0;

  /* --- pack --------------------------------------------------------------
     Only the masked voxels are kept, in flat-index order, as float32 seconds.
     Storing the brain rather than the whole 128x128 FOV is most of the saving,
     and float32 is fine enough that every voxel lands in the same T1 bin the
     in-page fit put it in. 0 marks a voxel inside the mask with no usable fit. */
  const N = nx * ny;
  let nMask = 0;
  for (let v = 0; v < N; v++) { if (mask[v]) { nMask++; } }
  const packed = new Float32Array(nMask);
  let fitted = 0, k = 0;
  for (let v = 0; v < N; v++) {
    if (!mask[v]) { continue; }
    const t = T1[v];
    const ok = Number.isFinite(t) && t > 0;
    packed[k++] = ok ? t : 0;
    if (ok) { fitted++; }
  }

  const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString("base64");
  const payload = {
    dims: [nx, ny],
    units: "s",
    note: "raw VFA fit, float32 little-endian, masked voxels only in flat-index order; 0 = no fit",
    source: "chapters/interactive/data-vfa.js via utility/precompute-t1map.js",
    t1: b64(packed),
    mask: b64(mask)
  };
  fs.writeFileSync(OUT, "var T1MAP = " + JSON.stringify(payload) + ";\n");

  /* --- report ------------------------------------------------------------ */
  const vals = Array.from(packed).filter((x) => x > 0).sort((a, b) => a - b);
  const pct = (p) => vals[Math.floor(p * (vals.length - 1))];
  console.log("fit_volume: " + ms.toFixed(0) + " ms in Node");
  console.log("voxels fitted: " + fitted + " of " + nMask + " masked, in a " +
              nx + "x" + ny + " FOV");
  console.log("T1 s  min " + pct(0).toFixed(2) + "  p50 " + pct(0.5).toFixed(2) +
              "  p95 " + pct(0.95).toFixed(2) + "  max " + pct(1).toFixed(2));
  console.log("wrote " + path.relative(ROOT, OUT) + "  (" +
              (fs.statSync(OUT).size / 1024).toFixed(0) + " kB, replacing 277 kB of VFA data)");
})();
