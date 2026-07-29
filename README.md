# MRI-2026

Quarto repository for early-draft lecture notes for Human Neuroimaging with MRI: A Primer.

The course will be taught at Stanford by Brian Wandell and at NYU by Jonathan Winawer. The repository is intentionally incomplete and will evolve quickly as material is added.

## Scope

This repository is for the Quarto book source, shared notes, and the image assets actually used by those notes.

The original teaching slide decks and their working assets are not expected to live in this repository. Those files remain in instructor-managed local directories.

## Structure

- `chapters/` for lecture notes (`.qmd`)
- `chapters/images/` for exported image derivatives used by the notes
- `chapters/resources/` for supplementary material
- `utility/` for repository utility scripts; generated local outputs belong in `local/`
- `styles/` for shared style assets
- `local/` for local drafts and characterization files (not committed to the repository)
- `_quarto.yml` for shared HTML/PDF rendering defaults

## Images

Images derived from the main teaching slides may be stored in `chapters/images/`.

Images for additional resources are stored in chapters/resources/images/. 

Current working conventions:

- Keep PPTX and other slide-source files outside the repository unless there is a specific reason to version them here.
- Prefer `png` for diagrams, plots, annotations, and text-heavy slide exports.
- Use `svg` when the export remains genuinely vector and renders cleanly.
- Use `jpg` mainly for photographic material.
- Prefer chapter-based filenames of the form `chNN-topic-description.ext`.
- Reserve `partN-topic-description.ext` for part-level overview or divider images.

## AI Agent Instructions

Repository-specific AI guidance lives in `.github/copilot-instructions.md`.

The root startup files `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are lightweight pointers that tell different AI tools to read `.github/copilot-instructions.md` first. That file is the single source of truth for shared repository guidance.
