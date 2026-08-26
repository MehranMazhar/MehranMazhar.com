# MehranMazhar.com

Personal site and CV of Mehran Mazhar — .NET backend engineer working on payments, refunds
and money-path systems.

Live at [mehranmazhar.com](https://mehranmazhar.com).

## Stack

Static HTML/CSS/JS, no build step, served by GitHub Pages. `.nojekyll` disables Jekyll
processing — the files are shipped as-is.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The whole site: hero, about, selected work, experience, education, research, contact |
| `assets/css/style.css` | All styles (single stylesheet, `mm-` prefixed classes) |
| `assets/js/main.js` | Nav toggle and scroll-reveal |
| `assets/cv/index.html` | CV, print-styled for A4 — the source for the PDF |
| `assets/cv/Mehran-Mazhar-CV.md` | Same CV in markdown |
| `assets/Mehran-Mazhar-CV.pdf` | Exported from `assets/cv/index.html` |
| `docs/redesign-mockups/` | Archived 2026 design directions, not linked from the site |

## Content source of truth

Wording, figures, titles and fences come from the `career-hub` repo — `s3-cv-pack/CVMasterPack.md`
(the CV of record) and `s4-linkedin/LinkedIn.md`. Do not invent figures here: every number on
this site traces to a MetricsBank row, and career-hub's `Risks & Contradictions` sections list
what must never appear on a public surface.

## Regenerating the CV PDF

After editing `assets/cv/index.html`:

```bash
chrome --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=assets/Mehran-Mazhar-CV.pdf assets/cv/index.html
```

Or open the page in a browser, print, Save as PDF, A4, headers and footers off.
