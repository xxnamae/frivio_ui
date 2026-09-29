# Frivio UI tokens

The values live in `assets/frivio-tokens.css`, generated from Frivio's
`app/globals.css`. This document explains what each group *means*.

Names are prefixed `--frv-` in the distributed file because it drops into
foreign projects where `--color-bg` would collide. Inside Frivio itself they
are `--color-*`; the mapping is 1:1.

## Reading the scale

Every non-background scale runs ten steps, and the step encodes **use**, not
just lightness:

| Step | Role |
|---|---|
| `100` | default background |
| `200` | hover background |
| `300` | active background |
| `400` | default border |
| `500` | hover border |
| `600` | active border |
| `700` | filled surface |
| `800` | filled surface, hover |
| `900` | secondary text and icons |
| `1000` | primary text and icons |

Eight colour families — `gray` plus seven accent hues (`blue`, `red`, `amber`,
`green`, `teal`, `purple`, `pink`) — plus `gray-alpha`. The full palette is
always emitted, but interface chrome deliberately uses only grey and one
blue; the rest are reserved for data visualisation and content, never chrome.

**`gray-*` is solid, `gray-alpha-*` is translucent.** Solid greys hold their
contrast on any surface, so they carry text and opaque fills. Alpha greys
layer onto whatever is beneath them, so they carry borders, dividers,
overlays and hover tints. Swapping one for the other looks fine on one
surface and wrong on the next.

## Status recipe

`success` → teal, `warning` → amber, `error` → red. Each status is built from
its hue with a single formula:

- the base (`--frv-success` etc.) sits on step `700` — a **filled surface**,
  never text
- `-hover` (`800`) is that same surface's hover state
- `-light` (`100`) is the background tint for banners and soft badges
- `-border` (`400`) is the border for that tint
- `-text` (`900`) is the AA-safe colour for **text and icons** — never the
  base step, which only clears WCAG's 3:1 *graphics* threshold
- `-solid` is the step that actually holds AA contrast for a label sitting
  **on top of** the filled surface, and is not always the same step as the
  base: teal's `700`/`800` only measure 3–4:1 against white, so
  `success-solid` uses `900`; amber and red hold AA at their own base step
- `-fg` is that label's colour, set per hue rather than assumed — amber and
  (in dark mode) success carry a black label, error and light-mode success
  carry white

## Priority

`akutt`, `hoy` and `lav` are aliases onto `error`, `warning` and `success` —
identical values, separate names, so priority can move without dragging
every error message with it. `middels` is **not** an alias: it is its own
neutral, grey-based role (`gray-700` / `gray-100` / `gray-400` / `gray-900`),
because aliasing it onto `warning`/`amber` made "medium" and "high" priority
read as the same colour — the underlying scale's dark-mode `amber-800` and
`amber-900` are literally the same hex.

## Text

Three steps, each with one job (R2, 2026-09-26): `text-primary` READS
(`gray-1000`, values and headings), `text-secondary` EXPLAINS (`gray-900` in
light mode; in dark mode its own step — 25% `gray-1000` mixed into `gray-900`,
≈`#b3b3b3` — because plain `gray-900` sat only 1.2:1 from tertiary there),
`text-tertiary` can be SKIPPED (hint, empty, disabled-adjacent). `text-quaternary`
is RETIRED as a text-colour name — it was always a plain alias of
`text-tertiary`, never a visible fourth step. Use `text-tertiary`, or
`text-disabled` (same value) for genuinely disabled/placeholder text.

`text-tertiary`'s own value (2026-09-26, C4 — "cooler neutrals" ruling): a
LITERAL in both themes now, not a scale alias — `#838a96` in dark mode
(previously a plain `gray-700` alias; the cooler-neutrals pass only touched
100/900/1000, so `gray-700` itself got no new value and the alias would have
drifted from the rest of the cooled palette), `#5c6470` in light mode
(previously `#666666` — recalibrated cooler while re-confirming ≥4.5:1 against
all three surfaces; a first cooler candidate measured only 3.65:1 and was
corrected before use, see `arkiv/rapporter/spectrum-lab/runde6`).

## Surfaces and borders

`bg` → `surface` → `surface-2` → `surface-3`. Dark mode: `#06070a` →
`#0d0f13` → `gray-100` → `gray-200`. Light mode: `#ffffff` → `#fbfbfc` →
`gray-100` → `gray-200` — the same alias pattern in both themes. `border` /
`border-2` / `border-3` point at `gray-alpha-400` / `-500` / `-600` in DARK
mode; in LIGHT mode `border`/`border-2` are literal, opaque, cooled-grey
values instead (`border-3` still aliases `gray-alpha-600`) — white-alpha over
a coloured background inherits a hint of that background's hue, but
black-alpha over white always composites to plain achromatic grey, so a cool,
blue-tinted border in light mode needs a literal value, not opacity alone
(2026-09-26, C4).

Every neutral above (`bg`/`surface`/`gray-100`/`gray-200`/`gray-900`/
`gray-1000` in both themes, plus `border`/`border-2` in light mode) carries a
faint, deliberate cool (slightly blue) hue as of 2026-09-26 (C4, founder
ruling over a Spectrum-lab comparison) — previously pure achromatic grey.
Accent and status families were untouched; only the neutrals shifted.

## Typography

One ladder, four families of role:

- `heading-72 … heading-14` — titles sections and pages; letter-spacing
  tightens as size grows
- `label-20 … label-12` — single-line scannable text: navigation, field
  labels, table headers, metadata
- `copy-24 … copy-13` — multi-line body text, higher line-height
- `button-16 / 14 / 12` — control labels, medium weight

Typography trap ruling (R1, 2026-09-26 — a codemod of USAGE, not of the token
values themselves): reading text is `copy-14`, metadata/secondary text is
`label-13`, labels stay `label-12`. `copy-13` is now DEPRECATED for reading
text — dozens of call sites (`ListRow` secondary/subtitle, `StatCard` sub,
`Table` empty-row text, `Callout`/`FormError`/`ProposalCard`/`AgentSteps`
body text, and more) moved from `copy-13`/`label-12` to `copy-14`/`label-13`.
`Callout`'s own `textSize="copy-13"` opt-in is the one NAMED exception (a
deliberately tighter notice size for the colored tones) — never reach for
bare `copy-13` on new reading text elsewhere.

`copy-14` and `label-14` cover most text. `-mono` variants pair the
monospace family at the same metrics; prefer them for figures that must
align in columns. `overline` sets a small uppercase eyebrow label in the
monospace family with wider letter-spacing — for a label above a heading or
a section eyebrow, never for the print document set, which keeps its own,
deliberately different labels.

Each `.type-*` class bundles font-family, size, weight, line-height and
letter-spacing in one declaration, so a size can never drift away from its
own line-height.

## Spacing, radius, motion

Spacing is a 4px scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96). Rhythm
is three-step: **8px inside a group, 16px between groups, 32–40px between
sections.**

Radius: `sm` 6px for everyday surfaces and controls, `md` 12px for menus and
modals, `lg` 16px for full-screen surfaces, `full` for pills and avatars.

Motion is used only when it clarifies a change. `0ms` is often correct; when
it isn't, `--frv-ease-spring` (`cubic-bezier(0.175, 0.885, 0.32, 1.1)`) with
~150ms for state changes, 200ms for popovers, 300ms for modals. Respect
`prefers-reduced-motion`; drop the transform and keep the colour change.

Gradients (`--frv-gradient-accent/-card/-hero/-glow`) are grayscale only —
mixes of `gray-1000`/`gray-800` against the surface — never an accent hue.

## Fonts

One typeface for UI text and headings, one monospace companion for numbers
and code — set once as `--frv-font` / `--frv-font-mono` and consumed by every
`.type-*` class. Both are loaded via the `@import` at the top of
`frivio-tokens.css`.

## Deliberate choices

A few values are Frivio's own rather than an inherited default, called out
here so a future edit doesn't "fix" them by accident:

| Token | Value | Why |
|---|---|---|
| Button horizontal padding | 12 / 16 / 20px | Comfort and legibility for non-technical users — wider than a typical dense control library. |
| Touch targets | 44px below `lg` | WCAG 2.5.5. The reference user is often 50+ on a phone. Desktop density is untouched from `lg` up. |
| `accent` | `#4b7eea` (light) / `#6d9bff` (dark) | Frivio's own brand blue, reserved for links, focus and the single primary action. |
| `accent-strong` | `#3870e8` | Filled accent buttons need 4.5:1 behind a white label; plain `accent` does not clear it in both themes. Buttons only — links, focus and glow keep `accent`. |
| `middels` | own grey role, not an amber/warning alias | See **Priority**, above — the inherited step was not visually distinct. |
| `shadow-card` | `shadow-border` + `shadow-xs` | 2026-09-27: `Card`'s rest state gained a soft, barely-there shadow on top of its border — composed once here rather than duplicated per component. Deliberately weaker than a full `shadow-sm`: `Card` sits in tight lists (dashboard, finance, card-in-card) where a heavier shadow reads as noise. |
| `floating-pad-y` / `-x` | `space-2` / `space-3` (8/12px) | 2026-09-28: padding for a COMPACT floating surface with no row of its own (`Tooltip`, `Begrep`). `Popover`'s own panel padding is only `space-1` (4px) but reads roomy because its rows (`Dropdown`/`OverflowMenu`/`MultiSelect`) carry `px-3 py-2` themselves; a tooltip has no such inner row, so it needs this larger, named pair for the same felt air. |

## Print tokens

`--frv-print-*` is a **theme-invariant** set living in a plain `:root`, never
under a theme selector. Invoices, registers and statements must render as
white paper regardless of the viewer's theme; moving these under
`[data-theme]` gives a dark-mode user an invoice with white text on white
paper.

`print-accent` (`#4b7eea`) is decoration only — measured 3.84:1 against
paper, which fails AA for text. `print-accent-strong` (`#2f62d0`) is the text
and button-fill value, measured against **both** the paper (`5.56:1`) and the
canvas behind it (`5.05:1`). The canvas is the binding constraint, which is
why the app's own `accent-strong` could not simply be reused: it clears
paper at 4.52:1 but fails the canvas at 4.10:1.

## Regenerating

`assets/frivio-tokens.css` is generated. Do not hand-edit it — edit
`app/globals.css` in the Frivio repo and run:

```bash
node scripts/build-skill.mjs
```

Two files holding the same numbers drift apart with certainty; a generator is
the only honest way to keep a distributed copy true to what the app actually
runs.
