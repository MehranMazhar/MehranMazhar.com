# Design Polish — Design

**Date:** 2026-08-27
**Author:** Mehran Mazhar (with Claude)
**Status:** Approved

## Problem

The site's content is strong but its visual design does not rank it. Seven specific faults,
found by reading `index.html` and `assets/css/style.css`:

1. **Selected Work is twelve near-identical cards.** Money path (4), product verticals (6) and
   the open-source side project (2) all render as the same `.mm-repo`: 38px icon box, monospace
   title, paragraph, tech tags. Only a small monospace label separates the groups, and all
   twelve sit inside one giant white `.mm-proj` card, so the section reads as an
   undifferentiated blob.
2. **Card sameness site-wide.** Repo, timeline, education, interests and stat cards share the same
   1px `--line` border, `--shadow-sm`, 14px radius and hover lift. Nothing is visually heavier
   than anything else, so nothing reads as more important.
3. **Contrast below WCAG AA.** `--ink-mute: #82827e` measures 3.72:1 on `--bg`, 3.86:1 on
   `--surface` and 3.53:1 on `--surface-2`, used at 11–13.5px in tech tags, `.mm-stat em`,
   `.mm-educard__note`, `.mm-tl__date` and the footer. The hero code card's string colour
   (`.mm-code .st`, `#9a7b3a`) measures 3.99:1 on white.
4. **No type scale.** Thirteen body-text sizes (11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5,
   16, 16.5, 17px) sit close enough together that the steps read as accidental rather than chosen.
5. **Flat section rhythm.** All eight sections use 104px padding and the same left-aligned
   eyebrow + `h2` + optional paragraph head, on alternating background tints. The pattern is
   predictable by the third section. *Partly caused by fault 7 — see below.*
6. **False hover affordance.** `.mm-repo:hover` lifts the card and animates an arrow. Eight of the
   twelve repo cards are `div`s, not links — they invite a click that does nothing.
7. **A specificity collision silently deletes 14 authored spacing rules.** The reset at
   `style.css:34` is written as an element-qualified selector:

   ```css
   .mm-root h1,.mm-root h2,.mm-root h3,.mm-root h4,.mm-root p { margin: 0; }
   ```

   `.mm-root h2` scores (0,1,1) — one class *plus* one element. A component selector like
   `.mm-contact__title` scores (0,1,0), so the reset wins and the authored margin never applies.
   Measured in the browser, fourteen spacing declarations are dead:

   | Selector | Dead declaration |
   | --- | --- |
   | `.mm-hero__greet` | `margin-bottom: 14px` |
   | `.mm-hero__title` | `margin-top: 18px` |
   | `.mm-hero__desc` | `margin-top: 22px` |
   | `.mm-proj__quote` | `margin-bottom: 30px` |
   | `.mm-proj__lead` | `margin-bottom: 20px` |
   | `.mm-stats-label` | `margin: 34px 0 16px` |
   | `.mm-tl__quote` | `margin-top: 14px` |
   | `.mm-educard__note` | `margin-top: 2px` |
   | `.mm-research__title` | `margin-top: 12px` |
   | `.mm-research__advisor` | `margin-top: 12px` |
   | `.mm-research__quote` | `margin-top: 18px` |
   | `.mm-research__note` | `margin-top: 24px` |
   | `.mm-contact__title` | `margin-top: 14px` |
   | `.mm-contact__text` | `margin: 18px auto 0` |

   This is the root cause of the visible symptom in the contact box, where the eyebrow, heading and
   paragraph are glued together with a measured gap of 4px and 0px. It also means fault 5 above is
   not entirely a design choice: some of the intended vertical rhythm was authored and never
   rendered.

## Goals

1. Give Selected Work three visible tiers of importance instead of twelve equal cards.
2. Make elevation mean something: only genuinely prominent elements carry a shadow.
3. Meet WCAG AA (4.5:1) for all text colour pairs, and keep it met.
4. Replace the thirteen ad-hoc body sizes with a five-step ramp.
5. Break the section-head monotony without changing the visual identity.
6. Stop non-clickable cards from lifting and gaining a shadow on hover.
7. Make the fourteen dead spacing rules apply, and fix the contact box's composition.

## Non-goals

- No change to the visual identity: the light warm palette, deep-teal accent, system-sans
  typography and `mm-` class prefix all stay.
- No adoption of the archived `docs/redesign-mockups/` directions.
- No dark mode, no build step, no dependency, no new page.
- No content or copy rewriting. Duplicate facts (the "10+ years" and "7+ years, one platform"
  figures appearing in hero copy, hero mini-stats and the stats row) stay as they are — reviewed
  and deliberately kept.

## Design

### 0. Fix the reset first

Nothing else in this pass can be tuned on top of a broken cascade, so this lands first. One line:

```css
/* :where() keeps this reset at zero specificity, so a single-class component rule such as
   .mm-contact__title can still set its own margin. Do not rewrite it as `.mm-root h1, …` —
   that form outranks every component selector and silently deletes their spacing. */
.mm-root :where(h1,h2,h3,h4,p) { margin: 0; }
```

`:where()` contributes nothing to specificity, so the reset drops to (0,1,0) — the `.mm-root`
class alone. It then ties with single-class component selectors, and since every component rule
appears later in the file, source order resolves in their favour. Verified live in the browser:
all fourteen margins apply, and the contact stack goes from 4px/0px gaps to 18px/18px.

The consequence is deliberate but wide: fourteen dormant margins activate at once, changing
vertical spacing in the hero, Selected Work, timeline, education, research and contact sections.
This restores what the stylesheet already intended rather than inventing new spacing, but it is the
single highest-risk change in this pass and needs the manual pass listed under Verification.

### 1. Foundations — tokens in `assets/css/style.css`

**Contrast.** Two colour values change, both verified by measurement:

| Token | From | To | Worst measured ratio |
| --- | --- | --- | --- |
| `--ink-mute` | `#82827e` | `#6f6f6a` | 4.62:1 (on `--surface-2`) |
| `.mm-code .st` → new `--code-str` | `#9a7b3a` | `#8a6c2e` | 4.92:1 (on `--surface`) |

The string colour becomes a token so the contrast check covers it automatically. No other colour
token moves — `--ink` (15.93:1 worst), `--ink-soft` (8.13:1 worst) and `--accent` (6.72:1 worst)
all pass comfortably.

**Type ramp.** Five new tokens replace the ad-hoc body sizes:

```css
--fs-xs:   12px;     /* monospace labels, tech tags, eyebrows */
--fs-sm:   13.5px;   /* card meta, notes, dates */
--fs-base: 15px;     /* card body, list items */
--fs-md:   17px;     /* prose, section lead */
--fs-lg:   19px;     /* card titles, timeline role */
```

Every body-text `font-size` in the stylesheet maps onto one of these five, explicitly — the
current values sit close enough that "nearest" is ambiguous at the boundaries, so the mapping is
fixed here:

| Current sizes | Becomes | Largest shift |
| --- | --- | --- |
| 11, 11.5, 12, 12.5 | `--fs-xs` (12px) | +1px |
| 13, 13.5 | `--fs-sm` (13.5px) | +0.5px |
| 14, 14.5, 15, 15.5 | `--fs-base` (15px) | +1px |
| 16, 16.5, 17 | `--fs-md` (17px) | +1px |
| 18 | `--fs-lg` (19px) | +1px |

The 15.5px row sits with `--fs-base`, not `--fs-md`: it is used by `.mm-btn--lg` and
`.mm-proj__lead`, and promoting those to 17px would inflate the large buttons noticeably. Keeping
the boundary here holds every single shift to 1px or less, which is the point of the exercise —
the ramp should tidy the scale, not restyle the page.

Display sizes — `h1`, `.mm-h2`, `.mm-proj__title`, `.mm-contact__title`, `.mm-research__title`,
`.mm-proj__quote` — keep their existing `clamp()` expressions; those are already deliberate and
responsive. `.mm-mini b`, `.mm-stat b` and `.mm-hero__name` are display numerals and also keep
their current values, as does `.mm-logo` — the nav brand mark is not body text and its 16px is
tuned to the 68px nav height.

### 2. Selected Work — three tiers

The single `.mm-proj` wrapper card is removed. The pull-quote and the "Measured in production"
stats row stay as a lede block. The twelve cards then split into three explicitly-weighted
tiers, each a modifier on the existing `.mm-repo`:

**Money path (4 cards) — `.mm-repo--major`.** The tier that should stop a reader. Two columns,
24px padding, sans-serif title at `--fs-lg` (not monospace), 44px icon box, 3px accent rule on
the left edge, keeps `--shadow-sm`.

**Product verticals (6 cards) — `.mm-repo--compact`.** Clearly secondary. Three columns on
desktop, no icon box, hairline border, no shadow, 16px padding; tech tags render as inline
`·`-separated text rather than bordered chips. Full paragraph text is kept — no line clamping,
nothing hidden.

**Side project (2 cards) — `.mm-repo--aside`.** `--surface-2` background, no shadow, sitting under
the existing "Side project — open source, not production" label.

Responsive collapse: `--major` 2→1 column at 700px; `--compact` 3→2 at 900px, 2→1 at 560px.

### 3. Rhythm and card variety

**Elevation gets meaning.** `--shadow-sm` is removed from the repeated secondary cards — education
cards, interest cards and timeline cards — and the compact and aside repo tiers are defined without
one from the start. Those cards are then defined by their border alone.

Elevation stays where it marks a genuinely distinct surface: the four large panels
(`.mm-hero__card`, `.mm-portrait`, `.mm-research`, `.mm-contact__box`, all `--shadow-lg`), the
floating `.mm-about__badge` over the portrait (`--shadow-md`), the mobile nav dropdown overlay
(`--shadow-lg`), and the four `--major` money-path cards (`--shadow-sm`). Small controls —
buttons, pills, skills, the nav bar — keep their `--shadow-sm` too.

The point is not to minimise the number of shadowed elements; it is that a shadow should mean
"this is a distinct surface" rather than "this is a card". Before this change every repeated card
carried one, so the signal was worthless.

**Hover follows clickability.** The lift, border-colour change and arrow animation move from
`.mm-repo:hover` to `a.mm-repo:hover`. The eight `div` cards keep a static appearance. The same
scoping applies to the other three card types that are not links and currently animate on hover:
`.mm-educard`, `.mm-icard` and `.mm-tl__card` lose their `:hover` rules entirely (including the
`--shadow-md` upgrade, which would otherwise reintroduce a shadow on a card whose base shadow
this pass removes).

Real links and buttons — `.mm-social a`, `.mm-btn`, nav links, `a.mm-repo` — keep their hover
states. `.mm-skill` and `.mm-pill` also keep theirs, and are the deliberate exception: they are
non-interactive `div`/`span` elements, but their hover is a 3px slide and a border tint with no
elevation change, which reads as surface texture rather than as a click target. The rule this pass
enforces is narrower than "hover only on links" — it is that **nothing card-shaped may lift or
gain a shadow unless it is clickable**, because lift plus shadow on a card is what actually reads
as a button.

**Section heads vary.** Research and Beyond Code get centered heads (`.mm-head--center`: `margin-left`
and `margin-right: auto` to recentre the 720px head box inside the 1160px container,
`text-align: center`, and the decorative `.mm-eyebrow::before` leading rule suppressed since it only
reads correctly flush left). The other six sections stay left-aligned. This breaks the repeat cheaply
without touching the identity.

No auto-margin rule is applied to the head paragraph: with no constrained width on it, auto margins
resolve to zero and the declaration would do nothing. The paragraph centres via the inherited
`text-align`.

### 4. Contact box composition

With the reset fixed, two faults remain in the closing panel, both measured at a 1280px viewport:

**The paragraph is capped far below its container.** `.mm-contact__text` sets `max-width: 500px`
inside a box whose content width is 638px. The paragraph renders 138px narrower than the heading
above it and breaks into four lines — measured rag 487 / 493 / 449 / 343, shortest line at 69% of
measure. Raising the cap to **620px** gives three lines, rag 614 / 591 / 566, shortest at 91%. At
mobile the cap is inert (content width is 269px), so nothing regresses.

620px rather than 600px: at 600px the paragraph still takes four lines and ends in a 41px orphan
(rag 549 / 589 / 588 / 41). An earlier draft of this spec attributed that orphan to the 500px
before-state; that was wrong — 500px rags to a perfectly ordinary 343px last line. The defect at
500px is the 138px under-cap and the extra line, not an orphan.

**The stack has no hierarchy.** Once margins apply, label→title and title→text are both 18px, so
the three elements read as one undifferentiated block. Tightening the title's `margin-top` to 10px
and raising the paragraph's to 20px makes the heading group with its eyebrow and separate from its
body copy.

`text-wrap` was tested and rejected. At 620px, `normal`, `pretty` and `balance` produce byte-identical
line breaks, and the heading is a single line at both 1280px (242px of 638px) and 375px
(242px of 269px), so `balance` has nothing to balance. Two declarations measurement removed.

The title's `font-weight: 800` stays. It is the closing display element and pairs with
`.mm-hero__name`; `.mm-h2`'s 700 is for in-page section heads.

## Files touched

| Path | Change |
| --- | --- |
| `assets/css/style.css` | `:where()` reset fix, token changes, five type tokens, three `.mm-repo` modifiers, shadow removals, hover-scoping, `.mm-head--center`, contact paragraph width and stack gaps |
| `index.html` | Selected Work restructured into three tiers; `.mm-proj` wrapper removed; two section heads get `--center` |
| `docs/check-contrast.py` | New — the verification script below |

## Verification

`docs/check-contrast.py` parses the colour tokens out of `style.css` and asserts every text/
background pair in use meets 4.5:1, exiting non-zero with the failing pairs named. It found the
`.mm-code .st` failure that reading the CSS by eye had missed, and it guards against a future
token edit silently regressing contrast.

```bash
python docs/check-contrast.py
```

Everything else here is visual and has no automated check — the site has no build step and no test
harness, and adding one for a CSS pass is not worth its weight. Manual checks close the loop:

1. Load the page at desktop, 900px, 700px and 375px widths; confirm the three Selected Work tiers
   read as three levels and no grid collapses badly.
2. Confirm the seven non-link repo cards no longer respond to hover.
3. **After the reset fix, walk all six affected sections** — hero, Selected Work, timeline,
   education, research, contact. Fourteen margins activate simultaneously; anywhere the revived
   value now reads as too loose, tune that component's own value rather than reverting the reset.

The dead-margin audit itself was run as a one-off script against `document.styleSheets` in the
browser, comparing each authored margin to its computed value. It is not kept: once the reset is
`:where()`-based the collision cannot recur for these selectors, and the CSS comment at the reset
is the cheaper guard against someone rewriting it back into the element-qualified form.

Note: the browser pane in the authoring environment was not compositing frames, so screenshots
were unavailable during this work. Visual sign-off is the user's.

## Open items

None. All values in this spec are measured or specified; nothing is left to decide at
implementation time.
