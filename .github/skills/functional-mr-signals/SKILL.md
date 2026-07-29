---
name: functional-mr-signals
description: Enforce scientific accuracy when drafting, editing, or revising content about BOLD fMRI, neurovascular coupling, hemodynamics, electrophysiology, energy use, and the interpretation of functional MR signals.
---

# Functional MR Signals

## Canonical Notation & Variables

- Use BOLD for blood-oxygenation-level-dependent contrast, $S(t)$ for MR signal, $\Delta S/S_0$ for fractional signal change, and percent signal change only as $100\Delta S/S_0\,\%$.
- Use CBF, CBV, and $\mathrm{CMRO_2}$ for flow, blood volume, and oxygen metabolism; use $q$, $v$, and $f$ for normalized deoxyhemoglobin content, venous volume, and flow only after defining their baseline normalization.
- Use $R_2^*$ in $\mathrm{s^{-1}}$ and TE in ms or s. Do not use “oxygenation” where the meaning is blood oxygen saturation, deoxyhemoglobin concentration, or BOLD contrast.

## Core Scientific Models & Assumptions

- Treat BOLD as an indirect, hemodynamically mediated signal with contributions from baseline physiology, vascular architecture, sequence parameters, and neural activity. It is neither a direct measure of spikes nor a universal measure of “activation.”
- State the assumed temporal model: a linear time-invariant HRF is a useful approximation for many designs, not a biological law. Note possible nonlinearities, region/subject differences, and vascular confounds.
- Describe neurovascular coupling as an empirical relationship among neural activity, metabolism, and vascular response; avoid a single-causal-cell narrative.

## Terminology Safeguards

Do use: “BOLD response,” “task-evoked signal change,” “hemodynamic response,” “neural correlate,” and “vascular contribution.”

Don't use: “brain activity” as a synonym for BOLD, “oxygenated blood causes the signal,” “BOLD measures neurons firing,” or “negative BOLD means inhibition” without specific evidence.

## Key Equations & Diagrams

```latex
\Delta R_2^*=-\frac{1}{\mathrm{TE}}\ln\!\left(\frac{S(\mathrm{TE})}{S_0(\mathrm{TE})}\right),
\qquad
y(t)=\beta\,[u*h](t)+\varepsilon(t).
```

For the balloon model, define every normalized state and parameter before displaying equations; depict the chain as neural/metabolic processes → vascular dynamics → susceptibility-weighted MR signal, with uncertainty indicated.
