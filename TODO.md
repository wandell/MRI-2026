# TODO: things for Brian to check

Running list of items an AI agent flagged while extracting PPTX images/videos into the Quarto chapters. Nothing here blocks rendering; these are judgment calls or minor issues worth a human look.

## Rendering
- [ ] Full `quarto render` of ch05–ch10 and ch22–ch30 hasn't been run in this environment (no `quarto` CLI available here). Please render both HTML and PDF locally and spot-check figure/video numbering, especially the new video blocks.
- [ ] For every embedded video, confirm the HTML version autoplays/loops acceptably and the PDF fallback poster frame is a reasonable stand-in.

## Pre-existing bug found (not introduced this session)
- [ ] `chapters/ch06-macroscopic-model.qmd`: the heading "Applying the RF field rotates all the spins" and its label `#fig-ch06-applying-the-rf-field-rotates-all-the-spins` appear **twice** (once mid-chapter, once near the end), both pointing at the same image. This will cause a duplicate-label warning/error in Quarto. Decide whether the second occurrence should be removed, renamed, or was intentional repetition.

## New videos added (ch06, ch08, ch09 — from "02 Signals and Sequence.pptx")
- [ ] ch06: precession of net magnetization, B1 force → transverse signal, and receiver-coil measurement — three short animations (silent, small) inserted where the deck had "Play precess.avi" links or an explicit "Video to be included here" placeholder.
- [ ] ch08: spin de-phasing animation, plus a **new** "Why is the T2 measurement not quantitative?" section built from PowerPoint slide 106, which had not been extracted into any chapter before. Please confirm this new section reads correctly and belongs where I put it (after the tumor-visibility figure).
- [ ] ch09: single spin-echo formation and multiple spin-echo decay animations.
- [ ] The "Multiple spin echoes" video clip is reused twice in the source deck (once for ch09's "Multiple echoes," once for ch08's new T2 section) — I copied the same clip into both chapters' image folders rather than sharing one file. Fine to leave as-is, or point both at one shared asset if you'd rather not duplicate ~2.5MB.
- [ ] I have not yet checked "02 Signals and Sequences Extra.pptx" for additional videos — it's on Google Drive and wasn't downloaded to the sandbox when I tried to scan it. Say the word if you want that one checked too.

## Chapter 4 (Brain) image quality
- [ ] `ch28-gross-neurovascular.qmd`, figure `vascular-overview-dural-sinuses`: the exported PNG includes a decorative Stanford-campus background photo that was apparently part of the slide template, not the intended content. I kept the full slide capture for consistency with other chapters, but it may be worth cropping to just the skull/sinus diagram.
- [ ] A few other slides in ch27–ch30 had similar template/background artifacts (semi-transparent photos behind diagrams) that came through in the PNG export. None obscure the content, but worth a scan.
- [ ] ch27: I converted one slide (a Nature News feature screenshot on astrocyte signaling, dated Dec 2025) into cited prose instead of an image, since it was a dated webpage capture rather than durable teaching content. Confirm that's the right call.
- [ ] ch30: I skipped one slide ("Incidentally in my inbox today" — a PNAS commentary screenshot) as a personal aside not meant for the permanent notes. Confirm that's fine to omit entirely.

## Citations added this session
New entries were added to `references.bib` (not `paperpile.bib`) for: Avery & Krichmar 2017, Abbott (Nature News) 2025, Peppiatt et al. 2006, Roy & Sherrington 1890, Attwell et al. 2010, Nedergaard & Goldman 2020. Worth a quick check that these match the wording/edition you'd cite, since they were sourced from web search rather than your own library.
