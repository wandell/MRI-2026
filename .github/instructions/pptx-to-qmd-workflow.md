# Workflow: Extracting Slides from PPTX into Quarto Chapter Files

This documents the process used to convert teaching slide decks into image assets
and `.qmd` chapter files for the lecture notes.

## Referring to slides precisely

**Always use slide titles, not slide numbers or PDF page numbers.**

PPTX slide numbers and PDF page numbers diverge whenever hidden slides are present
(LibreOffice skips hidden slides during PDF conversion). This causes silent off-by-N
errors that are hard to catch.

The reliable reference forms are:

- Range: "from the slide titled 'X' through the slide before 'Y'"
- Single slide: "the slide titled 'X'"
- Untitled slide in a sequence: "the two slides after 'X'"

To quickly list all slide titles and find a range:

```python
from pptx import Presentation
prs = Presentation("DeckName.pptx")
for i, slide in enumerate(prs.slides, 1):
    title = next((s.text_frame.text.strip()[:70] for s in slide.shapes
                  if s.has_text_frame and s.name.startswith("Title")), "(no title)")
    print(f"Slide {i:3d}: {title}")
```

**Critical:** when reading slides from the ZIP, always get the correct slide order from
`ppt/presentation.xml` via its relationship file — do NOT sort slide XML files
alphabetically. Alphabetic sort gives `slide1, slide10, slide11, ..., slide2` which
is wrong. Use this pattern instead:

```python
with zipfile.ZipFile(path) as z:
    prs_xml = z.read('ppt/presentation.xml')
    prs_root = etree.fromstring(prs_xml)
    ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
          'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    slide_ids = prs_root.xpath('.//p:sldIdLst/p:sldId', namespaces=ns)
    rels_xml = z.read('ppt/_rels/presentation.xml.rels')
    rels_root = etree.fromstring(rels_xml)
    rel_map = {r.get('Id'): r.get('Target') for r in rels_root}
    rns = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    ordered_slides = [
        'ppt/' + rel_map[s.get(f'{{{rns}}}id')].lstrip('/')
        for s in slide_ids
    ]
```

Note: LibreOffice handles corrupt embedded images gracefully (logs a warning but
still converts). If `python-pptx` raises `BadZipFile: Bad CRC-32`, try the
LibreOffice conversion path directly — the resulting PDF will still be usable.

To find the correct PDF page for a given PPTX slide (accounting for hidden slides):

```python
pdf_page = 0
for i, slide in enumerate(prs.slides, 1):
    if slide._element.get("show") != "0":
        pdf_page += 1
    print(f"PPTX {i:2d} -> PDF p.{pdf_page}  [{title}]")
```

---

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

**If the deck is very large (100s of MB) or conversion hangs/times out**, the cause is
usually one or more embedded video files (`ppt/media/*.mov`, `*.mp4`) — LibreOffice
has to load them even though it won't render hidden slides. Check media sizes first:

```python
import zipfile
z = zipfile.ZipFile("DeckName.pptx")
for i in sorted(z.infolist(), key=lambda i: -i.file_size)[:10]:
    print(f"{i.file_size/1e6:8.2f} MB  {i.filename}")
```

If large videos are present, extract them first (see "Embedded videos" below), then
strip them from a working copy before converting to PDF — this is much faster than
converting the full deck and does not affect which slides appear in the PDF:

```bash
cp "DeckName.pptx" /tmp/work.pptx   # do this in /tmp, not a mounted/synced folder —
                                      # mounted folders may not support in-place rename
cd /tmp
zip work.pptx -d "ppt/media/media1.mov" "ppt/media/media2.mov"   # repeat per large file
python3 /path/to/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf work.pptx
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

### 7. Handle progressive build sequences

PowerPoint decks frequently use progressive builds — the same slide title repeated
across 2–4 slides, each adding one element. Export ALL slides in the sequence with a
numeric suffix (`-1.png`, `-2.png`, `-3.png`). In the `.qmd`, wrap them in a
`panel-tabset` so readers can click through the steps:

```markdown
::: {.panel-tabset}
## Step 1
![Title — step 1.](images/chNN/filename-1.png){#fig-label-1}

## Step 2
![Title — step 2.](images/chNN/filename-2.png){#fig-label-2}

## Step 3
![Title — step 3.](images/chNN/filename-3.png){#fig-label-3}
:::

Notes from the final slide of the build go here as prose.
```

The Python generator script (see below) detects build sequences automatically by
finding consecutive slides with the same title and emits `panel-tabset` blocks.

### 7a. Embedded videos

Slides sometimes embed video (demos, animations, recordings). These should be
extracted and included in the Quarto notes as real `<video>` elements (HTML output),
not as a static screenshot of the slide — a rendered PDF page of a video placeholder
just shows a frozen player UI (play button, view count, etc.), which looks bad and
isn't the actual content.

**Find which slides have video**, using the slide relationship files (fast — this
does not require opening the video data itself):

```python
import zipfile, re
from lxml import etree

z = zipfile.ZipFile("DeckName.pptx")
video_exts = ('.mov', '.mp4', '.avi', '.wmv', '.m4v')

prs_root = etree.fromstring(z.read('ppt/presentation.xml'))
ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
rns = ns['r']
rels_root = etree.fromstring(z.read('ppt/_rels/presentation.xml.rels'))
rel_map = {r.get('Id'): r.get('Target') for r in rels_root}
ordered_slides = ['ppt/' + rel_map[s.get(f'{{{rns}}}id')].lstrip('/')
                   for s in prs_root.findall('.//p:sldIdLst/p:sldId', ns)]

for idx, slide_path in enumerate(ordered_slides, 1):
    rel_path = f"ppt/slides/_rels/{slide_path.split('/')[-1]}.rels"
    if rel_path in z.namelist():
        for rel in etree.fromstring(z.read(rel_path)):
            target = rel.get('Target') or ''
            if target.lower().endswith(video_exts):
                print(f"pptx slide {idx}: {target}")
```

**Extract the raw video bytes.** PowerPoint stores media uncompressed inside the
zip (`compress_type == 0`), so extraction is a fast raw byte copy — no need to load
the file through `python-pptx`:

```python
z = zipfile.ZipFile("DeckName.pptx")
with z.open("ppt/media/media1.mov") as f_in, open("out/media1.mov", "wb") as f_out:
    f_out.write(f_in.read())
```

**Convert/compress for the web** with `ffmpeg`. Check codec first — PowerPoint videos
are usually already H.264/AAC, so a container remux to `.mp4` is a fast stream copy:

```bash
ffmpeg -y -i media1.mov -c copy -movflags +faststart media1.mp4
```

If the source is large (PowerPoint/Keynote screen recordings are often 4K at very
high bitrate — 40–60+ Mbps — which produces multi-hundred-MB files that exceed
GitHub's 100MB per-file push limit), re-encode at a lower resolution/CRF instead:

```bash
ffmpeg -y -i media1.mov -vf "scale=1920:-2" -c:v libx264 -preset veryfast -crf 18 \
  -c:a aac -b:a 160k -movflags +faststart media1.mp4
```

`-crf 18` at 1080p is visually near-lossless for typical slide content and, combined
with the resolution drop from 4K, usually lands well under 100MB even for
30–60 second clips. Check the output size and adjust CRF/resolution if still too
large.

**Generate a poster-frame PNG** for the PDF fallback (nicer than a screenshot of the
embedded player UI):

```bash
ffmpeg -y -ss 1 -i media1.mp4 -frames:v 1 media1.png
```

**Store the video next to the chapter's images** (`chapters/images/chNN/`, same as
PNGs) and embed it with a static PDF fallback, per
`.github/instructions/quarto-tips.md` §6:

```markdown
::: {.content-visible when-format="html"}
![Caption.](images/chNN/filename.mp4){#vid-chNN-filename width="80%" loop="true" autoplay="true" muted="true"}
:::

::: {.content-visible when-format="pdf"}
![Caption (video; see the HTML version for the animation).](images/chNN/filename.png){#vid-chNN-filename width="80%"}
:::
```

### 8. Create the `.qmd` chapter file

- Place it in `chapters/chNN-topic.qmd`
- Figure labels **must** use `#fig-` prefix with hyphens only (no underscores):

```markdown
![Brief caption.](images/chNN/filename.png){#fig-chNN-filename}
```

- The label format `fig-chNN-filename` (all hyphens) is required for Quarto crossrefs.
  Using underscores (e.g., `fig_chNN_filename`) silently disables figure numbering.
- Put slide notes as prose between figures (trim AI-generated verbosity).
- Use `## Section` headers to group related slides.
- Chapter headings should NOT have `{.unnumbered}` (see figure numbering below).
- Add the chapter to `_quarto.yml` under the appropriate part.

### 9. Add chapter to `_quarto.yml`

**Critical:** use the `part: file.qmd` syntax (not `part: "string"`) so that part
introduction files are NOT counted as numbered chapters. This ensures ch01 = Chapter 1,
ch05 = Chapter 5, etc.:

```yaml
- part: chapters/part1-instrumentation.qmd   # part intro — unnumbered, not a chapter
  chapters:
   - chapters/ch01-big-iron.qmd              # Chapter 1
   - chapters/ch02-gradient-coils.qmd        # Chapter 2
- part: chapters/part2-signals.qmd           # part intro — unnumbered, not a chapter
  chapters:
   - chapters/ch05-mr-signal-fundamentals.qmd  # Chapter 5
```

Part introduction files (e.g., `part1-instrumentation.qmd`) must keep `{.unnumbered}`
on their headings. Chapter files (ch01–chNN) must NOT have `{.unnumbered}` on their
primary heading.

## Figure numbering (X.Y format)

To get figures numbered as "5.1, 5.2, ..." in chapter 5:

1. `_quarto.yml` must have `crossref: chapters: true` (already set).
2. Use `part: file.qmd` syntax in `_quarto.yml` so part intros don't steal chapter numbers.
3. Chapter headings must NOT use `{.unnumbered}` — numbered headings are required for
   crossref chapter numbers to be assigned.
4. Figure labels must use `#fig-` prefix with hyphens.

Part intro files KEEP `{.unnumbered}`. Chapter files DROP it.

If figures show "Figure 1" instead of "Figure 5.1", check:
- Are the chapter headings missing `{.unnumbered}`? ✓ (they should not have it)
- Are the labels using hyphens? ✓
- Is the `_quarto.yml` using `part: file.qmd` not `part: "string"` + file in chapters? ✓

## Splitting one deck into multiple chapters

A single PPTX deck often covers enough material for several book chapters. This
needs an explicit decision process, separate from the per-slide keep/skip/edit
decisions in step 4 above.

- **Chapter numbers are global and sequential across the whole book**, not
  per-part and not tied to the source deck's own numbering. Find the next
  available number by checking the highest existing `chNN` across all of
  `_quarto.yml` (not just the target part) and continue from there.
- **The source deck's internal "Part N" label is unrelated to the book's
  `partN-*.qmd` structure.** For example, "04 Brain Part 1 Anatomy" is the
  instructor's own deck-organization scheme; it does not mean this deck becomes
  "Chapter 1" or maps one-to-one with the book's Part 4. Do not assume a 1:1
  mapping between a deck's internal parts and book chapters.
- Process to split a deck:
  1. List all slide titles (script above), noting hidden slides.
  2. Identify topic clusters — natural subject breaks, independent of the
     deck's internal slide/part numbering.
  3. Propose a chapter grouping (chapter title + slide-title range for each
     proposed chapter) to the user and get explicit approval **before**
     extracting any images or notes.
  4. Once approved, run each chapter's slide range through the extraction
     pipeline (steps 1–9 above) independently, assigning consecutive chapter
     numbers in slide order.
  5. Add each new chapter to `_quarto.yml` under the correct part, in slide
     order, using the `part: file.qmd` syntax (see figure-numbering notes
     below for why this matters).

## Naming conventions

Images live in per-chapter subdirectories under `chapters/images/`:

```
chapters/images/
  ch01/   gradient-amplifiers.png        ← no chapter prefix in filename
  ch02/   helmholtz-pair-diagram.png
  ch05/   fid-experiment-3.png           ← build sequence: -1, -2, -3
  resources-stanford/  cni-stats.png
```

| Context | Directory | Filename pattern | Example |
|---------|-----------|-----------------|---------|
| Main chapter images | `images/chNN/` | `topic.png` | `images/ch01/gradient-amplifiers.png` |
| Build sequence | `images/chNN/` | `topic-N.png` | `images/ch05/fid-experiment-3.png` |
| Stanford-specific | `images/resources-stanford/` | `topic.png` | `images/resources-stanford/cni-stats.png` |

The chapter is identified by the directory, not the filename. Drop the `chNN-` prefix
from individual filenames — it's redundant once the file is inside `images/chNN/`.

Keep names short — drop redundant words like the chapter subject (e.g., inside `ch01/`,
drop "machine-room" if every slide in that section is from the machine room).

## Notes on image quality

- `pdftoppm -r 150` gives adequate web quality (~1100×619 px for a 16:9 slide).
- Increase to `-r 200` if figures contain fine text or diagrams that need to be legible.
- The LibreOffice PDF conversion is good for photos; vector diagrams may lose some crispness
  compared to exporting directly from PowerPoint. If a diagram looks blurry, export it as
  PNG directly from PowerPoint at high resolution.
