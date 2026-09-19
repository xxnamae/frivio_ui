---
name: frivio-ui
description: Build interfaces in Frivio UI — a calm, high-contrast product design system for tools people use to get real work done. Use this skill whenever building any new interface, screen, dashboard, form or admin surface, and whenever the user shares a screenshot, mockup, URL or existing code and asks to redesign it, restyle it, clean it up, make it consistent, or make it look professional. Also use it when they mention Frivio, the Frivio design system, the design system, our UI kit, or our components. Reach for it even when the request only says "make this look better" and never names a system, since new UI should be born in the system rather than converted into it afterwards.
---

# Frivio UI

A product design system for **tools, not marketing sites**, extended with the
patterns a real application needs: list rows, notices, empty states, priority
levels and print surfaces. The colour system is a 10-step scale per hue
(gray/gray-alpha/blue/red/amber/green/teal/purple/pink) where each step
encodes a USE, not just lightness: `100`–`300` background/hover/active,
`400`–`600` border, `700`–`800` filled surface, `900`–`1000` text/icon. The
semantic layer built on that scale is Frivio's own: near-black surfaces
(not true black), a visible-but-soft border in both themes, a neutral
(non-blue) primary button, and a dedicated typeface pair for UI text and
numbers/code.

Output is React plus Tailwind, composed from the kit in `assets/`.

## What this system is

A quiet instrument for someone who did not ask to become a software user. The
reference user is a volunteer board member in their fifties doing unpaid
administrative work on a Tuesday evening — competent, busy, and not interested
in your interface. Every decision follows from that.

Near-black surfaces, one blue accent, generous but not wasteful space, and
structure carried by tonal surfaces and hairline borders rather than shadows.
Text sits on a strict typographic ladder; nothing is sized by hand. Colour means
something — state, priority, or the single most important action on a screen —
and is never decoration.

The feel to aim for is a well-made control panel: legible, calm, obvious. If a
build looks like a landing page, a marketing dashboard, or "a dark theme," it has
failed even if every token is correct.

**The governing standard is that the interface should require zero training.**
Not "discoverable with a tooltip" — genuinely obvious to someone who will never
read documentation and will blame themselves, not you, when they get lost.

Full documentation, live, with every component on its own page: <https://design.frivio.no>.

## Setup

Copy both files into the project and import the CSS once at the root:

- `assets/frivio-tokens.css` — variables, typography classes, font loading
- `assets/frivio-kit.tsx` — components

The kit reads CSS variables through Tailwind arbitrary values, so **no
`tailwind.config` changes are needed** and it works with Tailwind v3 or v4.
The UI typeface and its monospace companion are pulled from Google Fonts by the token file.

Every component needs nothing beyond `react`/`react-dom`, with ONE named
exception: `MultiSelect` builds on `cmdk` for its search/select/keyboard-nav
engine (styling is still 100% this kit's own tokens). `npm install cmdk`
only if you use that one component.

Dark is the default. For light, set `data-theme="light"` on `<html>`; every token
name stays the same and only the values change, so nothing in your code branches
on theme.

## Request modes

Resolve the mode from the verb before you do anything. A URL, a screenshot or
a route gives you *scope* — which surface you're looking at — not *edit
rights*. An audit is never a silent invitation to also fix what it finds.

- **Shape** — "what should this look like", "how would you design…". Produce
  the inventory (Workflow step 1) and a proposal. Don't write code yet.
- **Implement** — "build", "add", "migrate to". Follow Workflow steps 2–5 in
  full, laws included. This is the only mode that touches components and
  pages by default.
- **Review** / **audit** — "check", "does this follow the system", "find
  gaps". Read and report against the laws and `references/produktskjonn.md`.
  Findings, not diffs. If a finding is worth fixing, say so and wait — fixing
  it is a separate request unless the user already said "and fix it."
- **Copy** — "rewrite this text", "make this sound like us". Voice section
  only; do not touch layout, spacing or components unless the copy change
  forces a length-driven layout fix.
- **Harden** — "make this handle X safely", "what breaks if…". Look for the
  `regel/*` entries in `references/produktskjonn.md` that govern the surface
  in question (money, quarantine, bank matching) before proposing a change —
  several of those rules exist precisely because a plausible hardening idea
  was tried and rejected once already.

When the mode is ambiguous, treat it as the narrower one and say what a wider
pass would additionally cover, rather than guessing wide and surprising the
user with an unrequested rewrite.

## Workflow

### 1. Inventory the source by function

List what each element *does*, not what it looks like. A card with a big number
and a coloured arrow is a metric with a trend, not a card. A rounded rectangle in
the strongest neutral tone (black-on-light / white-on-dark) is the primary
action — not a blue one; blue is reserved for links, focus and `variant="accent"`.
This matters because the mapping below is
functional, and describing the source visually drags the old design's decisions
into the new one.

Write the inventory before building. It is short, and it prevents the most common
failure: transliterating decoration.

### 2. Map to components

| Source element | Frivio UI |
|---|---|
| Page title with description | `PageHeader` pattern — `h1` + one-sentence purpose line. A page-level context switcher (building, year) goes in `context`, next to `action` — never its own row under the title, which steals a full row of height. |
| Search + filter + action row above a list/table | `Toolbar` — one shared 40px height for `SearchInput`, `PillTabs size="md"` and `Button` md, `end` slot for actions; wraps cleanly under 640px |
| Section heading inside a page | `SectionHeader` |
| Card, panel, widget | `Card` |
| Row in a list, table row, record | `ListRow` in a `divide-y` container — short facts in `secondary`, amount/date in `value` |
| Metric, KPI, stat block | `StatCard` (row of several on mobile: `StatCardRad`, never a hand-rolled grid — 2 columns minimum on phone). Numbers ≥ 1 million compress to mill./mrd.; full precision with øre is for accounting tables only, right-aligned with tabular figures. |
| Labelled value, metadata field, definition list | `Field` |
| Status pill, tag, priority | `Badge` — icon and text always stay on one line, never wrap |
| Tip, info box, warning banner | `Callout` (tone `accent`/`success`/`warning`/`error`) |
| Structural aside — "belongs here, isn't the step itself" | `Callout` (tone `default`/`secondary`) |
| Comment attached to a number above it | `InlineNote` |
| Jargon term the reader needs foreknowledge for | `Begrep` (dotted underline, explanation on hover/tap right where the word stands — never a paragraph explaining it above) |
| Validation or action error | `FormError` |
| Error state after a failed fetch | `ErrorState` — sibling to `EmptyState`: icon in the error tint, title, plain-language message, "Try again" with a built-in spinner |
| Text field, search | `Input` |
| One-time code field | `OtpInput` — jumps to large, tracked digits once it has content |
| Multi-line text | `Textarea` |
| Dropdown, picker (a native form field) | `Select` |
| A trigger + popup list where the value itself is the label (a building/context switcher, a nav filter) | `Dropdown` — button + portaled popup list, not a form field |
| Search, select several as chips, optionally create a new one from free text | `MultiSelect` — the one component in the kit with a dependency (`cmdk`) |
| Primary CTA | `Button variant="primary"` (monochrome — black-on-light/white-on-dark, never blue) |
| Filled blue CTA | `Button variant="accent"` |
| Secondary action | `Button variant="secondary"` |
| Low-emphasis action | `Button variant="tertiary"` |
| Tonal neutral secondary action (e.g. "Copy" next to content) | `Button variant="soft"` |
| Destructive action | `Button variant="error"` |
| Warning action | `Button variant="warning"` |
| Primary action on a long page that must survive scroll on mobile | `ActionBar` (sticky bottom row under 640px, a plain right-aligned row with no bar chrome from 640px, max two buttons — never a page-specific fixed footer). Always the LAST element in the page content. |
| Icon-only standalone control | `IconButton` (always 44×44) |
| On/off setting that saves immediately | `Switch` |
| Checkbox in a form saved as a whole, or a row selection | `Checkbox` (`indeterminate` for "some, not all") |
| One choice from a long list, each with its own description | `Radio` / `RadioGroup` — NOT for 2-4 plain choices, that's still `PillTabs`/`Select` |
| Sibling views sharing scope/data model | `Tabs` (underline) — a VIEW switch, never a filter |
| Tab bar, filter chips, segmented control | `PillTabs` (a shared track, active tab inverted; hidden tabs collapse behind a trigger showing the COUNT, "+2", never a bare "…") — a FILTER within one view, never navigation between siblings. `size="md"` (36px) pairs it with `SearchInput`/`Button` in a `Toolbar`; `size="sm"` (28px, default) elsewhere. `Tabs`, `PillTabs` and `YearSelector` cover three distinct jobs (view / filter / period) and must never look alike. |
| Period selector (year, a date range stepped one unit at a time) | `YearSelector` — a period, never a tab; don't reach for `PillTabs` to page through years |
| Period filter spanning several years (year, optionally a month within it, or "all years") | `PeriodeVelger` — a single trigger button opening an anchored panel with its own year row, a "whole year" + month grid, and "all years" as its own choice. Built independently of `YearSelector`, not from it. |
| Dialog, drawer, sheet | `Modal` (+ `ModalBody`/`ModalActions` for the two-slot layout) |
| Confirm-before for a destructive action | `ConfirmDialog` (`useConfirm()` inside a `ConfirmProvider`) |
| A destructive action needing deliberate confirmation with no dialog | `HoldToConfirm` — hold 1.2s, the fill IS the confirmation; reserve for the 2-3 most destructive actions only |
| Undo-after for a reversible action | `Toast` (`useToast().vis(...)` inside a `ToastProvider`) |
| Secondary actions collapsed behind one trigger | `OverflowMenu` |
| Short hover/focus hint on one element | `Tooltip` |
| Any anchored panel that must escape a clipping/scrolling ancestor | `FloatingLayer` (headless — portal to `document.body`, `position: fixed`, automatic flip + clamp; `Dropdown`/`OverflowMenu`/`Tooltip`/`MultiSelect` are all built on it) |
| Closing a floating panel on click outside and/or Escape | `useKlikkUtenfor` — shared hook (pointerdown, multiple refs for a portaled panel, Escape optional) backing `MultiSelect`'s and `OverflowMenu`'s click-outside/Escape handling |
| Loading placeholder | `Skeleton` |
| Data grid compared down a column (monthly figures, a multi-year forecast) | `Table` |
| A searchable/sortable/paginated data grid with tabs, row selection and totals | `DataTable` — built ON `Table`, not around it |
| Zero state | `EmptyState` |
| Progress through a fixed number of steps (position, not a nav element) | `StepIndicator` |
| A ready-made multi-step form frame | `StegForm` — `StepIndicator` + one step panel at a time + Back/Next/Finish in an `ActionBar`, per-step validation |
| Announcing a new user-facing capability | `FeatureIntro` — inline next to the feature, once per user (see this skill's rule on new functionality) |
| Expandable section | `CollapsibleSection` |
| Full-height centered shell for an out-of-app page (login/invite/token/404) | `CenteredPage` (`as="main"` when it IS the page, `as="div"` when nested inside one that already has a landmark) |
| Round identity surface (image or initials) | `Avatar` / `AvatarGroup` |
| Small state dot inline in text or a row | `StatusDot` |
| 1px divider, horizontal or vertical | `Separator` |
| One keyboard key | `Kbd` |
| Page navigation for a paged list | `Pagination` |
| Bar comparing amount ACROSS rows in a set | `LoadBar` |
| Bar showing share of ONE whole completed | `Progress` |
| An AI-assistant-suggested plan awaiting selective approval | `AgentPlan` — several toggleable actions, one combined run/cancel row |
| Progress while assistant-suggested actions actually run | `AgentSteps` (+ `ThinkingDots`) — one step at a time, status + error per step |
| A collapsible "here's how the assistant reasoned" log | `ReasoningTrace` |
| ONE assistant-suggested action awaiting approval | `ProposalCard` — nothing runs before "Approve" |
| Any text at all | `Text` / `Heading`, or a `.type-*` class |

### 3. Choose fidelity

Default to a **reskin**: preserve the source's layout, order and hierarchy, swap
each element for its Frivio equivalent. Predictable, and directly comparable to
the original.

Escalate to a **rethink** only when the source's structure cannot survive the
swap — a marketing hero with display type, a layout built on large imagery, or
content scattered as free-floating cards. Then regroup into sections and say in
one line what moved and why.

When unsure, reskin and mention the alternative rather than stopping to ask.

### 4. Build

Compose from the kit. Reach for raw `div`s only for content with no equivalent,
and when you do, use the token variables rather than Tailwind's own palette
(`bg-[var(--frv-surface)]`, never `bg-neutral-900`) so the result stays
re-themeable and follows the light/dark switch for free.

If the source has a component with no kit equivalent, follow the derivation rules
below.

### 5. Audit

Before delivering, check against the laws. Most failures are **additive** —
something got a gradient, a second accent, a hand-rolled box, a font size typed
by hand. Read the result looking for what to remove.

## The laws

These are what make the system recognisable. Breaking one should be a deliberate
decision you tell the user about, with the reason. Each law carries a `regel/`
ID so it can be cited precisely from elsewhere (a PR comment, an audit finding,
`references/produktskjonn.md`) instead of paraphrased — see **Product
judgment**, below, for the Frivio-specific decisions layered on top of these.

1. `regel/typografi-via-type-klasser` — **Type comes from the ladder.** Never
   write `font-size`, `line-height`, `font-weight` or `letter-spacing` by hand,
   and never use Tailwind's `text-lg font-medium tracking-tight` cluster. Use a
   `.type-*` class or `<Text variant>`. One token carries all four properties,
   so a size can never drift from its own line-height. This includes never
   reaching for a weight utility to fake a heavier label — the `.type-*`
   classes are unlayered CSS, so a layered Tailwind utility (`font-medium`
   included) always loses to them regardless of specificity; the class name
   lies about the rendered weight. See the next law for the dedicated
   500-weight `-strong` label tokens instead.
2. `regel/tre-vekter-400-leser-500-navngir-600-titler` — **Three weights,
   three jobs.** `400` (plain label/copy) READS — values, metadata, menu
   items, selected text. `500` (`label-*-strong`) NAMES something — a field
   label above a form control, a table column header, a row title in a
   docs-style list, a `Callout` title. `600` (heading) is a TITLE. Never use
   `600` just to get a heavier label, and never fake `500` with `font-medium`
   on a `.type-label-*` class (see the law above).

   `regel/typehierarki-roller` pins the weight rule down to actual roles,
   derived from the primitives that carry them (full table + a live "page in
   miniature": <https://design.frivio.no/typography#hierarki>; full prose in
   `references/produktskjonn.md`):

   | Role | Class | Weight | Carrier |
   |---|---|---|---|
   | Page title | `.type-page-title` | 600 | `PageHeader` (h1) |
   | Page blurb | `.type-copy-14` | 400 | `PageHeader` (children) |
   | Section title | `.type-heading-16` | 600 | `SectionHeader` |
   | Card title | `.type-heading-16` | 600 | `Card` convention |
   | Row title | `.type-heading-14` | 600 | `ListRow` (title) |
   | Row secondary text | `.type-label-13` | 400 | `ListRow` (secondary/value) |
   | Field label | `.type-label-13-strong` | 500 | `Field`/`DescriptionList` (key) · `Input`/`Select` (label) · `Table` (column header) |
   | Body copy | `.type-copy-14` | 400 | general prose, `Text` default |
   | Help text | `.type-copy-14` | 400 | `Callout`/`InlineNote` content |
   | Big number | `.type-heading-24 tabular-nums` | 600 | `StatCard` (value) |
   | Button | `.type-button-16`/`-14`/`-12` | 500 | `Button` |
   | Overline | `.type-overline` | 500 (mono, caps) | `DocsSectionTitle` · `SectionHeader` (eyebrow) |

   One unresolved split found while deriving this: field labels exist at two
   sizes for the same role (`Field`/`DescriptionList` at 12, `Input`/`Select`/
   `Table` at 13) with identical weight and colour and no code comment
   explaining the size difference. Flagged, not fixed — both are load-bearing
   at 100+ call sites, so the direction needs a founder decision.
3. `regel/farger-via-tokens` — **Colour means state, never decoration.** The
   blue accent marks links, focus, and the single most important action on a
   surface. Semantic colours mark status. Nothing is coloured to look nice, and
   nothing is a hand-typed hex or `rgba()` — every colour is a CSS variable.
4. `regel/en-primaerhandling-per-flate` — **One primary action per surface.**
   The monochrome, neutral `primary` button is the loudest thing on the
   screen — not blue. Two on one surface means one of them is wrong.
5. `regel/farget-smaatekst-bruker-text-token` — **Coloured text under 18px must
   use a `-text` variant.** Raw `--frv-success`, `--frv-error`, `--frv-akutt`
   and friends only clear WCAG's 3:1 *graphics* threshold — fine for icons and
   fills, **not** for body text, which needs 4.5:1. Use `--frv-success-text`,
   `--frv-error-text`, `--frv-warning-text`, `--frv-accent-text`. This is the
   single most repeated real defect in this system's history. Its sibling,
   `regel/700-er-flate-900-er-forgrunn`, pins down the step numbers precisely:
   step `700` (`--frv-success`/`-warning`/`-error`) is a filled SURFACE only,
   never text/icon colour; step `900` (surfaced as the `-text` variant) is
   calibrated for exactly that use; a filled `700` surface that must carry a
   label uses the paired `-solid`/`-fg` tokens (e.g. a `Button`/`Badge` error
   variant), never `700` itself for the label colour.
6. `regel/struktur-via-overflater-ikke-skygge` — **Borders and tonal surfaces
   carry structure, not shadows.** The stack is `bg` → `surface` → `surface-2`
   → `surface-3`, separated by 1px borders low enough in contrast to read as
   seams. Shadows are reserved for things that genuinely float.
7. `regel/liste-med-handling-er-listrow` — **Lists are flat rows, never
   cards.** A list of records is `ListRow` inside a `divide-y` container. One
   card per item is the most common way to make an application look like a
   template. And one row is ONE line when its container is wide enough
   (`regel/listerad-er-en-linje`): title, short facts inline via `secondary`
   (an array renders with «·» between items), up to two `Badge`s in `meta`, a
   right-aligned tabular `value`, actions in `trailing`. The title truncates
   last. `subtitle` is the exception for longer text (own line, two-line
   clamp); `details` + `expanded` is the accordion beneath the row. Width is
   decided by the row's own container query (28rem), never the viewport.
8. `regel/gradient-viser-flatt-opererer` — **Gradient shows, flat operates.**
   The accent gradients belong on surfaces that *display* — hero metrics,
   standard cards, empty states. Never on surfaces you *operate in*: forms,
   modals, menus, list rows, tables, notice banners, buttons, sidebars.
9. `regel/trefflater-44px` — **Touch targets are 44px where a thumb goes.**
   `IconButton` guarantees 44×44 always. Buttons and pills step up to 44px
   below `lg`. Dense in-row actions are the one exception, and they use the
   row-action pattern, not a bare `<button>`.
10. `regel/tilstand-ikke-kun-farge` — **State is never carried by colour
    alone.** Pair it with a text label or an icon. Priority always ships with
    its name, never just a coloured dot.
11. `regel/print-er-temauavhengig` — **Print surfaces are theme-invariant.**
    Anything that becomes a document — an invoice, a register, a statement —
    uses the `--frv-print-*` tokens and stays white paper regardless of the
    viewer's theme. A user in dark mode must not print white text on white
    paper.

## Anti-patterns

Each of these is a plausible-looking move that quietly destroys the system.
Where one is just a violation of a law above, it links there instead of
repeating an ID.

- `regel/ingen-handrullet-boks-som-finnes` — **Hand-rolling a box that already
  exists.** A `borderLeft` + tinted background written inline on a page is a
  `Callout`. This exact pattern was found duplicated across a dozen files
  before it was consolidated — it is the most frequent way this system decays.
- Raw semantic colour on small text. See `regel/farget-smaatekst-bruker-text-token`.
- One card per list item. See `regel/liste-med-handling-er-listrow`.
- A gradient on a form, a modal, a button or a row. See `regel/gradient-viser-flatt-opererer`.
- Drop shadows to imply hierarchy. See `regel/struktur-via-overflater-ikke-skygge`.
- Typing a font size. See `regel/typografi-via-type-klasser`.
- `regel/en-aksentfarge` — A second accent colour, or the accent used on a
  border, heading or divider.
- `regel/ingen-emoji-som-ikon` — Emoji as iconography.
- `regel/hover-endrer-farge-ikke-skala` — Hover effects that scale or glow.
  Hover changes colour and border; that's all.
- `regel/ingen-selgende-tone` — Marketing voice in product copy — no
  "vennligst", no superlatives, no exclamation marks.
- `regel/tetthet-er-bevisst` — Adding whitespace "to let it breathe". Density
  here is deliberate; a board member scanning twelve maintenance items wants
  them on one screen.

## When a component doesn't exist

Derive it from the primitives rather than importing a foreign pattern:

- **Anything listing records** → `ListRow` in a `divide-y` container. If a row
  expands, the detail panel is a sibling `div` with a `border-top`, not nested
  inside the row.
- **Anything explaining or warning** → `Callout` with the matching tone.
- **A remark about a number directly above it** → `InlineNote`.
- **Anything selectable from a short fixed set** → `PillTabs`.
- **Anything that overlays** → `Modal`.
- **Anything tabular** → hairline rules, a column header that NAMES the
  column (`type-label-13-strong` — see
  `regel/tre-vekter-400-leser-500-navngir-600-titler`), numerics right-aligned,
  tabular figures via the `-mono` type tokens.
- **A new semantic colour** → check whether the underlying scale actually gives
  you a distinct step before aliasing a new name onto a raw scale value. In dark
  mode two neighbouring steps can be *literally identical* (this system's amber
  `800`/`900` are both `#ff9300`), which silently made two different priority
  levels indistinguishable everywhere. Measure, then define an explicit value if
  the scale doesn't serve you.

**Before inventing anything, check whether the pattern already exists.** If it
does not and you need it in two or more places, define it as a component first
and then use it — never the other way round. State clearly which components in a
delivery were derived rather than taken from the kit.

## Voice

Copy is part of the design. The kit's own examples are Norwegian because Frivio
is; adapt the language to the project, but keep the rules.

- Name actions with verb + noun — `Create maintenance plan`, `Delete member` —
  never `Confirm`, `OK`, or a bare verb.
- Errors say what happened **and** what to do now: `Upload failed. The file is
  over 25 MB. Compress it or upload a smaller one.`
- Confirmations name the thing that changed, drop the full stop, and never say
  "successfully": `Building deleted`, not `The building was successfully deleted.`
- Empty states point at the first step, not at the emptiness.
- Progress uses the present participle with an ellipsis: `Analysing…`
- Write for someone with no technical background. Calm, plain, explanatory.

## Product judgment

The laws above are *form* — the easy half of what a design system needs once
it's copied elsewhere. Form is easy to port; the *why* behind
a real product's decisions usually isn't, because it lives in chat logs and
planning docs, not in the components. Frivio hit this gap directly: a founder
had to repeat the same correction twice across separate deliveries before it
was written down anywhere durable.

Three references carry that other half. Read them before a `harden` or
`review` request on a surface they cover, and before assuming a pattern from
one part of the app transfers to another:

- `references/produktskjonn.md` — the bindable product decisions (money
  handling, quarantine security, terminology locks, UI-pattern choices), each
  with a rule, its scope, the reasoning, named exceptions and a source. This is
  where a `regel/*` ID resolves to its full story.
- `exemplars/` — worked before/after cases (a migration, a deliberate
  non-migration, a bug that turned out to live in a primitive rather than a
  page) showing the reasoning in the specific situation it came from.
- `references/coverage-gaps.md` — the honest "no standard yet" list. Checking
  it before inventing a pattern costs less than inventing one that
  contradicts a decision made later.

## Reference

- `references/tokens.md` — the full token table, what each step means, and the
  reasoning behind the deliberate deviations
- `references/produktskjonn.md` — product judgment: the bindable decisions
  behind the laws, with sources (see **Product judgment**, above)
- `references/coverage-gaps.md` — patterns with no standard yet, and what
  would settle each one
- `exemplars/` — worked before/after cases behind specific decisions
- `assets/frivio-tokens.css` — the token layer (generated from Frivio's
  `app/globals.css`; do not hand-edit)
- `assets/frivio-kit.tsx` — component source
- Living showcase: <https://design.frivio.no> (also reachable at
  `www.frivio.no/design`; public to view, editable by Frivio-admin only) —
  replaces the old `/system/design` path, which now 301s here
- Machine-readable spec: <https://www.frivio.no/design.md>
