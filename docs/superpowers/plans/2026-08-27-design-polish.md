# Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix a CSS specificity bug that silently deletes 14 spacing rules, then polish the existing light-teal design — Selected Work hierarchy, elevation discipline, WCAG AA contrast, and a five-step type ramp — without changing the visual identity.

**Architecture:** A single static page (`index.html`) styled by a single stylesheet (`assets/css/style.css`), no build step. All work is CSS token and rule edits plus one HTML restructure of the Selected Work section. Tasks are ordered so the cascade fix lands first — every later spacing decision depends on it.

**Tech Stack:** Static HTML/CSS/JS on GitHub Pages. Python 3 for the contrast check. Verification is done by measuring the live DOM through the Claude Browser tools, because there is no test harness.

## Global Constraints

- Spec of record: `docs/superpowers/specs/2026-08-27-design-polish-design.md`. Do not deviate without updating it.
- No change to the visual identity: the warm light palette, deep-teal `--accent`, system-sans typography and `mm-` class prefix all stay.
- No new dependency, no build step, no framework, no dark mode, no new page.
- No content or copy rewriting. The duplicated "10+ years" / "7+ years, one platform" figures stay.
- Every colour change must keep `python docs/check-contrast.py` exiting 0.
- The site is served from `master` and deploys on push. Commit per task; do not push until the whole plan is verified.
- Class naming follows the existing convention: `mm-` prefix, `__element`, `--modifier`.
- The browser pane may refuse screenshots in this environment. Verify numerically via `mcp__Claude_Browser__javascript_tool`; visual sign-off is the user's.

## Verification Helper

Several tasks measure the live page. Unless a task says otherwise, load the local file first so
unpushed edits are what gets measured:

```
mcp__Claude_Browser__preview_start with url: file:///D:/source/mehranmazhar/MehranMazhar.com/index.html
```

If `file://` is refused, run a local server instead and use `http://localhost:8000`:

```bash
python -m http.server 8000
```

After each CSS edit, reload before measuring — `mcp__Claude_Browser__navigate` with the same URL.

---

### Task 1: Fix the reset that deletes 14 spacing rules

**Files:**
- Modify: `assets/css/style.css:34`

**Interfaces:**
- Consumes: nothing.
- Produces: a zero-specificity element reset. Every later task depends on component-level margins actually applying.

- [ ] **Step 1: Measure the broken state**

Load the local file per the Verification Helper, then run this in `javascript_tool`:

```js
(() => {
  const q = s => document.querySelector(s);
  const mt = s => getComputedStyle(q(s)).marginTop;
  return {
    contactTitle: mt('.mm-contact__title'),
    contactText: mt('.mm-contact__text'),
    heroDesc: mt('.mm-hero__desc'),
    researchTitle: mt('.mm-research__title'),
    statsLabel: getComputedStyle(q('.mm-stats-label')).margin
  };
})()
```

Expected (the bug): every value `0px`, `statsLabel` reported as `0px`.

- [ ] **Step 2: Apply the fix**

Replace line 34 of `assets/css/style.css`:

```css
  .mm-root h1,.mm-root h2,.mm-root h3,.mm-root h4,.mm-root p { margin: 0; }
```

with:

```css
  /* :where() keeps this reset at zero specificity, so a single-class component rule such as
     .mm-contact__title can still set its own margin. Do NOT rewrite this as
     `.mm-root h1, .mm-root h2, …` — that form scores (0,1,1), outranks every single-class
     component selector, and silently deletes their spacing. Fourteen rules were dead this way. */
  .mm-root :where(h1,h2,h3,h4,p) { margin: 0; }
```

- [ ] **Step 3: Re-measure and confirm all 14 revive**

Reload the page, then run:

```js
(() => {
  const expected = {
    '.mm-hero__greet': ['marginBottom','14px'],
    '.mm-hero__title': ['marginTop','18px'],
    '.mm-hero__desc': ['marginTop','22px'],
    '.mm-proj__quote': ['marginBottom','30px'],
    '.mm-proj__lead': ['marginBottom','20px'],
    '.mm-stats-label': ['marginTop','34px'],
    '.mm-tl__quote': ['marginTop','14px'],
    '.mm-educard__note': ['marginTop','2px'],
    '.mm-research__title': ['marginTop','12px'],
    '.mm-research__advisor': ['marginTop','12px'],
    '.mm-research__quote': ['marginTop','18px'],
    '.mm-research__note': ['marginTop','24px'],
    '.mm-contact__title': ['marginTop','14px'],
    '.mm-contact__text': ['marginTop','18px']
  };
  const fails = [];
  for (const [sel,[prop,want]] of Object.entries(expected)) {
    const el = document.querySelector(sel);
    if (!el) { fails.push(sel + ' MISSING'); continue; }
    const got = getComputedStyle(el)[prop];
    if (got !== want) fails.push(`${sel} ${prop}: want ${want}, got ${got}`);
  }
  return fails.length ? {PASS:false, fails} : {PASS:true, checked:Object.keys(expected).length};
})()
```

Expected: `{PASS: true, checked: 14}`.

- [ ] **Step 4: Walk the six affected sections**

Fourteen margins just activated at once. Check each section at 1280px and 375px and record the
page height change:

```js
({height: document.documentElement.scrollHeight, viewport: innerWidth})
```

Read each of `#mm-hero`, `#mm-projects`, `#mm-experience`, `#mm-education`, `#mm-research`,
`#mm-contact` with `get_page_text` or `read_page` and confirm nothing overlaps or collides. If a
revived value now reads as too loose, tune that component's own margin — do **not** revert the
reset.

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css
git commit -m "fix(css): stop the element reset deleting 14 authored margins

The reset was written as \`.mm-root h1, …, .mm-root p\`, which scores
(0,1,1) and outranks single-class component selectors like
.mm-contact__title. Fourteen authored spacing declarations across the
hero, Selected Work, timeline, education, research and contact sections
never applied — the contact stack measured 4px and 0px gaps where 14px
and 18px were authored.

:where() drops the reset to zero specificity so component rules win on
source order. Verified in-browser: all 14 margins now compute to their
authored values.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Fix the contact box composition

**Files:**
- Modify: `assets/css/style.css:515-516`

**Interfaces:**
- Consumes: Task 1's working margins — without them the gap changes here are inert.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Measure the current paragraph rag**

At a 1280px viewport, run:

```js
(() => {
  const t = document.querySelector('.mm-contact__text');
  const lh = parseFloat(getComputedStyle(t).lineHeight);
  const node = t.firstChild, range = document.createRange(), text = node.textContent;
  const widths = []; let start = 0, prevTop = null;
  for (let i = 1; i <= text.length; i++) {
    range.setStart(node, start); range.setEnd(node, i);
    const rects = range.getClientRects(); const last = rects[rects.length-1];
    if (!last) continue;
    if (prevTop !== null && Math.abs(last.top - prevTop) > 2) {
      range.setStart(node, start); range.setEnd(node, i-1);
      widths.push(Math.round(range.getBoundingClientRect().width)); start = i-1;
    }
    prevTop = last.top;
  }
  range.setStart(node, start); range.setEnd(node, text.length);
  widths.push(Math.round(range.getBoundingClientRect().width));
  return {maxWidth: getComputedStyle(t).maxWidth,
          lines: Math.round(t.getBoundingClientRect().height/lh), rag: widths};
})()
```

Expected before the fix, at a 1280px viewport: `maxWidth: "500px"`, `lines: 4`,
`rag: [487, 493, 449, 343]`. The defect here is the cap, not the rag: 500px is 138px narrower than
the 638px content box. (At 600px the rag becomes `[549, 589, 588, 41]` — that 41px orphan is why
620px is the target rather than 600px.) If your viewport is not 1280px the absolute numbers differ;
what must hold is 4 lines before and 3 after.

- [ ] **Step 2: Apply the fix**

Replace lines 515-516 of `assets/css/style.css`:

```css
  .mm-contact__title { font-size: clamp(28px, 4.5vw, 42px); font-weight: 800; letter-spacing: -.03em; color: var(--ink); margin-top: 14px; line-height: 1.1; }
  .mm-contact__text { margin: 18px auto 0; max-width: 500px; color: var(--ink-soft); font-size: 16.5px; line-height: 1.65; }
```

with:

```css
  /* 10px above the title groups it with its eyebrow; 20px below separates it from the body copy.
     Equal gaps made the three read as one undifferentiated block. */
  .mm-contact__title { font-size: clamp(28px, 4.5vw, 42px); font-weight: 800; letter-spacing: -.03em; color: var(--ink); margin-top: 10px; line-height: 1.1; }
  /* 620px, not 500px: the box's content width is 638px, and 500px broke the paragraph into four
     lines ending in a 56px orphan. Inert at mobile, where content width is 269px. */
  .mm-contact__text { margin: 20px auto 0; max-width: 620px; color: var(--ink-soft); font-size: 16.5px; line-height: 1.65; }
```

Note: the `font-size: 16.5px` here is left alone — Task 4 converts it to `var(--fs-md)`.

- [ ] **Step 3: Confirm three lines and no orphan**

Reload, re-run the Step 1 snippet. Expected: `maxWidth: "620px"`, `lines: 3`,
`rag: [614, 591, 566]`. The shortest line must be at least 80% of 620px (566/620 = 91%).

Then confirm the gaps differentiated:

```js
(() => {
  const g = (a,b) => { const x=document.querySelector(a).getBoundingClientRect(),
                             y=document.querySelector(b).getBoundingClientRect();
                       return Math.round(y.top-(x.top+x.height)); };
  return {labelToTitle: g('.mm-contact__label','.mm-contact__title'),
          titleToText: g('.mm-contact__title','.mm-contact__text')};
})()
```

Expected: `titleToText` strictly greater than `labelToTitle`.

- [ ] **Step 4: Check mobile did not regress**

`resize_window` to preset `mobile`, reload, re-run the Step 1 snippet. Expected: `lines: 7`, every
rag value between 200 and 269 — no orphan under 100px. Then `resize_window` back to `desktop`.

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css
git commit -m "fix(css): widen contact paragraph and differentiate its stack gaps

max-width was 500px inside a 638px content box, breaking the paragraph
into four lines ending in a 56px orphan (measured rag 614/591/566/56).
At 620px it sets three lines, rag 614/591/566, shortest line 91% of
measure. Inert at mobile, where content width is 269px.

Title margin 14px->10px and paragraph 18px->20px so the eyebrow groups
with the heading rather than all three reading as one block.

text-wrap was tested and not used: at 620px normal, pretty and balance
produce identical breaks, and the heading is a single line at both
1280px and 375px.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Fix the two failing contrast pairs

**Files:**
- Modify: `assets/css/style.css:8` (`--ink-mute`), `assets/css/style.css:12-22` (add `--code-str` token), `assets/css/style.css:240` (`.mm-code .st`)

**Interfaces:**
- Consumes: nothing.
- Produces: `--code-str` token, consumed by nothing else.

- [ ] **Step 1: Run the check and watch it fail**

```bash
python docs/check-contrast.py
```

Expected: exit code 1, four FAIL lines — `--ink-mute` on `--bg` (3.72:1), on `--surface` (3.86:1),
on `--surface-2` (3.53:1), and `--mm-code .st on --surface` (3.99:1).

- [ ] **Step 2: Change the two colour values**

In `assets/css/style.css`, line 8, replace:

```css
    --ink-mute:      #82827e;
```

with:

```css
    --ink-mute:      #6f6f6a;   /* 4.62:1 worst case (on --surface-2) — see docs/check-contrast.py */
```

Then add a `--code-str` token immediately after the `--accent-ink` declaration (line 12):

```css
    --code-str:      #8a6c2e;   /* hero code-card string literal, 4.92:1 on --surface */
```

Then replace line 240:

```css
  .mm-code .kw { color: var(--accent); } .mm-code .st { color: #9a7b3a; }
```

with:

```css
  .mm-code .kw { color: var(--accent); } .mm-code .st { color: var(--code-str); }
```

- [ ] **Step 3: Point the check at the new token**

In `docs/check-contrast.py`, replace the `LITERAL_PAIRS` entry so the string colour is checked as a
token pair rather than a literal. Change:

```python
LITERAL_PAIRS = [
    ("#fff on --accent", "#ffffff", "accent"),
    ("--mm-code .st on --surface", "#9a7b3a", "surface"),
]
```

to:

```python
LITERAL_PAIRS = [
    ("#fff on --accent", "#ffffff", "accent"),
]
```

and add `("code-str", "surface")` to the end of the `PAIRS` list.

- [ ] **Step 4: Run the check and confirm it passes**

```bash
python docs/check-contrast.py
```

Expected: exit code 0, final line `All 16 pairs meet 4.5:1.`, and no FAIL lines.

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css docs/check-contrast.py
git commit -m "fix(a11y): bring --ink-mute and the code string colour to WCAG AA

--ink-mute measured 3.72:1 on --bg, 3.86:1 on --surface and 3.53:1 on
--surface-2, used at 11-13.5px in tech tags, stat captions, education
notes, timeline dates and the footer. #6f6f6a measures 4.62:1 worst
case.

The hero code card's string literal (#9a7b3a, 3.99:1) becomes a
--code-str token at #8a6c2e (4.92:1) so the contrast script covers it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Collapse 13 body font sizes into a five-step ramp

**Files:**
- Modify: `assets/css/style.css` — add tokens near line 22, then edit the 40 `font-size` declarations listed below

**Interfaces:**
- Consumes: nothing.
- Produces: `--fs-xs`, `--fs-sm`, `--fs-base`, `--fs-md`, `--fs-lg`. Task 5 uses `--fs-lg` and `--fs-base` for its card titles.

- [ ] **Step 1: Add the five tokens**

In `assets/css/style.css`, after the `--serif` declaration (line 22), add:

```css
    /* Body-text ramp. Display sizes use clamp() directly and are not on this ramp;
       neither are .mm-logo, .mm-mini b or .mm-stat b. See the spec for the mapping. */
    --fs-xs:         12px;      /* mono labels, tech tags, eyebrows */
    --fs-sm:         13.5px;    /* card meta, notes, dates */
    --fs-base:       15px;      /* card body, list items */
    --fs-md:         17px;      /* prose, section lead */
    --fs-lg:         19px;      /* card titles, timeline role */
```

- [ ] **Step 2: Replace every mapped declaration**

Apply the mapping exactly. Each row is `line: current value -> token`.

`--fs-xs` (11, 11.5, 12, 12.5):

```
161: 12.5px -> var(--fs-xs)    .mm-eyebrow
213: 11.5px -> var(--fs-xs)    .mm-stack-label
237: 12px   -> var(--fs-xs)    .mm-hero__card-file
249: 12px   -> var(--fs-xs)    .mm-mini span
266: 12.5px -> var(--fs-xs)    .mm-about__badge
269: 11px   -> var(--fs-xs)    .mm-about__badge span
309: 11.5px -> var(--fs-xs)    .mm-proj__tag
349: 11px   -> var(--fs-xs)    .mm-repo__tech span
354: 11.5px -> var(--fs-xs)    .mm-stats-label
365: 12px   -> var(--fs-xs)    .mm-stat em
395: 12.5px -> var(--fs-xs)    .mm-tl__date
409: 11.5px -> var(--fs-xs)    .mm-tl__tags span
428: 12.5px -> var(--fs-xs)    .mm-educard__date
449: 11.5px -> var(--fs-xs)    .mm-research__label
512: 12px   -> var(--fs-xs)    .mm-contact__label
```

`--fs-sm` (13, 13.5):

```
150: 13.5px -> var(--fs-sm)    .mm-btn--sm
218: 13px   -> var(--fs-sm)    .mm-pill
238: 13px   -> var(--fs-sm)    .mm-code
276: 13px   -> var(--fs-sm)    .mm-expertise > h3
345: 13.5px -> var(--fs-sm)    .mm-repo p
431: 13.5px -> var(--fs-sm)    .mm-educard__note
469: 13.5px -> var(--fs-sm)    .mm-hl__item p
533: 13px   -> var(--fs-sm)    .mm-footer__copy
```

`--fs-base` (14, 14.5, 15, 15.5):

```
84:  14.5px -> var(--fs-base)  .mm-navlinks a
139: 14.5px -> var(--fs-base)  .mm-btn
151: 15.5px -> var(--fs-base)  .mm-btn--lg
194: 15px   -> var(--fs-base)  .mm-hero__greet
283: 14px   -> var(--fs-base)  .mm-skillgroup__label
291: 14.5px -> var(--fs-base)  .mm-skill
323: 15.5px -> var(--fs-base)  .mm-proj__lead
342: 15px   -> var(--fs-base)  .mm-repo h4
364: 14px   -> var(--fs-base)  .mm-stat span
391: 14.5px -> var(--fs-base)  .mm-tl__co
399: 15px   -> var(--fs-base)  .mm-tl__quote
401: 14.5px -> var(--fs-base)  .mm-tl__list li
430: 14.5px -> var(--fs-base)  .mm-educard__school
453: 14.5px -> var(--fs-base)  .mm-research__advisor
468: 14.5px -> var(--fs-base)  .mm-hl__item strong
471: 14px   -> var(--fs-base)  .mm-research__note
492: 14px   -> var(--fs-base)  .mm-icard p
531: 14px   -> var(--fs-base)  .mm-footer__credit
```

`--fs-md` (16, 16.5, 17):

```
132: 16px   -> var(--fs-md)    .mm-navlinks a (mobile, inside @media max-width 860px)
173: 17px   -> var(--fs-md)    .mm-head p
207: 17px   -> var(--fs-md)    .mm-hero__desc
270: 16.5px -> var(--fs-md)    .mm-prose p
315: 16px   -> var(--fs-md)    .mm-proj__sub
429: 17px   -> var(--fs-md)    .mm-educard h3
456: 16.5px -> var(--fs-md)    .mm-research__quote
491: 17px   -> var(--fs-md)    .mm-icard h3
516: 16.5px -> var(--fs-md)    .mm-contact__text
```

`--fs-lg` (18):

```
390: 18px   -> var(--fs-lg)    .mm-tl__role
```

Do **not** touch these — they are display sizes or tuned one-offs:

```
72:  16px    .mm-logo            (tuned to the 68px nav height)
169: clamp   .mm-h2
198: clamp   .mm-hero__name
202: clamp   .mm-hero__title
248: 22px    .mm-mini b          (display numeral)
314: clamp   .mm-proj__title
319: clamp   .mm-proj__quote
363: 30px    .mm-stat b          (display numeral)
452: clamp   .mm-research__title
515: clamp   .mm-contact__title
```

- [ ] **Step 3: Verify no unmapped literal sizes remain**

```bash
grep -nE "font-size: *[0-9]" assets/css/style.css | grep -vE "clamp|16px; *$|: *16px|22px|30px"
```

Expected: no output. If a line appears, it was missed in Step 2 — map it and re-run.

Then confirm the count of remaining literal sizes is exactly the four allowed:

```bash
grep -cE "font-size: *(16|22|30)px" assets/css/style.css
```

Expected: `3` — exactly `.mm-logo` (line 72), `.mm-mini b` (248) and `.mm-stat b` (363). Before
this task the same grep returns 5; `.mm-navlinks a` (132) and `.mm-proj__sub` (315) both become
`var(--fs-md)` and drop out. If the number is not 3, list the matches with `grep -nE` and reconcile
against the do-not-touch list above.

- [ ] **Step 4: Confirm nothing shifted more than 1px**

Reload the page and run:

```js
(() => {
  const want = {
    '.mm-eyebrow':'12px', '.mm-repo__tech span':'12px', '.mm-repo p':'13.5px',
    '.mm-skill':'15px', '.mm-btn--lg':'15px', '.mm-prose p':'17px',
    '.mm-tl__role':'19px', '.mm-logo':'16px', '.mm-stat b':'30px'
  };
  const fails = [];
  for (const [sel,px] of Object.entries(want)) {
    const el = document.querySelector(sel);
    if (!el) { fails.push(sel+' MISSING'); continue; }
    const got = getComputedStyle(el).fontSize;
    if (got !== px) fails.push(`${sel}: want ${px}, got ${got}`);
  }
  return fails.length ? {PASS:false, fails} : {PASS:true};
})()
```

Expected: `{PASS: true}`.

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css
git commit -m "refactor(css): collapse 13 body font sizes onto a five-step ramp

The stylesheet used 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5,
16, 16.5 and 17px for body text — steps close enough to read as
accidental. Forty declarations now resolve to --fs-xs/sm/base/md/lg.

15.5px maps to --fs-base rather than --fs-md so .mm-btn--lg and
.mm-proj__lead are not inflated; every shift is 1px or less. Display
clamp() sizes, .mm-logo and the two display numerals are off the ramp.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Split Selected Work into three weighted tiers

**Files:**
- Modify: `index.html:218-357` (the Selected Work section)
- Modify: `assets/css/style.css:297-325` (`.mm-proj*` rules), `assets/css/style.css:327-351` (`.mm-repo*` rules)

**Interfaces:**
- Consumes: `--fs-lg`, `--fs-base`, `--fs-xs` from Task 4.
- Produces: `.mm-repo--major`, `.mm-repo--compact`, `.mm-repo--aside` modifiers and a `.mm-repos--compact` grid variant. Task 6 scopes hover rules against these.

- [ ] **Step 1: Record the before state**

```js
(() => {
  const cards = document.querySelectorAll('.mm-repo');
  return {
    total: cards.length,
    links: [...cards].filter(c => c.tagName === 'A').length,
    divs: [...cards].filter(c => c.tagName === 'DIV').length,
    wrapper: !!document.querySelector('.mm-proj'),
    grids: document.querySelectorAll('.mm-repos').length
  };
})()
```

Expected: `{total: 12, links: 4, divs: 8, wrapper: true, grids: 3}`.

- [ ] **Step 2: Add the tier CSS**

In `assets/css/style.css`, immediately after the `.mm-repo__tech span` rule (ends line 351), add:

```css
  /* ---- Selected Work tiers ----
     Three weights, not twelve identical cards. Major = money path (stop the reader).
     Compact = product verticals (dense, secondary). Aside = the open-source side project. */

  .mm-repo--major {
    padding: 24px;
    border-left: 3px solid var(--accent);
    box-shadow: var(--shadow-sm);
  }
  .mm-repo--major h4 {
    font-family: var(--sans);
    font-size: var(--fs-lg);
    font-weight: 700;
    letter-spacing: -.01em;
  }
  .mm-repo--major .mm-repo__ic { width: 44px; height: 44px; border-radius: 11px; }
  .mm-repo--major .mm-repo__ic svg { width: 22px; height: 22px; }

  .mm-repos--compact { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 900px){ .mm-repos--compact { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px){ .mm-repos--compact { grid-template-columns: 1fr; } }

  .mm-repo--compact {
    padding: 16px;
    box-shadow: none;
    background: var(--surface);
  }
  .mm-repo--compact h4 { font-size: var(--fs-base); }
  /* Tags become inline text rather than chips: the chip border repeated six times across a
     dense grid was most of the visual noise in this tier. */
  .mm-repo--compact .mm-repo__tech { gap: 0; }
  .mm-repo--compact .mm-repo__tech span {
    border: 0; background: none; padding: 0; color: var(--ink-mute);
  }
  .mm-repo--compact .mm-repo__tech span + span::before {
    content: " · "; color: var(--line);
  }

  .mm-repo--aside {
    background: var(--surface-2);
    box-shadow: none;
  }
```

- [ ] **Step 3: Restructure the HTML**

In `index.html`, inside the Selected Work section:

1. Delete the `<div class="mm-proj mm-reveal">` opening tag and the `<div class="mm-proj__body">`
   opening tag, plus their two matching closing `</div>` tags at the end of the section. The
   pull-quote, stats and card grids become direct children of `.mm-container`.
2. On the four money-path cards (`Refunds, end to end`, `Payment gateways`,
   `Wallets & withdrawals`, `B2B webhook surface`), change `class="mm-repo"` to
   `class="mm-repo mm-repo--major"`.
3. On the grid wrapping the six product verticals (`Virtual interlining`, `Auto-reserve`,
   `Flexible search`, `Gift cards`, `Flight price alerts`,
   `Travel insurance & supplier hub`), change `class="mm-repos"` to
   `class="mm-repos mm-repos--compact"`, and on each of those six cards change `class="mm-repo"`
   to `class="mm-repo mm-repo--compact"` (keep `mm-repo` on the two that are `<a>` elements and
   keep their `href`/`target`/`rel` attributes untouched).
4. On the two side-project cards (`Clutch Protocol`, `master-thesis`), change `class="mm-repo"` to
   `class="mm-repo mm-repo--aside"`.
5. Add `mm-reveal` to each of the three grid wrappers so the scroll-reveal still fires now that
   the single `.mm-proj mm-reveal` wrapper is gone.

- [ ] **Step 4: Verify the tiers and the grids**

Reload and run:

```js
(() => {
  const n = s => document.querySelectorAll(s).length;
  const cols = s => getComputedStyle(document.querySelector(s)).gridTemplateColumns.split(' ').length;
  const shadow = s => getComputedStyle(document.querySelector(s)).boxShadow;
  return {
    major: n('.mm-repo--major'), compact: n('.mm-repo--compact'), aside: n('.mm-repo--aside'),
    total: n('.mm-repo'), wrapperGone: !document.querySelector('.mm-proj'),
    compactCols: cols('.mm-repos--compact'),
    majorHasShadow: shadow('.mm-repo--major') !== 'none',
    compactNoShadow: shadow('.mm-repo--compact') === 'none',
    revealCount: n('.mm-repos.mm-reveal')
  };
})()
```

Expected: `{major: 4, compact: 6, aside: 2, total: 12, wrapperGone: true, compactCols: 3,
majorHasShadow: true, compactNoShadow: true, revealCount: 3}`.

The card population is fixed and verified: 12 cards in 3 grids — 4 money path (all `div`), 6
verticals (4 `div` + 2 `a`), 2 side project (both `a`). If `total` is not 12 after the edit, a
class attribute was mistyped; fix it rather than adjusting this expectation.

- [ ] **Step 5: Verify the responsive collapse**

For each of 900px, 700px and 560px: `resize_window` with that width and height 900, reload, then:

```js
({w: innerWidth,
  compactCols: getComputedStyle(document.querySelector('.mm-repos--compact')).gridTemplateColumns.split(' ').length,
  majorCols: getComputedStyle(document.querySelector('.mm-repos:not(.mm-repos--compact)')).gridTemplateColumns.split(' ').length,
  overflow: document.documentElement.scrollWidth > innerWidth})
```

Expected: at 900px `compactCols: 2`; at 700px `compactCols: 2`, `majorCols: 1`; at 560px
`compactCols: 1`. `overflow` must be `false` at every width. Reset with `resize_window` preset
`desktop`.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat(css): give Selected Work three weighted tiers

Twelve identical .mm-repo cards became a wall: money path, product
verticals and the open-source side project all rendered the same, inside
one giant .mm-proj wrapper card.

Now three tiers — --major (money path: accent edge, 44px icon, sans
title at --fs-lg, keeps its shadow), --compact (verticals: three-up,
no shadow, tags as inline dot-separated text), --aside (side project on
--surface-2). The .mm-proj wrapper is gone; mm-reveal moves to the three
grids.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Make elevation and hover mean something

**Files:**
- Modify: `assets/css/style.css:334` (`.mm-repo:hover`), `:340` (`.mm-repo:hover .mm-repo__ic`), `:344` (`.mm-repo:hover h4 .arr`), `:384` + `:387` (`.mm-tl__card`), `:418` + `:422` (`.mm-educard`), `:482` + `:485` (`.mm-icard`)

**Interfaces:**
- Consumes: Task 5's `.mm-repo--major` / `--compact` / `--aside` modifiers.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Record which non-links currently animate on hover**

```js
(() => {
  const sels = ['.mm-repo','.mm-tl__card','.mm-educard','.mm-icard'];
  return sels.map(s => {
    const els = [...document.querySelectorAll(s)];
    return {sel: s, count: els.length,
            nonLinks: els.filter(e => e.tagName !== 'A' && !e.closest('a')).length};
  });
})()
```

Expected, measured against the current markup:

```
[{sel: ".mm-repo",     count: 12, nonLinks: 8},
 {sel: ".mm-tl__card", count: 3,  nonLinks: 3},
 {sel: ".mm-educard",  count: 3,  nonLinks: 3},
 {sel: ".mm-icard",    count: 4,  nonLinks: 4}]
```

Every `nonLinks` count above zero is a card that currently lifts on hover without being clickable
— 18 of the 22 cards on the page. None of the timeline, education or interest cards is a link, so
all three types lose their hover outright in Step 3.

- [ ] **Step 2: Scope the repo hover to links only**

Replace line 334:

```css
  .mm-repo:hover { border-color: #cfe0da; transform: translateY(-2px); box-shadow: var(--shadow-md); background: var(--surface); }
```

with:

```css
  /* Lift + shadow on a card reads as "button". Only apply it where there is somewhere to go. */
  a.mm-repo:hover { border-color: #cfe0da; transform: translateY(-2px); box-shadow: var(--shadow-md); background: var(--surface); }
```

Replace line 340:

```css
  .mm-repo:hover .mm-repo__ic { background: var(--accent-soft); color: var(--accent); border-color: #cfe0da; }
```

with:

```css
  a.mm-repo:hover .mm-repo__ic { background: var(--accent-soft); color: var(--accent); border-color: #cfe0da; }
```

Replace line 344:

```css
  .mm-repo:hover h4 .arr { color: var(--accent); transform: translate(2px,-2px); }
```

with:

```css
  a.mm-repo:hover h4 .arr { color: var(--accent); transform: translate(2px,-2px); }
```

- [ ] **Step 3: Drop the shadow and hover from the three non-link card types**

In the `.mm-tl__card` rule (line 384), remove `box-shadow: var(--shadow-sm);` and delete the
`transition` property's `box-shadow` entry, then delete the whole `.mm-tl__card:hover` rule
(line 387).

In the `.mm-educard` rule (line 418), remove `box-shadow: var(--shadow-sm);`, then delete the whole
`.mm-educard:hover` rule (line 422).

In the `.mm-icard` rule (line 482), remove `box-shadow: var(--shadow-sm);`, then delete the whole
`.mm-icard:hover` rule (line 485).

Leave `.mm-skill`, `.mm-pill`, `.mm-social a`, `.mm-btn*` and the nav links exactly as they are —
their hover is a slide or tint with no elevation change, which reads as surface texture rather than
as a click target.

- [ ] **Step 4: Verify elevation is now limited to three things**

Reload and run:

```js
(() => {
  const shadowed = [...document.querySelectorAll('.mm-root *')]
    .filter(e => { const s = getComputedStyle(e).boxShadow; return s && s !== 'none'; })
    .map(e => e.className.toString().split(' ')[0])
    .filter(c => c);
  const counts = {};
  for (const c of shadowed) counts[c] = (counts[c]||0)+1;
  return {shadowedClasses: counts,
          timelineClean: getComputedStyle(document.querySelector('.mm-tl__card')).boxShadow === 'none',
          eduClean: getComputedStyle(document.querySelector('.mm-educard')).boxShadow === 'none',
          icardClean: getComputedStyle(document.querySelector('.mm-icard')).boxShadow === 'none'};
})()
```

Expected: `timelineClean`, `eduClean` and `icardClean` all `true`. `shadowedClasses` should contain
`mm-hero__card`, `mm-contact__box`, `mm-repo` (the four `--major`), plus the buttons, pills, skills
and nav — those keep their small shadows by design.

- [ ] **Step 5: Confirm the CSS no longer has non-link card hovers**

```bash
grep -nE "^\s*\.(mm-repo|mm-tl__card|mm-educard|mm-icard):hover" assets/css/style.css
```

Expected: no output. Then confirm the link-scoped rules exist:

```bash
grep -c "a\.mm-repo:hover" assets/css/style.css
```

Expected: `3`.

- [ ] **Step 6: Commit**

```bash
git add assets/css/style.css
git commit -m "fix(css): make elevation and hover signal what they claim

Every card carried --shadow-sm and lifted on hover, so elevation meant
nothing and eight of twelve repo cards invited a click that did
nothing. .mm-repo hover rules are now scoped to a.mm-repo; timeline,
education and interest cards lose both their base shadow and their
hover entirely.

Shadows now appear on three things only: the hero card, the contact box
and the four major money-path cards. .mm-skill and .mm-pill keep their
hover deliberately — a slide and a border tint with no elevation change
reads as texture, not as a button.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Vary two section heads

**Files:**
- Modify: `assets/css/style.css:158-173` (add `.mm-head--center`)
- Modify: `index.html:463` (Research head), `index.html:528` (Beyond Code head)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Add the modifier**

In `assets/css/style.css`, immediately after the `.mm-head p` rule (line 173), add:

```css
  /* Two of eight sections centre their head, so the left-aligned pattern does not become
     fully predictable by the third section. */
  .mm-head--center { margin-left: auto; margin-right: auto; text-align: center; }
  .mm-head--center .mm-eyebrow::before { display: none; }
  .mm-head--center p { margin-left: auto; margin-right: auto; }
```

- [ ] **Step 2: Apply it to the two sections**

In `index.html`, in the Research section, change:

```html
        <div class="mm-head mm-reveal">
```

to:

```html
        <div class="mm-head mm-head--center mm-reveal">
```

Do the same for the Beyond Code section head. Both are the first `.mm-head` inside
`#mm-research` and `#mm-interests` respectively — leave the other six section heads alone.

- [ ] **Step 3: Verify exactly two heads are centered**

Reload and run:

```js
(() => {
  const heads = [...document.querySelectorAll('.mm-head')];
  return {
    total: heads.length,
    centered: heads.filter(h => getComputedStyle(h).textAlign === 'center')
                   .map(h => h.closest('section').id),
    eyebrowRuleHidden: getComputedStyle(
      document.querySelector('.mm-head--center .mm-eyebrow'), '::before').display
  };
})()
```

Expected: `total: 6` (the hero and contact sections use their own layouts, not `.mm-head`),
`centered: ["mm-research", "mm-interests"]` and nothing else, `eyebrowRuleHidden: "none"`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat(css): centre the Research and Beyond Code section heads

All eight sections used the same left-aligned eyebrow + h2 + paragraph
head, which made the pattern predictable by the third section. Two of
the eight now centre, with the eyebrow's leading rule suppressed since
it only reads correctly flush left.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Full-page verification and push

**Files:** none modified — this task only verifies.

**Interfaces:**
- Consumes: everything from Tasks 1-7.
- Produces: a pushed `master`.

- [ ] **Step 1: Run the contrast check**

```bash
python docs/check-contrast.py
```

Expected: exit 0, `All 16 pairs meet 4.5:1.`

- [ ] **Step 2: Check every viewport for overflow**

For each of 1280, 1024, 900, 700, 560 and 375 px: `resize_window` to that width, reload, then:

```js
({w: innerWidth,
  overflowX: document.documentElement.scrollWidth > innerWidth,
  scrollW: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight})
```

Expected: `overflowX: false` at every width. Record the heights.

- [ ] **Step 3: Confirm no element collides**

At 1280px and 375px, run:

```js
(() => {
  const sections = [...document.querySelectorAll('section, footer')];
  const bad = [];
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i].getBoundingClientRect(), b = sections[i+1].getBoundingClientRect();
    if (b.top < a.bottom - 1) bad.push(`${sections[i].id||'footer'} overlaps ${sections[i+1].id||'footer'}`);
  }
  return bad.length ? {PASS:false, bad} : {PASS:true, sections: sections.length};
})()
```

Expected: `{PASS: true}`.

- [ ] **Step 4: Confirm the reveal animation still fires everywhere**

The `.mm-proj mm-reveal` wrapper was removed in Task 5, so verify nothing is stuck invisible:

```js
(() => {
  window.scrollTo(0, document.body.scrollHeight);
  return new Promise(r => setTimeout(() => {
    const stuck = [...document.querySelectorAll('.mm-reveal')]
      .filter(e => !e.classList.contains('is-in'))
      .map(e => e.className);
    r(stuck.length ? {PASS:false, stuck} : {PASS:true, revealed: document.querySelectorAll('.mm-reveal.is-in').length});
  }, 1200));
})()
```

Expected: `{PASS: true}` with a non-zero `revealed` count.

- [ ] **Step 5: Hand to the user for visual sign-off**

Screenshots may be unavailable in this environment. Report the measured results and ask the user to
look at the live-equivalent local file before pushing. Do not push without their go-ahead — the
site deploys from `master` on push.

- [ ] **Step 6: Push**

```bash
git log --oneline master ^origin/master
git push origin master
```

Expected: seven commits listed, then the push succeeds. Note that `master` is branch-protected and
prints `Changes must be made through a pull request.` — the push still lands as repo admin, so
confirm the ref moved:

```bash
git fetch origin master -q; git log -1 --format="%h %s" origin/master
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
| --- | --- |
| §0 Fix the reset first | Task 1 |
| §1 Foundations — contrast | Task 3 |
| §1 Foundations — type ramp | Task 4 |
| §2 Selected Work three tiers | Task 5 |
| §3 Elevation gets meaning | Task 6 |
| §3 Hover follows clickability | Task 6 |
| §3 Section heads vary | Task 7 |
| §4 Contact box composition | Task 2 |
| Verification (contrast script) | Tasks 3, 8 |
| Verification (manual six-section walk) | Task 1 Step 4, Task 8 |

No spec requirement is unassigned.

**Placeholder scan:** No TBD, TODO, "handle edge cases", or "similar to Task N". Every code step
shows the actual before and after text. Every check step gives the exact command or snippet and its
expected output.

**Type consistency:** Class names used across tasks are consistent — `.mm-repo--major`,
`.mm-repo--compact`, `.mm-repo--aside`, `.mm-repos--compact` and `.mm-head--center` are defined in
Tasks 5 and 7 and referenced with the same spelling in Tasks 6 and 8. Token names `--fs-xs`,
`--fs-sm`, `--fs-base`, `--fs-md`, `--fs-lg` and `--code-str` are defined in Tasks 4 and 3 and used
with the same spelling in Task 5.

**Counts verified against the markup, not assumed:** 12 `.mm-repo` cards in 3 `.mm-repos` grids
(4 money path, all `div`; 6 verticals, 4 `div` + 2 `a`; 2 side project, both `a`), 3 `.mm-tl__card`,
3 `.mm-educard`, 4 `.mm-icard`, 4 `.mm-stat`, 6 `.mm-head`, 8 `<section>`. An earlier draft of this
plan carried 13 cards and 4 grids as expected values; those were wrong and are corrected
throughout. Line numbers throughout are from the pre-Task-1
stylesheet and will drift as earlier tasks insert lines; locate rules by selector, not by line
number, once Task 1 has landed.
