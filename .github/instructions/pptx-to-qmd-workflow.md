# Workflow: Extracting Slides from PPTX into Quarto Chapter Files

This documents the process used to convert teaching slide decks into image assets
and `.qmd` chapter files for the lecture notes.

## Faster approach (recommended for future chapters)

The interactive review-then-extract process used for ch01 works well but involves
many round-trips. A more efficient approach:

1. **Convert the whole deck to images up front** using a single `pdftoppm` command,
   then review all slides in one pass in a grid or sequence. Decide in bulk which
   slides to keep, skip, or edit before extracting anything.

2. **Batch-extract slide notes** with a short Python script (see below) so you have
   all notes available when naming files and writing the `.qmd`.

3. **Edit the PPTX first** (remove stale text, etc.), then convert to PDF once and
   extract all needed pages in one `pdftoppm` call.

## Step-by-step

### 1. Convert PPTX to PDF

```bash
python3 /path/to/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf "DeckName.pptx"
```

### 2. Convert PDF pages to PNG images (all at once)

```bash
pdftoppm -png -r 150 "DeckName.pdf" slide
# produces slide-01.png, slide-02.png, ...
```

Use `-r 150` for lecture note quality. Use `-r 200` for higher resolution if needed.

### 3. Extract all slide notes

```python
from pptx import Presentation

prs = Presentation("DeckName.pptx")
for i, slide in enumerate(prs.slides, 1):
    title = next(
        (s.text_frame.text.strip() for s in slide.shapes
         if s.has_text_frame and s.name.startswith("Title")), ""
    )
    notes = slide.notes_slide.notes_text_frame.text.strip() if slide.has_notes_slide else ""
    print(f"=== Slide {i}: {title} ===")
    print(notes or "(no notes)")
    print()
```

### 4. Review slides and decide

For each slide, decide:
- **Keep** → assign a `chNN-descriptive-name.png` filename
- **Skip** → redundant, annotated variant of another slide, or course-logistics only
- **Edit PPTX first** → stale dates, placeholder text, etc. (edit, then re-convert)
- **Stanford-specific** → use `resources-stanford-descriptive-name.png`; goes in a
  separate `.qmd` outside the main book chapters

### 5. Copy selected images to `chapters/images/`

```bash
cp slide-03.png /path/to/repo/chapters/images/ch01-system-rooms-diagram.png
```

### 6. Edit PPTX if needed

Use `python-pptx` to remove text boxes programmatically:

```python
from pptx import Presentation
from lxml import etree

prs = Presentation("DeckName.pptx")
slide = prs.slides[1]  # 0-indexed
for shape in slide.shapes:
    if shape.has_text_frame and "text to remove" in shape.text_frame.text:
        shape._element.getparent().remove(shape._element)
        break
prs.save("DeckName.pptx")
```

### 7. Create the `.qmd` chapter file

- Place it in `chapters/chNN-topic.qmd`
- Use Quarto markdown figure syntax:

```markdown
![Brief caption.](images/chNN-filename.png){#fig-label fig-alt="Alt text."}
```

- Put slide notes as prose between figures (trim AI-generated verbosity).
- Use `## Section` headers to group related slides.
- Add the chapter to `_quarto.yml` under the appropriate part.

### 8. Add chapter to `_quarto.yml`

```yaml
- part: "Instrumentation"
  chapters:
   - chapters/part1-instrumentation.qmd
   - chapters/ch01-instrumentation.qmd
```

## Naming conventions

| Context | Pattern | Example |
|---------|---------|---------|
| Main chapter images | `chNN-topic.png` | `ch01-gradient-amplifiers.png` |
| Stanford-specific | `resources-stanford-topic.png` | `resources-stanford-cni-stats.png` |
| Part-level overview | `partN-topic.png` | `part1-instrumentation-overview.png` |

Keep names short — drop redundant words like the chapter subject (e.g., drop "machine-room"
if every slide in a section is from the machine room).

## Notes on image quality

- `pdftoppm -r 150` gives adequate web quality (~1100×619 px for a 16:9 slide).
- Increase to `-r 200` if figures contain fine text or diagrams that need to be legible.
- The LibreOffice PDF conversion is good for photos; vector diagrams may lose some crispness
  compared to exporting directly from PowerPoint. If a diagram looks blurry, export it as
  PNG directly from PowerPoint at high resolution.
