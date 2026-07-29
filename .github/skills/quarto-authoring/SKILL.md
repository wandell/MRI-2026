---
name: quarto-authoring
description: Use this when editing Quarto .qmd files, adding figures, cross-references, tables, callouts, citations, or chapter structure in this repository. Activate for formatting, numbering, citation, or layout issues in chapters and resources.
---

# Quarto Authoring

## Instructions & Guidelines

- Prefer Quarto-native markdown and existing project conventions over ad hoc HTML.
- Keep edits localized and preserve the structure of the current chapter or resource file.
- Use stable cross-reference labels with the project’s established prefixes: `fig-`, `sec-`, `eq-`, and `nte-`.
- New part and chapter files should normally begin with a lightweight scaffold:

```qmd
---
date: last-modified
---

# <Chapter or Part NAME> {.unnumbered}

{{< include "includes/WIP-callout.qmd" >}}

---
```

- For figures, use Quarto figure syntax with a caption and a label:

```md
![Figure caption](images/ch14/example.png){#fig-ch14-example}
```

- Reference figures and sections in text with Quarto crossrefs, for example `@fig-ch14-example` or `@sec-...`.
- Use relative resource links from chapters to resources in `chapters/resources/`:

```md
For background, see [Joseph Larmor and his frequency](resources/joseph-larmor.qmd).
```

- Keep citations in BibTeX style and prefer existing bibliography files: `paperpile.bib` for shared references and `references.bib` for project-specific additions.
- Use standard Quarto syntax for callouts, tabs, and lists rather than custom HTML wrappers.
- If a formatting change depends on HTML versus PDF output, say that clearly and provide a PDF-safe fallback.

## Common patterns

### Figures

```md
![The Fourier series is a linear model.](images/ch14/the-fourier-series-is-a-linear-model.png){#fig-ch14-linear-model}
```

### Callouts

```md
::: {.callout-note}
## Optional Title
This is the body text.
:::
```

### Citations

```md
Standard citation in parentheses: [@wandell1999-ColorSignalsHuman]
```

### Equations

```md
$$
\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (\hat{y}_i - y_i)^2}
$$ {#eq-rmse}
```

## Avoid

- Inventing custom link or label schemes.
- Using raw HTML when Quarto-native syntax is available.
- Adding large rewrites without a clear need.
