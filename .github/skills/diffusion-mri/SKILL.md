---
name: diffusion-mri
description: Enforce scientific accuracy when drafting, editing, or revising diffusion MRI content on diffusion weighting, b-values and b-vectors, ADC, DTI, multicompartment models, tractography, white-matter fascicles, and model reliability.
---

# Diffusion MRI

## Canonical Notation & Variables

- Use $S(b,\mathbf g)$ for diffusion-weighted signal, $S_0$ for the corresponding unweighted signal, $b$ in $\mathrm{s/mm^2}$, and unit gradient direction $\mathbf g$. Retain b-values and b-vectors as acquisition metadata, with their coordinate convention documented.
- Use diffusion coefficient $D$ or ADC in $\mathrm{mm^2/s}$; use tensor $\mathbf D$ as symmetric positive semidefinite. Define FA as dimensionless and report streamline counts as algorithm-dependent counts, not tissue quantities.
- Use “fascicle” for a coherent axon bundle when anatomy is intended; use “streamline” for a tractography path.

## Core Scientific Models & Assumptions

- State that DW signal attenuation reflects water displacement under a specific encoding sequence and is sensitive to microstructure, not a direct image of axons or myelin. “Restricted diffusion” is model- and time-scale-dependent.
- Present DTI as a Gaussian single-tensor approximation per voxel. It cannot resolve multiple orientations reliably in crossing-fiber regions; FA is not a specific measure of axon count, myelin, or integrity.
- Treat tractography as a model-based reconstruction of plausible pathways, subject to false positives and false negatives. Do not equate a streamline with an individual axon, synapse, or proven anatomical connection.

## Terminology Safeguards

Do use: “diffusion-weighted,” “orientation distribution,” “intravoxel crossing,” “model fit,” “tractography estimate,” and “fascicle segmentation.”

Don't use: “diffusion direction” for a b-vector without qualification, “fiber” when the evidence is voxel-scale orientation, “tractography proves connectivity,” “isotropic voxel means isotropic tissue,” or “FA measures white-matter integrity.”

## Key Equations & Diagrams

```latex
S(b)=S_0e^{-b\,\mathrm{ADC}},\qquad
S(b,\mathbf g)=S_0\exp\!\left(-b\,\mathbf g^\mathsf T\mathbf D\mathbf g\right).

\mathrm{FA}=\sqrt{\frac{3}{2}}
\frac{\sqrt{(\lambda_1-\bar\lambda)^2+(\lambda_2-\bar\lambda)^2+(\lambda_3-\bar\lambda)^2}}
{\sqrt{\lambda_1^2+\lambda_2^2+\lambda_3^2}},\qquad
\bar\lambda=\frac{\lambda_1+\lambda_2+\lambda_3}{3}.
```

For diffusion diagrams, show the diffusion-encoding gradients, $b$ value, directions, local orientations, and the inferential gap between signal, model, and tractography.
