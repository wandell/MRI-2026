---
name: standalone-html-publishing
description: Use this when preparing a Quarto document for sharing as a single standalone HTML file, or when uploading a talk or article to the Stanford web server. Activate for publish, render, or upload requests.
---

# Standalone HTML Publishing

## Instructions & Guidelines

- Before rendering, confirm the document is configured for standalone HTML output.
- Add the following to the document front matter when needed:

```yaml
format:
  html:
    embed-resources: true
```

- For offline-friendly math rendering, also add `self-contained-math: true` when the document contains extensive LaTeX.
- Render from the project root or the document’s directory with:

```bash
quarto render <path-to-document>.qmd --to html
```

- Verify that the result is a single self-contained HTML file and that no extra `_files/` directory is required for assets.
- For upload to the Stanford web space, use `scp` with the appropriate target path.

```bash
scp <path-to-document>.html wandell@cardinal.stanford.edu:~/WWW/data/papers/
```

- When the user asks to publish a talk or article, verify the standalone HTML configuration before proceeding to upload.
- If the output still contains linked assets or extra directories, treat that as a configuration problem and fix the render settings rather than manually copying files around.

## Good examples

- A talk rendered as one HTML file with embedded assets and a single upload step.
- A document that remains readable both online and offline without missing CSS or images.

## Avoid

- Uploading a document that still depends on external `_files/` assets.
- Skipping the standalone verification step before sharing the output.
