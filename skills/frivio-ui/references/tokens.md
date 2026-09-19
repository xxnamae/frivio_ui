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

Three steps, used strictly by role: `text-primary` (`gray-1000`, values and
headings), `text-secondary` (`gray-900`, body and descriptions),
`text-tertiary` (metadata, labels — `gray-700` in dark mode, but a literal
`#666666` in light mode, because `gray-800` there only measures 3.6:1 against
the card surface). `text-quaternary` is an alias of `text-tertiary`, kept for
call sites that haven't migrated yet — use `text-tertiary` in new code.

## Surfaces and borders

`bg` → `surface` → `surface-2` → `surface-3`. Dark mode: `#000000` →
`#0a0a0a` → `gray-100` → `gray-200`. Light mode: `#ffffff` → `#fafafa` →
`gray-100` → `gray-200` — the same alias pattern in both themes. `border` /
`border-2` / `border-3` point at `gray-alpha-400` / `-500` / `-600` in both
themes too: the alpha scale is already theme-aware, so borders need no
separate light-mode override.

## Typography

One ladder, four families of role:

- `heading-72 … heading-14` — titles sections and pages; letter-spacing
  tightens as size grows
- `label-20 … label-12` — single-line scannable text: navigation, field
  labels, table headers, metadata
- `copy-24 … copy-13` — multi-line body text, higher line-height
- `button-16 / 14 / 12` — control labels, medium weight

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
