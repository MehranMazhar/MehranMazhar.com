# Portfolio Career Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the personal site as a Senior Full-Stack .NET Developer & Blockchain Engineer with a real work history, education section, downloadable CV, de-hyped copy, and SEO/social/hygiene fixes.

**Architecture:** Plain static site on GitHub Pages (no build step, `.nojekyll` present). All page content lives in `index.html`; styling in `assets/css/style.css`; behavior in `assets/js/main.js`. The CV is a self-contained print-optimized HTML file (`assets/cv/index.html`) that is the maintainable master; a committed PDF (`assets/Mehran-Mazhar-CV.pdf`) is generated from it via headless Chrome and linked from the site.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JS, headless Chrome for PDF export.

**Note on "tests":** This repo has no test framework and none is warranted for a static site. Each task's verification is a concrete command (grep / JSON validation / file existence) plus a browser check, with expected output stated. Treat the verification step as the task's test.

## Global Constraints

- All copy in English; all dates Gregorian.
- No new build system, no external runtime dependencies added to the page.
- Career data is the source of truth from the spec — do not invent employers or dates.
- Bullets for Parto CRS / Fly Today are unverified: end each such `<li>` with an inline `<!-- VERIFY -->` comment.
- CSS additions must use existing custom properties: `--bg-card`, `--bg-card-hover`, `--border-color`, `--border-color-hover`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--accent-primary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--font-mono`, `--transition-fast`.
- Canonical/site URL: `https://mehranmazhar.com/`. Profile image: `images/profile.jpg`.
- Every new content block that should animate on scroll gets `class="... reveal"` (matches existing pattern; `main.js` handles it).
- Commit after every task.

---

### Task 1: Site hygiene — remove Jekyll leftovers and stale references

**Files:**
- Delete: `Gemfile`, `_config.yml`, `images/tochal.jpg`
- Modify: `robots.txt` (remove the `_config.yml` disallow line)
- Modify: `sitemap.xml` (update `<lastmod>` to `2026-07-06`)

**Interfaces:**
- Consumes: nothing
- Produces: a clean static tree with no Jekyll config for later tasks

- [ ] **Step 1: Delete the dead files**

```bash
git rm Gemfile _config.yml images/tochal.jpg
```

- [ ] **Step 2: Fix robots.txt**

Remove the line `Disallow: /_config.yml` (the file no longer exists). Leave the `Gemfile` and `.nojekyll` disallows as-is only if those paths still exist — `Gemfile` is being deleted, so remove `Disallow: /Gemfile` too. Resulting "Block non-public files" block:

```
# Block non-public files
Disallow: /.nojekyll
```

- [ ] **Step 3: Update sitemap lastmod**

In `sitemap.xml`, change `<lastmod>2026-02-13</lastmod>` to `<lastmod>2026-07-06</lastmod>`.

- [ ] **Step 4: Verify**

Run: `ls Gemfile _config.yml images/tochal.jpg 2>&1; grep -c "_config.yml\|Gemfile" robots.txt; grep lastmod sitemap.xml`
Expected: the three files report "No such file"; grep count is `0`; lastmod shows `2026-07-06`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Jekyll leftovers and stale references"
```

---

### Task 2: Head — meta, Open Graph, Twitter image, canonical, JSON-LD

**Files:**
- Modify: `index.html` (lines 6–24, the `<head>` metadata region)

**Interfaces:**
- Consumes: nothing
- Produces: the new positioning string `Senior Full-Stack .NET Developer & Blockchain Engineer` used verbatim in later tasks

- [ ] **Step 1: Replace title + description + keywords + author**

Replace lines 6–9:

```html
  <title>Mehran Mazhar — Senior Full-Stack .NET Developer & Blockchain Engineer</title>
  <meta name="description" content="Mehran Mazhar is a senior full-stack developer with 10+ years on the .NET stack (C#, ASP.NET Core, SQL Server) and a blockchain engineer — creator of Clutch Protocol, an open-source ride-sharing network built in Rust.">
  <meta name="keywords" content="Mehran Mazhar, Full Stack Developer, .NET Developer, C#, ASP.NET Core, SQL Server, Blockchain Engineer, Rust, Clutch Protocol, Azure">
  <meta name="author" content="Mehran Mazhar">
```

- [ ] **Step 2: Replace Open Graph + Twitter blocks and add images + canonical**

Replace the Open Graph and Twitter Card blocks (lines 11–21) with:

```html
  <!-- Canonical -->
  <link rel="canonical" href="https://mehranmazhar.com/">

  <!-- Open Graph -->
  <meta property="og:title" content="Mehran Mazhar — Senior Full-Stack .NET Developer & Blockchain Engineer">
  <meta property="og:description" content="10+ years on the .NET stack and creator of Clutch Protocol, an open-source blockchain ride-sharing network built in Rust.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://mehranmazhar.com/">
  <meta property="og:image" content="https://mehranmazhar.com/images/profile.jpg">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@mehran_mazhar4">
  <meta name="twitter:title" content="Mehran Mazhar — Senior Full-Stack .NET Developer & Blockchain Engineer">
  <meta name="twitter:description" content="10+ years on the .NET stack and creator of Clutch Protocol, an open-source blockchain ride-sharing network built in Rust.">
  <meta name="twitter:image" content="https://mehranmazhar.com/images/profile.jpg">
```

- [ ] **Step 3: Add JSON-LD Person before `</head>`**

Immediately before `</head>` (line 36), insert:

```html
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Mehran Mazhar",
    "url": "https://mehranmazhar.com/",
    "image": "https://mehranmazhar.com/images/profile.jpg",
    "jobTitle": "Senior Full-Stack .NET Developer & Blockchain Engineer",
    "sameAs": [
      "https://github.com/MehranMazhar",
      "https://linkedin.com/in/mehran-mazhar",
      "https://twitter.com/mehran_mazhar4",
      "https://stackoverflow.com/users/2676799"
    ],
    "alumniOf": "Islamic Azad University",
    "knowsAbout": ["C#", ".NET", "ASP.NET Core", "SQL Server", "Microsoft Azure", "Rust", "Blockchain", "Smart Contracts", "Cryptography"]
  }
  </script>
```

- [ ] **Step 4: Verify the JSON-LD is valid JSON**

Run: `python -c "import re,json,sys; h=open('index.html',encoding='utf-8').read(); m=re.search(r'application/ld\+json\">(.*?)</script>', h, re.S); json.loads(m.group(1)); print('JSON-LD OK')"`
Expected: `JSON-LD OK` (no exception).

Run: `grep -c "og:image\|twitter:image\|rel=\"canonical\"" index.html`
Expected: `3`.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: reposition head metadata, add og/twitter image, canonical, JSON-LD"
```

---

### Task 3: Navigation + Hero + About rewrite

**Files:**
- Modify: `index.html` (nav links ~50–57; hero ~69–93; about text ~115–127)

**Interfaces:**
- Consumes: positioning string from Task 2
- Produces: nav anchor `#education` (target section created in Task 6); hero "Download CV" button linking `assets/Mehran-Mazhar-CV.pdf` (file created in Task 9)

- [ ] **Step 1: Add Education to nav**

In the `nav__links` list, insert an Education link after the Experience link:

```html
        <li><a href="#experience" class="nav__link">Experience</a></li>
        <li><a href="#education" class="nav__link">Education</a></li>
        <li><a href="#research" class="nav__link">Research</a></li>
```

- [ ] **Step 2: Rewrite hero title + description**

Replace the `hero__title` and `hero__description` (lines 70–77) with:

```html
        <h2 class="hero__title reveal">
          <span class="hero__title-gradient">Senior Full-Stack .NET Developer</span> &amp; Blockchain Engineer
        </h2>
        <p class="hero__description reveal">
          10+ years building enterprise web platforms, B2B travel &amp; reservation systems, and IoT
          solutions on the .NET stack. Creator of <strong>Clutch Protocol</strong> — an open-source,
          blockchain-based ride-sharing network written in Rust.
        </p>
```

- [ ] **Step 3: Add Download CV button to hero actions**

Replace the `hero__actions` block (lines 78–85) with:

```html
        <div class="hero__actions reveal">
          <a href="#projects" class="btn btn--primary">
            <i class="fas fa-rocket"></i> View My Work
          </a>
          <a href="assets/Mehran-Mazhar-CV.pdf" class="btn btn--outline" download>
            <i class="fas fa-file-arrow-down"></i> Download CV
          </a>
        </div>
```

- [ ] **Step 4: Fix hero tech pills**

Replace the `hero__tech-icons` block (lines 88–92) with real technologies (not a job title):

```html
          <div class="hero__tech-icons">
            <span class="tech-pill">C# / .NET</span>
            <span class="tech-pill">ASP.NET Core</span>
            <span class="tech-pill">SQL Server</span>
            <span class="tech-pill">Rust</span>
            <span class="tech-pill">Azure</span>
          </div>
```

- [ ] **Step 5: Rewrite About text (de-hyped, .NET-first)**

Replace the two `<p>` paragraphs in `about__text` (lines 116–127) with:

```html
          <p>
            I'm a senior full-stack developer with over a decade of experience delivering enterprise
            portals, B2B travel and reservation platforms, workflow-automation systems, and IoT
            solutions. My core stack is <mark>C#, ASP.NET Core, and SQL Server</mark>, with front-end
            work in Angular, React, and TypeScript.
          </p>
          <p>
            In recent years I've moved deeper into blockchain engineering. I'm the creator of
            <mark>Clutch Protocol</mark>, an open-source decentralized ride-sharing network built in
            Rust — a project that grew out of my master's thesis on reducing travel costs through
            blockchain technology.
          </p>
```

- [ ] **Step 6: Verify**

Run: `grep -c "Senior Full-Stack .NET Developer\|Download CV\|#education\|C# / .NET" index.html`
Expected: `4` or more.
Browser: open `index.html`; hero shows new title, five tech pills, and a Download CV button; nav has Education.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: rewrite nav, hero, and about for full-stack .NET positioning"
```

---

### Task 4: Skills — split flat grid into three labeled groups

**Files:**
- Modify: `index.html` (about skills block ~128–155)
- Modify: `assets/css/style.css` (after line 588, end of `.skill-card span` rule)

**Interfaces:**
- Consumes: existing `.skill-card` markup pattern (`<div class="skill-card"><i class="fas fa-..."></i><span>Label</span></div>`)
- Produces: `.about__skill-group` / `.about__skill-group-label` classes

- [ ] **Step 1: Add CSS for grouped skills**

Append to `assets/css/style.css` after the `.skill-card span { ... }` rule (line 588):

```css
.about__skill-group {
  margin-bottom: 20px;
}

.about__skill-group:last-child {
  margin-bottom: 0;
}

.about__skill-group-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--accent-primary);
  margin-bottom: 10px;
  display: block;
}
```

- [ ] **Step 2: Replace the skills markup**

Replace the `about__skills` inner content (the `<h3>` + `about__skill-grid`, lines 129–154) with three groups:

```html
            <h3>Core Expertise</h3>
            <div class="about__skill-group">
              <span class="about__skill-group-label">.NET Stack</span>
              <div class="about__skill-grid">
                <div class="skill-card"><i class="fas fa-hashtag"></i><span>C# / .NET</span></div>
                <div class="skill-card"><i class="fas fa-server"></i><span>ASP.NET Core</span></div>
                <div class="skill-card"><i class="fas fa-database"></i><span>SQL Server</span></div>
                <div class="skill-card"><i class="fas fa-plug"></i><span>Web API &amp; WCF</span></div>
                <div class="skill-card"><i class="fas fa-cloud"></i><span>Microsoft Azure</span></div>
              </div>
            </div>
            <div class="about__skill-group">
              <span class="about__skill-group-label">Blockchain</span>
              <div class="about__skill-grid">
                <div class="skill-card"><i class="fas fa-cog"></i><span>Rust</span></div>
                <div class="skill-card"><i class="fas fa-file-contract"></i><span>Smart Contracts</span></div>
                <div class="skill-card"><i class="fas fa-shield-halved"></i><span>Cryptography</span></div>
                <div class="skill-card"><i class="fas fa-network-wired"></i><span>libp2p &amp; P2P</span></div>
              </div>
            </div>
            <div class="about__skill-group">
              <span class="about__skill-group-label">Frontend</span>
              <div class="about__skill-grid">
                <div class="skill-card"><i class="fab fa-angular"></i><span>Angular</span></div>
                <div class="skill-card"><i class="fab fa-react"></i><span>React</span></div>
                <div class="skill-card"><i class="fab fa-js"></i><span>TypeScript</span></div>
                <div class="skill-card"><i class="fas fa-code"></i><span>JavaScript</span></div>
                <div class="skill-card"><i class="fab fa-html5"></i><span>HTML &amp; CSS</span></div>
              </div>
            </div>
```

- [ ] **Step 3: Verify**

Run: `grep -c "about__skill-group-label" index.html`
Expected: `3`.
Browser: About section shows three labeled skill groups; cards keep their hover style.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: group skills into .NET / Blockchain / Frontend"
```

---

### Task 5: Experience — replace single entry with four-role timeline

**Files:**
- Modify: `index.html` (the `timeline` block, lines ~280–325)

**Interfaces:**
- Consumes: existing `.timeline__item` markup pattern (dot, content, header/role/company/date, quote, list, tags)
- Produces: four `.timeline__item` entries, most-recent first

- [ ] **Step 1: Replace the timeline contents**

Replace everything inside `<div class="timeline"> ... </div>` (the single existing `timeline__item`, lines 281–324) with the four entries below. Keep the surrounding `<div class="timeline">` open/close tags.

```html
        <!-- 1. Parto CRS / Fly Today -->
        <div class="timeline__item reveal">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <div class="timeline__header">
              <div>
                <h3 class="timeline__role">Senior Full-Stack Developer (.NET)</h3>
                <span class="timeline__company">Parto CRS / Fly Today</span>
              </div>
              <span class="timeline__date">Dec 2018 — Present</span>
            </div>
            <p class="timeline__quote">
              Building B2B travel and airline reservation platforms serving agencies across the region.
            </p>
            <ul class="timeline__list">
              <li>Design and develop B2B flight and hotel reservation systems with C#, ASP.NET Core, and SQL Server <!-- VERIFY --></li>
              <li>Build and maintain REST / Web API services integrating GDS and third-party supplier feeds <!-- VERIFY --></li>
              <li>Develop responsive front-end interfaces and internal tools for booking and fare management <!-- VERIFY --></li>
            </ul>
            <div class="timeline__tags">
              <span>C#</span><span>ASP.NET Core</span><span>SQL Server</span>
              <span>Web API</span><span>JavaScript</span>
            </div>
          </div>
        </div>

        <!-- 2. Vanda IoT -->
        <div class="timeline__item reveal">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <div class="timeline__header">
              <div>
                <h3 class="timeline__role">.NET &amp; IoT Developer</h3>
                <span class="timeline__company">Vanda IoT Communication Technology</span>
              </div>
              <span class="timeline__date">Apr 2018 — Oct 2018</span>
            </div>
            <p class="timeline__quote">
              Built device management and monitoring solutions on Microsoft Azure IoT Hub.
            </p>
            <ul class="timeline__list">
              <li>Developed an IoT device management and monitoring portal on Microsoft Azure IoT Hub</li>
              <li>Built a dual-channel touch switch with cloud connectivity and network cameras with face detection</li>
              <li>Programmed embedded hardware in Python and Arduino; authored content for iot-lab.ir</li>
            </ul>
            <div class="timeline__tags">
              <span>C#</span><span>Azure IoT Hub</span><span>Python</span><span>Arduino</span>
            </div>
          </div>
        </div>

        <!-- 3. Sepna + Tehran Municipality ICT (concurrent) -->
        <div class="timeline__item reveal">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <div class="timeline__header">
              <div>
                <h3 class="timeline__role">Full-Stack Web Developer</h3>
                <span class="timeline__company">Sepna &amp; Tehran Municipality ICT Organization</span>
              </div>
              <span class="timeline__date">Oct 2014 — Feb 2018</span>
            </div>
            <p class="timeline__quote">
              Delivered enterprise portals and an ITIL-based IT service management platform.
            </p>
            <ul class="timeline__list">
              <li>Co-developed an ITIL-based ITSM platform for Tehran Municipality ICT, including a custom workflow engine for business-process automation</li>
              <li>Built enterprise portals on DotNetNuke and single-page apps with Angular</li>
              <li>Developed ASP.NET (Web Forms, MVC, Core) applications and WCF / ASMX web services</li>
              <li>Designed SQL Server databases with stored procedures, functions, and reporting</li>
            </ul>
            <div class="timeline__tags">
              <span>ASP.NET</span><span>DotNetNuke</span><span>Angular</span>
              <span>WCF</span><span>SQL Server</span>
            </div>
          </div>
        </div>

        <!-- 4. Clutch Protocol (side project) -->
        <div class="timeline__item reveal">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <div class="timeline__header">
              <div>
                <h3 class="timeline__role">Founder &amp; Lead Blockchain Engineer</h3>
                <a href="https://github.com/clutch-protocol" target="_blank" rel="noopener" class="timeline__company">
                  Clutch Protocol <i class="fas fa-arrow-up-right-from-square"></i>
                </a>
              </div>
              <span class="timeline__date">2024 — Present · Side Project</span>
            </div>
            <p class="timeline__quote">
              Building an open-source, decentralized ride-sharing network on a custom Rust blockchain.
            </p>
            <ul class="timeline__list">
              <li><strong>Architecture &amp; Design:</strong> Implemented a blockchain core in Rust with Aura consensus for high throughput and low latency</li>
              <li><strong>Full-Stack Development:</strong> Built the API layer, a TypeScript SDK, and a React demo application</li>
              <li><strong>Protocol Design:</strong> Designed a tokenomics model distributing 90% of fees to drivers, 5% to validators, and 5% to developers</li>
              <li><strong>Security:</strong> Implemented client-side transaction signing with secp256k1 / ed25519</li>
            </ul>
            <div class="timeline__tags">
              <span>Rust</span><span>Node.js</span><span>TypeScript</span>
              <span>React</span><span>libp2p</span><span>Cryptography</span>
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Verify**

Run: `grep -c "timeline__item" index.html`
Expected: `4`.
Browser: Experience shows four entries in reverse-chronological order; the Clutch entry is tagged "Side Project".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add real four-role work history to experience timeline"
```

---

### Task 6: Education section + section renumbering + research de-overclaim

**Files:**
- Modify: `index.html` (insert new section after Experience `</section>` ~327; renumber section numbers; research overclaim ~384–387)
- Modify: `assets/css/style.css` (append education styles at end of file)

**Interfaces:**
- Consumes: `#education` nav anchor from Task 3; `.section` / `.section__title` / `.section__number` / `.container` / `.reveal` patterns
- Produces: `.education__grid` / `.edu-card` classes; section id `education`

- [ ] **Step 1: Insert the Education section**

Immediately after the Experience section's closing `</section>` (line 327) and before the Research section comment, insert:

```html
  <!-- ============ EDUCATION SECTION ============ -->
  <section class="section education" id="education">
    <div class="container">
      <h2 class="section__title reveal">
        <span class="section__number">04.</span> Education
      </h2>
      <div class="education__grid">
        <div class="edu-card reveal">
          <div class="edu-card__icon"><i class="fas fa-graduation-cap"></i></div>
          <div class="edu-card__body">
            <span class="edu-card__date">2023</span>
            <h3 class="edu-card__degree">M.Sc., Computer Software Engineering</h3>
            <p class="edu-card__school">Islamic Azad University</p>
            <p class="edu-card__note">Thesis: a blockchain-based network to reduce travel cost in ride-sharing services — the foundation of Clutch Protocol.</p>
          </div>
        </div>
        <div class="edu-card reveal">
          <div class="edu-card__icon"><i class="fas fa-graduation-cap"></i></div>
          <div class="edu-card__body">
            <span class="edu-card__date">2018</span>
            <h3 class="edu-card__degree">B.Sc., Computer Software Engineering</h3>
            <p class="edu-card__school">Islamic Azad University, Islamshahr Branch</p>
          </div>
        </div>
        <div class="edu-card reveal">
          <div class="edu-card__icon"><i class="fas fa-graduation-cap"></i></div>
          <div class="edu-card__body">
            <span class="edu-card__date">2015</span>
            <h3 class="edu-card__degree">A.Sc., Computer Software Engineering</h3>
            <p class="edu-card__school">Shahid Babaei College, Qazvin</p>
          </div>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Renumber the sections that follow**

Education takes `04.`. Update the two later section numbers:
- Research `section__number`: change `04.` to `05.`
- Beyond the Code `section__number`: change `05.` to `06.`

(About `01.`, Projects `02.`, Experience `03.` are unchanged.)

- [ ] **Step 3: Soften the research overclaim**

In the Research section, replace the `research__note` paragraph (lines 384–387) with:

```html
          <p class="research__note">
            This thesis is the academic groundwork for Clutch Protocol — the research is now being
            put into practice as a working open-source implementation.
          </p>
```

- [ ] **Step 4: Add education CSS**

Append to the end of `assets/css/style.css`:

```css
/* ============================================
   EDUCATION SECTION
   ============================================ */
.education__grid {
  display: grid;
  gap: 20px;
}

.edu-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px 28px;
  transition: all var(--transition-fast);
}

.edu-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
}

.edu-card__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-sm);
  color: var(--accent-primary);
  font-size: 1.2rem;
}

.edu-card__date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--accent-primary);
  display: block;
  margin-bottom: 4px;
}

.edu-card__degree {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.edu-card__school {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.edu-card__note {
  font-size: 0.83rem;
  color: var(--text-muted);
  line-height: 1.6;
}
```

- [ ] **Step 5: Verify**

Run: `grep -o 'section__number">0[0-9]' index.html`
Expected: `01`..`06` each appearing once, in order.
Run: `grep -c "id=\"education\"" index.html`
Expected: `1`.
Browser: Education section renders three cards between Experience and Research; nav "Education" scrolls to it and highlights when active; section numbers read 01–06 top to bottom.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: add education section, renumber sections, soften research claim"
```

---

### Task 7: De-hype the Clutch Protocol project section

**Files:**
- Modify: `index.html` (hero of projects section ~172–188; stats block label ~240–261)

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Soften the project quote and description**

Replace the `project-featured__quote` (lines 177–180) with:

```html
          <p class="project-featured__quote">
            An open-source, blockchain-based ride-sharing network designed to lower platform fees and
            return more value to drivers through transparent, decentralized infrastructure.
          </p>
```

Replace the `project-featured__subtitle` if it still reads promotionally — keep "Decentralized Ride-Sharing Platform" (factual, fine).

In the `project-featured__description` paragraph (lines 183–187) replace "I'm building the future of decentralized mobility. This comprehensive blockchain platform" with:

```html
              As creator and lead developer of Clutch Protocol, I designed and built its core
              components:
```

- [ ] **Step 2: Relabel the stats block as design targets**

Add a small label above the stats. Replace the opening of the stats block (line 240) `<div class="project-featured__stats">` with:

```html
          <p class="project-featured__stats-label">Protocol design targets</p>
          <div class="project-featured__stats">
```

Then append CSS to `assets/css/style.css`:

```css
.project-featured__stats-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
}
```

- [ ] **Step 3: Verify**

Run: `grep -c "revolutioniz\|disrupt\|revolutionary" index.html`
Expected: `0`.
Run: `grep -c "design targets" index.html`
Expected: `1`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "refactor: de-hype Clutch section, label stats as design targets"
```

---

### Task 8: Create the CV master (self-contained print HTML)

**Files:**
- Create: `assets/cv/index.html`

**Interfaces:**
- Consumes: career data from the spec
- Produces: `assets/cv/index.html`, the source that Task 9 prints to PDF

- [ ] **Step 1: Write the CV HTML**

Create `assets/cv/index.html` with fully inline CSS, A4 print sizing, and a system font stack. Content below is complete — do not abbreviate.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mehran Mazhar — CV</title>
<style>
  :root { --ink:#1a1a2e; --muted:#555; --accent:#4f46e5; --line:#e2e2ec; }
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size: A4; margin: 14mm 14mm; }
  html,body { background:#fff; color:var(--ink);
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.5pt; line-height: 1.45; }
  .wrap { max-width: 800px; margin: 0 auto; padding: 24px; }
  header { border-bottom: 2px solid var(--accent); padding-bottom: 12px; margin-bottom: 16px; }
  h1 { font-size: 22pt; letter-spacing: 0.5px; }
  .title { color: var(--accent); font-weight: 600; font-size: 11.5pt; margin-top: 2px; }
  .contact { margin-top: 8px; font-size: 9pt; color: var(--muted); display: flex; flex-wrap: wrap; gap: 4px 14px; }
  .contact a { color: var(--muted); text-decoration: none; }
  section { margin-top: 16px; }
  h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1.5px; color: var(--accent);
    border-bottom: 1px solid var(--line); padding-bottom: 4px; margin-bottom: 8px; }
  .job { margin-bottom: 11px; }
  .job__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .job__role { font-weight: 700; font-size: 10.5pt; }
  .job__org { color: var(--accent); font-weight: 600; }
  .job__date { color: var(--muted); font-size: 9pt; white-space: nowrap; }
  ul { margin: 4px 0 0 16px; }
  li { margin-bottom: 2px; }
  .summary { color: #333; }
  .skills p { margin-bottom: 3px; }
  .skills b { color: var(--ink); }
  .edu { margin-bottom: 7px; }
  .edu__deg { font-weight: 600; }
  .edu__meta { color: var(--muted); font-size: 9pt; }
  .muted { color: var(--muted); }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Mehran Mazhar</h1>
    <div class="title">Senior Full-Stack .NET Developer &amp; Blockchain Engineer</div>
    <div class="contact">
      <span>Tehran, Iran</span>
      <a href="mailto:mehran.mazhar@gmail.com">mehran.mazhar@gmail.com</a>
      <a href="https://mehranmazhar.com">mehranmazhar.com</a>
      <a href="https://github.com/MehranMazhar">github.com/MehranMazhar</a>
      <a href="https://linkedin.com/in/mehran-mazhar">linkedin.com/in/mehran-mazhar</a>
    </div>
  </header>

  <section>
    <h2>Summary</h2>
    <p class="summary">
      Senior full-stack developer with 10+ years delivering enterprise portals, B2B travel and
      reservation platforms, workflow-automation systems, and IoT solutions on the .NET stack
      (C#, ASP.NET Core, SQL Server). Creator of Clutch Protocol, an open-source blockchain-based
      ride-sharing network written in Rust, developed from master's thesis research.
    </p>
  </section>

  <section>
    <h2>Experience</h2>

    <div class="job">
      <div class="job__head">
        <span><span class="job__role">Senior Full-Stack Developer (.NET)</span> — <span class="job__org">Parto CRS / Fly Today</span></span>
        <span class="job__date">Dec 2018 — Present</span>
      </div>
      <ul>
        <li>Design and develop B2B flight and hotel reservation systems with C#, ASP.NET Core, and SQL Server.</li>
        <li>Build and maintain REST / Web API services integrating GDS and third-party supplier feeds.</li>
        <li>Develop responsive front-end interfaces and internal tools for booking and fare management.</li>
      </ul>
    </div>

    <div class="job">
      <div class="job__head">
        <span><span class="job__role">.NET &amp; IoT Developer</span> — <span class="job__org">Vanda IoT Communication Technology</span></span>
        <span class="job__date">Apr 2018 — Oct 2018</span>
      </div>
      <ul>
        <li>Developed an IoT device management and monitoring portal on Microsoft Azure IoT Hub.</li>
        <li>Built a dual-channel touch switch with cloud connectivity and network cameras with face detection.</li>
        <li>Programmed embedded hardware in Python and Arduino; authored content for iot-lab.ir.</li>
      </ul>
    </div>

    <div class="job">
      <div class="job__head">
        <span><span class="job__role">Full-Stack Web Developer</span> — <span class="job__org">Sepna &amp; Tehran Municipality ICT Organization</span></span>
        <span class="job__date">Oct 2014 — Feb 2018</span>
      </div>
      <ul>
        <li>Co-developed an ITIL-based ITSM platform for Tehran Municipality ICT, including a custom workflow engine for business-process automation.</li>
        <li>Built enterprise portals on DotNetNuke and single-page apps with Angular.</li>
        <li>Developed ASP.NET (Web Forms, MVC, Core) applications and WCF / ASMX web services.</li>
        <li>Designed SQL Server databases with stored procedures, functions, and reporting.</li>
      </ul>
    </div>

    <div class="job">
      <div class="job__head">
        <span><span class="job__role">Founder &amp; Lead Blockchain Engineer</span> — <span class="job__org">Clutch Protocol (open-source side project)</span></span>
        <span class="job__date">2024 — Present</span>
      </div>
      <ul>
        <li>Implemented a blockchain core in Rust with Aura consensus for high throughput and low latency.</li>
        <li>Built the API layer, a TypeScript SDK, and a React demo application.</li>
        <li>Implemented client-side transaction signing with secp256k1 / ed25519.</li>
      </ul>
    </div>
  </section>

  <section class="skills">
    <h2>Skills</h2>
    <p><b>.NET Stack:</b> C#, ASP.NET Core, ASP.NET MVC / Web Forms, Web API, WCF, SQL Server, Microsoft Azure</p>
    <p><b>Blockchain:</b> Rust, Smart Contracts, Cryptography (secp256k1 / ed25519), libp2p, P2P networking</p>
    <p><b>Frontend:</b> Angular, React, TypeScript, JavaScript, HTML, CSS</p>
    <p><b>Other:</b> DotNetNuke, MongoDB, Docker, Git, Python, Arduino, ITIL / ITSM</p>
  </section>

  <section>
    <h2>Education</h2>
    <div class="edu">
      <div class="edu__deg">M.Sc., Computer Software Engineering <span class="edu__meta">— Islamic Azad University, 2023</span></div>
      <div class="muted">Thesis: a blockchain-based network to reduce travel cost in ride-sharing services.</div>
    </div>
    <div class="edu">
      <div class="edu__deg">B.Sc., Computer Software Engineering <span class="edu__meta">— Islamic Azad University, Islamshahr Branch, 2018</span></div>
    </div>
    <div class="edu">
      <div class="edu__deg">A.Sc., Computer Software Engineering <span class="edu__meta">— Shahid Babaei College, Qazvin, 2015</span></div>
    </div>
  </section>
</div>
</body>
</html>
```

- [ ] **Step 2: Verify it opens and is valid HTML**

Run: `python -c "from html.parser import HTMLParser; HTMLParser().feed(open('assets/cv/index.html',encoding='utf-8').read()); print('HTML parse OK')"`
Expected: `HTML parse OK`.
Browser: open `assets/cv/index.html`; single-page CV renders cleanly with header, summary, four jobs, skills, education.

- [ ] **Step 3: Commit**

```bash
git add assets/cv/index.html
git commit -m "feat: add self-contained print-ready CV master"
```

---

### Task 9: Generate CV PDF and wire the download link in contact

**Files:**
- Create: `assets/Mehran-Mazhar-CV.pdf` (generated)
- Modify: `index.html` (contact section CTA ~459–461)

**Interfaces:**
- Consumes: `assets/cv/index.html` (Task 8); hero already links `assets/Mehran-Mazhar-CV.pdf` (Task 3)
- Produces: the committed PDF the site links to

- [ ] **Step 1: Generate the PDF with headless Chrome**

Run (PowerShell, absolute paths; use the repo root as appropriate):

```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$src = "file:///D:/source/mehranmazhar/MehranMazhar.com/assets/cv/index.html"
$out = "D:\source\mehranmazhar\MehranMazhar.com\assets\Mehran-Mazhar-CV.pdf"
& $chrome --headless=new --disable-gpu --no-pdf-header-footer "--print-to-pdf=$out" $src
```

Expected: exit code 0 and `assets/Mehran-Mazhar-CV.pdf` created. If `--headless=new` is unsupported on the installed build, retry with `--headless`. If `--no-pdf-header-footer` errors, retry without it.

- [ ] **Step 2: Verify the PDF exists and is non-trivial**

Run: `ls -l assets/Mehran-Mazhar-CV.pdf` (or `Get-Item`), and open it.
Expected: file size > 20 KB; opens to a one-page CV matching the HTML.

- [ ] **Step 3: Add Download CV to the contact section**

Replace the single contact CTA link (lines 459–461) with two actions:

```html
        <div class="contact__actions">
          <a href="mailto:mehran.mazhar@gmail.com" class="btn btn--primary btn--lg">
            <i class="fas fa-envelope"></i> Say Hello
          </a>
          <a href="assets/Mehran-Mazhar-CV.pdf" class="btn btn--outline btn--lg" download>
            <i class="fas fa-file-arrow-down"></i> Download CV
          </a>
        </div>
```

Append CSS to `assets/css/style.css`:

```css
.contact__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
```

- [ ] **Step 4: Verify**

Run: `grep -c "Mehran-Mazhar-CV.pdf" index.html`
Expected: `2` (hero + contact).
Browser: both Download CV buttons open the PDF.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/style.css assets/Mehran-Mazhar-CV.pdf
git commit -m "feat: generate CV PDF and wire download links"
```

---

## Self-Review

**Spec coverage:**
- Reposition to .NET + blockchain → Tasks 2, 3 (title/meta/hero/about). ✓
- Real work history → Task 5. ✓
- Education section restored → Task 6. ✓
- Downloadable CV → Tasks 8, 9. ✓
- Skills rewrite into groups → Task 4. ✓
- Tone down hype → Task 7 (Clutch) + Task 6 Step 3 (research overclaim). ✓
- SEO: og:image/twitter:image, JSON-LD, canonical → Task 2. ✓
- Hygiene: delete Gemfile/_config.yml/tochal.jpg, fix robots/sitemap → Task 1. ✓
- Nav Education link + section renumber + anchor integrity → Tasks 3, 6. ✓
- `<!-- VERIFY -->` on Parto/Fly Today bullets → Task 5 Step 1. ✓

**Placeholder scan:** No "TBD/TODO"; every code/content step contains complete content. The `<!-- VERIFY -->` markers are intentional per spec (user-confirmable facts), not plan placeholders.

**Type/label consistency:** New CSS classes (`about__skill-group`, `about__skill-group-label`, `education__grid`, `edu-card` + `__icon/__date/__degree/__school/__note`, `project-featured__stats-label`, `contact__actions`) are each defined once and referenced consistently. PDF filename `assets/Mehran-Mazhar-CV.pdf` is identical in Tasks 3, 8-reference, and 9. Section numbers 01–06 assigned exactly once each.

All checks pass.
