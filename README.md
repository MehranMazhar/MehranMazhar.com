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
| `images/og.png` | 1200×630 social card behind `og:image` / `twitter:image`, rendered from `docs/og-card.html` |
| `images/favicon.svg`, `images/favicon.ico`, `favicon.ico` | Site icon: SVG for browsers, 16/32/48px ICO for the rest. Google needs a multiple of 48px or an SVG for the result icon |
| `robots.txt`, `sitemap.xml` | Crawl rules and the four public URLs — see "Crawling" below |
| `docs/redesign-mockups/` | Archived 2026 design directions, not linked from the site |
| `docs/og-card.html` | Source for the social card |

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

## Regenerating the social card

`images/og.png` is rendered from `docs/og-card.html`, which reuses the site's colours and type.
After editing it, serve the repo and screenshot the page at 1200×630:

```bash
python -m http.server 8000
chrome --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=images/og.png http://localhost:8000/docs/og-card.html
```

Link-preview caches key on the image URL, so if a preview looks stale after a change, save the
card under a new filename and update the `og:image` / `twitter:image` tags on all four pages.

## Crawling

- `robots.txt` has one group on purpose. A crawler obeys only its own group, so a `Googlebot` or
  `Bingbot` group would bypass `Disallow: /docs/`. It is a hint, not access control: everything
  in the repo is still publicly readable.
- `.claude/`, `.agents/` and `skills-lock.json` are git-ignored because GitHub Pages would
  publish anything committed.
- When a page's content changes, bump its `lastmod` in `sitemap.xml`.
- Page titles stay at or under about 60 characters and descriptions at or under about 160.
