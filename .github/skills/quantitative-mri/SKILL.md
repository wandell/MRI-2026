---
name: quantitative-mri
description: Enforce scientific accuracy when drafting, editing, or revising quantitative MRI content on relaxometry, magnetization transfer, ASL, QSM, VASO, multi-echo imaging, MR fingerprinting, high-field MRI, macromolecular tissue volume, and g-ratio models.
---

# Quantitative MRI

## Canonical Notation & Variables

- Reserve “quantitative MRI” for an estimate with physical units or a defined quantitative index, a stated forward model, and calibration/correction assumptions. Use $T_1,T_2,T_2^*$ in s or ms; $R_1,R_2,R_2^*$ in $\mathrm{s^{-1}}$.
- Use proton-density-related quantities with explicit scale and corrections. Use susceptibility $\chi$ in ppm (state reference) and CBF in $\mathrm{mL\,100\,g^{-1}\,min^{-1}}$. State the unit and reference for every map color bar.
- Use $\mathrm{MVF}$ for myelin volume fraction, $\mathrm{AVF}$ for axonal volume fraction, and $g$ for aggregate g-ratio only after defining the model. Do not reuse $g$ for a gradient direction in the same section.

## Core Scientific Models & Assumptions

- Separate parameter mapping from tissue specificity. A relaxation rate, MT-derived index, susceptibility estimate, or fingerprinting-derived parameter can be sensitive to several tissue properties and acquisition confounds.
- State acquisition, signal model, fitting method, corrections, and uncertainty. Inversion efficiency, transmit/receive field inhomogeneity, motion, partial volume, exchange, and model mismatch are not optional footnotes when they materially affect an estimate.
- Describe ASL as labeled-water perfusion imaging and QSM as a field-to-susceptibility inverse problem. Present high-field MRI as increased potential SNR and contrast together with shortened RF wavelength, $B_0/B_1$ inhomogeneity, SAR, and susceptibility challenges.
- Do not label an aggregate g-ratio as the microscopic g-ratio of any individual axon.

## Terminology Safeguards

Do use: “parameter estimate,” “quantitative index,” “model-derived map,” “sensitivity,” “specificity,” “calibration,” and “reference tissue/scale.”

Don't use: “quantitative means ground truth,” “myelin map” for a nonspecific measure, “perfusion equals blood flow” without ASL model context, “QSM directly images iron,” or “higher field is simply better.”

## Key Equations & Diagrams

```latex
S(\mathrm{TE})=S_0e^{-\mathrm{TE}/T_2^*},\qquad R_2^*=1/T_2^*.

\Delta\omega(\mathbf r)=\gamma B_0\,[d\ast\chi](\mathbf r),
\qquad
g=\sqrt{\frac{1}{1+\mathrm{MVF}/\mathrm{AVF}}}.
```

For quantitative-map figures, pair the map with parameter units, reference scale, fit/model diagram, and at least one major confound or uncertainty cue.
