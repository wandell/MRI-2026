---
name: mri-applications
description: Enforce scientifically calibrated interpretation when drafting, editing, or revising MRI application content, including clinical examples, neurological case studies, diagnosis, biomarkers, segmentation, surface reconstruction, visualization, and translational claims.
---

# MRI Applications

## Canonical Notation & Variables

- Name the measurement and image contrast before the clinical interpretation: for example, “T2-weighted FLAIR hyperintensity,” “diffusion-weighted signal,” “ADC map,” or “BOLD contrast.” Specify voxel size in mm and effect or diagnostic uncertainty with CI where available.
- Use sensitivity $=\mathrm{TP}/(\mathrm{TP}+\mathrm{FN})$, specificity $=\mathrm{TN}/(\mathrm{TN}+\mathrm{FP})$, and positive predictive value $=\mathrm{TP}/(\mathrm{TP}+\mathrm{FP})$. State the population/prevalence for predictive values.
- For surfaces, distinguish vertices, faces, meshes, and cortical surfaces; retain the coordinate space and interpolation/resampling method.

## Core Scientific Models & Assumptions

- Separate image finding, measurement/model estimate, and clinical conclusion. MRI findings are often non-specific and must be interpreted with history, examination, acquisition quality, and appropriate reference standards.
- Distinguish diagnostic accuracy, prognostic performance, and mechanistic explanation. A group difference or classifier accuracy does not establish individual-level clinical utility.
- Treat segmentation, registration, flattening, and visualization as transformations with failure modes. Surface maps and thresholded statistical images should expose preprocessing, thresholding, color-scale, and anatomical-reference choices.
- When discussing lesions or rare cases, avoid generalizing causal function from one patient without acknowledging lesion extent, reorganization, and convergent evidence.

## Terminology Safeguards

Do use: “imaging finding,” “differential diagnosis,” “reference standard,” “biomarker candidate,” “external validation,” “segmentation error,” and “thresholded statistical map.”

Don't use: “MRI diagnosis” when MRI is only one input, “normal scan” as proof of no disease, “biomarker” for an unvalidated association, “connectivity” for a visualization alone, or “brain area lights up.”

## Key Equations & Diagrams

```latex
\mathrm{Sensitivity}=\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FN}},\qquad
\mathrm{Specificity}=\frac{\mathrm{TN}}{\mathrm{TN}+\mathrm{FP}},\qquad
\mathrm{PPV}=\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FP}}.

\mathrm{Dice}(A,B)=\frac{2|A\cap B|}{|A|+|B|}.
```

For application figures, show the source image, processing/measurement step, and interpretation separately; label orientation, scale, color bar, threshold, and uncertainty or caveat.
