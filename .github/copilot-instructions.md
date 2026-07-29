# Repository Instructions

This repository is a Quarto book project for *Human Neuroimaging with MRI: A Primer*.

## Global rules

- Keep edits minimal, localized, and consistent with the existing book structure.
- Treat this as an early-draft book repository that will evolve quickly; do not assume missing content is accidental.
- Keep the repository limited to Quarto book source, shared notes, and assets used by those notes. Original teaching slide decks and their working assets remain in instructor-managed local directories unless there is a specific reason to version them here.
- Do not invent file paths, filenames, labels, or configuration keys; verify against the repository first.
- Preserve existing conventions for chapter files, resource files, image locations, and cross-reference prefixes.
- Prefer Quarto-native syntax and existing project patterns over custom HTML or ad hoc formatting.
- Be explicit about HTML-versus-PDF behavior when a change is format-specific.
- If a build or render issue appears, ask for the relevant file and the exact error text rather than guessing.

## Repository layout

- Source chapters live in `chapters/`.
- Chapter-specific resources live in `chapters/resources/`.
- Image assets used by the book live in `chapters/images/`.
- Shared styles live in `styles/`.
- Utility scripts live in `utility/` and should write generated output to `local/`.
- Quarto configuration lives in `_quarto.yml`.

## Image assets

- Store exported image derivatives used by the notes in `chapters/images/`; do not add slide-source files by default.
- Prefer PNG for diagrams, plots, annotations, and text-heavy slide exports; use SVG only when it remains genuinely vector and renders cleanly; use JPEG mainly for photographs.
- Prefer chapter-based filenames of the form `chNN-topic-description.ext`; reserve `partN-topic-description.ext` for part-level overview or divider images.

## Tooling and workflow expectations

- Use Quarto for rendering and debugging book content.
- Use `rg` instead of `grep` and `fd` instead of `find` when searching the repository from the terminal.
- Keep BibTeX-related edits consistent with the existing `paperpile.bib` and `references.bib` workflow.

## Skill activation

Use the task-specific skills in `.github/skills/` when the request matches one of these workflows:

- Quarto authoring and chapter formatting
- PPTX slide extraction and conversion into Quarto content
- Standalone HTML publishing and upload
