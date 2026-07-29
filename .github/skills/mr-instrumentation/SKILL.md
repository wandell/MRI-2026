---
name: mr-instrumentation
description: Enforce scientific accuracy when drafting, editing, or revising introductory MRI content about magnets, gradient coils, RF coils, shimming, scanner hardware, or MRI safety.
---

# MR Instrumentation

## Canonical Notation & Variables

- Use $B_0$ for the static main field, $B_1^+(t)$ for the transmit RF field, and $\mathbf{G}(t)=[G_x,G_y,G_z]^\mathsf{T}$ for the applied gradient vector. State field strength in tesla (T); use $\mathrm{mT/m}$ for gradient amplitude and $\mathrm{T/m/s}$ for slew rate.
- Define the local field as $B(\mathbf r,t)=B_0+\mathbf G(t)\!\cdot\!\mathbf r+\Delta B_0(\mathbf r)+B_1(\mathbf r,t)$. Specify whether $\gamma$ is in $\mathrm{rad\,s^{-1}\,T^{-1}}$ or $\gamma/2\pi$ is in $\mathrm{Hz/T}$.
- Use SAR in $\mathrm{W/kg}$, acoustic level in dB(A), and $dB/dt$ in $\mathrm{T/s}$.

## Core Scientific Models & Assumptions

- Distinguish the persistent, approximately static $B_0$ field from switched gradients and oscillatory RF fields. Gradients encode position; they do not themselves excite spins.
- Describe receive coils as inductive sensors of transverse magnetization and transmit coils as generators of $B_1^+$; a coil may perform both roles. Treat phased-array elements and their noise covariance as relevant to SNR and parallel imaging.
- State that shimming reduces spatial variation in $B_0$; it does not make the field perfectly homogeneous or correct all susceptibility-induced distortions.
- Frame safety by hazard mechanism: projectile/torque, RF heating, peripheral nerve stimulation, acoustic noise, cryogen/quench, and implants. Never imply that an absence of ionizing radiation means MRI is risk-free.

## Terminology Safeguards

Do use: “static magnetic field,” “gradient amplitude,” “slew rate,” “RF transmit field,” “receive sensitivity,” “conditional implant labeling.”

Don't use: “the magnet is off” for a superconducting system at field; “RF radiation” as a synonym for ionizing radiation; “gradient strength” when the intended quantity is slew rate.

## Key Equations & Diagrams

```latex
\omega(\mathbf r,t)=\gamma B(\mathbf r,t), \qquad
\phi(\mathbf r,t)=\gamma\int_0^t \mathbf G(\tau)\cdot\mathbf r\,d\tau.
```

For a system diagram, show separate $B_0$, gradient, transmit, receive, reconstruction, and safety paths; label the scanner, control, and equipment rooms.
