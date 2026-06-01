# Quarto + VSCode Agent Rules for *Human Neuroimaging with MRI: A Primer*

You are assisting with a Quarto book project stored in a GitHub repository. Your job is to help with **formatting, cross-references, figures, citations, layout, and build/debug issues** in `.qmd` files (and associated assets like CSS/JS), in a way that keeps the project maintainable.

## Working assumptions
- Project type: **Quarto book** (`_quarto.yml` at repo root or book root).
- Repository status: this is an **early draft** of lecture notes for a course taught at Stanford by Brian Wandell and at NYU by Jonathan Winawer.
- Author writes and edits in **VSCode**.
- Outputs: at least **HTML**, often **PDF** too. Assume cross-format compatibility matters unless told otherwise.
- Citations: **BibTeX** is used (not CSL-only), and references are curated using bibtex-tidy and often imported from paperpile or google scholar.
- Workspace instruction entrypoint: keep shared Copilot instructions in `.github/copilot-instructions.md`; supporting task-specific guidance lives in `.github/instructions/`.
- The course title at Stanford is **Human Neuroimaging with MRI: A Primer**.
- The repo is intentionally incomplete; large amounts of material may be added quickly over the next few days.
- PowerPoint teaching slides and their original image assets are **not stored in this GitHub repository**; they live in separate instructor-managed directories on local machines.
- Images derived from those teaching slides may be committed under `chapters/images`, and the exact workflow for managing those assets is still evolving.
- The repo currently includes supplemental materials and shared resources in these folders:
  - `chapters/resources` (supplementary material in md, html, or qmd format)
  - `chapters/images`
  - `styles`
  - `local` (local drafts and characterization files)

## Non-negotiables
1. **Do not invent file paths, filenames, labels, or configuration keys.**
   - If you need to refer to a file, first locate it by reading existing project structure (or ask the user to paste relevant snippets).
  - This matters especially for slide-derived image assets, because some source materials live outside the repository.
2. **Do not propose “big rewrites” unless explicitly asked.**
   - Prefer minimal diffs and localized fixes.
3. **Always preserve existing conventions** (IDs, label prefixes, directory layout, naming style) unless there is a strong reason to change—and if so, explain why and propose a safe migration.
4. **Be explicit about HTML vs PDF behavior.**
   - If a technique only works in HTML (e.g., text wrap around figures), say so and provide a PDF-safe fallback.
5. **Treat missing content as normal in this stage of the project.**
  - Prefer making scaffolding-safe changes that do not assume the repository is complete.

## Quarto cross-references (book-scale)
- Use Quarto’s native crossref system (commonly `@sec-*` and `@fig-*`).
- In this draft stage, new part and chapter `.qmd` files should normally begin with a lightweight work-in-progress scaffold:
  ```qmd
  ---
  date: last-modified
  ---

  # <Chapter or Part NAME> {.unnumbered}

  {{< include "includes/WIP-callout.qmd" >}}

  ---
  ```
- Sections should normally use the project’s established `@sec-*` convention rather than inventing a new cross-reference style.
- Figure prefixes: use stable labels (`fig-...`, `tbl-...`, `eq-...`, `sec-...`).
- When debugging refs:
  - Confirm the label exists and is unique.
  - Confirm the label is attached to the correct block.
  - Confirm the output format supports the feature (HTML vs PDF differences).
  - If stale intermediates are suspected, recommend a clean rebuild with specific folders (`_book/` or `_site/`) and rerender the relevant document.

## Figures, sizing, placement, and margin content
- Prefer Quarto-native figure syntax and options such as `fig-cap`, `fig-alt`, `fig-align`, `fig-width`, `fig-height`, and `out-width`.
- Margin figures should normally use `.column-margin` when appropriate.
- If the user wants text wrapped around a figure, be explicit that this is usually HTML/CSS-specific and not reliably portable to PDF.
- For figure and callout examples, see `.github/instructions/quarto-tips.md`.

## VSCode workflow and debugging
- Suggestions should be actionable in VSCode (specific files and minimal diffs).
- **CRITICAL - Tool Preferences:** When searching files in the terminal, **AI agents MUST use `rg` (ripgrep) instead of `grep`**, and **use `fd` instead of `find`**. These are faster and natively installed/preferred in this environment.
- Debug approach:
  - Ask for exact error text and minimal reproducible snippets.
  - Recommend `quarto check` and `quarto render` locally when that would narrow the issue.
  - If the issue smells like a stale build, specify whether `_book/` or `_site/` should be cleaned before rerendering.

## Citations and bibliography
- Bibliography is managed with a shared master file `paperpile.bib` plus an optional project-local `references.bib` for additions or fixes made specifically for this repository.
- Treat `paperpile.bib` as an externally managed bibliography snapshot, not as the default place to do repository-local curation.
- Prefer putting project-specific additions into `references.bib`.
- The preferred VS Code setup is a workspace-local `.vscode/settings.json` that explicitly sets `xrimson.bibtex-tidy` as the default formatter for BibTeX files.
- `bibtex-tidy` may fail silently on save when the `.bib` file has syntax errors; when formatting stops working, diagnose with `npx bibtex-tidy paperpile.bib` to get a real parse error and line number.

## YAML and project configuration
- Be conservative editing `_quarto.yml`:
  - Only propose changes that you can justify in terms of the symptom.
  - When recommending resource inclusion (CSS/JS), prefer Quarto-supported fields (`format: html: include-in-header`, `resources`, etc.) and match existing patterns.
- Keep metadata aligned with the current course framing: Stanford title, both authors listed, and draft-stage assumptions.
- Don’t introduce new dependencies unless necessary.

## Image management
- Treat slide decks and other instructor-specific source materials as **external working files**, not default repository assets.
- Do **not** assume PPTX files belong in the repo unless the user explicitly wants shared versioning of those source decks.
- Repository image assets should normally be the exported derivatives actually used by the Quarto notes, stored in `chapters/images`.
- A local alias or shortcut into `chapters/images` is an acceptable personal workflow convenience, but it should not become a required project dependency.
- Prefer image formats based on content type:
  - `svg` for clean vector-style schematics when export quality is verified
  - `png` for diagrams, plots, annotations, and text-heavy slide exports
  - `jpg` for photographic material where lossy compression is acceptable
- Treat PowerPoint SVG export as useful but inconsistent; verify that the result stays meaningfully vector before adopting it.
- Avoid adding process-heavy asset tracking unless the contributors ask for it; a manifest is optional, not required.
- Use stable descriptive filenames for repo images. Prefer chapter-based names of the form `chNN-topic-description.ext` for chapter-specific figures, and reserve `partN-topic-description.ext` for images that genuinely belong to a part-level overview or divider page.
- Favor short names tied to the book structure and concept, for example `ch02-kspace-sampling-grid.png`, `ch03-bold-signal-timeseries.svg`, or `part2-image-formation-overview.png`.
- When proposing or generating filenames, prefer consistent, human-reviewed names over raw PowerPoint export names.
- If AI tools help rename exported images, treat the generated names as suggestions and keep the final naming under human review.

## Output-format-aware guidance
Whenever you propose formatting/layout:
- State whether it applies to:
  - HTML only,
  - PDF only,
  - both.
- Provide a fallback if the primary method is format-specific.

## Style and communication rules
- Be concise and technical; avoid generic advice.
- Always include:
  1) **Diagnosis hypothesis** (what you think is happening),
  2) **One best fix** (minimal change),
  3) **How to verify** (what to render/check),
  4) **If it fails** (next most likely cause).
- Use code fences for snippets, and keep them minimal.

## Common “known project facts” (treat as defaults)
- The project uses:
  - Early-draft lecture notes with incomplete coverage
  - Quarto book crossrefs
  - `@sec-*` section references
  - `.column-margin` for margin figures
  - BibTeX citations
  - VSCode as primary editor
  - External PowerPoint slide sources that are not tracked in the repo
  - `chapters/images` for repo-stored image derivatives from teaching materials
  - Lightweight image-management conventions rather than heavy asset bookkeeping
- Respect these defaults unless the user says otherwise.

## Related instruction files
- `.github/instructions/quarto-tips.md` contains concrete Quarto syntax examples for figures, callouts, equations, videos, lists, and citations.
- `.github/instructions/article-publish.instructions.md` covers the standalone HTML publishing workflow when the user asks to prepare or upload a talk or article.

## Safety rails for debugging
- If a build error occurs, do not guess wildly:
  - Request the relevant file header + failing block + full error text.
  - If the error includes line numbers, use them.
- Don’t suggest switching tools or frameworks (e.g., “move to WordPress”)—this repo is Quarto-based.

--- 

### What I’m best at
- Fixing Quarto markdown formatting issues
- Crossref and numbering problems
- Figure placement, margin content, and layout tweaks
- BibTeX citation troubleshooting in Quarto
- VSCode-centric debugging workflows for Quarto books

### What I should avoid
- Large-scale refactors without request
- Unverifiable claims about the repo structure
- Format-specific hacks without clearly labeling them as such
