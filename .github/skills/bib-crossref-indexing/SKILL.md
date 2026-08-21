---
name: bib-crossref-indexing
description: Use when adding new bibliography sources, syncing paperpile.bib from the shared master library, working with references.bib, or diagnosing a citation that broke after a bibliography update. Not to be confused with the `crossref-indexing` skill, which covers backward chapter-to-chapter @fig-/@sec- links — this skill is specifically about where the bibliography files come from and how they're kept in sync across projects.
---

# Bibliography file coordination (multi-project)

This repo is one of three actively coordinated Quarto book projects — the others
are `FISE-2025-Quarto` and `FOV-2025-Quarto`. A fourth project, `FOV-1995-Quarto`,
is frozen (already published, will not change again) and is intentionally
excluded from all of this.

## Architecture

One fixed master library, plus a small per-project local file:

- `paperpile.bib` in this repo is a **committed copy** of a shared master library
  that lives at `~/Documents/paperpile.bib` on the maintainer's machine. It's
  refreshed by a sync script, not edited by hand for new sources.
- `references.bib` plays the role of this project's "local additions" file — it
  holds references specific to this book that aren't (yet) in the shared
  Paperpile library. New citations that aren't already in `paperpile.bib` go
  here, not into `paperpile.bib` directly. Both files are listed together in
  `_quarto.yml`'s `bibliography:` field. (`quarto-authoring` already documents
  this split as "`paperpile.bib` for shared references and `references.bib` for
  project-specific additions" — this skill covers the mechanics behind that
  split in more depth.)

## Rules

- Never hand-edit `paperpile.bib` to add a new reference — it will be overwritten
  wholesale the next time the master is synced in. Add new sources to
  `references.bib` instead.
- Before adding a citation, check whether the source is already in `paperpile.bib`
  (`grep -m1 "^@.*authorname" paperpile.bib`) to avoid creating a duplicate entry
  for the same paper under a different key in `references.bib`.
- Citation keys are **not guaranteed stable across Paperpile re-exports** — the
  same paper can get a different key in a later export (confirmed in practice:
  one paper appeared as both `Abdelhamed2021-mo` and
  `abdelhamed2021-mofig-modulation-transfer` across two exports of the same
  library). Don't manually renumber or "clean up" keys in `paperpile.bib`; if a
  sync breaks an existing citation, fix the citation in the `.qmd`, not the bib
  file.
- "Sync the bibliography" / "update paperpile.bib from the master" is a cross-repo
  operation run from `~/Documents`, not something to do by directly editing this
  repo's copy.

## Known cleanup item in `references.bib`

A cross-check of this file against the shared master turned up real duplication:
21 of its 79 entries are the *same paper* as an existing `paperpile.bib` entry,
just under a different citation key — for example `andrews1997-lgn` (in the
master) and `andrews1997-correlatedsizevariations` (in `references.bib`) are the
same paper. If both keys end up cited in the book, the reference list would show
the same source twice. The other 58 entries are genuinely not in Paperpile yet.
Before adding new citations from this file, it's worth resolving the 21
duplicates first (pick one key, update its citations, drop the other entry) —
`bib_merge_check.py` (below) is what surfaced this and can be re-run to confirm
after cleanup.

## Maintenance scripts

Live in `~/Documents/`, not part of this repo — they operate across all three
active projects:

- `bib_sync.sh` — copies the current master `paperpile.bib` into each active
  project (this one included) and can commit the change.
- `bib_key_audit.py <project-dir> <candidate-bib>` — before overwriting this
  project's `paperpile.bib` with a fresher master, checks whether any `@citekey`
  actually used in this project's `.qmd` files would go missing. Run this first
  if `paperpile.bib` here hasn't been synced in a while.
- `bib_merge_check.py <master.bib> <local.bib>...` — reports which entries in a
  local/references file are genuinely new versus already present in the master
  under a different key (compares by DOI, falling back to title). Run
  periodically to find what's ready to add to Paperpile and fold back into the
  shared master.

## Diagnosing a citation that renders as "?" or is missing from the bibliography

1. Confirm the exact key exists in `paperpile.bib` or `references.bib`
   (`grep -n "^@.*{the-key" *.bib`) — case matters, keys are case-sensitive.
2. If it was working before a bibliography sync, it likely got renamed in the
   newer Paperpile export — run `bib_key_audit.py` against the new master to
   find it.
3. Confirm the file with the citation is actually listed in `_quarto.yml`'s
   `chapters:`/rendered set.

## See also

- `quarto-authoring` — citation and cross-reference syntax used throughout this
  book.
- `crossref-indexing` — a different workflow: backward-pointing @fig-/@sec- links
  from a review chapter to where a concept was first introduced elsewhere in the
  book. Not related to bibliography files despite the similar name.
