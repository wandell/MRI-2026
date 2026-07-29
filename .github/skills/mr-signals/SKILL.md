---
name: mr-signals
description: Enforce scientific accuracy when drafting, editing, or revising MRI content on nuclear magnetization, FID, relaxation, spin echo, inversion recovery, pulse sequences, and MR contrast.
---

# MR Signals

## Canonical Notation & Variables

- Use $\mathbf M=(M_x,M_y,M_z)$ for bulk magnetization, $M_0$ for equilibrium longitudinal magnetization, and $M_{xy}=M_x+iM_y$ for transverse magnetization.
- Use $T_1$, $T_2$, and $T_2^*$ only for time constants (s or ms); use $R_1=1/T_1$, $R_2=1/T_2$, and $R_2^*=1/T_2^*$ for rates ($\mathrm{s^{-1}}$). Use TR, TE, TI, and flip angle $\alpha$ with units stated.
- Use complex signal $s(t)$ for the demodulated received signal. Do not call magnitude data “the MR signal” without qualification.

## Core Scientific Models & Assumptions

- Treat the Bloch equations as the macroscopic phenomenological model. Separate irreversible $T_2$ relaxation from reversible static dephasing contributing to $T_2^*$; a spin echo refocuses the latter only to the extent that dephasing is static over the echo.
- Explain contrast as sequence- and acquisition-dependent. A short TE reduces $T_2$ weighting; it does not directly “measure $T_2$.” Quantitative estimation requires a stated signal model, sufficient sampling, and an account of confounds.
- State explicitly whether an RF pulse is idealized as instantaneous/hard or has finite bandwidth and slice-selective behavior.

## Terminology Safeguards

Do use: “longitudinal recovery,” “transverse decay,” “dephasing,” “refocusing,” “relaxation rate,” and “proton-density weighting.”

Don't use: “spins return to alignment” as a complete mechanism for $T_1$; “T2 signal”; “spin density” when the relevant measurable is mobile proton density; “T2 correction” for an unmodeled contrast effect.

## Key Equations & Diagrams

```latex
\frac{d\mathbf M}{dt}=\gamma\mathbf M\times\mathbf B
-\frac{M_x\hat{\mathbf x}+M_y\hat{\mathbf y}}{T_2}
-\frac{(M_z-M_0)\hat{\mathbf z}}{T_1}.

M_z(t)=M_0-(M_0-M_z(0))e^{-t/T_1},\qquad
M_{xy}(t)=M_{xy}(0)e^{-t/T_2^*}e^{-i\omega_0t}.
```

For pulse-sequence diagrams, use an increasing left-to-right time axis and show RF, gradient, and acquired-echo rows with TR/TE/TI marked.
