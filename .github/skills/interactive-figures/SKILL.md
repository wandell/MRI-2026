---
name: interactive-figures
description: Use this when creating, modifying, embedding, or debugging client-side interactive figures and WebAssembly (qMRust) simulations in Quarto book chapters.
---

# Interactive Figures with Quarto and WebAssembly

## Summary

This project embeds interactive, client-side scientific simulations directly into the book's chapters (such as `ch10-inversion-recovery.qmd`). Readers can manipulate parameters (e.g., via sliders) and observe the results of MRI physics equations updated in real time. 

All computation runs entirely in the reader's web browser without a server-side computational kernel by leveraging **WebAssembly (Wasm)**, **JavaScript**, and **Plotly.js**.

---

## Core Components & Architecture

1. **WebAssembly (Wasm)**: Heavy MRI signal equations and fitting calculations are written in Rust (`qMRust`) and compiled to WebAssembly (`.wasm`). The binary runs at near-native speed directly in the browser.
2. **JavaScript ("Glue" Layer)**: 
   - Initializes the Wasm module.
   - Sets up UI listeners (sliders, numeric inputs, buttons).
   - Calls the Wasm functions with new parameters.
   - Formats data returned by Wasm and passes it to Plotly.
3. **Plotly.js**: JavaScript charting library (`chapters/interactive/plotly-cartesian.min.js`) for fast interactive 2D line and heatmap renderings.
4. **Quarto Includes**: Interactive figures are modularized in separate `.qmd` files inside `chapters/includes/` (e.g., `fig-t1-equations.qmd`, `fig-qmrlab-demo.qmd`) and embedded into chapters using `{{< include "includes/fig-name.qmd" >}}`.
5. **Static Assets & Quarto Resources**: The Wasm and JS assets live in `chapters/interactive/`. Because JavaScript loads `.wasm` files dynamically via runtime path strings, Quarto's static scanner cannot discover them automatically. They must be registered in `_quarto.yml` under `resources`.

---

## Authoring Rules & Patterns

### 1. HTML vs. PDF Format Conditioning
Interactive figures cannot run in PDF or print formats. Always wrap the include content in format-conditional blocks:

```qmd
::: {.content-visible when-format="html"}

<!-- HTML layout, Plotly divs, and scripts here -->

:::

::: {.content-visible when-format="pdf"}
*Interactive figure — available in the HTML edition only.*
:::
```

### 2. Captions and Cross-References
- **Do NOT put captions inside the `.qmd` include file.** Placing a `<p class="caption">` or markdown caption inside the include will cause duplicate captions or broken numbering.
- **Always wrap the include in a Quarto figure div (`:::: {#fig-...}`) in the parent chapter file**:

```qmd
:::: {#fig-ch10-ti-contrast}
{{< include "includes/fig-qmrlab-demo.qmd" >}}

Left: longitudinal magnetization for three tissues... Right: the inversion-recovery image...
::::
```

### 3. Asset Paths in HTML and JavaScript
When referencing stylesheets, scripts, or `.wasm` binaries inside an include file or script, use paths relative to the rendered book root (`interactive/...`), not `../interactive/` or `chapters/interactive/`:

```html
<link rel="stylesheet" href="interactive/figures.css">
<script src="interactive/plotly-cartesian.min.js"></script>
<script src="interactive/qmrust_wasm.js"></script>
```

```javascript
wasm_bindgen({ module_or_path: "interactive/qmrust_wasm_bg.wasm" })
```

### 4. Shared Asset Loading & Global Scope Protection
When multiple interactive figures appear on the same chapter page:
- `qmrust_wasm.js` declares `let wasm_bindgen` at the top level. Loading this file a second time on the same page triggers a JavaScript `SyntaxError` (redeclaration in global lexical scope) which will halt subsequent scripts.
- Only load shared libraries (`plotly-cartesian.min.js`, `qmrust_wasm.js`, `figures.css`) in the first figure on a page, or share state through common helper modules like `chapters/interactive/ir-shared.js`.
- Wrap figure scripts in immediately invoked function expressions (IIFEs) `(function () { "use strict"; ... })();` to avoid polluting the global namespace.

---

## Step-by-Step Implementation Workflow

1. **Computation (Rust / Wasm)**:
   - Implement MRI physics or signal equations in Rust (or reuse existing `qMRust` functions).
   - Compile to WebAssembly using `wasm-pack`:
     ```bash
     wasm-pack build --target web --out-dir <output-dir>
     ```
   - Place the compiled `.wasm` and loader `.js` files in `chapters/interactive/`.

2. **UI & Shared Logic (JavaScript & CSS)**:
   - Create any reusable helper utilities (e.g., `chapters/interactive/ir-shared.js`) for data mapping, color scales, or grid manipulation.
   - Define figure layout styling in `chapters/interactive/figures.css`.

3. **Figure Include File (`chapters/includes/fig-<topic>.qmd`)**:
   - Create a modular `.qmd` include containing the HTML UI elements, Plotly target `<div>`s, format-conditional blocks, and the orchestration script.

4. **Quarto Configuration (`_quarto.yml`)**:
   - Ensure `chapters/interactive/` is listed under `project.resources` so Quarto copies the `.wasm` and JS assets to the output directory:
     ```yaml
     project:
       type: book
       resources:
         - chapters/interactive/
     ```

5. **Chapter Embedding**:
   - In `chapters/chXX-<name>.qmd`, embed the figure inside a Quarto figure div (`:::: {#fig-...}`) with a descriptive caption.

---

## Source Material and Licensing

The interactive figures and the underlying `qMRust` library were contributed by Mathieu Boudreau and are based on the qMRLab mOOC (Massive Open Online Course).

Per Mathieu Boudreau's communication:
> "All of our qMRI mOOC materials (site: https://qmrlab.org/mooc/, repo: https://github.com/qMRLab/mooc) are licensed free for reuse, this includes text, figures, and code."

- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Attribution**: Include attribution in figure captions and retain third-party notices in `THIRD-PARTY-NOTICES.md`.
- **Future Expansions**: The qMRLab mOOC repository contains additional quantitative MRI interactive modules (e.g., diffusion imaging, relaxometry, magnetization transfer) that can be adapted into future chapters using this pattern.
