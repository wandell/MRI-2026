---
name: mr-image-formation
description: Enforce scientific accuracy when drafting, editing, or revising MRI content on spatial encoding, k-space, Fourier reconstruction, slice selection, EPI, image artifacts, resolution, and parallel imaging.
---

# MR Image Formation

## Canonical Notation & Variables

- Use $\mathbf r=(x,y,z)$ in m or mm and $\mathbf k=(k_x,k_y,k_z)$ in cycles/m (or cycles/mm, stated consistently). If radians/m are used, say so and replace $2\pi$ consistently.
- Define $\mathbf k(t)=\frac{\gamma}{2\pi}\int_0^t\mathbf G(\tau)d\tau$. Use FOV in mm, voxel dimensions in mm, matrix dimensions as counts, bandwidth in Hz/pixel or Hz, and acceleration $R$ as dimensionless.
- Use $\rho(\mathbf r)$ for complex transverse spin density/signal weighting, not a literal density unless physically justified.

## Core Scientific Models & Assumptions

- Present Cartesian MRI as samples of a Fourier encoding of an object under a stated idealization. Clarify that coil sensitivity, relaxation, off-resonance, motion, and sampling trajectory make the practical forward model more complex.
- Separate spatial resolution (nominal voxel dimensions) from effective resolution (point-spread function) and from precision. Smaller voxels do not automatically produce more reliable estimates.
- Explain EPI distortion as phase-encoding displacement from off-resonance and its low bandwidth per pixel; do not attribute it simply to “poor gradients.” Parallel imaging reduces acquisition time but carries a noise penalty quantified by the geometry factor.

## Terminology Safeguards

Do use: “k-space trajectory,” “phase encoding,” “readout/frequency encoding,” “aliasing,” “point-spread function,” and “susceptibility-induced off-resonance.”

Don't use: “k-space is image space,” “each k-space point is a pixel,” “higher k-space is higher resolution” without noting sampling extent, or “undersampling improves resolution.”

## Key Equations & Diagrams

```latex
s(\mathbf k)=\int \rho(\mathbf r)e^{-i2\pi\mathbf k\cdot\mathbf r}\,d\mathbf r,
\qquad
\rho(\mathbf r)=\int s(\mathbf k)e^{i2\pi\mathbf k\cdot\mathbf r}\,d\mathbf k.

\Delta x=\frac{\mathrm{FOV}_x}{N_x},\qquad
\Delta k_x=\frac{1}{\mathrm{FOV}_x},\qquad
k_{x,\max}\approx\frac{1}{2\Delta x}.
```

In diagrams, distinguish the object, gradients, k-space trajectory, sampling grid, and reconstructed image; never draw a spatial image as a literal k-space photograph.
