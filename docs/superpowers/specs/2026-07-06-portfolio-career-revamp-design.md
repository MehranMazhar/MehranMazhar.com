# Portfolio Career Revamp — Design

**Date:** 2026-07-06
**Author:** Mehran Mazhar (with Claude)
**Status:** Approved

## Problem

The personal site (mehranmazhar.com, a single-page static site on GitHub Pages) presents a
confused professional identity and lacks career substance:

- Identity conflict: the site headlines "Blockchain Engineer / creator of Clutch Protocol," but a
  recent edit inserted ".NET Full Stack Developer" as a *tech-stack pill*, leaving mixed messaging.
- No real employment history — the only experience entry is the self-founded Clutch Protocol.
- Education section was previously deleted; only the thesis remains, with no degrees named.
- No resume/CV to download.
- Skills are entirely blockchain-flavored; no .NET/C#/SQL/Azure despite the ".NET full stack" claim.
- Hype-heavy copy ("revolutionary," "disrupt the $100B+ market," pre-launch stats stated as results)
  undermines credibility.
- SEO/technical gaps: no `og:image`/`twitter:image` (broken link previews), no JSON-LD, no canonical.
- Dead Jekyll leftovers (`Gemfile`, `_config.yml`) and an unused image (`images/tochal.jpg`).

## Goals

1. Reposition as **Senior Full-Stack .NET Developer & Blockchain Engineer** (10+ years, 2014–present),
   with Clutch Protocol as a flagship side project rather than the sole identity.
2. Add a real, accurate work history.
3. Restore an education section.
4. Add a downloadable, professional English CV (Gregorian dates).
5. Rewrite skills into coherent groups reflecting the full career.
6. Tone down unverifiable hype into concrete, defensible statements.
7. Fix SEO/social/technical hygiene issues.

Non-goals: redesigning the visual theme, adding a build system, adding a blog/CMS, multi-page routing.

## Career Data (source of truth)

Derived from the user's 2018 Persian CV plus user corrections. Shamsi dates converted to Gregorian.

### Work history (most recent first)

1. **Senior Full-Stack Developer (.NET)** — Parto CRS / Fly Today — **Dec 2018 – Present**
   - B2B travel & airline reservation platforms (GDS/consolidator domain).
   - Stack: C#, ASP.NET Core, SQL Server, Web API, front-end SPA.
   - Bullets to be written plausibly and marked `<!-- VERIFY -->` for the user to confirm.
2. **.NET & IoT Developer** — Vanda IoT Communication Technology — **Apr 2018 – Oct 2018**
   - IoT device management/monitoring portal on Microsoft Azure IoT Hub.
   - Dual-channel touch switch + cloud connectivity; network cameras with face detection.
   - Python on-device + Arduino; author of iot-lab.ir content.
3. **Full-Stack Web Developer** — Sepna (Safir Pardazesh No Andish) **+** Tehran Municipality ICT
   Organization — **Oct 2014 – Feb 2018** *(concurrent engagements, merged into one entry)*
   - ITSM system (ITIL-based) for Tehran Municipality ICT — BPM/workflow automation, custom
     WorkFlow Engine.
   - Enterprise portals on DotNetNuke; SPA pages with Angular 2; ASP.NET (Web Forms/MVC/Core);
     WCF/ASMX web services; SQL Server (stored procedures, functions, reporting).
4. **Founder & Lead Blockchain Engineer** — Clutch Protocol *(open-source side project)* —
   **2024 – Present**
   - Existing content, de-hyped. Rust blockchain, Aura consensus, libp2p, TypeScript SDK, React demo.

### Education (most recent first)

- **M.Sc., Computer Software Engineering** — Islamic Azad University — **2023**
  (Winter 1401 Shamsi). Thesis: blockchain-based ride-sharing network (foundation of Clutch Protocol).
- **B.Sc., Computer Software Engineering** — Islamic Azad University, Islamshahr Branch — **2018**.
- **A.Sc., Computer Software Engineering** — Shahid Babaei College, Qazvin — **2015**.

## Design

### Component A — index.html content rewrite

- **Head/meta:** update `<title>`, `meta description`, `og:title/description`, `twitter:*` to the new
  positioning. Add `og:image` + `twitter:image` (absolute URL to `images/profile.jpg`),
  `<link rel="canonical" href="https://mehranmazhar.com/">`, and a JSON-LD `Person` block
  (name, jobTitle, url, sameAs → GitHub/LinkedIn/Twitter/StackOverflow, alumniOf, knowsAbout).
- **Hero:** retitle to "Senior Full-Stack .NET Developer & Blockchain Engineer"; rewrite description to
  a factual 10-year summary that still features Clutch. Fix tech pills to real technologies
  (`C# / .NET`, `Rust`, `Azure`, `SQL Server`, `Blockchain`). Add a "Download CV" button alongside
  existing actions.
- **About:** rewrite to lead with full-stack .NET experience, then blockchain specialization.
- **Skills:** replace the single flat grid with three labeled groups: **.NET Stack** (C#, ASP.NET
  Core, SQL Server, Azure, Web API/WCF), **Blockchain** (Rust, Smart Contracts, Cryptography, libp2p,
  P2P), **Frontend** (Angular, React, TypeScript, JavaScript, HTML/CSS).
- **Projects (Clutch):** keep structure; soften "revolutionary/disrupt/$100B"; relabel the stats block
  as "Design Targets" so pre-launch numbers are not read as delivered results.
- **Experience:** replace the single entry with the 4-entry timeline above, most-recent first.
- **Education (new section, id `education`):** new section number, three degree cards; the thesis link
  continues to live in the existing Research section. Add "Education" to the nav.
- **Research:** soften "peer-reviewed" overclaim → "master's thesis research."
- **Section numbering:** renumber sections after inserting Education (About 01 … Contact last).
- **Contact:** add a secondary "Download CV" action.

### Component B — CV (new)

- Self-contained print-optimized HTML at `assets/cv/index.html` (inline CSS, A4 `@page`, no external
  fonts required for print fidelity — system font stack fallback).
- Content: header (name, title, contact, location, links), professional summary, work history (4
  entries), education (3), skills (grouped), selected project (Clutch), languages.
- Export to PDF at `assets/Mehran-Mazhar-CV.pdf`. Generation method chosen in the plan (headless
  print or documented manual "Save as PDF" step if no headless tool is available). The site links to
  the PDF; the HTML source is the maintainable master.

### Component C — hygiene

- Delete `Gemfile` and `_config.yml` (site is plain static; `.nojekyll` is present).
- Remove `_config.yml` reference from `robots.txt` (path will no longer exist).
- Delete unused `images/tochal.jpg`.
- Update `sitemap.xml` `lastmod` to the change date.

## Data Flow

Static site — no runtime data flow. Content is authored directly in `index.html`. The CV HTML is the
maintainable master; the committed PDF is a generated artifact linked from the site.

## Error Handling / Edge Cases

- **JSON-LD:** must be valid JSON inside `<script type="application/ld+json">`; validate structure.
- **Absolute og:image URL:** social scrapers require absolute URLs, not relative paths.
- **CV PDF generation without a headless browser:** if unavailable, commit the CV HTML and document the
  one-step manual export; do not block the site changes on PDF tooling.
- **Unverified Parto/Fly Today bullets:** mark with `<!-- VERIFY -->` comments so the user can confirm
  or correct without hunting.
- **Anchor integrity:** adding the Education section and renumbering must not break existing nav anchors
  or the active-nav IntersectionObserver in `main.js` (id-based, so new section needs its `id`).

## Testing / Verification

- Open the site locally; confirm all nav links (including new Education) scroll to correct sections.
- Confirm no broken internal anchors and that `main.js` active-nav highlighting includes Education.
- Validate JSON-LD (well-formed JSON; required Person fields present).
- Confirm og/twitter image URLs are absolute and resolve.
- Confirm the CV link downloads/opens the PDF.
- Visual pass: hero pills, skills groups, timeline (4 entries), education cards render correctly on
  desktop and mobile widths.
- Confirm deleted files are gone and `robots.txt`/`sitemap.xml` are consistent.

## Open Items (user to verify post-build)

- Exact job titles, start month, and achievement bullets for Parto CRS / Fly Today.
- Whether Fly Today and Parto CRS should show as one merged entry (current design) or be named
  distinctly within it.
