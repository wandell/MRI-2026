---
name: visual-neuroscience-fmri
description: Enforce scientific accuracy when drafting, editing, or revising visual-neuroscience fMRI content on retinotopy, visual field maps, visual pathways, category selectivity, population receptive fields, and stimulus-based inference.
---

# Visual Neuroscience with fMRI

## Canonical Notation & Variables

- Express visual-field location as eccentricity $e$ (degrees of visual angle) and polar angle $\theta$ (degrees or radians, with convention stated). Use $x,y$ in degrees of visual angle for Cartesian visual-field coordinates.
- Use spatial frequency in cycles/degree, temporal frequency in Hz, contrast as Michelson or Weber contrast with the definition specified, and pRF center $\boldsymbol\mu=(x_0,y_0)$ with size $\sigma$ in degrees of visual angle.
- Name visual field maps with their established identifiers (for example V1, V2, V3) only when the map-definition evidence is relevant; do not use a region label as a substitute for a measured property.

## Core Scientific Models & Assumptions

- Treat retinotopy as an orderly mapping between visual-field coordinates and cortical position, estimated from stimulus-driven responses. A traveling-wave phase or pRF estimate depends on stimulus design, HRF assumptions, preprocessing, and fit quality.
- Treat a voxel pRF as a model-derived aggregate receptive-field description, not a single-neuron receptive field. Category selectivity is relative to a contrast and stimulus set, not evidence for exclusive processing.
- Keep visual field, retinal image, and cortical map distinct. Specify the visual-field convention, hemifield, and laterality before interpreting polar-angle maps.

## Terminology Safeguards

Do use: “visual field map,” “retinotopic organization,” “population receptive field,” “stimulus preference,” “category-selective region,” and “contralateral visual field.”

Don't use: “retina coordinates” for a cortical map without an optical inversion convention, “face area” as a claim of functional exclusivity, “visual cortex is a single map,” or “pRF equals receptive field.”

## Key Equations & Diagrams

```latex
\hat r(t)=\left[g(\mathbf x;\boldsymbol\mu,\sigma)\ast_{\mathbf x}s(\mathbf x,t)\right],
\qquad
\hat y(t)=\beta\,[\hat r*h](t)+\varepsilon(t),

g(\mathbf x;\boldsymbol\mu,\sigma)=
\exp\!\left(-\frac{\|\mathbf x-\boldsymbol\mu\|^2}{2\sigma^2}\right).
```

For map figures, show eccentricity and polar-angle legends, visual-field meridians, cortical laterality, and the stimulus aperture or encoding-model schematic.
