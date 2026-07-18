# Chapter Merge Recommendations

Goal: reduce the chapter count by merging short, tightly-related chapters. All
proposals stay **within a single Part** — no merge crosses a Part boundary.

Length is measured by **number of slide-sections** (`##` headings), not word
count, since these chapters are slide-image based. A chapter with 3–5 sections
is a strong merge candidate; 6–8 is a maybe; 10+ generally stands alone.

No merges are recommended for **Part 1 (Instrumentation)** or **Part 8
(Diffusion)** — those chapters are all substantial.

---

## Strongly recommended merges

### Part 2 — Signals
- **ch10 (Inversion recovery) + ch11 (MR summaries)** → keep as one chapter.
  ch11 is only 3 sections and functions as an end-of-topic summary; fold it in
  as the closing section of ch10.

### Part 3 — Image Formation
- **ch15 (Slice Selection) + ch16 (Gradient Echo Sequences)** → merge.
  ch16 is only 5 sections (one is literally flagged "move to previous section
  next year"). Both are acquisition/encoding mechanics and sit adjacent.
- **ch19 (Image Distortions and Quality) + ch20 (Parallel Imaging)** → merge.
  ch19's undersampling section is already labeled "IMPORTANT FOR PARALLEL
  IMAGING," so it directly sets up ch20. ch19 is 8 sections, ch20 is 13.

### Part 4 — Brain Systems
- **ch24 (Gross anatomy) + ch25 (Model brain systems)** → merge.
  ch24 is the shortest chapter in the book (2 sections); ch25 is 3. Both are
  structural/overview material.
- **ch29 (Fine-scale neurovascular) + ch30 (The neurovascular unit)** → merge.
  6 sections each, consecutive, and conceptually one topic.

### Part 5 — Functional Signals
- **ch38 (Electrophysiological signal definitions: mEF, MUA, LFP) + ch40
  (BOLD and the LFP)** → merge. ch38 (3 sections) defines the terms that ch40
  immediately uses; they are adjacent in the current order.

### Part 6 — Data Analysis
- **ch44 (Signal detection theory) + ch45 (Applying SDT: diagnostic
  examples)** → merge. ch45 is 3 sections of worked examples for ch44.
- **ch47 (Statistical significance, effect size) + ch48 (History and
  philosophy of hypothesis testing)** → merge. ch48 is 3 sections; both are the
  "interpretation and caution" bookend of the part.

### Part 7 — Vision
- **ch51 (Discovery of multiple maps) + ch52 (Organization of the maps)** →
  merge. ch52 is 3 sections; discovery and organization of the maps read as one
  story.

---

## Optional / weaker candidates

- **Part 5: ch31 (The story of Walter K) → intro to ch32.** ch31 is a 3-section
  narrative vignette; it could open ch32 rather than stand alone. (Keep separate
  if you want the vignette to have its own entry in the TOC.)
- **Part 2: ch09 (Spin echo) + ch10 (Inversion recovery).** Both are named
  pulse sequences. Merging gives a single "Pulse sequences" chapter, but ch10 is
  already 16 sections, so this mainly helps the TOC, not chapter balance.

---

## Not recommended (leave standalone)

- **ch21 (Image Data Formats)** — practical DICOM/NIfTI material; doesn't pair
  naturally with a neighbor.
- **ch14, ch17** (Part 3) and all of Part 8 — already substantial.

---

## Cleanup unrelated to merging

Two stray duplicate files exist that are **not** referenced in `_quarto.yml`
(the hyphenated versions are the live ones):

- `chapters/ch57-models-of-voxellevel-diffusion.qmd` (duplicate of
  `ch57-models-of-voxel-level-diffusion.qmd`)
- `chapters/ch58-voxellevel-reliability-measures.qmd` (duplicate of
  `ch58-voxel-level-reliability-measures.qmd`)

Recommend deleting the `voxellevel` (no-hyphen) copies.

---

## Summary

If all "strongly recommended" merges are done, the count drops by **8
chapters** (from 62 down to 54): one in Part 2, two in Part 3, two in Part 4,
one in Part 5, two in Part 6, one in Part 7.
