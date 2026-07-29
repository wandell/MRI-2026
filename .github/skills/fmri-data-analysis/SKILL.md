---
name: fmri-data-analysis
description: Enforce scientific accuracy when drafting, editing, or revising fMRI analysis content on experimental design, preprocessing, general linear models, effect sizes, statistical inference, signal detection, ROC curves, and visualization.
---

# fMRI Data Analysis

## Canonical Notation & Variables

- Use $\mathbf y\in\mathbb R^T$ for a voxel/vertex time series, $\mathbf X\in\mathbb R^{T\times p}$ for the design matrix, $\boldsymbol\beta$ for coefficients, and $\boldsymbol\varepsilon$ for residuals. Define rows as time points and columns as regressors.
- State temporal sampling as TR (s), effect size as percent signal change or model coefficient with units, and uncertainty as SE, CI, or SD—never bare “error bars.”
- Use hit rate $H$, false-alarm rate $F$, criterion $c$, discriminability $d'$, and AUC only after defining the classification target and independent observations.

## Core Scientific Models & Assumptions

- State the GLM assumptions relevant to the claim: specified design, residual structure, temporal filtering, nuisance model, contrast, and inferential unit. Convolution with a canonical HRF is a modeling choice, not proof of a neural response.
- Separate prediction, estimation, and hypothesis testing. A small $p$-value does not quantify effect magnitude, scientific importance, replication probability, or diagnostic performance.
- Avoid circular analysis: define regions/features independently of the effect tested, or explicitly label the analysis descriptive/exploratory. Account for multiplicity when many voxels, contrasts, or models are tested.

## Terminology Safeguards

Do use: “regressor,” “contrast,” “residual,” “effect estimate,” “confidence interval,” “false-positive rate,” and “out-of-sample evaluation.”

Don't use: “the null is accepted,” “statistically insignificant means no effect,” “significant voxel equals active voxel,” “accuracy” without a denominator and validation scheme, or “correlation proves decoding.”

## Key Equations & Diagrams

```latex
\mathbf y=\mathbf X\boldsymbol\beta+\boldsymbol\varepsilon,
\qquad
\widehat{\boldsymbol\beta}=(\mathbf X^\mathsf T\mathbf X)^{-1}\mathbf X^\mathsf T\mathbf y,
\qquad
t=\frac{\mathbf c^\mathsf T\widehat{\boldsymbol\beta}}
{\sqrt{\widehat{\sigma}^2\mathbf c^\mathsf T(\mathbf X^\mathsf T\mathbf X)^{-1}\mathbf c}}.

d'=Z(H)-Z(F),\qquad \mathrm{AUC}=P(s_+>s_-).
```

Draw a design matrix with labeled task, nuisance, and intercept columns; show the contrast separately. For ROC figures, label both axes and the decision criterion.
