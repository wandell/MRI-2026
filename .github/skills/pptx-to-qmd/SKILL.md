---
name: pptx-to-qmd
description: Use this when converting PowerPoint slides into Quarto chapter content, extracting slide notes, naming images, or building progressive-build panels. Activate for PPTX-to-.qmd workflows, image export naming, or slide-based chapter drafting.
---

# PPTX to Quarto Workflow

## Instructions & Guidelines

- Always identify slides by title rather than slide number or PDF page number.
- Treat hidden slides as a source of ambiguity; use the slide title and sequence context instead of relying on numbering.
- When extracting notes or ordering slides, preserve the actual PowerPoint slide order rather than sorting filenames alphabetically.
- For large decks, review and select slides in bulk before extracting content. This is usually faster than doing one slide at a time.
- For progressive build sequences, export every step and wrap them in a Quarto `panel-tabset` block.

```md
::: {.panel-tabset}
## Step 1
![Title — step 1.](images/chNN/filename-1.png){#fig-label-1}

## Step 2
![Title — step 2.](images/chNN/filename-2.png){#fig-label-2}
:::
```

- Store exported figures in `chapters/images/` using stable, descriptive names such as `chNN-topic-description.png`.
- Use `chapters/resources/` for separate resources that are not part of the main chapter flow.
- Keep prose concise and editorial; do not simply transcribe slide text. Add short transitions and explanatory context where helpful.
- If the deck includes embedded video, prefer extracting the actual video asset and embedding it in HTML output rather than using a static screenshot of the slide.
- When converting a deck, prefer a full conversion to PDF first and then extract images in one pass; this avoids repeated round-trips.
- If a deck contains large embedded video files, remove or isolate them before conversion because LibreOffice can become slow or fail on those assets.
- Use the repository’s chapter naming convention: `chNN-topic-description.png` for chapter figures and `resources-...` for more general resource images.

## Practical commands

```bash
python3 /path/to/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf "DeckName.pptx"
pdftoppm -png -r 150 "DeckName.pdf" slide
```

## Avoid

- Using slide numbers as references.
- Adding raw PowerPoint export names without review.
- Assuming the lecture deck should be copied into the repository wholesale.
