# Design Polish — Design

**Date:** 2026-08-27
**Author:** Mehran Mazhar (with Claude)
**Status:** Approved

## Problem

The site's content is strong but its visual design does not rank it. Six specific faults,
found by reading `index.html` and `assets/css/style.css`:

1. **Selected Work is thirteen near-identical cards.** Money path (4), product verticals (6) and
   the open-source side project (2) all render as the same `.mm-repo`: 38px icon box, monospace
   title, paragraph, tech tags. Only a small monospace label separates the groups, and all
   thirteen sit inside one giant white `.mm-proj` card, so the section reads as an
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
   predictable by the third section.
6. **False hover affordance.** `.mm-repo:hover` lifts the card and animates an arrow. Seven of the
   thirteen repo cards are `div`s, not links — they invite a click that does nothing.

## Goals

1. Give Selected Work three visible tiers of importance instead of thirteen equal cards.
2. Make elevation mean something: only genuinely prominent elements carry a shadow.
3. Meet WCAG AA (4.5:1) for all text colour pairs, and keep it met.
4. Replace the thirteen ad-hoc body sizes with a five-step ramp.
5. Break the section-head monotony without changing the visual identity.
6. Stop non-clickable cards from lifting and gaining a shadow on hover.

## Non-goals

- No change to the visual identity: the light warm palette, deep-teal accent, system-sans
  typography and `mm-` class prefix all stay.
- No adoption of the archived `docs/redesign-mockups/` directions.
- No dark mode, no build step, no dependency, no new page.
- No content or copy rewriting. Duplicate facts (the "10+ years" and "7+ years, one platform"
  figures appearing in hero copy, hero mini-stats and the stats row) stay as they are — reviewed
  and deliberately kept.

## Design

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

| Current sizes | Becomes |
| --- | --- |
| 11, 11.5, 12, 12.5 | `--fs-xs` |
| 13, 13.5 | `--fs-sm` |
| 14, 14.5, 15 | `--fs-base` |
| 15.5, 16, 16.5, 17 | `--fs-md` |
| 18 | `--fs-lg` |

Display sizes — `h1`, `.mm-h2`, `.mm-proj__title`, `.mm-contact__title`, `.mm-research__title`,
`.mm-proj__quote` — keep their existing `clamp()` expressions; those are already deliberate and
responsive. `.mm-mini b`, `.mm-stat b` and `.mm-hero__name` are display numerals and also keep
their current values, as does `.mm-logo` — the nav brand mark is not body text and its 16px is
tuned to the 68px nav height.

### 2. Selected Work — three tiers

The single `.mm-proj` wrapper card is removed. The pull-quote and the "Measured in production"
stats row stay as a lede block. The thirteen cards then split into three explicitly-weighted
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

**Elevation gets meaning.** `--shadow-sm` is removed from education cards, interest cards,
compact repo cards and timeline cards. Shadows remain on exactly three things: the hero card, the
contact box, and major repo cards. Secondary cards are defined by their border alone.

**Hover follows clickability.** The lift, border-colour change and arrow animation move from
`.mm-repo:hover` to `a.mm-repo:hover`. The seven `div` cards keep a static appearance. The same
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

**Section heads vary.** Research and Beyond Code get centered heads (`.mm-head--center`: `margin:
0 auto`, `text-align: center`, and the `.mm-eyebrow::before` rule suppressed). The other six
sections stay left-aligned. This breaks the repeat cheaply without touching the identity.

## Files touched

| Path | Change |
| --- | --- |
| `assets/css/style.css` | Token changes, five type tokens, three `.mm-repo` modifiers, shadow removals, hover-scoping, `.mm-head--center` |
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
harness, and adding one for a CSS pass is not worth its weight. Two manual checks close the loop:

1. Load the page at desktop, 900px, 700px and 375px widths; confirm the three Selected Work tiers
   read as three levels and no grid collapses badly.
2. Confirm the seven non-link repo cards no longer respond to hover.

Note: the browser pane in the authoring environment was not compositing frames, so screenshots
were unavailable during this work. Visual sign-off is the user's.

## Open items

None. All values in this spec are measured or specified; nothing is left to decide at
implementation time.
