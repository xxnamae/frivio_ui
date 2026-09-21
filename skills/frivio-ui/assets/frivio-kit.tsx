/* ══════════════════════════════════════════════════════════════════════════
   FRIVIO DESIGN SYSTEM — component kit (standalone port)

   A near dependency-free copy of Frivio's shared UI primitives, meant to be
   dropped into ANY React + Tailwind project. Nothing is imported except React
   itself: no `cn`/clsx, no next/link, no icon library, no app types — with
   ONE named exception, `MultiSelect`, which needs the `cmdk` package (see its
   own section for why). Every other component needs nothing beyond React.

   Synced 2026-09-13 (Spectrum-lab comparison wave, following designrunde 2,
   wave 3, 2026-09-10 — the round that rewrote the token layer AND every
   component's API: Button variants renamed to secondary/tertiary/error,
   monochrome form controls, Card/StatCard/Modal moved to a box-shadow
   "border", ListRow/Table typography). The 09-13 wave added OtpInput,
   StepIndicator, StegForm, FeatureIntro, ErrorState, HoldToConfirm, Dropdown,
   DataTable, MultiSelect, and the "Kari" assistant primitives (AgentPlan,
   AgentSteps, ReasoningTrace, ProposalCard — see that section's own note).
   Every component below mirrors its `components/ui/*.tsx` counterpart's
   props, variants and defaults exactly, including Norwegian prop names where
   the source uses them (`verdi`, `steg`, `hoyde`, `antall` — this is Frivio's
   own system, and the kit is a faithful port, not a translation).

   Synced 2026-09-14 (founder rounds of 2026-09-13 evening and the night into
   09-14): `Tabs`/`PillTabs` active-tab weight (`-strong`, an invisible
   same-weight copy reserving the width so switching never shifts layout);
   `Callout`/`InlineNote` own their own text size (`type-copy-14`);
   `InlineNote` caps running text at `max-w-[65ch]` (Callout does NOT — its
   text fills the tinted box, and the copy stays short instead), joined by the
   same 65ch cap on `StepCard`/`SectionHeader`/`PageHeader`'s description text; `PageHeader`'s
   context+action block dropped `shrink-0` (it clipped instead of wrapping on
   narrow screens); `Field`/`DescriptionList`'s key label grew from 12 to
   13px, matching `Input`; `StatCard`'s value never wraps, stepping its font
   size down for long values; `FeatureIntro` gained a `nyheter` prop for
   grouping several announcements into one bubble (max one per page);
   `Modal`'s scrim-click-to-close is fixed (the handlers were on the wrong
   element and never actually fired); `StegForm` gained `kanGaVidereFra` and
   uses it for the last step's "Finish" button, which was permanently
   disabled; a new shared `useKlikkUtenfor` hook (pointerdown + optional
   Escape, multiple refs) now backs `MultiSelect` and `OverflowMenu`'s
   click-outside/Escape handling; new `YearSelector`/`PeriodeVelger` (year +
   optional month, with an "all years" state) — YearSelector's arrows are
   hand-rolled here since this kit's `IconButton` has no `size` variant (see
   YearSelector's own section for why).

   Synced 2026-09-14 morning: `PeriodeVelger` rebuilt again, same day — a
   single trigger + anchored panel (year row, "whole year" + a month grid,
   "all years" as its own choice) replacing the previous night's toggle +
   stepper, which read as two controls. `YearSelector` lost the `alle`
   extension it gained hours earlier — `PeriodeVelger` no longer uses it.

   Synced 2026-09-14 later morning: `PeriodeVelger` gained a third quick pick,
   `'siste3'` ("last 3 years" — current year plus the two before it, no
   month), its own full-width panel row next to "all years", and a shared
   pure helper `periodeTilAar(verdi)` returning `{fra?, til?}` for filtering.

   Synced 2026-09-14 evening: `PeriodeVelger`'s "last 3 years"/"all years"
   full-width buttons became ONE row of small pill chips ("this year", each
   older year with data, "since the start" last) — `'siste3'` removed from
   `PeriodeVerdi` again as a result (a concrete year plus a chip click covers
   the same ground). Panel typography stepped down from 14 to 13px throughout
   (year-row number, "whole year", the new chip row) to match founder
   feedback on the screenshot.
   `FeatureIntro`'s multi-item display changed from a bulleted list (badge
   "New (N)") to a STEPPER — badge "New" + a counter ("1 of 2"), one item
   shown at a time, "Got it" dismissing only the shown item (advancing to the
   next unread) and "Next" only switching which one is shown; see the
   "ONE AT A TIME, NOT A BULLET LIST" note in that section.

   Synced 2026-09-21: a due-date/status pill row (five buckets, e.g. "overdue/
   this month/next 3 months/this year/all") is now a DROPDOWN with the
   selected bucket + its count shown right on the trigger — see `FristVelger`
   near the end of the `Dropdown` section. `Dropdown` itself gained an
   optional `icon` prop (a leading icon in the trigger) to support this
   without a bespoke fourth dropdown variant.

   ── Setup (three steps) ──────────────────────────────────────────────────
   1. Import `frivio-tokens.css` ONCE at the root of your app. Every component
      here reads its colors, radii, spacing and shadows from the CSS variables
      that file defines (`--frv-*`). Without it the components render unstyled.
   2. Put `class="frv"` on a root element (or <body>). That switches on the
      system surface, text color, font — and the two-layer `:focus-visible`
      ring, which is scoped to `.frv` in the token file.
   3. Copy this file into your project. No tailwind.config changes are needed:
      the components use Tailwind ARBITRARY VALUES (`bg-[var(--frv-surface)]`),
      which are compiled verbatim and simply read the CSS variables at runtime.
      The `.type-*` typography classes (type-heading-16, type-copy-13, …) are
      plain CSS classes defined in frivio-tokens.css — not Tailwind — so they
      also work without config.

   ── Next.js App Router ───────────────────────────────────────────────────
   Add `'use client'` at the top of this file (or of your own re-export
   wrapper) — most components here use state, refs, effects or event
   handlers. The directive is omitted here so the file also works unchanged
   in Vite/CRA/Remix, where it would be meaningless.

   ── Differences from the in-repo Frivio components ───────────────────────
   • `cn()` (clsx + tailwind-merge) is replaced by a plain `cx()` join. Class
     lists are concatenated, NOT de-duplicated: if you pass a `className` that
     conflicts with a built-in Tailwind class (e.g. `px-6` over `px-4`), the
     winner is decided by CSS source order, not by argument order. Use an
     `!` important suffix or add tailwind-merge yourself if you need overrides.
     (Button's own `shape` prop sidesteps this by never emitting two
     conflicting padding classes at once — see its comment.)
   • Icons are props, never imports. Any component that showed an icon now
     takes an `icon` of type `IconComponent` — pass a lucide-react icon, your
     own SVG component, anything with a `size`/`className`/`style` signature.
     Chrome the components draw themselves (Select's chevron, Modal's close,
     Checkbox's check, …) is inline SVG, gathered in one place below.
   • Anything that was `next/link` renders a plain `<a href>` instead; a
     `scroll` prop kept for API parity is a documented no-op (swap the `<a>`
     for your router's link component if you need real scroll control).
     Anything that was `next/navigation`'s `useRouter().push(...)` is
     `window.location.href = ...` instead (PillTabs' overflow menu).
   • `Popover` (the shared anchored-panel primitive, 5 consumers in the app)
     is NOT ported — it depends on `.popover-panel`/`.popover-scrim` CSS
     classes and a mobile-sheet breakpoint that live in the app's own
     stylesheet, not in the token layer. `OverflowMenu` (which is ported,
     since it's in the "mirror exactly" list) reimplements the minimal chrome
     it needs directly: an anchored dropdown, Escape/click-outside, no mobile
     bottom-sheet, no `auto` placement. `ConfirmDialog` doesn't need Popover
     at all (it's built on `Modal`).
   • `Modal` drops `useTastaturhoyde` (mobile on-screen-keyboard avoidance,
     a browser `visualViewport` hook) and the decorative `modal-in`/
     `overlay-in` entrance animations, for the same reason as Popover above.
     Everything functional (Escape, focus trap, focus restore, click-outside,
     mobile bottom-sheet layout) is intact.
   • `SidePanel` (added 2026-09-18) is in the same family as `Modal` — a
     fixed, full-viewport overlay with its own scrim, not anchored to a
     trigger — so it needs neither `Popover` nor a portal. It drops the
     decorative `panel-in` slide animation for the same reason as `Modal`
     above, but (unlike `Modal`) uses the kit's own `useKlikkUtenfor` for
     Escape/click-outside instead of hand-rolled backdrop tracking — see its
     own comment for why that's safe here.
   • `Tabs` drops the `.tabs-fade` scroll-edge gradient hint (a CSS
     `:has()` rule in the app stylesheet) — the sliding underline, keyboard
     nav and scroll-into-view are intact.
   • `ListRow`'s narrow-container line 2 (secondary/meta/value) keeps
     `overflow-x-auto` as a safety net but drops the `.rad-fade`/`RadFade`
     scroll-edge gradient hint, same reasoning as `Tabs` above.
   • `Toast`'s public API is intentionally still Norwegian
     (`useToast().vis({ tekst, tone, handling, varighet, preserve,
     vedLukking })`) — see that section for why.
   • `Begrep` takes `term`/`explanation` directly instead of an `id` into a
     hardcoded glossary — the Frivio source centralizes ALL of its housing-
     specific vocabulary in one `lib/ordliste.ts`, which has no equivalent in
     a foreign project. Build your own lookup and pass the resolved pair in,
     or wrap this component with one.
   • `ActionBar`'s bottom-clearance variable is `--frv-bottom-clearance`
     (default `0px`), not the Frivio source's `--frivio-bottomnav-h` (default
     `55px`) — the source coordinates with its own app's fixed `BottomNav`;
     a foreign project has no such bar unless it sets one, hence the
     zero-clearance default here.
   • `PageHeader`'s `info` popover uses the shared `Tooltip` only (hover/
     focus) — it drops the source's separate touch-tap fallback panel
     (`InfoHint`, not ported, depends on the app's own coarse-pointer
     click-to-open state). On touch the "i" button renders with no way to
     open the explanation; put anything touch users must see in `children`.

   Everything else — prop names, variants, sizes, a11y wiring, the deliberate
   touch-target overrides — is a 1:1 port. Comments explaining WHY a decision
   was made are kept and translated (condensed); they are the part worth
   reading.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  Children,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type {
  AnchorHTMLAttributes,
  AnimationEvent,
  ButtonHTMLAttributes,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  ReactNode,
  RefObject,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
// The ONE non-React dependency in this file — see `MultiSelect`'s own
// section for why (its search/select/keyboard-nav engine, not its styling).
// `npm install cmdk` alongside this kit if you use that one component; every
// other component needs nothing beyond `react`/`react-dom`.
import { Command as CommandPrimitive } from 'cmdk'

/** Minimal className joiner. Replaces clsx + tailwind-merge (see header). */
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/** Icon contract. Any component that renders an icon receives it as a prop, so
    this kit stays free of an icon dependency. lucide-react components match
    this signature as-is. */
export type IconComponent = React.ComponentType<{
  size?: number
  className?: string
  style?: React.CSSProperties
}>

/* ══════════════════════════════════════════════════════════════════════════
   0. INLINE CHROME ICONS — drawn here so the kit needs no icon dependency.
      Used only by the components themselves (Select's chevron, Modal/Toast's
      close, Checkbox's check, …), never exported as part of the public API.
   ══════════════════════════════════════════════════════════════════════════ */

type ChromeIconProps = { size?: number; className?: string; style?: CSSProperties }

function ChevronDownIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronUpIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ChevronLeftIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ArrowRightIcon({ size = 11, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CloseIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" aria-hidden="true" className={className} style={style}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ size = 13, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function MinusIcon({ size = 11, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
      strokeLinecap="round" aria-hidden="true" className={className} style={style}>
      <path d="M5 12h14" />
    </svg>
  )
}

// Hand-drawn approximation of lucide's `calendar-range` glyph (frame + two
// range marks) — added 2026-09-14 for `PeriodeVelger`'s trigger. Not pixel-
// exact (this kit has no icon dependency to check against), just recognizable.
function CalendarRangeIcon({ size = 16, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M17 14h-6M13 18H7" />
    </svg>
  )
}

function SearchIcon({ size = 15, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function MoreIcon({ size = 16, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} style={style}>
      <circle cx="5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" />
    </svg>
  )
}

function PlusIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}

function WarningIcon({ size = 16, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}

function RefreshIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}

function InfoIcon({ size = 12, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" />
    </svg>
  )
}

// The four below (2026-09-13 extension) are used only by the section 7/8
// components added the same day (AgentSteps/ReasoningTrace/DataTable) — same
// "chrome icons live here, components take them as props elsewhere" rule as
// the ones above. Mirrors the source's lucide-react aliases exactly (see
// `components/ui/icons.tsx`): `Sirkel`→Circle, `GenererAI`→Sparkles,
// `Rutenett`→LayoutGrid, `Laster`→Loader2 (itself an alias of LoaderCircle).

function SparklesIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" />
    </svg>
  )
}

function CircleOutlineIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function LayoutGridIcon({ size = 14, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

/** Spin it yourself (`className="animate-spin"`, same as the source's `Laster`
 *  usage) — the icon only draws the ¾-circle stroke, same as lucide's `Loader2`. */
function LoaderIcon({ size = 16, className, style }: ChromeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   1. PRIMITIVES — Button, IconButton, Card, Badge, Avatar/AvatarGroup,
      StatusDot, Separator, Kbd, Spinner, Text/Heading
   ══════════════════════════════════════════════════════════════════════════ */

interface ButtonOwnProps {
  /** Wave 3 (2026-09-10): API aligned with the token contract.
   *  `outline`→`secondary`, `ghost`→`tertiary`, `danger`→`error`.
   *  `soft` is deliberately grayscale in this round (founder): a tinted
   *  NEUTRAL secondary action that should be visible without competing with
   *  a filled button or a colored action — typically "Copy" next to content.
   *  It previously used an accent tint, which made it hard to tell apart
   *  from `accent` and from a link.
   *  `link` (added 2026-09-19): a text link with a real hit target — accent
   *  color, underlined, no fill/border. For a STANDALONE action link ("5
   *  paid →"), never inline in running prose (use a plain `.link`-styled
   *  anchor there instead). */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'accent' | 'soft' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  /** Brief confirmation that the action succeeded — "Copied", "Saved". A
   *  STATE, not a variant: the same button changes color for a moment and
   *  reverts, so it composes with every variant instead of forcing the call
   *  site to swap `variant="success"` back and forth. The call site owns the
   *  label/icon; the component only swaps colors. */
  confirmed?: boolean
  /** Shared disabled state for both modes. On button-mode this is native
   *  `disabled`; on link-mode there is no such attribute (an `<a>` is always
   *  focusable), so it's simulated with `aria-disabled` + removed tab stop +
   *  blocked click. Same prop name either way. */
  disabled?: boolean
  /** Why the button is disabled, shown as a `type-label-12` line right below
   *  it (info icon + text, tertiary color) and wired with `aria-describedby`.
   *  Proactive rights explanation: a user without write access should see WHY
   *  before trying, not a 403 after. Purely additive — omitting it leaves
   *  existing call sites unchanged. */
  disabledReason?: string
}

/** `shape` discriminates on `aria-label`: `square`/`circle` (icon-only) make
 *  it REQUIRED at the type level, since there is no visible text to name the
 *  button for a screen reader otherwise. `default`/`rounded` keep it
 *  optional, same as any button. Written as a flat union in
 *  `ButtonAsButtonProps`/`ButtonAsLinkProps` below rather than intersected
 *  in — `keyof` and destructuring of a type intersected with a union type
 *  is unreliable in some TS versions. */
type ButtonShapeProps =
  | { shape?: 'default' | 'rounded' }
  | { shape: 'square' | 'circle'; 'aria-label': string }

type ButtonAsButtonBase = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'aria-label'> & { href?: undefined }

type ButtonAsButtonProps =
  | (ButtonAsButtonBase & { shape?: 'default' | 'rounded' })
  | (ButtonAsButtonBase & { shape: 'square' | 'circle'; 'aria-label': string })

type ButtonAsLinkBase = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'color' | 'aria-label'> & {
    /** Navigation that LOOKS like a button: renders a plain `<a>` (the
     *  Frivio source renders `next/link`), NEVER `<Link><Button/></Link>` —
     *  the nested pattern gave two focus stops for keyboard/screen reader.
     *  Same classes/variants/sizes/icon support as button-mode; only the
     *  outer element is an `<a>`. */
    href: string
  }

type ButtonAsLinkProps =
  | (ButtonAsLinkBase & { shape?: 'default' | 'rounded' })
  | (ButtonAsLinkBase & { shape: 'square' | 'circle'; 'aria-label': string })

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

const BTN_VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'text-[var(--frv-btn-fg)] bg-[var(--frv-btn-bg)] hover:bg-[var(--frv-btn-bg-hover)]',
  secondary: 'text-[var(--frv-text-primary)] bg-[var(--frv-surface)] border border-[var(--frv-gray-alpha-400)] hover:border-[var(--frv-gray-alpha-500)] hover:bg-[var(--frv-gray-alpha-100)]',
  tertiary:  'bg-transparent text-[var(--frv-text-primary)] hover:bg-[var(--frv-gray-alpha-100)]',
  error:     'text-[var(--frv-error-fg)] bg-[var(--frv-error-solid)] hover:brightness-110',
  warning:   'text-[var(--frv-warning-fg)] bg-[var(--frv-warning-solid)] hover:brightness-110',
  accent:    'text-[var(--frv-accent-fg)] bg-[var(--frv-accent-strong)] hover:bg-[var(--frv-accent-strong-hover)]',
  soft:      'text-[var(--frv-text-primary)] bg-[var(--frv-gray-alpha-100)] hover:bg-[var(--frv-gray-alpha-200)]',
  // Same recipe as the `.link` CSS utility: dimmed underline at rest
  // (color-mix 45% currentColor), full color on hover.
  link:      'bg-transparent text-[var(--frv-accent-text)] underline decoration-1 underline-offset-[0.16em] decoration-[color-mix(in_srgb,currentColor_45%,transparent)] hover:decoration-current',
}

const BTN_HEIGHT: Record<NonNullable<ButtonProps['size']>, string> = { xs: 'h-6', sm: 'h-8', md: 'h-10', lg: 'h-12' }
const BTN_GAP: Record<NonNullable<ButtonProps['size']>, string> = { xs: 'gap-1', sm: 'gap-1.5', md: 'gap-2', lg: 'gap-2' }
const BTN_TEXT: Record<NonNullable<ButtonProps['size']>, string> = { xs: 'type-button-12', sm: 'type-button-14', md: 'type-button-14', lg: 'type-button-16' }
const BTN_PAD_X: Record<NonNullable<ButtonProps['size']>, string> = { xs: 'px-2', sm: 'px-3', md: 'px-4', lg: 'px-5' }
// 24/32/40px (xs/sm/md) sit below WCAG 2.5.5 for a thumb, and the typical
// user is a 50+ board member on a phone — so they get 44px below `lg`
// (min-height, not height, so content stays vertically centered). `lg`
// (48px) is already touch-safe and left completely alone.
const BTN_MIN_H: Record<NonNullable<ButtonProps['size']>, string> = { xs: 'min-h-11 lg:min-h-0', sm: 'min-h-11 lg:min-h-0', md: 'min-h-11 lg:min-h-0', lg: '' }
// A two-letter `xs` label (e.g. "xs") measured 31px wide with only `px-2` —
// the same mobile-touch-target floor as height, just for width (2026-09-19).
const BTN_MIN_W: Record<NonNullable<ButtonProps['size']>, string> = { xs: 'min-w-10 lg:min-w-0', sm: '', md: '', lg: '' }
const BTN_RADIUS: Record<NonNullable<ButtonProps['shape']>, string> = {
  default: 'rounded-[var(--frv-radius-sm)]', rounded: 'rounded-full',
  square: 'rounded-[var(--frv-radius-sm)]', circle: 'rounded-full',
}

/* Button
   Heights 24/32/40/48px (xs/sm/md/lg), radius sm (6px), button-12 (xs) /
   button-14 (sm/md) / button-16 (lg), weight 500. Variants: `primary`
   (monochrome signature — black-on-light/white-on-dark, never blue),
   `secondary` (bg surface + translucent border), `tertiary` (transparent,
   tints on hover), `error` (filled, calibrated `-solid`/`-fg` pair — raw
   red-700 text measures under AA, `-solid` is red-800 and holds 4.5:1),
   `warning` (filled amber, always dark text), `accent` (filled blue CTA —
   blue is otherwise reserved for links/focus), `soft` (tonal neutral
   secondary, e.g. "Copy" next to content), `link` (text link with a real hit
   target, for a standalone action link — never inline in prose). `confirmed`
   layers on top of any variant. Icon rule: Button has no icon logic of its own — add a leading
   icon at the call site only when it NAMES the action; use `shape`
   ('square'/'circle') for a single icon with no text.

   `shape` never conflicts with a size's own padding class: horizontal
   padding is applied ONLY for `default`/`rounded` shapes, and `square`/
   `circle` get `aspect-square` with none at all — see the kit-wide note
   about `cx()` not de-duplicating classes (header comment). `square`/
   `circle` require `aria-label` at the type level (`ButtonShapeProps` above).

   Text in CONTENT (i.e. not `shape="square"|"circle"`) is never hidden on
   mobile — no `hidden sm:inline` at the call site. A button with a text
   label keeps it at every width; shorten the wording instead of hiding it. */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', shape = 'default', loading, confirmed, disabled, disabledReason, children, style, href, ...rest }, ref) => {
    const base = 'inline-flex items-center justify-center whitespace-nowrap transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none'
    const autoId = useId()
    const showReason = !!disabled && !!disabledReason
    const reasonId = showReason ? `btn-reason-${autoId}` : undefined
    const reasonNode = showReason ? (
      <p id={reasonId} className="type-label-12 inline-flex items-start gap-1.5 mt-1.5 text-(color:--frv-text-tertiary)">
        <InfoIcon size={12} className="mt-0.5 shrink-0 text-(color:--frv-text-tertiary)" />
        {disabledReason}
      </p>
    ) : null

    const isIconOnly = shape === 'square' || shape === 'circle'

    /* Confirmed state uses `--frv-success-text`, NOT the raw `--frv-success`:
       the label is 14px and the raw token doesn't hold 4.5:1 on a card
       surface in light mode. Border toned down via color-mix — a receipt,
       not a warning. Fill is removed for filled variants (else text sits on
       the wrong ground); `soft` keeps its tint and only changes hue. */
    const confirmedStyle: CSSProperties = confirmed
      ? {
          background: variant === 'soft' ? 'var(--frv-success-light)' : 'transparent',
          color: 'var(--frv-success-text)',
          borderColor: 'color-mix(in srgb, var(--frv-success) 30%, transparent)',
        }
      : {}

    const classes = cx(
      base,
      BTN_VARIANT_CLASS[variant],
      BTN_HEIGHT[size],
      BTN_GAP[size],
      BTN_TEXT[size],
      BTN_MIN_H[size],
      BTN_MIN_W[size],
      BTN_RADIUS[shape],
      isIconOnly ? 'aspect-square' : BTN_PAD_X[size],
      // Filled variants have no border; in confirmed state they need one, or
      // the button loses its shape once the fill is removed. `secondary`
      // already has a border (no duplicate); `soft`/`link` need none — `soft`
      // shows state through background alone, `link` has no fill to outline.
      confirmed && variant !== 'secondary' && variant !== 'soft' && variant !== 'link' && 'border',
      confirmed && variant !== 'soft' && 'hover:bg-transparent',
      confirmed && variant === 'soft' && 'hover:brightness-100',
      className,
    )
    const combinedStyle: CSSProperties = { ...confirmedStyle, ...style }
    const inner = (
      <>
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </>
    )

    if (href !== undefined) {
      const { onClick, target, rel, ...anchorRest } = rest as Omit<ButtonAsLinkProps, keyof ButtonOwnProps | keyof ButtonShapeProps | 'href' | 'className' | 'style' | 'children'>
      const isDisabled = disabled || loading
      const link = (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel}
          aria-live={confirmed ? 'polite' : undefined}
          aria-disabled={isDisabled || undefined}
          aria-describedby={reasonId}
          tabIndex={isDisabled ? -1 : undefined}
          className={classes}
          style={combinedStyle}
          onClick={isDisabled ? (e) => e.preventDefault() : onClick}
          {...anchorRest}
        >
          {inner}
        </a>
      )
      if (!showReason) return link
      return <span className="inline-flex flex-col items-start">{link}{reasonNode}</span>
    }

    const button = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        aria-live={confirmed ? 'polite' : undefined}
        aria-describedby={reasonId}
        style={combinedStyle}
        disabled={disabled || loading}
        {...(rest as Omit<ButtonAsButtonProps, keyof ButtonOwnProps | keyof ButtonShapeProps | 'className' | 'style' | 'children' | 'href'>)}
      >
        {inner}
      </button>
    )
    if (!showReason) return button
    return <span className="inline-flex flex-col items-start">{button}{reasonNode}</span>
  }
)

Button.displayName = 'Button'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  /** Same idea as Button's `disabledReason`, without room for a visible text
   *  line — the button IS the icon. Shown as `title` (tooltip) plus a
   *  visually-hidden (`sr-only`) text wired with `aria-describedby`. */
  disabledReason?: string
  /** `default`: neutral text-secondary at rest, gray-alpha-100 + text-primary
   *  on hover/focus. `error`: same rest state, error-light/-text ONLY on
   *  hover/focus — for a destructive row action that shouldn't shout red at
   *  rest. `tertiary`/`quaternary`: SAME hover/focus as default, but the rest
   *  color is already dimmed one/two steps — for a low-weight secondary
   *  action in a row/list that shouldn't compete with the content. */
  tone?: 'default' | 'error' | 'tertiary' | 'quaternary'
}

const ICON_BTN_TONE: Record<NonNullable<IconButtonProps['tone']>, string> = {
  default:    'text-[var(--frv-text-secondary)] hover:bg-[var(--frv-gray-alpha-100)] hover:text-[var(--frv-text-primary)] focus-visible:bg-[var(--frv-gray-alpha-100)] focus-visible:text-[var(--frv-text-primary)]',
  error:      'text-[var(--frv-text-secondary)] hover:bg-[var(--frv-error-light)] hover:text-[var(--frv-error-text)] focus-visible:bg-[var(--frv-error-light)] focus-visible:text-[var(--frv-error-text)]',
  tertiary:   'text-[var(--frv-text-tertiary)] hover:bg-[var(--frv-gray-alpha-100)] hover:text-[var(--frv-text-primary)] focus-visible:bg-[var(--frv-gray-alpha-100)] focus-visible:text-[var(--frv-text-primary)]',
  quaternary: 'text-[var(--frv-text-quaternary)] hover:bg-[var(--frv-gray-alpha-100)] hover:text-[var(--frv-text-primary)] focus-visible:bg-[var(--frv-gray-alpha-100)] focus-visible:text-[var(--frv-text-primary)]',
}

/* IconButton
   Icon-only button with a GUARANTEED 44×44px hit area (WCAG 2.5.5 / Apple
   HIG), no matter how small the icon inside is (12–20px). `aria-label` is
   mandatory (type-enforced) because the button never has visible text. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, style, children, disabled, disabledReason, title, tone = 'default', ...props }, ref) => {
    const autoId = useId()
    const showReason = !!disabled && !!disabledReason
    const reasonId = showReason ? `icon-btn-reason-${autoId}` : undefined
    return (
      <button
        ref={ref}
        disabled={disabled}
        title={showReason ? disabledReason : title}
        aria-describedby={reasonId}
        className={cx(
          'inline-flex items-center justify-center shrink-0 rounded-[var(--frv-radius-sm)] transition-colors',
          ICON_BTN_TONE[tone],
          className
        )}
        style={{ width: 44, height: 44, ...style }}
        {...props}
      >
        {children}
        {showReason && <span id={reasonId} className="sr-only">{disabledReason}</span>}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `default` (bg surface) | `hero` (the `--frv-gradient-hero` background —
   *  the ONE highlighted surface on a page, not the default). */
  tone?: 'default' | 'hero'
}

/* Card
   Wave 3 (2026-09-10): bg `--frv-surface`, border via
   `box-shadow: var(--frv-shadow-border)` (NOT a Tailwind `border` class — a
   box-shadow border doesn't take up layout space, so content doesn't shift
   1px when a border is added/removed), radius-md, no drop shadow at rest.
   `style` is merged AFTER these defaults, so a call site that sets its own
   `style={{ background: ... }}` still wins. */
export function Card({ className, children, tone = 'default', style, ...props }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-[var(--frv-radius-md)] p-6 shadow-(--frv-shadow-border)',
        tone === 'hero' ? 'bg-[image:var(--frv-gradient-hero)]' : 'bg-(color:--frv-surface)',
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

/* Frivio's priority domain, inlined so this file needs no app-type import. */
export type Priority = 'akutt' | 'hoy' | 'middels' | 'lav'
export type BadgeHue = 'gray' | 'blue' | 'purple' | 'amber' | 'red' | 'pink' | 'green' | 'teal'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeHue | 'inverted' | 'accent' | Priority | 'default'
  /** `low` (default): bg hue-100, text hue-900 — calibrated for AA on 12–14px
   *  text. `high`: solid bg hue-700 + white text (amber/inverted: black) —
   *  holds only ~3:1 (graphics level), so use it on ICONS or large labels
   *  only, never on small text alone. */
  contrast?: 'low' | 'high'
  size?: 'sm' | 'md' | 'lg'
  /** Leading icon, same color as the text. One icon only, no suffix slot. */
  icon?: IconComponent
}

/* Badge (wave 3, 2026-09-10)
   Small pill (radius full) for ONE short state word — priority, status or a
   neutral category. Ten color variants (eight scale hues + inverted +
   accent), two contrast levels, three sizes.

   The priority domain (`akutt`/`hoy`/`middels`/`lav`) and `default` are
   ALIASES over the color scale, not separate color families — akutt→red,
   hoy→amber, middels→gray, lav→teal, default→gray — kept explicit so none of
   the existing `variant="akutt"`-style call sites need to change as the
   system grows the pure hue variants. */
const BADGE_PRIORITY_ALIAS: Record<string, BadgeHue> = { akutt: 'red', hoy: 'amber', middels: 'gray', lav: 'teal', default: 'gray' }
const BADGE_HUES: readonly BadgeHue[] = ['gray', 'blue', 'purple', 'amber', 'red', 'pink', 'green', 'teal']

function badgeResolveHue(variant: string): BadgeHue {
  if ((BADGE_HUES as readonly string[]).includes(variant)) return variant as BadgeHue
  return BADGE_PRIORITY_ALIAS[variant] ?? 'gray'
}

/* Solid surface per color family, measured 2026-09-12 (a sweep found white on
 * teal/green/gray-700 measuring 3.0-3.2:1). White text only holds 4.5:1 on
 * blue/purple-700 and red/purple/pink-800; amber, teal, green and gray need
 * dark text. The semantic families reuse the `-solid`/`-fg` tokens (same
 * surface as Button warning/error and StatCard); the rest use step 800 with
 * whichever foreground measures best in BOTH themes. */
const BADGE_SOLID: Record<BadgeHue, { background: string; color: string }> = {
  gray:   { background: 'var(--frv-gray-800)', color: 'var(--frv-warning-fg)' },
  blue:   { background: 'var(--frv-accent-strong)', color: 'var(--frv-accent-fg)' },
  purple: { background: 'var(--frv-purple-800)', color: 'var(--frv-accent-fg)' },
  amber:  { background: 'var(--frv-warning-solid)', color: 'var(--frv-warning-fg)' },
  red:    { background: 'var(--frv-error-solid)', color: 'var(--frv-error-fg)' },
  pink:   { background: 'var(--frv-pink-800)', color: 'var(--frv-accent-fg)' },
  green:  { background: 'var(--frv-green-800)', color: 'var(--frv-warning-fg)' },
  teal:   { background: 'var(--frv-success-solid)', color: 'var(--frv-success-fg)' },
}

function badgeStyle(variant: string, contrast: 'low' | 'high'): { background: string; color: string } {
  if (variant === 'inverted') return { background: 'var(--frv-gray-1000)', color: 'var(--frv-bg)' }
  if (variant === 'accent') {
    return contrast === 'high'
      ? { background: 'var(--frv-accent-strong)', color: 'var(--frv-accent-fg)' }
      : { background: 'var(--frv-accent-light)', color: 'var(--frv-accent-text)' }
  }
  const hue = badgeResolveHue(variant)
  return contrast === 'high' ? BADGE_SOLID[hue] : { background: `var(--frv-${hue}-100)`, color: `var(--frv-${hue}-900)` }
}

const BADGE_SIZE_CLASS = { sm: 'h-5 px-1.5 gap-1 type-button-12', md: 'h-6 px-2 gap-1 type-button-12', lg: 'h-7 px-2.5 gap-1.5 type-button-14' }
const BADGE_ICON_SIZE = { sm: 12, md: 12, lg: 14 }

/** Icon and text stay on ONE line no matter how narrow the container gets —
 *  `whitespace-nowrap` + `shrink-0` on the pill itself (found wrapping to two
 *  lines in a narrow table cell/`ListRow` meta column, which reads as a
 *  rendering bug rather than a state). The text span still truncates with an
 *  ellipsis via `max-w-full truncate` if it's unusually long — the pill
 *  shrinks/clips before it ever breaks onto a second line. */
export function Badge({ variant = 'default', contrast = 'low', size = 'md', icon: Icon, className, children, ...props }: BadgeProps) {
  const style = badgeStyle(variant, contrast)
  return (
    <span
      className={cx('inline-flex items-center max-w-full whitespace-nowrap shrink-0 rounded-[var(--frv-radius-full)] bg-(color:--badge-bg) text-(color:--badge-fg)', BADGE_SIZE_CLASS[size], className)}
      style={{ '--badge-bg': style.background, '--badge-fg': style.color } as CSSProperties}
      {...props}
    >
      {Icon && <Icon size={BADGE_ICON_SIZE[size]} className="shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  )
}

export type AvatarSize = 16 | 24 | 32 | 48 | 64

export interface AvatarProps {
  /** Image URL. Falls back to initials if missing OR if it fails to load. */
  src?: string
  /** Full name — source of the initials fallback (max 2 chars). */
  name: string
  /** Pixels, round. Default 32. */
  size?: AvatarSize
  /** Accessible name (native `title`). Default `name`. */
  title?: string
  className?: string
}

const AVATAR_SIZE_TYPE: Record<AvatarSize, string> = { 16: 'type-label-12', 24: 'type-label-12', 32: 'type-label-13', 48: 'type-label-13', 64: 'type-label-13' }
const AVATAR_SIZE_DIM: Record<AvatarSize, string> = { 16: 'w-4 h-4', 24: 'w-6 h-6', 32: 'w-8 h-8', 48: 'w-12 h-12', 64: 'w-16 h-16' }

function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

/* Avatar / AvatarGroup
   Round surface, `size` 16/24/32/48/64 (default 32). Image first; missing OR
   failing to load (`onError`) falls back to initials on an OPAQUE
   `--frv-gray-200` surface (opaque in both themes) — never a broken image
   icon. Fixed 2026-09-12: the surface used to be `--frv-gray-alpha-200`
   (7-9% alpha), so the initials underneath showed through when avatars
   overlapped, reading as unintentional transparency. It's the 2px ring
   (`--frv-surface`) that should separate overlapping avatars, not
   translucency.

   AvatarGroup: `limit` visible with a slight overlap (negative margin, ~30%
   of size) and a thin ring (`--frv-surface`) separating them, with an
   ascending `z-index` (later avatar over earlier, "+N" on top) — needed
   because the hover fan below puts a `transform` on every element, which
   each opens its own stacking context. The rest collapse into a "+N"
   rendered as a REAL Avatar (`name={"+"+N}`), not a separate hand-rolled
   box, since the initials fallback already handles a single "+N" token as a
   one-word name.

   Hover fan (2026-09-12): on hover OR focus of the group, the avatars slide
   from overlapping to spaced out — plain CSS `transform`/`transition`
   (`motion-safe`), no extra dependency. */
const AVATAR_TONER = [
  'bg-(color:--frv-blue-100) text-(color:--frv-blue-900)',
  'bg-(color:--frv-purple-100) text-(color:--frv-purple-900)',
  'bg-(color:--frv-teal-100) text-(color:--frv-teal-900)',
  'bg-(color:--frv-pink-100) text-(color:--frv-pink-900)',
  'bg-(color:--frv-green-100) text-(color:--frv-green-900)',
] as const
function avatarToneForNavn(navn: string): string { let h = 0; for (const c of navn.trim().toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AVATAR_TONER[h % AVATAR_TONER.length]! }

export function Avatar({ src, name, size = 32, title, tone = 'noytral', className }: AvatarProps & { tone?: 'noytral' | 'farget' }) {
  const [failed, setFailed] = useState(false)
  const showImage = !!src && !failed
  return (
    <span
      role="img"
      aria-label={title ?? name}
      title={title ?? name}
      className={cx('inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none', tone === 'farget' ? avatarToneForNavn(name) : 'bg-(color:--frv-gray-200) text-(color:--frv-text-secondary)', AVATAR_SIZE_TYPE[size], AVATAR_SIZE_DIM[size], className)}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- plain avatar thumbnail, no next/image optimization needed for a tiny icon-sized image.
        <img src={src} alt="" onError={() => setFailed(true)} className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden="true">{avatarInitials(name)}</span>
      )}
    </span>
  )
}

export interface AvatarGroupProps {
  children: ReactElement<AvatarProps> | ReactElement<AvatarProps>[]
  /** Max visible avatars before the rest collapse into a "+N". Unset shows all. */
  limit?: number
  /** Size the "+N" avatar renders in. Should match the children's own `size`. Default 32. */
  size?: AvatarSize
  className?: string
}

const AVATAR_FAN_GAP = 4

export function AvatarGroup({ children, limit, size = 32, className }: AvatarGroupProps) {
  const [hovered, setHovered] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const all = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[]
  const visible = limit ? all.slice(0, limit) : all
  const rest = limit ? Math.max(all.length - limit, 0) : 0
  const overlapPx = Math.round(size * 0.3)
  const overlap = -overlapPx
  const fanned = hovered || focusWithin
  const fanClass = 'motion-safe:transition-transform motion-safe:duration-[var(--frv-duration-state)] motion-safe:ease-[var(--frv-ease-spring)] shadow-[0_0_0_2px_var(--frv-surface)] rounded-(--frv-radius-full) ml-(--avatar-ml) z-(--avatar-z) translate-x-(--avatar-tx)'
  return (
    <div
      className={cx('flex items-center', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false) }}
    >
      {visible.map((child, i) => (
        <span
          key={child.key ?? i}
          className={fanClass}
          style={{
            '--avatar-ml': `${i === 0 ? 0 : overlap}px`,
            '--avatar-z': i + 1,
            '--avatar-tx': fanned ? `${i * (overlapPx + AVATAR_FAN_GAP)}px` : '0px',
          } as CSSProperties}
        >{child}</span>
      ))}
      {rest > 0 && (
        <span
          className={fanClass}
          style={{
            '--avatar-ml': `${visible.length === 0 ? 0 : overlap}px`,
            '--avatar-z': visible.length + 1,
            '--avatar-tx': fanned ? `${visible.length * (overlapPx + AVATAR_FAN_GAP)}px` : '0px',
          } as CSSProperties}
        >
          <Avatar name={`+${rest}`} size={size} title={`${rest} more`} />
        </span>
      )}
    </div>
  )
}

export type StatusDotTone = 'success' | 'warning' | 'error' | 'gray' | 'accent'

const STATUSDOT_TONE_COLOR: Record<StatusDotTone, string> = {
  success: 'bg-(color:--frv-success-text)', warning: 'bg-(color:--frv-warning-text)', error: 'bg-(color:--frv-error-text)',
  gray: 'bg-(color:--frv-text-secondary)', accent: 'bg-(color:--frv-accent-text)',
}

export type StatusDotSize = 'sm' | 'md'

const STATUSDOT_SIZE_CLASS: Record<StatusDotSize, string> = { sm: 'w-2 h-2', md: 'w-3 h-3' }

export interface StatusDotProps {
  tone?: StatusDotTone
  /** Pulsing ring around the dot (static under `prefers-reduced-motion`). Use for "live" states, not a stable finished one. */
  pulse?: boolean
  /** Short text next to the dot. */
  label?: string
  /** Accessible name when there's no visible `label`. */
  ariaLabel?: string
  /** `sm` (8px, default — tight lists) or `md` (12px — a single, more prominent status line). */
  size?: StatusDotSize
  className?: string
}

/* StatusDot — `sm` (8px, default) or `md` (12px) dot. Without a visible
   `label` the dot itself carries `role="img"` + `aria-label`; with `label`
   the dot is decorative (`aria-hidden`) and the text carries the meaning.
   `pulse` uses the shared `pulse-ring` keyframe (a continuous, gentle
   scale/opacity breathe) rather than Tailwind's built-in `animate-ping`
   (one sharp pulse then reset) — reads as "something is alive" rather than
   a one-shot alert ping. */
export function StatusDot({ tone = 'gray', pulse, label, ariaLabel, size = 'sm', className }: StatusDotProps) {
  const colorClass = STATUSDOT_TONE_COLOR[tone]
  const sizeClass = STATUSDOT_SIZE_CLASS[size]
  return (
    <span className={cx('inline-flex items-center gap-[var(--frv-space-1-5)]', className)}>
      <span className={cx('relative inline-flex shrink-0', sizeClass)}>
        {pulse && <span aria-hidden="true" className={cx('absolute inset-0 rounded-full motion-safe:[animation:pulse-ring_1.6s_ease-in-out_infinite]', colorClass)} />}
        <span
          className={cx('relative inline-flex rounded-full', sizeClass, colorClass)}
          aria-hidden={label ? true : undefined}
          role={label ? undefined : ariaLabel ? 'img' : undefined}
          aria-label={label ? undefined : ariaLabel}
        />
      </span>
      {label && <span className="type-label-13 text-(color:--frv-text-secondary)">{label}</span>}
    </span>
  )
}

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** Short label centered on the line, e.g. "or". Horizontal mode only. */
  label?: string
  className?: string
}

/** Separator — 1px `--frv-border`. `role="separator"` always (a semantic
 *  divider, not pure decoration — use a plain `<div className="border-t">`
 *  for visual-only spacing). */
export function Separator({ orientation = 'horizontal', label, className }: SeparatorProps) {
  if (orientation === 'vertical') {
    return <span role="separator" aria-orientation="vertical" className={cx('inline-block self-stretch w-px shrink-0', className)} style={{ background: 'var(--frv-border)' }} />
  }
  if (label) {
    return (
      <div role="separator" aria-orientation="horizontal" className={cx('flex items-center gap-[var(--frv-space-3)]', className)}>
        <span className="flex-1 h-px" style={{ background: 'var(--frv-border)' }} />
        <span className="type-label-12 shrink-0" style={{ color: 'var(--frv-text-secondary)' }}>{label}</span>
        <span className="flex-1 h-px" style={{ background: 'var(--frv-border)' }} />
      </div>
    )
  }
  return <div role="separator" aria-orientation="horizontal" className={cx('h-px w-full', className)} style={{ background: 'var(--frv-border)' }} />
}

export interface KbdProps { children: ReactNode; className?: string }

/** Kbd — one keyboard key: bg gray-alpha-100, bordered, radius 4px (a
 *  deliberate deviation from the radius scale for this one tiny surface),
 *  mono type, min-width 20px. Chain several for a shortcut: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. */
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cx('type-label-12-mono inline-flex items-center justify-center px-1 min-w-[20px] h-5 rounded-[4px] border', className, 'bg-(color:--frv-gray-alpha-100) text-(color:--frv-text-secondary) border-(color:--frv-border)')}
    >
      {children}
    </kbd>
  )
}

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

const SPINNER_SIZE_CLASS: Record<SpinnerSize, string> = {
  xs: 'h-3.5 w-3.5', // inline in a label line
  sm: 'h-4 w-4',
  md: 'h-5 w-5', // unchanged default
  lg: 'h-8 w-8', // alone on a larger surface
}

/** Spinner — a waiting indicator is not an action, so the default color is
 *  `--frv-text-secondary`, not accent. `tone="accent"` keeps the accent-
 *  colored variant for the few places that want it (e.g. inside an accent
 *  button's own `loading`). One STROKED circle with a gap (`strokeDasharray`,
 *  round linecap) rather than the classic "faint background circle + a
 *  filled eighth-wedge" — same idea as a ring-with-a-hole spinner, geometry
 *  ported, no icon library imported. `label` is sr-only text for the rare
 *  case the spinner stands entirely alone (it's `aria-hidden` itself, since
 *  it almost always sits next to visible text that already says what's happening). */
export function Spinner({ className, tone = 'default', size = 'md', label }: { className?: string; tone?: 'default' | 'accent'; size?: SpinnerSize; label?: string }) {
  const svg = (
    <svg
      aria-hidden="true"
      className={cx('animate-spin', SPINNER_SIZE_CLASS[size], tone === 'accent' ? 'text-[var(--frv-accent)]' : 'text-[var(--frv-text-secondary)]', className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="47.1 15.7" />
    </svg>
  )
  if (!label) return svg
  return (
    <span className="inline-flex">
      {svg}
      <span className="sr-only">{label}</span>
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Typography (the system's own token set)

   One source for all text style. Instead of loose Tailwind classes
   (`text-lg font-medium tracking-tight`), text is set through these components,
   which apply the .type-* classes from frivio-tokens.css.

   <Heading level={2}>Title</Heading>            → correct heading step + <h2>
   <Text variant="copy-14">Body text</Text>      → copy-14, <p>
   <Text variant="label-13" as="span">Meta</Text>

   Three weights: 400 READS (label-*, copy-*, plain `<Text>`), 500 NAMES
   (label-*-strong — field labels, table column headers, DescriptionList/
   Field keys, Callout/Toast titles), 600 is TITLES (heading-*). Never fake
   500 with `font-medium` on a `label-*` class — `.type-*` classes are
   unlayered CSS while Tailwind's own utilities (including `font-medium`)
   live in `@layer utilities`; an unlayered rule always beats a layered one
   regardless of specificity, so `type-label-14 font-medium` silently renders
   at weight 400. Use the real `-strong` variant instead.

   Color is inherited (currentColor) unless `tone` is set.
   ───────────────────────────────────────────────────────────────────────────── */

export type TypeVariant =
  | 'heading-72' | 'heading-64' | 'heading-56' | 'heading-48' | 'heading-40'
  | 'heading-32' | 'heading-24' | 'heading-20' | 'heading-16' | 'heading-14'
  | 'button-16' | 'button-14' | 'button-12'
  | 'label-20' | 'label-18' | 'label-16' | 'label-14' | 'label-13' | 'label-12'
  | 'label-16-strong' | 'label-14-strong' | 'label-13-strong' | 'label-12-strong'
  | 'label-14-mono' | 'label-13-mono' | 'label-12-mono'
  | 'copy-24' | 'copy-20' | 'copy-18' | 'copy-16' | 'copy-14' | 'copy-13'
  | 'copy-14-mono' | 'copy-13-mono'

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'accent' | 'success' | 'warning' | 'error' | 'inherit'

const TEXT_TONE_VAR: Record<Exclude<TextTone, 'inherit'>, string> = {
  primary: 'var(--frv-text-primary)', secondary: 'var(--frv-text-secondary)', tertiary: 'var(--frv-text-tertiary)',
  quaternary: 'var(--frv-text-quaternary)', accent: 'var(--frv-accent-text)', success: 'var(--frv-success-text)',
  warning: 'var(--frv-warning-text)', error: 'var(--frv-error-text)',
}

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  variant?: TypeVariant
  as?: ElementType
  tone?: TextTone
  truncate?: boolean
  balance?: boolean
  children?: ReactNode
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = 'copy-14', as = 'p', tone = 'inherit', truncate, balance, className, style, children, ...rest },
  ref,
) {
  const toneStyle: CSSProperties = tone === 'inherit' ? {} : { color: TEXT_TONE_VAR[tone] }
  return createElement(
    as,
    { ref, className: cx(`type-${variant}`, truncate && 'truncate', balance && '[text-wrap:balance]', className), style: { ...toneStyle, ...style }, ...rest },
    children,
  )
})

const HEADING_LEVEL_VARIANT: Record<1 | 2 | 3 | 4 | 5 | 6, TypeVariant> = {
  1: 'heading-32', 2: 'heading-24', 3: 'heading-20', 4: 'heading-16', 5: 'heading-14', 6: 'heading-14',
}

interface HeadingProps extends Omit<TextProps, 'as' | 'variant'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: TypeVariant
}

/** Heading — picks the right heading token per level and renders a semantic
 *  <h1>–<h6>. Override the step with `variant` when the visual level
 *  differs from the document level. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, variant, tone = 'primary', children, ...rest }, ref,
) {
  return <Text ref={ref as never} as={`h${level}` as ElementType} variant={variant ?? HEADING_LEVEL_VARIANT[level]} tone={tone} {...rest}>{children}</Text>
})

/* ══════════════════════════════════════════════════════════════════════════
   2. FEEDBACK — Callout, InlineNote, FormError, EmptyState, StatCard,
      Skeleton, Tooltip, Toast
   ══════════════════════════════════════════════════════════════════════════ */

/** Wave 3 (2026-09-10): `default` (the light, transparent gray-alpha
 *  structural divider — "this belongs here, but isn't the step itself") and
 *  `secondary` (a solid, opaque neutral box with the SAME visual weight as
 *  success/warning/error) replace the old `divider`; `error` replaces
 *  `danger`. */
export type CalloutTone = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'accent'

const CALLOUT_TONE_RECIPE: Record<CalloutTone, { light: string; border: string; text: string }> = {
  default:   { light: 'var(--frv-gray-alpha-100)', border: 'var(--frv-gray-alpha-400)', text: 'var(--frv-text-secondary)' },
  secondary: { light: 'var(--frv-gray-100)', border: 'var(--frv-gray-400)', text: 'var(--frv-gray-900)' },
  accent:    { light: 'var(--frv-accent-light)', border: 'var(--frv-accent-border)', text: 'var(--frv-accent-text)' },
  success:   { light: 'var(--frv-success-light)', border: 'var(--frv-success-border)', text: 'var(--frv-success-text)' },
  warning:   { light: 'var(--frv-warning-light)', border: 'var(--frv-warning-border)', text: 'var(--frv-warning-text)' },
  error:     { light: 'var(--frv-error-light)', border: 'var(--frv-error-border)', text: 'var(--frv-error-text)' },
}

/** Exported for the rare places the content must be something other than a
 *  `<div>` (e.g. a link row) — same color recipe as `fill`, without forcing
 *  Callout's wrapper/slots. */
export const CALLOUT_TONE_STYLE: Record<CalloutTone, { className: string; style: CSSProperties }> = Object.fromEntries(
  (Object.keys(CALLOUT_TONE_RECIPE) as CalloutTone[]).map((tone) => {
    const recipe = CALLOUT_TONE_RECIPE[tone]
    const small = tone !== 'default' && tone !== 'secondary'
    return [tone, {
      className: small ? 'rounded-[var(--frv-radius-sm)] px-3 py-2.5' : 'rounded-[var(--frv-radius-md)] p-4',
      style: { background: recipe.light, border: `1px solid ${recipe.border}` },
    }]
  }),
) as Record<CalloutTone, { className: string; style: CSSProperties }>

/* Class-string twin of CALLOUT_TONE_RECIPE, used by Callout's own JSX below.
   A class built from a runtime string (`` `bg-[${recipe.light}]` ``) would be
   invisible to Tailwind's static scanner — only a literal class name in the
   source gets compiled. CALLOUT_TONE_STYLE above keeps the raw values: it's
   the public escape hatch for callers that can't use `<Callout>` itself
   (e.g. a `<Link>` row) and apply the recipe via a real `style` attribute. */
const CALLOUT_TONE_CLASS: Record<CalloutTone, { fillBg: string; border: string; text: string }> = {
  default:   { fillBg: 'bg-(color:--frv-gray-alpha-100)', border: 'border-(color:--frv-gray-alpha-400)', text: 'text-(color:--frv-text-secondary)' },
  secondary: { fillBg: 'bg-(color:--frv-gray-100)', border: 'border-(color:--frv-gray-400)', text: 'text-(color:--frv-gray-900)' },
  accent:    { fillBg: 'bg-(color:--frv-accent-light)', border: 'border-(color:--frv-accent-border)', text: 'text-(color:--frv-accent-text)' },
  success:   { fillBg: 'bg-(color:--frv-success-light)', border: 'border-(color:--frv-success-border)', text: 'text-(color:--frv-success-text)' },
  warning:   { fillBg: 'bg-(color:--frv-warning-light)', border: 'border-(color:--frv-warning-border)', text: 'text-(color:--frv-warning-text)' },
  error:     { fillBg: 'bg-(color:--frv-error-light)', border: 'border-(color:--frv-error-border)', text: 'text-(color:--frv-error-text)' },
}

/* Callout
   The shared visual separation for "this belongs here, but it isn't the
   step/row itself" (`default`/`secondary`) or a tip/info/success/warning/
   error notice (the colored tones). `fill` (default true) preserves the
   always-filled look; `fill={false}` is a lighter variant — bg
   `--frv-surface` + colored border + colored icon/label, body text stays
   `text-primary` — for a notice that differs by BORDER, not a colored fill.
   `size` follows the tone unless set explicitly. */
export function Callout({
  children, tone = 'default', fill = true, size, icon: Icon, label, action, className, style, role,
}: {
  children: ReactNode
  tone?: CalloutTone
  fill?: boolean
  size?: 'small' | 'medium'
  /** Leading icon on the left edge. `null` hides it explicitly. */
  icon?: IconComponent | null
  /** Short title line (1-2 words) in the tone's text color, above the content. */
  label?: ReactNode
  /** ONE CTA (typically a small `Button`), shown below the content. */
  action?: ReactNode
  className?: string
  style?: CSSProperties
  /** E.g. "alert" for an error/warning Callout that must be announced to screen readers. */
  role?: string
}) {
  const toneClass = CALLOUT_TONE_CLASS[tone]
  const resolvedSize: 'small' | 'medium' = size ?? (tone === 'default' || tone === 'secondary' ? 'medium' : 'small')
  const sizeClass = resolvedSize === 'small' ? 'rounded-[var(--frv-radius-sm)] px-3 py-2.5' : 'rounded-[var(--frv-radius-md)] p-4'
  const containerClass = cx(sizeClass, 'type-copy-14 border', toneClass.border, fill ? toneClass.fillBg : 'bg-(color:--frv-surface)')
  const hasExtras = !!Icon || !!label || !!action

  // type-copy-14 on the OUTERMOST div in both branches (the same element
  // `className` merges into) — without a set size, plain text inherited the
  // page's 16px. Deliberately NOT on an inner wrapper in the hasExtras
  // branch: some call sites pass their own `className="type-copy-13"` to
  // Callout itself, and `.type-copy-13` is declared AFTER `.type-copy-14` in
  // the token file, so — with both classes on the SAME element — the
  // caller's 13px still wins the cascade (same precedence `sizeClass`/
  // `className` already have). No 65ch cap inside a Callout: a tinted box
  // with empty space beside the text reads as a bug, not as air — keep the
  // copy short (one or two sentences) instead.
  if (!hasExtras) {
    return (
      <div role={role} className={cx(containerClass, className)} style={style}>
        {children}
      </div>
    )
  }

  return (
    <div role={role} className={cx(containerClass, className)} style={style}>
      <div className="flex items-start gap-2.5">
        {Icon && <Icon size={16} className={cx('shrink-0 mt-0.5', toneClass.text)} />}
        <div className="min-w-0 flex-1">
          {label && <p className={cx('type-label-14-strong mb-1', toneClass.text)}>{label}</p>}
          {children}
          {action && <div className="mt-2.5">{action}</div>}
        </div>
      </div>
    </div>
  )
}

/** Wave 3 (2026-09-10): tone set grew from `accent`/`success`/`danger` to
 *  `default`/`success`/`warning`/`error`/`accent`. `default` is a neutral
 *  comment line with no colored message. The icon is deliberately kept
 *  NEUTRAL (`text-secondary`) regardless of tone — only the rule carries the
 *  color signal, so a comment next to a number never outshines the number
 *  itself. */
export function InlineNote({
  icon: Icon, tone = 'default', className, children,
}: {
  icon: IconComponent
  tone?: 'default' | 'success' | 'warning' | 'error' | 'accent'
  className?: string
  children: ReactNode
}) {
  const strokeClass: Record<NonNullable<typeof tone>, string> = {
    default: 'border-l-(color:--frv-gray-700)', success: 'border-l-(color:--frv-success)', warning: 'border-l-(color:--frv-warning)', error: 'border-l-(color:--frv-error)', accent: 'border-l-(color:--frv-accent)',
  }
  return (
    <div className={cx('flex items-start gap-3 py-1 pl-3 border-l-2', strokeClass[tone], className)}>
      <Icon size={16} className="shrink-0 mt-0.5 text-(color:--frv-text-secondary)" />
      {/* type-copy-14: without a set size, plain text inherited the page's
          16px. max-w-[65ch] caps the readable width of the running text. A
          caller that sets its own type-* class on its child still wins (an
          own class on the element beats inheritance regardless of specificity). */}
      <div className="min-w-0 max-w-[65ch] type-copy-14">{children}</div>
    </div>
  )
}

/** FormError — shared error message. `role="alert"` is the whole point: it
 *  announces the error to screen readers the moment it appears. `variant`
 *  (wave 3): `boxed` wraps the text in `CALLOUT_TONE_STYLE.error`'s soft red
 *  box, for an error that should take more than one line (login,
 *  registration); `inline` (default) is unchanged plain text. */
export function FormError({
  children, className, style, id, as = 'p', size = 'copy-13', variant = 'inline',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  id?: string
  as?: 'p' | 'span'
  size?: 'copy-13' | 'label-12' | 'label-13' | 'label-14'
  variant?: 'inline' | 'boxed'
}) {
  const Tag = as
  // Same recipe as CALLOUT_TONE_STYLE.error, written as literal classes
  // instead of spreading the imported style object — see the comment at
  // CALLOUT_TONE_CLASS above for why.
  const boxedClass = variant === 'boxed' ? 'rounded-[var(--frv-radius-sm)] px-3 py-2.5 border border-(color:--frv-error-border) bg-(color:--frv-error-light)' : null
  return (
    <Tag role="alert" id={id} className={cx(`type-${size}`, 'text-[var(--frv-error-text)]', boxedClass, className)} style={style}>
      {children}
    </Tag>
  )
}

export type EmptyStateSkygge = 'rader' | 'kort' | 'tabell'

/** `skygge` (2026-09-12): a faint "ghost" of rows/cards/a table BEHIND the
 *  message — hints at what will fill the surface. Use ONLY when the empty
 *  state IS a list/table/card row about to fill up (NOT a generic "nothing
 *  here", e.g. an empty search result). `aria-hidden`: pure ghosts, no
 *  meaning for a screen reader. Omitted (default): visually unchanged. */
function EmptyStateGhostShapes({ skygge }: { skygge: EmptyStateSkygge }) {
  if (skygge === 'rader') {
    return (
      <div className="flex flex-col gap-2 w-full">
        {[92, 76, 60].map((width, i) => (
          <div
            key={i}
            className={cx('h-3.5 rounded-[var(--frv-radius-sm)] w-(--ghost-w)', i % 2 === 0 ? 'bg-(color:--frv-gray-alpha-100)' : 'bg-(color:--frv-gray-alpha-200)')}
            style={{ '--ghost-w': `${width}%` } as CSSProperties}
          />
        ))}
      </div>
    )
  }
  if (skygge === 'kort') {
    return (
      <div className="grid grid-cols-3 gap-2 w-full">
        {[0, 1, 2].map(i => <div key={i} className={cx('h-16 rounded-[var(--frv-radius-sm)]', i === 1 ? 'bg-(color:--frv-gray-alpha-200)' : 'bg-(color:--frv-gray-alpha-100)')} />)}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex gap-1.5">{[0, 1, 2].map(i => <div key={i} className="h-3 flex-1 rounded-[var(--frv-radius-sm)] bg-(color:--frv-gray-alpha-200)" />)}</div>
      {[0, 1, 2].map(row => (
        <div key={row} className="flex gap-1.5">{[0, 1, 2].map(i => <div key={i} className="h-3 flex-1 rounded-[var(--frv-radius-sm)] bg-(color:--frv-gray-alpha-100)" />)}</div>
      ))}
    </div>
  )
}

/** EmptyState — dashed card, a 40px neutral icon CIRCLE (wave 3: no longer
 *  accent-tinted — empty states shouldn't glow blue, that's reserved for
 *  actions), a title (`heading-16`, down from `heading-20`) and optional
 *  actions. */
export function EmptyState({
  icon: Icon, title, children, action, skygge, className,
}: {
  icon: IconComponent
  title: string
  children?: ReactNode
  /** Actions (links/buttons) below the text. */
  action?: ReactNode
  /** Ghost rows/cards/table behind the message — see `EmptyStateSkygge` above. */
  skygge?: EmptyStateSkygge
  className?: string
}) {
  return (
    <div className={cx('relative overflow-hidden flex flex-col items-center justify-center py-16 px-6 text-center rounded-[var(--frv-radius-md)] bg-(color:--frv-surface) border border-dashed border-(color:--frv-border)', className)}>
      {skygge && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 inset-y-6 flex items-center [mask-image:radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_35%,black_80%)] [-webkit-mask-image:radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_35%,black_80%)]"
        >
          <EmptyStateGhostShapes skygge={skygge} />
        </div>
      )}
      <div className="relative flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-(color:--frv-gray-alpha-100)">
          <Icon size={18} className="text-(color:--frv-text-secondary)" />
        </div>
        <p className="type-heading-16 mb-1">{title}</p>
        {children && <p className="type-copy-14 max-w-sm text-(color:--frv-text-secondary)">{children}</p>}
        {action && <div className="flex items-center gap-4 mt-5">{action}</div>}
      </div>
    </div>
  )
}

export interface StatCardEndring {
  /** Pre-formatted value, e.g. `'+1%'` or `'−$1,200'` — StatCard never makes up numbers itself. */
  verdi: string
  retning: 'opp' | 'ned' | 'flat'
  /** Is the change good for the user? `true` → success, `false` → error, omitted → neutral. Direction alone doesn't say (a lower expense is a "down" arrow that's still good). */
  god?: boolean
}

const STATCARD_ENDRING_SYMBOL: Record<StatCardEndring['retning'], string> = { opp: '↑', ned: '↓', flat: '→' }

/** Sparkline — inline SVG, no dependency. Shows DIRECTION, not precise
 *  values: no axis, no grid, no tooltip, no scrubbing. `viewBox` is fixed
 *  100×28 and stretched with `preserveAspectRatio="none"` — SSR-friendly, no
 *  ResizeObserver/client JS needed. The last-point marker is a real HTML
 *  element (not an SVG `<circle>`) — a circle in viewBox space would be
 *  stretched into an ellipse by the same non-uniform x/y scaling that makes
 *  the line fill the width. */
function StatCardSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const w = 100, h = 28, pad = 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - pad - ((v - min) / span) * (h - pad * 2) }))
  const line = points.map(p => `${p.x},${p.y}`).join(' ')
  const fill = `${points[0].x},${h} ${line} ${points[points.length - 1].x},${h}`
  const lastYPct = (points[points.length - 1].y / h) * 100
  return (
    <div className="relative mt-2 h-7" aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="block">
        <polygon points={fill} fill={color} opacity={0.12} />
        <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        className="absolute rounded-full right-0 w-[5px] h-[5px] -mt-[2.5px] top-(--sparkline-top) bg-(color:--sparkline-color)"
        style={{ '--sparkline-top': `${lastYPct}%`, '--sparkline-color': color } as CSSProperties}
      />
    </div>
  )
}

/** StatCard — shared KPI card. Wave 3: same material as Card (bg surface,
 *  box-shadow border, radius-md, no drop shadow at rest). `tone="hero"` uses
 *  `--frv-gradient-hero` for the one highlighted metric on a surface;
 *  `tone="error"` is a flat error tint (`danger` kept as an alias, mapped to
 *  the same recipe, for additive compatibility). Label/icon color defaults
 *  to `text-secondary` regardless of tone; `labelColor` overrides both
 *  together (e.g. success/error on income/expense).
 *
 *  `sparkline`/`endring` (2026-09-12): two independent, optional props — a
 *  call site can send just one. Both are colored by `endring.god`
 *  (success/error) when set, otherwise a neutral default — the sparkline
 *  shows DIRECTION, not a data-analysis tool (see `StatCardSparkline`).
 *  Deliberately STATIC (no measuring, no client-only requirement) since
 *  StatCard is used from Server Components with no client boundary. */
export function StatCard({
  icon: Icon, label, labelColor, value, valueStyle, sub, subStyle, sparkline, endring, tone = 'default', className, children,
}: {
  icon?: IconComponent
  label: string
  labelColor?: string
  value: ReactNode
  valueStyle?: CSSProperties
  sub?: ReactNode
  subStyle?: CSSProperties
  /** A monthly series or similar — drawn as a 28px inline sparkline under `sub`. Fewer than 2 points: no sparkline. */
  sparkline?: number[]
  /** Small badge with an arrow and a pre-formatted value (StatCard doesn't compute it). */
  endring?: StatCardEndring
  /** `danger` is an alias for `error` (same recipe), kept for existing call sites. */
  tone?: 'default' | 'hero' | 'error' | 'danger'
  className?: string
  /** Extra content below `sub` (progress bar, note, etc.). */
  children?: ReactNode
}) {
  const isError = tone === 'error' || tone === 'danger'
  const cardClass =
    tone === 'hero' ? 'bg-[image:var(--frv-gradient-hero)] shadow-(--frv-shadow-border)'
    : isError ? 'bg-(color:--frv-error-light) shadow-[0_0_0_1px_var(--frv-error-border)]'
    : 'bg-(color:--frv-surface) shadow-(--frv-shadow-border)'
  const resolvedLabelColor = labelColor ?? 'var(--frv-text-secondary)'
  const trendColor = endring?.god === true ? 'var(--frv-success-text)' : endring?.god === false ? 'var(--frv-error-text)' : 'var(--frv-text-tertiary)'
  const trendClass =
    endring?.god === true ? 'text-(color:--frv-success-text) bg-(color:--frv-success-light)'
    : endring?.god === false ? 'text-(color:--frv-error-text) bg-(color:--frv-error-light)'
    : 'text-(color:--frv-text-tertiary) bg-(color:--frv-gray-alpha-100)'

  /* Value size step-down: a long formatted value (e.g. a range like
     "651 000–893 000 kr") could wrap across two lines in a narrow card.
     `whitespace-nowrap` prevents the wrap outright; the font size steps down
     in two stages so a longer value still fits on ONE line instead of just
     being clipped. Only for STRING/NUMBER values — a `ReactNode` value
     (e.g. a `Badge`) has no text length to measure and keeps 24. */
  const valueText = typeof value === 'string' || typeof value === 'number' ? String(value) : null
  const valueSizeClass =
    // Terskler målt på mobil, der kortet ALLTID står i 2 kolonner (~120 px innenfor
    // padding): «kr 1 240 500» (12 tegn) klippet på 20 px, «651 000–893 000 kr»
    // (18 tegn) på 16 px (mobilsveip docs 19. sep 2026). Intervaller får bryte
    // ved tankestreken (se whitespace under).
    valueText == null ? 'type-heading-24'
    : valueText.length > 18 ? 'type-heading-14'
    : valueText.length > 13 ? 'type-heading-16'
    : valueText.length > 9 ? 'type-heading-20'
    : 'type-heading-24'

  return (
    <div className={cx('relative rounded-[var(--frv-radius-md)] p-5 @container', cardClass, className)}>
      <div
        className="flex items-center gap-2 mb-3 text-(color:--statcard-label-color)"
        style={{ '--statcard-label-color': resolvedLabelColor } as CSSProperties}
      >
        {Icon && <Icon size={14} />}
        <span className="type-label-13">{label}</span>
      </div>
      <p data-stat-verdi={valueSizeClass.replace('type-heading-', '')} className={cx(valueSizeClass, 'tabular-nums', typeof value === 'string' && (!/\d/.test(value) || value.includes('–')) ? 'whitespace-normal text-balance' : 'whitespace-nowrap')} style={valueStyle}>{value}</p>
      {sub && <p className="type-label-12 mt-2 text-(color:--frv-text-tertiary)" style={subStyle}>{sub}</p>}
      {endring && (
        <span
          className={cx('inline-flex items-center gap-1 type-label-12 mt-2 px-1.5 py-0.5 rounded-[var(--frv-radius-full)] tabular-nums', trendClass)}
        >
          <span aria-hidden="true">{STATCARD_ENDRING_SYMBOL[endring.retning]}</span>
          {endring.verdi}
        </span>
      )}
      {sparkline && <StatCardSparkline data={sparkline} color={trendColor} />}
      {children}
    </div>
  )
}

const STATCARD_ROW_COLS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
}

/** StatCardRad — the mobile ROW for several `StatCard`s, IN the primitive
 *  rather than hand-rolled per page (a page-level grid drifts: one page ends
 *  up `grid-cols-1 md:grid-cols-3`, another `flex flex-col sm:flex-row`,
 *  each with a different mobile outcome). Mobile is ALWAYS 2 columns —
 *  KPIs never stack into a single column on a phone; `kolonner` only
 *  controls the column count from `sm` up. */
export function StatCardRad({ children, kolonner = 3, className }: {
  children: ReactNode
  /** Columns from `sm`. Mobile is always 2. @default 3 */
  kolonner?: 2 | 3 | 4
  className?: string
}) {
  return <div className={cx('grid gap-4', STATCARD_ROW_COLS[kolonner], className)}>{children}</div>
}

export interface SkeletonProps {
  width?: number | string
  height?: number | string
  /** `true` gives full (pill/circle) radius — for avatar/icon placeholders. Default radius-sm. */
  rounded?: boolean
  className?: string
}

/** Skeleton — "content is loading here". `motion-safe:` disables the pulse
 *  under `prefers-reduced-motion` automatically. `aria-hidden`: a skeleton
 *  has nothing for a screen reader to read. `<Skeleton.Text lines={3} />`
 *  for paragraph text, last line shorter (69%) like real prose. */
function SkeletonBase({ width, height = 16, rounded, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('block motion-safe:animate-pulse w-(--skeleton-w) h-(--skeleton-h) bg-(color:--frv-gray-alpha-200)', rounded ? 'rounded-full' : 'rounded-[var(--frv-radius-sm)]', className)}
      style={{
        '--skeleton-w': typeof width === 'number' ? `${width}px` : width,
        '--skeleton-h': typeof height === 'number' ? `${height}px` : height,
      } as CSSProperties}
    />
  )
}

export interface SkeletonTextProps {
  /** Number of lines. Default 3. */
  lines?: number
  className?: string
}

function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cx('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <SkeletonBase key={i} height={14} width={lines > 1 && i === lines - 1 ? '70%' : '100%'} />)}
    </div>
  )
}

export const Skeleton = Object.assign(SkeletonBase, { Text: SkeletonText })

/* ══════════════════════════════════════════════════════════════════════════
   1.5 FLOATING LAYER (NEW, 2026-09-12/13) — portal-based positioning shared
       by Tooltip, OverflowMenu, Dropdown and MultiSelect below. Ported from
       `components/ui/FloatingLayer.tsx` + `lib/floatingPosition.ts`.

   WHAT WAS MISSING: no component in the source `components/ui` used
   `createPortal` — Popover/OverflowMenu/Dropdown/MultiSelect's list/Tooltip
   were all `position: absolute` INSIDE their own parent, so any ancestor
   with `overflow` (a docs example box, a scrollable table, a card with
   `overflow-hidden`) clipped them.

   REJECTED ALTERNATIVE: `@floating-ui/react` (the actual standard for this) —
   the source's own brief is explicit about staying dependency-free, and the
   real need is small: NONE of the four call sites ever need sideways
   (left/right) FLIP — a menu panel or dropdown list always hangs either
   below or above its trigger. `lib/floatingPosition.ts` is a PURE function
   (no DOM), so it's easy to port verbatim; this file's `useFloatingPosition`/
   `FloatingLayer` own the DOM part (measuring, portal, scroll/resize).

   TWO EXPORTS: `<FloatingLayer>` for a call site happy to let the primitive
   own the whole panel node; `useFloatingPosition(anchorRef, opts)` for a call
   site that must build its own markup (OverflowMenu below spreads the same
   style object it would otherwise have gotten from `FloatingLayer`). Both
   portal to `document.body` — any "click outside closes" check must
   therefore test BOTH the anchor ref and the panel ref.

   `useMontert()`: hydration-safe "are we on the client?" via
   `useSyncExternalStore` with a `false` server snapshot — `typeof document
   !== 'undefined'` alone is true during the client's FIRST (hydrating)
   render too, so gating a portal on it mismatches the server render. */
const noopSubscribe = () => () => {}
export function useMontert(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

/** Which side of the anchor the panel hangs from. `left`/`right` never flip
 *  (only `top`/`bottom` do, see `computeFloatingPosition`) — only clamp on
 *  the cross axis. */
export type FloatingSide = 'bottom' | 'top' | 'left' | 'right'
/** Cross-axis anchoring — horizontal (against the anchor's width) when
 *  `side` is `top`/`bottom`, vertical (against the anchor's height) when
 *  `side` is `left`/`right`. `start` is always "same edge reading order
 *  starts from" (left for horizontal, top for vertical), `end` the opposite
 *  edge, `center` centered. */
export type FloatingAlign = 'start' | 'end' | 'center'

/** Minimal rectangle contract — compatible with `DOMRect` but without a real
 *  `DOMRect` dependency (doesn't exist in a `node`-environment test). */
export interface FloatingRect { top: number; left: number; right: number; bottom: number; width: number; height: number }

export interface FloatingPositionOptions {
  /** Preferred side. Auto-flips to the opposite side only when there truly
   *  isn't room AND the opposite side has more space. Default 'bottom'. */
  side?: FloatingSide
  /** Default 'start' (left edge to left edge, normal LTR reading order). */
  align?: FloatingAlign
  /** Gap between anchor and panel, px. Default 4. */
  offset?: number
  /** Minimum distance to the viewport edge when clamping the cross axis, px. Default 8. */
  viewportPadding?: number
  /** Panel's minimum width is set equal to the anchor's width (a field-style dropdown). MIN width, not fixed. */
  matchWidth?: boolean
}

export interface FloatingPositionResult {
  /** `top` in viewport coordinates — usable directly as `style.top` on a `position: fixed` element. */
  top: number
  left: number
  /** Actual side AFTER any flip — may differ from `opts.side`. */
  side: FloatingSide
  /** Actual cross-axis anchoring AFTER any flip. */
  align: FloatingAlign
  /** Only set when `matchWidth` is true. */
  minWidth?: number
}

const FLOATING_DEFAULT_OFFSET = 4
const FLOATING_DEFAULT_VIEWPORT_PADDING = 8

/** Pure calculation: given the anchor's rect, the panel's (measured) size and
 *  the viewport's size, return `top`/`left` for a `position: fixed` panel.
 *  TWO BRANCHES — the primary axis decides: `side: 'top'|'bottom'` places
 *  along the VERTICAL axis (primary) with a horizontal cross axis (`align`);
 *  `side: 'left'|'right'` is mirrored. `left`/`right` never flip, only clamp.
 *  FLIP (top/bottom and `align` on the cross axis) only happens when the
 *  preferred side truly lacks room AND the opposite side has MORE room —
 *  otherwise the preferred side is kept even if it must share space with
 *  scrollable content (steadier than flip-flopping around an equilibrium).
 *  The cross axis is ALWAYS clamped to the viewport as a final safety net,
 *  even after a flip. */
export function computeFloatingPosition(
  anchor: FloatingRect,
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  opts: FloatingPositionOptions = {},
): FloatingPositionResult {
  const { side = 'bottom', align = 'start', offset = FLOATING_DEFAULT_OFFSET, viewportPadding = FLOATING_DEFAULT_VIEWPORT_PADDING, matchWidth } = opts

  if (side === 'left' || side === 'right') {
    const left = side === 'left' ? anchor.left - offset - panel.width : anchor.right + offset
    let top: number
    if (align === 'end') top = anchor.bottom - panel.height
    else if (align === 'center') top = anchor.top + anchor.height / 2 - panel.height / 2
    else top = anchor.top
    const minTop = viewportPadding
    const maxTop = Math.max(minTop, viewport.height - panel.height - viewportPadding)
    top = Math.min(Math.max(top, minTop), maxTop)
    return { top, left, side, align }
  }

  const spaceBelow = viewport.height - anchor.bottom
  const spaceAbove = anchor.top
  let resolvedSide: FloatingSide = side
  if (side === 'bottom' && panel.height + offset > spaceBelow && spaceAbove > spaceBelow) resolvedSide = 'top'
  else if (side === 'top' && panel.height + offset > spaceAbove && spaceBelow > spaceAbove) resolvedSide = 'bottom'

  const top = resolvedSide === 'bottom' ? anchor.bottom + offset : anchor.top - offset - panel.height
  const panelWidth = matchWidth ? anchor.width : panel.width

  const spaceForStart = viewport.width - anchor.left - viewportPadding
  const spaceForEnd = anchor.right - viewportPadding
  let resolvedAlign: FloatingAlign = align
  if (align === 'end' && panelWidth > spaceForEnd && spaceForStart > spaceForEnd) resolvedAlign = 'start'
  else if (align === 'start' && panelWidth > spaceForStart && spaceForEnd > spaceForStart) resolvedAlign = 'end'

  let left: number
  if (resolvedAlign === 'end') left = anchor.right - panelWidth
  else if (resolvedAlign === 'center') left = anchor.left + anchor.width / 2 - panelWidth / 2
  else left = anchor.left
  const minLeft = viewportPadding
  const maxLeft = Math.max(minLeft, viewport.width - panelWidth - viewportPadding)
  left = Math.min(Math.max(left, minLeft), maxLeft)

  return { top, left, side: resolvedSide, align: resolvedAlign, minWidth: matchWidth ? anchor.width : undefined }
}

/** True when the anchor is COMPLETELY outside the viewport — scrolled away
 *  while the panel was open. Lets the DOM layer below CLOSE the panel
 *  instead of clamping it into view, detached from its anchor. */
export function isAnchorOutsideViewport(anchor: FloatingRect, viewport: { width: number; height: number }): boolean {
  return anchor.bottom <= 0 || anchor.top >= viewport.height || anchor.right <= 0 || anchor.left >= viewport.width
}

const FLOATING_Z = 'z-50'

export interface UseFloatingPositionOptions extends FloatingPositionOptions {
  /** Measuring/listening is ON only while this is true — a closed panel doesn't measure. */
  open: boolean
  /** Ref to the panel DOM node itself (after portaling). */
  panelRef: RefObject<HTMLElement | null>
  /** Called when the anchor scrolls COMPLETELY out of the viewport while the
   *  panel is open — call sites typically do `() => setOpen(false)`. */
  onAnchorOutOfView?: () => void
}

/** Pure DOM measurement around `computeFloatingPosition`. Returns `null`
 *  until the first measurement is done — the call site should keep the panel
 *  invisible (`visibility: hidden`) until the result is no longer `null`, to
 *  avoid one visible frame at the wrong position. Re-measures on `scroll`
 *  (capture phase — catches scroll in ANY ancestor, not just the window),
 *  `resize` (rAF-throttled) AND a `ResizeObserver` on the PANEL itself
 *  (catches the panel's own content changing size after the first measurement). */
export function useFloatingPosition(anchorRef: RefObject<HTMLElement | null>, opts: UseFloatingPositionOptions): FloatingPositionResult | null {
  const { open, panelRef, side, align, offset, viewportPadding, matchWidth, onAnchorOutOfView } = opts
  const [pos, setPos] = useState<FloatingPositionResult | null>(null)

  const onAnchorOutOfViewRef = useRef(onAnchorOutOfView)
  useEffect(() => { onAnchorOutOfViewRef.current = onAnchorOutOfView })

  useLayoutEffect(() => {
    if (!open || typeof window === 'undefined') return

    // The anchor must have been visible once after opening before "outside
    // the viewport" may close the panel — a panel opened below the fold
    // (docs demos with defaultOpen, keyboard-opened menus on a scrolled-out
    // trigger) must not close itself on the first measurement (2026-09-14).
    let hasBeenVisible = false
    function measure() {
      const anchorEl = anchorRef.current
      if (!anchorEl) return
      const anchorRect = anchorEl.getBoundingClientRect()
      const viewport = { width: window.innerWidth, height: window.innerHeight }
      const outside = isAnchorOutsideViewport(anchorRect, viewport)
      if (outside && hasBeenVisible) {
        setPos(null)
        onAnchorOutOfViewRef.current?.()
        return
      }
      if (!outside) hasBeenVisible = true
      const panelRect = panelRef.current?.getBoundingClientRect()
      setPos(computeFloatingPosition(anchorRect, { width: panelRect?.width ?? 0, height: panelRect?.height ?? 0 }, viewport, { side, align, offset, viewportPadding, matchWidth }))
    }

    measure()

    let raf = 0
    function onResize() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; measure() }) }
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', onResize)

    let panelRaf = 0
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
      if (panelRaf) return
      panelRaf = requestAnimationFrame(() => { panelRaf = 0; measure() })
    }) : null
    if (observer && panelRef.current) observer.observe(panelRef.current)

    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
      if (panelRaf) cancelAnimationFrame(panelRaf)
      observer?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable identities; onAnchorOutOfView is read via ref above.
  }, [open, side, align, offset, viewportPadding, matchWidth])

  return pos
}

export interface FloatingLayerProps extends FloatingPositionOptions {
  open: boolean
  /** Ref to the trigger/field element the panel should anchor to. */
  anchorRef: RefObject<HTMLElement | null>
  children: ReactNode
  /** The call site's OWN material — background/border/shadow/radius/animation.
   *  `FloatingLayer` only applies position + z-index. */
  className?: string
  style?: CSSProperties
  /** Callback ref to the panel DOM node itself — for click-outside checks (`.contains()`). */
  panelRef?: (el: HTMLDivElement | null) => void
  id?: string
  role?: string
  'aria-label'?: string
  onAnchorOutOfView?: () => void
}

/** Renders `children` in a portal on `document.body`, `position: fixed`
 *  based on the anchor's `getBoundingClientRect()`. For call sites that do
 *  NOT need to style the panel element beyond a `className` — see the
 *  section comment above for when `useFloatingPosition` (the hook) is the
 *  right choice instead. */
export function FloatingLayer({ open, anchorRef, children, side, align, offset, viewportPadding, matchWidth, className, style, panelRef: panelRefProp, id, role, 'aria-label': ariaLabel, onAnchorOutOfView }: FloatingLayerProps) {
  const montert = useMontert()
  const innerPanelRef = useRef<HTMLDivElement | null>(null)
  const pos = useFloatingPosition(anchorRef, { open, panelRef: innerPanelRef, side, align, offset, viewportPadding, matchWidth, onAnchorOutOfView })

  if (!open || !montert) return null

  return createPortal(
    <div
      ref={el => { innerPanelRef.current = el; panelRefProp?.(el) }}
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={cx(
        'fixed top-(--floating-top) left-(--floating-left)',
        FLOATING_Z,
        pos?.minWidth !== undefined && 'min-w-(--floating-min-w)',
        pos ? 'visible' : 'invisible',
        className,
      )}
      style={{
        ...style,
        '--floating-top': `${pos?.top ?? 0}px`,
        '--floating-left': `${pos?.left ?? 0}px`,
        '--floating-min-w': pos?.minWidth !== undefined ? `${pos.minWidth}px` : undefined,
      } as CSSProperties}
    >
      {children}
    </div>,
    document.body,
  )
}

export type UtenforArsak = 'utenfor' | 'escape'

interface UseKlikkUtenforOptions {
  /** Also listen for Escape and report 'escape'. Default true. */
  escape?: boolean
}

/* useKlikkUtenfor — ONE source of truth for "close on click outside +
   Escape", pulled out of `OverflowMenu` and `MultiSelect` below, which each
   had their own, nearly identical `mousedown`+`keydown` listener pair.
   Ported from `lib/useKlikkUtenfor.ts` (founder: "Popups, popovers etc. must
   close when you click outside them" — the app's own `Popover`, which this
   kit does NOT port, was migrated to the same hook; see this file's own
   top-comment for why `Popover` itself stays out).

   `pointerdown`, NOT `click`: fires BEFORE focus moves, and behaves the same
   with touch — a `click` after a tap arrives too late to prevent the new
   element from already having received focus/scrolled there.

   MULTIPLE REFS, NOT A DOM TREE: a portaled panel (a menu/list rendered via
   `createPortal`) sits OUTSIDE the anchor's DOM tree, in `document.body` —
   "outside" is therefore checked with `.contains()` against EACH ref
   separately (anchor AND panel), not by assuming they share a parent in the DOM.

   NEVER STEALS FOCUS: the hook only calls `onUtenfor(arsak)` — it never
   moves focus itself. Focus return on Escape (typically back to the
   trigger) is the call site's responsibility.

   `escape: false`: for call sites that already handle Escape elsewhere with
   its own meaning — `MultiSelect` below captures Escape on cmdk's
   `<Command>` root and stops its propagation (so the same keypress doesn't
   also close a surrounding `Modal`); it uses this hook ONLY for the
   pointerdown-outside part.

   The refs array and callback get a new identity on every render (a new
   array literal, a new inline function at the call site) — read via a ref
   (the same "update a ref in its own effect with no dependency list"
   pattern as `onAnchorOutOfViewRef` above) instead of in the dependency list
   itself, so the listeners don't get detached and reattached on every render. */
export function useKlikkUtenfor(
  refs: RefObject<HTMLElement | null>[],
  onUtenfor: (arsak: UtenforArsak) => void,
  aktiv: boolean,
  { escape = true }: UseKlikkUtenforOptions = {},
) {
  const refsRef = useRef(refs)
  useEffect(() => { refsRef.current = refs })
  const onUtenforRef = useRef(onUtenfor)
  useEffect(() => { onUtenforRef.current = onUtenfor })

  useEffect(() => {
    if (!aktiv) return
    function onPointerDown(e: PointerEvent) {
      if (!erUtenforAlle(refsRef.current, e.target as Node)) return
      onUtenforRef.current('utenfor')
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onUtenforRef.current('escape')
    }
    document.addEventListener('pointerdown', onPointerDown)
    if (escape) document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      if (escape) document.removeEventListener('keydown', onKeyDown)
    }
  }, [aktiv, escape])
}

/** Pure decision function, pulled out for DOM-free testability. True only
 *  when NONE of the refs contain `target` — i.e. the click was outside ALL of them. */
export function erUtenforAlle(refs: RefObject<HTMLElement | null>[], target: Node): boolean {
  return !refs.some(r => r.current?.contains(target))
}

export interface TooltipProps {
  /** Text shown. Short — one sentence, not a paragraph. */
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Milliseconds before showing on hover. Default 200. Hides immediately. */
  delay?: number
  /** Max width — a number (px) or CSS string (e.g. `'40ch'`). Default `'36ch'`:
   *  a `position: fixed` panel with no own `width` shrink-wraps to its
   *  nearest POSITIONED ancestor when absolutely positioned — often the
   *  anchor's own (frequently narrow) width, not the viewport's. `width:
   *  max-content` + a `ch`-based `maxWidth` fixes it without a hardcoded
   *  pixel width (same problem in miniature). */
  maxWidth?: number | string
  /** A single focusable/hoverable element — Tooltip rebuilds it with its own
   *  hover/focus handlers and `aria-describedby`, without changing its type. */
  children: ReactElement
  className?: string
}

const TOOLTIP_ARROW_STYLE: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-[-3px] left-1/2 ml-[-3px]', bottom: 'top-[-3px] left-1/2 ml-[-3px]',
  left: 'right-[-3px] top-1/2 mt-[-3px]', right: 'left-[-3px] top-1/2 mt-[-3px]',
}

/** True only on coarse pointers (touch) — there's no hover there, and
 *  press-and-hold isn't a discoverable interaction. */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return coarse
}

/* Tooltip
   Material: bg `--frv-text-primary`, text `--frv-bg` (the same inverted pair
   Toast's 'message' tone uses), label-13, radius-sm, `--frv-shadow-tooltip`,
   small arrow toward the trigger. Shows on hover OR focus, hides on Escape
   or immediately on mouseleave/blur.

   NO tooltip on touch (`pointer: coarse`) — renders `children` unchanged,
   no wrapper. That means `content` must exist somewhere else for touch
   users (visible text, an `aria-label`, a `Callout` nearby) — Tooltip
   supplements mouse/keyboard, it isn't the only source of the information.

   PORTAL, ALL FOUR SIDES (2026-09-12 for top/bottom, extended 2026-09-13 to
   left/right): uses `useFloatingPosition` and renders via `createPortal` on
   `document.body`, exactly like the ported `FloatingLayer` primitive above —
   a tooltip inside an `overflow` container used to get clipped exactly like
   the menus did. Left/right never flip (only vertical clamping of the cross axis). */
export function Tooltip({ content, maxWidth = '36ch', side = 'top', delay = 200, children, className }: TooltipProps) {
  const montert = useMontert()
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()
  const coarse = useCoarsePointer()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLSpanElement | null>(null)

  // Called UNCONDITIONALLY (Rules of Hooks) — before the `if (coarse …)
  // return` below. `align: 'center'` is right for all four sides: horizontal
  // centering for top/bottom, vertical centering for left/right.
  const pos = useFloatingPosition(wrapRef, {
    open, panelRef, side, align: 'center', offset: 8,
    onAnchorOutOfView: hideNow,
  })

  function showDelayed() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(true), delay)
  }
  function hideNow() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') hideNow() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  if (coarse || !isValidElement(children)) return children

  const Child = (children as ReactElement<Record<string, unknown>>).type as ElementType
  const childProps = (children as ReactElement<Record<string, unknown>>).props
  const existingMouseEnter = childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined
  const existingMouseLeave = childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined
  const existingFocus = childProps.onFocus as ((e: React.FocusEvent) => void) | undefined
  const existingBlur = childProps.onBlur as ((e: React.FocusEvent) => void) | undefined

  const panelContent = (
    <>
      {content}
      <span aria-hidden className={cx('absolute bg-(color:--frv-text-primary) w-1.5 h-1.5 rotate-45', TOOLTIP_ARROW_STYLE[side])} />
    </>
  )
  const panelClass = 'w-max whitespace-normal bg-(color:--frv-text-primary) text-(color:--frv-bg) rounded-(--frv-radius-sm) shadow-(--frv-shadow-tooltip) py-(--frv-space-1) px-(--frv-space-2) max-w-(--tooltip-max-w)'

  return (
    <span ref={wrapRef} className={cx('relative inline-flex', className)}>
      <Child
        {...childProps}
        aria-describedby={open ? id : undefined}
        onMouseEnter={(e: React.MouseEvent) => { existingMouseEnter?.(e); showDelayed() }}
        onMouseLeave={(e: React.MouseEvent) => { existingMouseLeave?.(e); hideNow() }}
        onFocus={(e: React.FocusEvent) => { existingFocus?.(e); showDelayed() }}
        onBlur={(e: React.FocusEvent) => { existingBlur?.(e); hideNow() }}
      />
      {open && montert && createPortal(
        <span
          ref={el => { panelRef.current = el }}
          role="tooltip"
          id={id}
          className={cx(
            'fixed z-50 type-label-13 pointer-events-none top-(--tooltip-top) left-(--tooltip-left)',
            panelClass,
            pos ? 'visible' : 'invisible',
          )}
          style={{
            '--tooltip-max-w': typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
            '--tooltip-top': `${pos?.top ?? 0}px`,
            '--tooltip-left': `${pos?.left ?? 0}px`,
          } as CSSProperties}
        >
          {panelContent}
        </span>,
        document.body,
      )}
    </span>
  )
}

/* Toast
 *
 * Kept Norwegian on purpose: this mirrors `components/ui/Toast.tsx` field
 * for field (`vis`, `tekst`, `handling`, `varighet`, `vedLukking`) rather
 * than translating the API, since the point of this file is fidelity to the
 * real component, not an English rewrite. Rename the export if your project
 * needs an English surface.
 *
 * CONTRACT: `useToast().vis({ tekst, tone?, handling?, varighet?, preserve?,
 * vedLukking? })`. `handling` is typically "Undo", called by the caller with
 * a real reversal — the toast knows nothing about the domain. Max three
 * visible; newest at the bottom. Auto-closes after `varighet` (6s, default),
 * but PAUSES while hovered or focused (WCAG 2.2.1).
 *
 * `vedLukking?: (angret: boolean) => void | Promise<void>` fires EXACTLY
 * ONCE when the toast disappears (`angret = true` only if "Undo" was
 * clicked). Use it to defer a destructive action until the undo window has
 * passed: remove the row from local state immediately, send the real call
 * only in `vedLukking(false)`.
 *
 * MATERIAL: an INVERTED card (opposite fg/bg pair from the rest of the UI,
 * so it always reads as "above" the page regardless of theme). `tone`
 * (default 'message') picks the pair: message = text-primary/bg (neutral,
 * same monochrome inversion as the primary button); success/warning/error =
 * the filled status tokens (-solid/-fg). The "Undo" action is a plain
 * inverted text button, not `Button` — Button's variants are built for a
 * `--frv-bg` canvas, not four different toned card surfaces.
 */
export interface ToastInnhold {
  tekst: string
  /** 'message' (default, neutral) | 'success' | 'warning' | 'error'. */
  tone?: 'message' | 'success' | 'warning' | 'error'
  /** Typically "Undo". Called once; the toast closes afterward. */
  handling?: { tekst: string; onClick: () => void | Promise<void> }
  /** Milliseconds before auto-close. Default 6000. 0 = manual close only. */
  varighet?: number
  /** Never auto-closes — readable alias for `varighet: 0`. */
  preserve?: boolean
  /** Deferred deletion — see the top comment. Fires exactly once. */
  vedLukking?: (angret: boolean) => void | Promise<void>
}

const TOAST_TONE_COLOR: Record<NonNullable<ToastInnhold['tone']>, { kort: string; fg: string }> = {
  message: { kort: 'bg-(color:--frv-text-primary) text-(color:--frv-bg)', fg: 'text-(color:--frv-bg)' },
  success: { kort: 'bg-(color:--frv-success-solid) text-(color:--frv-success-fg)', fg: 'text-(color:--frv-success-fg)' },
  warning: { kort: 'bg-(color:--frv-warning-solid) text-(color:--frv-warning-fg)', fg: 'text-(color:--frv-warning-fg)' },
  error: { kort: 'bg-(color:--frv-error-solid) text-(color:--frv-error-fg)', fg: 'text-(color:--frv-error-fg)' },
}

interface ToastRow extends ToastInnhold { id: number }

const ToastContext = createContext<{ vis: (t: ToastInnhold) => void } | null>(null)

/** Use inside a `ToastProvider`. Without one: a no-op with a console warning
 *  (a forgotten provider shouldn't crash a page). */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (ctx) return ctx
  return { vis: (t: ToastInnhold) => { console.warn('[Toast] no ToastProvider mounted — dropped:', t.tekst) } }
}

const TOAST_MAX_VISIBLE = 3
const TOAST_DEFAULT_VARIGHET = 6000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<ToastRow[]>([])
  const next = useRef(1)
  const vis = useCallback((t: ToastInnhold) => {
    const id = next.current++
    setRows(r => [...r, { ...t, id }].slice(-TOAST_MAX_VISIBLE))
  }, [])
  const close = useCallback((id: number) => setRows(r => r.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ vis }}>
      {children}
      <div role="status" aria-live="polite" className="frv-toast-viewport fixed left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-[28rem] bottom-6">
        {rows.map(r => <ToastCard key={r.id} row={r} onClose={() => close(r.id)} />)}
      </div>
      <style>{'@keyframes frv-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }'}</style>
    </ToastContext.Provider>
  )
}

function ToastCard({ row, onClose }: { row: ToastRow; onClose: () => void }) {
  const [paused, setPaused] = useState(false)
  const varighet = row.preserve ? 0 : (row.varighet ?? TOAST_DEFAULT_VARIGHET)
  const { kort, fg } = TOAST_TONE_COLOR[row.tone ?? 'message']

  // `vedLukking` must fire EXACTLY once — auto-close, close button and
  // pagehide are three independent paths to "disappears"; a ref (not state)
  // prevents a double-call.
  const calledRef = useRef(false)
  const callVedLukking = useCallback((angret: boolean) => {
    if (calledRef.current) return
    calledRef.current = true
    void row.vedLukking?.(angret)
  }, [row])

  useEffect(() => {
    if (!varighet || paused) return
    const t = setTimeout(() => { callVedLukking(false); onClose() }, varighet)
    return () => clearTimeout(t)
  }, [varighet, paused, onClose, callVedLukking])

  useEffect(() => {
    function handlePagehide() { callVedLukking(false) }
    window.addEventListener('pagehide', handlePagehide)
    return () => window.removeEventListener('pagehide', handlePagehide)
  }, [callVedLukking])

  async function handling() {
    try { await row.handling?.onClick() } finally { callVedLukking(true); onClose() }
  }
  function closeManually() { callVedLukking(false); onClose() }

  return (
    <div
      className={cx('flex items-center gap-3 px-4 py-3 rounded-[var(--frv-radius-md)] motion-safe:animate-[frv-toast-in_.18s_ease-out] shadow-(--frv-shadow-menu)', kort)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="type-label-14 flex-1 min-w-0 m-0">{row.tekst}</p>
      {row.handling && (
        <button type="button" onClick={handling} className={cx('shrink-0 type-label-14-strong hover:underline underline-offset-2', fg)}>
          {row.handling.tekst}
        </button>
      )}
      <IconButton aria-label="Close message" onClick={closeManually} className={cx('shrink-0', fg)}>
        <CloseIcon size={14} />
      </IconButton>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   3. FORM — Input, Textarea, Select, Checkbox, Radio/RadioGroup, Switch,
      SearchInput
   ══════════════════════════════════════════════════════════════════════════ */

export type FieldSize = 'sm' | 'md' | 'lg'

// sm: min-h-10 sm:min-h-8 løfter trykkflaten til 40px under 640px (mobil),
// og går tilbake til fast 32px fra 640px og opp (Frivio, 19. sep 2026).
export const FIELD_HEIGHT: Record<FieldSize, string> = { sm: 'min-h-10 sm:min-h-8 h-8', md: 'min-h-11 lg:min-h-0 h-10', lg: 'h-12' }
export const FIELD_TEXT: Record<FieldSize, string> = { sm: 'type-label-13', md: 'type-label-14', lg: 'type-label-16' }
export const FIELD_PAD: Record<FieldSize, string> = { sm: 'px-2.5', md: 'px-3', lg: 'px-4' }
export const FIELD_PAD_L: Record<FieldSize, string> = { sm: 'pl-2.5', md: 'pl-3', lg: 'pl-4' }
export const FIELD_PAD_R: Record<FieldSize, string> = { sm: 'pr-2.5', md: 'pr-3', lg: 'pr-4' }
const FIELD_SLOT_PAD: Record<FieldSize, string> = { sm: 'px-2.5', md: 'px-3', lg: 'px-4' }
const FIELD_INNER_PAD_START: Record<FieldSize, string> = { sm: 'pl-2', md: 'pl-2.5', lg: 'pl-3' }
const FIELD_INNER_PAD_END: Record<FieldSize, string> = { sm: 'pr-2', md: 'pr-2.5', lg: 'pr-3' }

/** The field's own text color — set directly on the text element, never a
 *  wrapper: an inherited color always loses to an element selector, and
 *  `input,textarea,select{color:...}` in the token file is exactly that. */
export function fieldTextColor(disabled?: boolean) {
  return disabled ? 'text-[var(--frv-text-quaternary)]' : 'text-[var(--frv-text-primary)]'
}

/** Shared field border/surface/hover/focus — bg-surface, translucent border
 *  (hover → border-2, focus → border-3 + a dedicated gray glow via the
 *  shared `.frv-focus-glow`/`.frv-focus-clear` classes — DELIBERATELY
 *  different from the accent `:focus-visible` ring buttons/links use).
 *  `focusVariant: 'self'` is for a field with no prefix/suffix (the field
 *  itself draws the glow, class `frv-focus-glow`); `'within'` is for a slot
 *  container (the child, not the wrapper, receives focus — ONE element
 *  draws focus, not two: the container glows via `focus-within`, the inner
 *  field carries `frv-focus-clear` to cancel the global accent ring it
 *  would otherwise also draw). */
export function fieldChrome({ error, disabled, focusVariant = 'self' }: { error?: boolean; disabled?: boolean; focusVariant?: 'self' | 'within' }) {
  return cx(
    'border rounded-[var(--frv-radius-sm)] outline-none transition-colors',
    disabled ? 'bg-[var(--frv-gray-alpha-100)]' : 'bg-[var(--frv-surface)]',
    error ? 'border-[var(--frv-error)]' : 'border-[var(--frv-border)]',
    !disabled && !error && 'hover:border-[var(--frv-border-2)]',
    !disabled && !error && (focusVariant === 'within' ? 'focus-within:border-[var(--frv-border-3)]' : 'focus-visible:border-[var(--frv-border-3)]'),
    !disabled && (focusVariant === 'within' ? 'focus-within:shadow-[var(--frv-focus-border)]' : 'frv-focus-glow'),
  )
}

const FIELD_PLACEHOLDER = 'placeholder:text-[var(--frv-text-quaternary)]'
const FIELD_SEARCH_CANCEL_FIX = '[&::-webkit-search-cancel-button]:appearance-none'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string
  error?: string
  /** Short helper line under the field, wired via `aria-describedby` alongside `error`. */
  hint?: string
  size?: FieldSize
  /** Text or icon before/after the field, with a 1px divider. Only changes markup when at least one is set. */
  prefix?: ReactNode
  suffix?: ReactNode
  /** Floating label — see the section comment below. */
  floating?: boolean
  /** Controls how `prefix`/`suffix` are presented. `true` (default): a
   *  background-less segment with a 1px divider against the field (a
   *  unit/symbol belonging to the VALUE: "kr", "m²", a "Verified" chip).
   *  `false`: the icon sits INSIDE the field with no divider — no
   *  `border-r`/`-l`, no own background, tighter inset, gap to the text via
   *  the container's `gap-2`, icon in `--frv-text-tertiary`. Only `false`
   *  for a plain search field (see `SearchInput`, which always uses it) —
   *  a segmented divider fits a UNIT, not a search icon that's part of the
   *  placeholder text itself. */
  prefixStyling?: boolean
}

/* Input / Textarea (wave 3)
   bg-surface (no longer transparent — the field is now a MATERIAL surface,
   same shift as Button/Card/Modal), translucent border, radius sm. Three
   sizes: sm 32px/label-13, md 40px/label-14 (default), lg 48px/label-16.
   `prefix`/`suffix` add a bordered slot with a 1px divider; without them the
   field is unchanged (border/bg/focus directly on the `<input>`).

   `floating` (2026-09-12): the label lives IN the field as a placeholder and
   glides up to a small label (label-12-strong) on focus/content — saves one
   line height per field. Only for a TIGHT form with SHORT labels, one field
   per row (login, registration, invite) — a REGULAR form keeps the label
   ABOVE the field. CSS-driven (`peer` + `:placeholder-shown`/`:focus`), not
   React state, so it works for both controlled (`value`) and uncontrolled
   (`defaultValue`, browser autofill) fields for free. `placeholder` from the
   caller is ALWAYS overridden to a single space (triggers
   `:placeholder-shown`) — the label text IS the placeholder. The label is a
   real `<label htmlFor>`, never just the `placeholder` attribute alone, so
   the accessible name never disappears if the CSS fails to load for some
   reason. `suffix` is NOT supported in `floating` (no call site needed it). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, size = 'md', prefix, suffix, prefixStyling = true, disabled, floating, ...props }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    const errorId = `${fieldId}-error`
    const hintId = `${fieldId}-hint`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

    if (floating) {
      return (
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="relative">
            {prefix !== undefined && (
              <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none type-label-14 text-(color:--frv-text-secondary)">
                {prefix}
              </span>
            )}
            <input
              {...props}
              ref={ref}
              id={fieldId}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className={cx(
                'peer w-full', FIELD_HEIGHT.md,
                prefix !== undefined ? 'pl-9' : FIELD_PAD_L.md, FIELD_PAD_R.md, FIELD_TEXT.md,
                fieldTextColor(disabled), fieldChrome({ error: !!error, disabled, focusVariant: 'self' }), FIELD_SEARCH_CANCEL_FIX, className,
              )}
              placeholder=" "
            />
            {label && (
              <label
                htmlFor={fieldId}
                className={cx(
                  'absolute z-10 left-3 top-2 -translate-y-4 origin-left px-1 cursor-text select-none pointer-events-none',
                  'transition-[top,transform] duration-150 motion-reduce:transition-none',
                  '[font:var(--frv-type-label-12-strong)] [letter-spacing:var(--frv-type-label-12-ls)]',
                  'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2',
                  'peer-placeholder-shown:[font:var(--frv-type-label-14)] peer-placeholder-shown:[letter-spacing:var(--frv-type-label-14-ls)]',
                  'peer-focus:top-2 peer-focus:-translate-y-4',
                  'peer-focus:[font:var(--frv-type-label-12-strong)] peer-focus:[letter-spacing:var(--frv-type-label-12-ls)]',
                  prefix !== undefined && 'left-9', 'text-(color:--frv-text-secondary)',
                  disabled ? 'bg-(color:--frv-gray-alpha-100)' : 'bg-(color:--frv-surface)',
                )}
              >
                {label}
              </label>
            )}
          </div>
          {hint && <p id={hintId} className="type-label-12 text-[var(--frv-text-tertiary)]">{hint}</p>}
          {error && <FormError id={errorId} size="label-12">{error}</FormError>}
        </div>
      )
    }

    const hasSlot = prefix !== undefined || suffix !== undefined

    const field = hasSlot ? (
      // The slot container IS the field visually — the caller's `className`
      // does NOT go here, it goes on the root wrapper below (the container
      // is a child of Input's own `flex-col`, so `flex-1` from a toolbar
      // gave flex-basis 0 on the HEIGHT and a 22px-tall field).
      <div className={cx('w-full flex items-stretch', FIELD_HEIGHT[size], !prefixStyling && 'gap-3', fieldChrome({ error: !!error, disabled, focusVariant: 'within' }))}>
        {prefix !== undefined && (
          <span
            className={cx(
              'flex items-center shrink-0', FIELD_TEXT[size], prefixStyling ? cx('border-r', FIELD_SLOT_PAD[size]) : 'pl-4',
              prefixStyling ? 'text-(color:--frv-text-secondary)' : 'text-(color:--frv-text-tertiary)',
              prefixStyling && (error ? 'border-(color:--frv-error)' : 'border-(color:--frv-border)'),
            )}
          >
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'min-w-0 flex-1 bg-transparent border-0 outline-none',
            // Cancels the accent ring on the `<input>` itself — the container
            // already draws its own glow via `focus-within` above; one
            // element should draw focus, not two.
            'frv-focus-clear',
            FIELD_TEXT[size], fieldTextColor(disabled),
            prefix === undefined ? FIELD_PAD_L[size] : prefixStyling ? FIELD_INNER_PAD_START[size] : undefined,
            suffix === undefined ? FIELD_PAD_R[size] : prefixStyling ? FIELD_INNER_PAD_END[size] : undefined,
            FIELD_PLACEHOLDER, FIELD_SEARCH_CANCEL_FIX,
          )}
          {...props}
        />
        {suffix !== undefined && (
          <span
            className={cx(
              'flex items-center shrink-0', FIELD_TEXT[size], prefixStyling ? cx('border-l', FIELD_SLOT_PAD[size]) : 'pr-4',
              prefixStyling ? 'text-(color:--frv-text-secondary)' : 'text-(color:--frv-text-tertiary)',
              prefixStyling && (error ? 'border-(color:--frv-error)' : 'border-(color:--frv-border)'),
            )}
          >
            {suffix}
          </span>
        )}
      </div>
    ) : (
      <input
        ref={ref}
        id={fieldId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx('w-full', FIELD_HEIGHT[size], FIELD_PAD[size], FIELD_TEXT[size], fieldTextColor(disabled), fieldChrome({ error: !!error, disabled, focusVariant: 'self' }), FIELD_PLACEHOLDER, FIELD_SEARCH_CANCEL_FIX, className)}
        {...props}
      />
    )

    return (
      // The root is the actual flex/grid child in a toolbar: in slot mode
      // (prefix/suffix) the caller's `className` lands HERE (`flex-1`,
      // `min-w-[180px]`, `w-full`); without a slot it stays on the `<input>` as before.
      <div className={cx('flex flex-col gap-1.5 min-w-0', hasSlot && className)}>
        {label && <label htmlFor={fieldId} className="type-label-13-strong text-[var(--frv-text-primary)]">{label}</label>}
        {field}
        {hint && <p id={hintId} className="type-label-12 text-[var(--frv-text-tertiary)]">{hint}</p>}
        {error && <FormError id={errorId} size="label-12">{error}</FormError>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  size?: FieldSize
}

const TEXTAREA_PAD_Y: Record<FieldSize, string> = { sm: 'py-2', md: 'py-2.5', lg: 'py-3' }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, size = 'md', disabled, ...props }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    const errorId = `${fieldId}-error`
    const hintId = `${fieldId}-hint`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
    return (
      <div className="flex flex-col gap-1.5 min-w-0">
        {label && <label htmlFor={fieldId} className="type-label-13-strong text-[var(--frv-text-primary)]">{label}</label>}
        <textarea
          ref={ref}
          id={fieldId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx('w-full min-h-24 resize-none', FIELD_PAD[size], TEXTAREA_PAD_Y[size], FIELD_TEXT[size], fieldTextColor(disabled), fieldChrome({ error: !!error, disabled, focusVariant: 'self' }), FIELD_PLACEHOLDER, className)}
          {...props}
        />
        {hint && <p id={hintId} className="type-label-12 text-[var(--frv-text-tertiary)]">{hint}</p>}
        {error && <FormError id={errorId} size="label-12">{error}</FormError>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

const SELECT_CHEVRON_PAD_R: Record<FieldSize, string> = { sm: 'pr-7', md: 'pr-8', lg: 'pr-9' }
const SELECT_CHEVRON_RIGHT: Record<FieldSize, string> = { sm: 'right-2', md: 'right-2.5', lg: 'right-3' }

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  /** `sm` (32px) is for a dropdown INSIDE a list/table row. `lg` (48px) matches Input/Textarea's third size. Default `md`. */
  size?: FieldSize
}

/** Select — same height/border/focus token as Input (see `fieldChrome`).
 *  Without `label`/`error` only the field container (inline-flex) is
 *  returned, so an existing inline call site doesn't gain a block wrapper. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, id, size = 'md', disabled, ...props }, ref) => {
    const autoId = useId()
    const fieldId = id ?? autoId
    const errorId = `${fieldId}-error`
    const field = (
      <div className={cx('relative inline-flex min-w-0', className)}>
        <select
          ref={ref}
          id={fieldId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cx(
            'appearance-none w-full', disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            FIELD_HEIGHT[size], FIELD_PAD_L[size], SELECT_CHEVRON_PAD_R[size], FIELD_TEXT[size],
            fieldTextColor(disabled), fieldChrome({ error: !!error, disabled, focusVariant: 'self' }),
            '[&>option]:bg-[var(--frv-surface)] [&>option]:text-[var(--frv-text-primary)]',
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon size={14} className={cx('pointer-events-none absolute top-1/2 -translate-y-1/2', SELECT_CHEVRON_RIGHT[size])} style={{ color: 'var(--frv-text-secondary)' }} />
      </div>
    )

    if (!label && !error) return field

    return (
      <div className="flex flex-col gap-1.5 min-w-0">
        {label && <label htmlFor={fieldId} className="type-label-13-strong text-[var(--frv-text-primary)]">{label}</label>}
        {field}
        {error && <FormError id={errorId} size="label-12">{error}</FormError>}
      </div>
    )
  }
)

Select.displayName = 'Select'

interface CheckboxProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  /** The label text. Omit for a bare checkbox with no visible text — set `ariaLabel` then. */
  label?: ReactNode
  description?: ReactNode
  /** Only used when `label` is missing: gives screen readers a name for the box. */
  ariaLabel?: string
  /** sm = 16px box (dense rows). md (default) = 20px, for forms. */
  size?: 'sm' | 'md'
  /** Third state for "some, not all" in a group. Shows a dash instead of a
   *  check, looks filled, and `aria-checked` becomes `"mixed"`. Visually
   *  overrides `checked` when both are set — the caller decides what a click
   *  here should do (typically: check everything). */
  indeterminate?: boolean
  className?: string
}

/* Checkbox — NEVER a raw `<input type="checkbox">` (can't be styled
   consistently across browsers without hiding it or non-standard pseudo-
   elements). This is `<button role="checkbox" aria-checked>`, same recipe
   as `Switch`/`Radio`. The whole button (box + text) is one click target,
   44px tall below `lg`. Monochrome (wave 3): checked box is
   `--frv-text-primary` with the check in `--frv-bg` — no longer accent blue. */
export function Checkbox({ checked, onChange, disabled, label, description, ariaLabel, size = 'md', indeterminate, className }: CheckboxProps) {
  const id = useId()
  const descId = description ? `${id}-desc` : undefined
  const box = size === 'sm' ? 16 : 20
  const iconSize = size === 'sm' ? 11 : 13
  const filled = checked || indeterminate

  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label ? undefined : ariaLabel}
      aria-describedby={descId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx('inline-flex gap-2.5 min-h-11 lg:min-h-0 text-left', description ? 'items-start' : 'items-center', disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer', className)}
    >
      <span
        aria-hidden
        className={cx(
          'shrink-0 flex items-center justify-center rounded-[4px] transition-colors duration-150 motion-reduce:transition-none border',
          box === 16 ? 'w-4 h-4' : 'w-5 h-5',
          filled ? 'border-(color:--frv-text-primary) bg-(color:--frv-text-primary)' : 'border-(color:--frv-border-3) bg-transparent',
        )}
      >
        {indeterminate ? <MinusIcon size={iconSize} className="text-(color:--frv-bg)" /> : (checked && <CheckIcon size={iconSize} className="text-(color:--frv-bg)" />)}
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {/* With a description: label-14-strong (500) — the label should stand apart from the explanation below. Without: 400 is enough. */}
          {label && <span className={cx(description ? 'type-label-14-strong' : 'type-label-14', 'block text-(color:--frv-text-primary)')}>{label}</span>}
          {description && <span id={descId} className="type-copy-13 block mt-0.5 text-(color:--frv-text-secondary)">{description}</span>}
        </span>
      )}
    </button>
  )
}

export type RadioVariant = 'liste' | 'kort'

interface RadioProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onClick'> {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label?: ReactNode
  /** The explanation under the label — the actual reason `Radio` exists next to `PillTabs`/`Select`. */
  description?: ReactNode
  ariaLabel?: string
  /** sm = 16px box (tight rows). md (default) = 20px, for a form. Ignored by `variant="kort"` (fixed card size). */
  size?: 'sm' | 'md'
  /** `liste` (default): row with a circle + text. `kort`: card with a border — see the section comment. */
  variant?: RadioVariant
  /** `variant="kort"` only: optional leading icon in the card. */
  icon?: IconComponent
  /** `variant="kort"` only: optional badge to the right of the title, e.g. "Recommended". */
  badge?: ReactNode
}

/* Radio / RadioGroup
   For a LONGER list (typically 5+) where EACH option needs its own
   description line — a subscription tier, a delivery method. NOT for 2-4
   options with no description; that's still `PillTabs`/`Select`. Monochrome,
   same measurements as Checkbox: 16/20px box, selected = filled with a dot
   in `--frv-bg`. `<button role="radio" aria-checked>`, same reasoning as
   Checkbox for avoiding a raw `<input type="radio">`.

   `variant="kort"` (2026-09-12): same `liste` recipe, but each option gets
   card chrome (`--frv-gray-alpha-400` border, 500 on hover), selected =
   `--frv-accent` border + `--frv-accent-light` background, radius-md, an
   optional leading icon and a "recommended"-style `Badge`. The whole card
   is clickable (same `<button role="radio">`), keyboard unchanged. Use for
   FEW options (typically 2-4) where EACH needs a description — same
   exception as `liste`, just heavier for a small set that should be
   compared side by side (e.g. a loan type). Don't mix `kort` and `liste` in
   the same group.

   `RadioGroup` implements the WAI-ARIA radiogroup pattern: roving tabindex
   (only the checked option, or the first enabled one if none is checked, is
   a tab stop), then Up/Down (vertical) or Left/Right (horizontal) to move
   AND select. */
export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { checked, onChange, disabled, label, description, ariaLabel, size = 'md', variant = 'liste', icon: Icon, badge, className, ...rest }, ref,
) {
  const id = useId()
  const descId = description ? `${id}-desc` : undefined
  const box = size === 'sm' ? 16 : 20
  const dot = size === 'sm' ? 6 : 8

  const circle = (
    <span
      aria-hidden
      className={cx(
        'shrink-0 flex items-center justify-center rounded-full transition-colors duration-150 motion-reduce:transition-none border',
        variant === 'kort' ? 'w-[18px] h-[18px]' : box === 16 ? 'w-4 h-4' : 'w-5 h-5',
        checked ? 'border-(color:--frv-text-primary) bg-(color:--frv-text-primary)' : 'border-(color:--frv-border-3) bg-transparent',
      )}
    >
      {checked && (
        <span
          className={cx('rounded-full bg-(color:--frv-bg)', variant === 'kort' ? 'w-[7px] h-[7px]' : dot === 6 ? 'w-1.5 h-1.5' : 'w-2 h-2')}
        />
      )}
    </span>
  )

  if (variant === 'kort') {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        id={id}
        aria-checked={checked}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={descId}
        disabled={disabled}
        onClick={onChange}
        className={cx(
          'flex items-start gap-3 w-full text-left rounded-[var(--frv-radius-md)] border p-3.5 transition-colors duration-150 motion-reduce:transition-none',
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          checked ? 'border-(color:--frv-accent) bg-(color:--frv-accent-light)' : 'border-(color:--frv-gray-alpha-400) bg-transparent',
          className,
        )}
        {...rest}
      >
        {circle}
        {Icon && <Icon size={18} className={cx('shrink-0 mt-0.5', checked ? 'text-(color:--frv-accent-text)' : 'text-(color:--frv-text-tertiary)')} />}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 flex-wrap">
            {label && <span className="type-label-14-strong text-(color:--frv-text-primary)">{label}</span>}
            {badge != null && (typeof badge === 'string' ? <Badge variant="accent" size="sm">{badge}</Badge> : badge)}
          </span>
          {description && <span id={descId} className="type-copy-13 block mt-0.5 text-(color:--frv-text-secondary)">{description}</span>}
        </span>
      </button>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      id={id}
      aria-checked={checked}
      aria-label={label ? undefined : ariaLabel}
      aria-describedby={descId}
      disabled={disabled}
      onClick={onChange}
      className={cx('inline-flex gap-2.5 min-h-11 lg:min-h-0 text-left', description ? 'items-start' : 'items-center', disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer', className)}
      {...rest}
    >
      {circle}
      {(label || description) && (
        <span className="min-w-0">
          {/* With a description: label-14-strong (500) — the label should stand apart from the explanation below. Without: 400 is enough. */}
          {label && <span className={cx(description ? 'type-label-14-strong' : 'type-label-14', 'block text-(color:--frv-text-primary)')}>{label}</span>}
          {description && <span id={descId} className="type-copy-13 block mt-0.5 text-(color:--frv-text-secondary)">{description}</span>}
        </span>
      )}
    </button>
  )
})

export interface RadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  /** `variant="kort"` only: leading icon in the card. */
  icon?: IconComponent
  /** `variant="kort"` only: badge to the right of the title, e.g. "Recommended". */
  badge?: ReactNode
}

interface RadioGroupProps {
  /** Not used for any DOM attribute (controls are `role="radio"`, not native `<input>`) — set as `data-name` for debugging/tests. */
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  /** vertical (default): one column. horizontal: wrapping row. Ignored by `variant="kort"` (always one column). */
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md'
  /** `liste` (default) or `kort` — see `Radio`'s section comment. */
  variant?: RadioVariant
  className?: string
}

export function RadioGroup({ name, value, onChange, options, orientation = 'vertical', size = 'md', variant = 'liste', className }: RadioGroupProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const enabledIndexes = options.reduce<number[]>((acc, o, i) => { if (!o.disabled) acc.push(i); return acc }, [])
  const hasSelection = options.some(o => o.value === value)

  function handleKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const horizontal = orientation === 'horizontal'
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown'
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp'
    if (e.key !== nextKey && e.key !== prevKey) return
    if (enabledIndexes.length === 0) return
    e.preventDefault()
    const pos = enabledIndexes.indexOf(index)
    const fromPos = pos === -1 ? 0 : pos
    const delta = e.key === nextKey ? 1 : -1
    const nextIndex = enabledIndexes[(fromPos + delta + enabledIndexes.length) % enabledIndexes.length]
    refs.current[nextIndex]?.focus()
    onChange(options[nextIndex].value)
  }

  return (
    <div role="radiogroup" data-name={name} className={cx('flex', variant === 'kort' ? 'flex-col gap-2.5' : orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-5 gap-y-2' : 'flex-col gap-3', className)}>
      {options.map((option, index) => {
        const isSelected = option.value === value
        const tabbable = isSelected || (!hasSelection && index === enabledIndexes[0])
        return (
          <Radio
            key={option.value}
            ref={el => { refs.current[index] = el }}
            checked={isSelected}
            onChange={() => onChange(option.value)}
            onKeyDown={e => handleKeyDown(e, index)}
            disabled={option.disabled}
            label={option.label}
            description={option.description}
            size={size}
            variant={variant}
            icon={option.icon}
            badge={option.badge}
            tabIndex={tabbable ? 0 : -1}
          />
        )
      })}
    </div>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  /** The label. Clicking it toggles the switch — a real `<label>`. */
  label: string
  description?: string
  className?: string
}

/** Switch — for a setting that takes effect once saved. Use `Select` for
 *  more than two choices, a `Checkbox` for a form value saved as a whole.
 *  Whole row is clickable, switch itself is 44px tall on mobile. Monochrome
 *  (wave 3): track is `gray-alpha-300` (off) / `text-primary` (on) — no
 *  longer accent blue; knob is `--frv-surface` with `--frv-shadow-xs`. */
export function Switch({ checked, onChange, disabled, label, description, className }: SwitchProps) {
  const id = useId()
  const descId = description ? `${id}-desc` : undefined

  return (
    <div className={cx('flex items-start justify-between gap-4', className)}>
      <div className={cx('min-w-0', disabled && 'opacity-40')}>
        <label htmlFor={id} className={cx('type-heading-14 block', !disabled && 'cursor-pointer')}>{label}</label>
        {description && <p id={descId} className="type-copy-13 mt-0.5 text-(color:--frv-text-secondary)">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx('shrink-0 inline-flex items-center min-h-11 lg:min-h-0 lg:h-5', 'disabled:cursor-not-allowed disabled:opacity-40', !disabled && 'cursor-pointer')}
      >
        <span aria-hidden className={cx('block w-9 h-5 rounded-[var(--frv-radius-full)] p-0.5 transition-colors duration-150 motion-reduce:transition-none', checked ? 'bg-(color:--frv-text-primary)' : 'bg-(color:--frv-gray-alpha-300)')}>
          <span className={cx('block w-4 h-4 rounded-[var(--frv-radius-full)] transition-transform duration-150 motion-reduce:transition-none bg-(color:--frv-surface) shadow-(--frv-shadow-xs)', checked ? 'translate-x-4' : 'translate-x-0')} />
        </span>
      </button>
    </div>
  )
}

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  className?: string
  /** Shows a clear button once the field has content. Omit it and there's no clear affordance. */
  onClear?: () => void
}

/** SearchInput — builds on `Input` (the magnifier is `prefix`, the clear
 *  button is `suffix`). `type="search"` is fixed, placeholder defaults to
 *  "Search…" and it never carries a label above or an error below — the
 *  icon and placeholder ARE the label. `prefixStyling={false}` (2026-09-12):
 *  the search icon is part of the placeholder text itself, not a unit next
 *  to the value — it should NOT have a segment divider. 16px icon + 16px
 *  edge padding + 12px gap (`Input`'s own `!prefixStyling` spacing). */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, placeholder = 'Search…', 'aria-label': ariaLabel, onClear, value, ...props }, ref) => {
    const showButton = !!onClear && value !== '' && value != null
    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        prefix={<SearchIcon size={16} aria-hidden />}
        prefixStyling={false}
        suffix={showButton ? (
          <button type="button" onClick={onClear} aria-label="Clear search" className="relative before:absolute before:-inset-[15px] before:content-['']">
            <CloseIcon size={13} />
          </button>
        ) : undefined}
        className={className}
        value={value}
        {...props}
      />
    )
  },
)

SearchInput.displayName = 'SearchInput'

/* ══════════════════════════════════════════════════════════════════════════
   4. DATA DISPLAY — ListRow, Table, Dokument, Field, DescriptionList,
      Pagination, LoadBar, Progress, StepCard, IconTile
   ══════════════════════════════════════════════════════════════════════════ */

/* ListRow
   The ONE flat list row. Used inside a flat, divider-separated container
   (`divide-y divide-[var(--frv-border)]`) — NEVER one card per item.

   Slots: `leading` (checkbox/date/icon), `title` (main text), `secondary`
   (short facts inline after the title — an array renders joined with "·"),
   `subtitle` (the exception: longer text, own line, `line-clamp-2`), `meta`
   (chips next to the title), `value` (right-aligned, tabular figures,
   never shrinks/wraps), `trailing` (actions/chevron), `details` + `expanded`
   (accordion content, rendered as a SIBLING below the row, never nested).

   Layout reacts to the ROW's own container width (`@container`, ≥28rem is
   "wide"), not the viewport — a row in a narrow column on a wide screen
   behaves like it would on a phone. `trailing` wraps to its own line if the
   title group (which asks for at least 15rem) doesn't fit alongside it.

   `href` renders a plain `<a>` (mutually exclusive with `onClick` — a row is
   either a NAVIGATION or an ACTION, never both, and the type enforces it).

   Wave 3 (2026-09-10, founder: "the main text should read heavier than
   supporting text"): title is `.type-heading-14` (600), `secondary` is
   `type-label-13` (previously `copy-13`) — matches `value`'s weight. Hover
   surface is `--frv-gray-alpha-100` (was `--frv-surface-2`).

   `status`/`done` (2026-09-12): a status icon reads faster than a plain text
   badge for lists where STATUS is the primary signal. `status` draws a 20px
   tone tile (same idiom as `IconTile`) in the `leading` slot WHEN `leading`
   isn't set explicitly — set both yourself (unusual, e.g. a checkbox
   TOGETHER with a status color) by composing `leading` with the exported
   `ListRowStatusIcon`. `done` strikes the title through in tertiary color —
   for a checked-off ROW, not a checked form field. Both are new, optional,
   additive slots; the other six stay unchanged. */
export type ListRowStatusTone = 'success' | 'warning' | 'error' | 'accent' | 'gray'

export interface ListRowStatus {
  tone: ListRowStatusTone
  /** Omitted: a plain dot in the tone's color (same fallback idiom as `StatusDot`). */
  icon?: IconComponent
}

const LISTROW_STATUS_TO_ICON_TILE: Record<ListRowStatusTone, IconTileTone> = {
  success: 'success', warning: 'warning', error: 'danger', accent: 'accent', gray: 'neutral',
}

function ListRowStatusDot({ size = 12 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="block rounded-full bg-current w-(--dot-d) h-(--dot-d)"
      style={{ '--dot-d': `${size * 0.5}px` } as CSSProperties}
    />
  )
}

/** Status icon in a tone tile — `IconTile` at `size="sm"` (20px). Used
 *  internally by the `status` prop; exported for call sites that must
 *  compose `leading` themselves. */
export function ListRowStatusIcon({ status }: { status: ListRowStatus }) {
  return <IconTile icon={status.icon ?? ListRowStatusDot} tone={LISTROW_STATUS_TO_ICON_TILE[status.tone]} size="sm" />
}

type ListRowSlots = {
  leading?: ReactNode
  title: ReactNode
  /** Short facts INLINE after the title, muted, ellipsis. An array renders joined with "·" (null/false/'' filtered out). */
  secondary?: ReactNode | ReactNode[]
  /** The exception, not the default: longer text, own line, `line-clamp-2`. */
  subtitle?: ReactNode
  /** Chips (Badge) next to the title. Two visible recommended max. */
  meta?: ReactNode
  /** Right-aligned value (amount/date/count), tabular figures, never shrinks/wraps. */
  value?: ReactNode
  /** Actions/chevron, outermost right. */
  trailing?: ReactNode
  /** Accordion detail, sibling below the row, only when `expanded`. */
  details?: ReactNode
  expanded?: boolean
  /** Status icon in a tone tile — see the section comment above. Fills `leading` when `leading` is unset. */
  status?: ListRowStatus
  /** Strikes the title through in tertiary color — see the section comment above. */
  done?: boolean
  className?: string
}

export type ListRowProps = ListRowSlots & ({ href: string; onClick?: never } | { href?: undefined; onClick?: () => void })

function listRowJoinSecondary(secondary: ReactNode | ReactNode[] | undefined): ReactNode {
  if (secondary == null) return null
  const items = Array.isArray(secondary) ? secondary : [secondary]
  const visible = items.filter(item => item != null && item !== false && item !== '')
  if (visible.length === 0) return null
  if (visible.length === 1) return visible[0]
  return visible.map((item, i) => <span key={i}>{i > 0 && <span aria-hidden className="mx-[var(--frv-space-1-5)]">·</span>}{item}</span>)
}

export function ListRow(props: ListRowProps) {
  const { leading, title, secondary, subtitle, meta, value, trailing, details, expanded, status, done, className, href, onClick } = props
  const secondaryContent = listRowJoinSecondary(secondary)
  // `status` fills `leading` ONLY when the call site hasn't set one itself.
  const leadingNode = leading ?? (status ? <ListRowStatusIcon status={status} /> : null)
  const titleColorClass = done ? 'text-(color:--frv-text-tertiary)' : 'text-(color:--frv-text-primary)'

  // Nested-interactive guard: when the row is clickable AND has buttons in
  // `trailing`, the whole row can't be `role="button"` (a button inside a
  // button) — the TITLE becomes the button instead, mouse clicks on the row
  // still work.
  const nested = !!onClick && trailing != null
  const titleEl = (classes: string) => nested ? (
    <button type="button" onClick={e => { e.stopPropagation(); onClick?.() }} aria-expanded={details != null ? (expanded ?? false) : undefined}
      className={cx(classes, done && 'line-through', 'text-left bg-transparent border-0 p-0 cursor-pointer', titleColorClass)}>{title}</button>
  ) : (
    <span className={cx(classes, done && 'line-through', titleColorClass)}>{title}</span>
  )

  const titleBlock = (
    <div className="min-w-0 flex-1">
      <div className="hidden @md:flex items-center gap-[var(--frv-space-2)] min-w-0">
        <div className="flex items-baseline min-w-0 flex-1">
          {titleEl('type-heading-14 truncate shrink-0 max-w-[60%]')}
          {secondaryContent != null && <span className="type-label-13 truncate min-w-[6rem] flex-1 ml-[var(--frv-space-2)] text-(color:--frv-text-secondary)">{secondaryContent}</span>}
        </div>
        {meta != null && <span className="shrink-0 flex items-center gap-[var(--frv-space-2)] text-(color:--frv-text-secondary)">{meta}</span>}
        {value != null && <span className="type-label-13 tabular-nums shrink-0 text-right text-(color:--frv-text-primary)">{value}</span>}
      </div>
      {/* Tittelen får hele linje 1 (line-clamp-2, aldri truncate) — value/meta
          flytter til linje 2, høyrestilt. `overflow-x-auto` er beholdt som
          sikkerhetsnett; kildens `.rad-fade`/`RadFade`-kant-hint (CSS `:has()`
          + en liten klientøy som setter data-scroll-start/-end) er droppet
          for portabilitet, samme begrunnelse som `.tabs-fade` over. */}
      <div className="flex @md:hidden flex-col gap-1 min-w-0">
        <div className="min-w-0">{titleEl('type-heading-14 line-clamp-2')}</div>
        {(secondaryContent != null || meta != null || value != null) && (
          <div className="flex items-center gap-x-[var(--frv-space-2)] overflow-x-auto whitespace-nowrap min-w-0">
            {secondaryContent != null && <span className="type-label-13 shrink-0 text-(color:--frv-text-secondary)">{secondaryContent}</span>}
            {meta != null && <span className="shrink-0 flex items-center gap-[var(--frv-space-2)] text-(color:--frv-text-secondary)">{meta}</span>}
            {value != null && <span className="type-label-13 tabular-nums shrink-0 ml-auto text-right text-(color:--frv-text-primary)">{value}</span>}
          </div>
        )}
      </div>
      {subtitle != null && <div className="type-copy-13 line-clamp-2 mt-0.5 text-(color:--frv-text-secondary)">{subtitle}</div>}
    </div>
  )

  const content = (
    <>
      <div className="flex items-center gap-[var(--frv-space-3)] min-w-0 flex-1 basis-[min(100%,15rem)]">
        {leadingNode != null && <div className="shrink-0 flex items-center">{leadingNode}</div>}
        {titleBlock}
      </div>
      {trailing != null && <div className="shrink-0 flex flex-wrap items-center justify-end gap-[var(--frv-space-2)] ml-auto">{trailing}</div>}
    </>
  )

  const rowClassName = cx(
    '@container flex flex-wrap @md:flex-nowrap items-center justify-between gap-x-[var(--frv-space-3)] gap-y-[var(--frv-space-2)] p-[var(--frv-space-3)]',
    (href || onClick) && 'cursor-pointer transition-colors hover:bg-[var(--frv-gray-alpha-100)]',
    className,
  )

  const ariaExpanded = onClick && details != null ? (expanded ?? false) : undefined

  const row = href ? (
    <a href={href} className={rowClassName}>{content}</a>
  ) : (
    <div
      onClick={onClick}
      role={onClick && !nested ? 'button' : undefined}
      tabIndex={onClick && !nested ? 0 : undefined}
      aria-expanded={nested ? undefined : ariaExpanded}
      onKeyDown={onClick && !nested ? e => { if (e.target !== e.currentTarget) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      className={rowClassName}
    >
      {content}
    </div>
  )

  if (details == null) return row

  return (
    <div>
      {row}
      {expanded && <div className="border-t border-[var(--frv-border)] bg-[var(--frv-surface-2)] p-[var(--frv-space-3)]">{details}</div>}
    </div>
  )
}

interface TableKolonne {
  key: string
  label: ReactNode
  align?: 'venstre' | 'hoyre'
  /** CSS grid-column width, e.g. `'90px'`. Default `'1fr'`. */
  bredde?: string
  /** Makes the header cell a clickable sort button (arrow affordance + `aria-sort`). `Table` never sorts itself — see `onSorter`. */
  sorterbar?: boolean
}

interface TableProps<T> {
  kolonner: TableKolonne[]
  rader: T[]
  /** Full freedom per cell — numbers, bars, icons. Returning `null`/`undefined` renders "—". */
  celle: (rad: T, kolonneKey: string) => ReactNode
  radKey: (rad: T) => string
  /** Optional sum row at the bottom, same signature as `celle` without a concrete row. */
  fot?: (kolonneKey: string) => ReactNode
  /** Forces a minimum content width, e.g. `'560px'`. Below it, content scrolls in its own container (never `body`) with a "swipe" hint. */
  minBredde?: string
  /** Every other row (from row 2) gets a faint tint — helps the eye track a row horizontally. */
  striped?: boolean
  /** Hover surface + pointer cursor on rows that have `radOnClick`. */
  interactive?: boolean
  /** Makes the row clickable. Pair with `interactive` for hover feedback. */
  radOnClick?: (rad: T) => void
  /** Which `sorterbar` column (key) the table is currently sorted by. */
  sortKey?: string
  sortRetning?: 'stigende' | 'synkende'
  /** Called with a column's `key` when a `sorterbar` header is clicked —
   *  `Table` has no idea how `T` compares, the caller sorts `rader` itself
   *  and passes it back in the new order (same "full freedom" idea as `celle`). */
  onSorter?: (kolonneKey: string) => void
  /** Text for the empty-row state when `rader` is empty. @default 'No rows' */
  tomTekst?: string
  /** `radKey()` of ONE row to highlight (accent tint + inset border) and scroll
   *  into view on mount — deep links that point at a single row. */
  merketRadKey?: string | null
  /** `'print'` swaps the border/surface colors from `--frv-*` to
   *  `--frv-print-*` and drops the outer box — for use inside `Dokument`
   *  (`DokumentTabell` sets this automatically). Omitted (or `'standard'`)
   *  is pixel-identical to `Table` before this prop existed. @default 'standard' */
  variant?: 'standard' | 'print'
  className?: string
}

/* Table
   Data-driven grid, not `<table>`: a CSS grid gives control over column
   widths (`bredde` per column, default `1fr`) without `<colgroup>`. Hairline
   dividers between rows, right-aligned cells get `tabular-nums`
   automatically — otherwise `celle()` has full freedom, same philosophy as
   the rest of the system's "full freedom per cell" primitives. Scroll is
   always inside the component's own `overflow-x-auto` container, never on
   `body`. `striped`/`interactive` and unknown values (`celle()` returning
   `null`/`undefined`) render as "—" instead of blank.

   `sorterbar` per column (arrow affordance in the header, `aria-sort`) and
   an empty-row state (`tomTekst`). NOT ported: the actual sorting — `Table`
   can't compare two rows itself, `onSorter` only reports WHICH column was
   clicked.

   ARIA: the component is a CSS grid of `<div>`s, not a real `<table>` — for
   `aria-sort` to be valid ARIA (only legal on `role="columnheader"`, which
   in turn requires a `role="row"` ancestor inside `role="table"`/rowgroup)
   the structure carries minimal explicit roles: the outer grid wrapper
   `role="table"`, each row `role="row"`, cells `role="columnheader"`/`"cell"`.
   These roles are DELIBERATELY omitted (all `undefined`) when a row is
   `radOnClick`+`interactive`: a clickable row is already `role="button"`,
   and "button" is not a valid ARIA row — putting `role="table"`/`"rowgroup"`
   on a table with button-rows is an `aria-required-children` violation. The
   two expressions ("sortable data table" vs. "row is a button") are
   therefore mutually exclusive in this component, min-h-11 (not h-11): a
   cell with long text grows instead of overflowing the row underneath. */
export function Table<T>({
  kolonner, rader, celle, radKey, fot, minBredde, striped, interactive, radOnClick,
  sortKey, sortRetning, onSorter, tomTekst = 'No rows', variant = 'standard', className, merketRadKey,
}: TableProps<T>) {
  const isPrint = variant === 'print'
  const gridTemplateColumns = kolonner.map(k => k.bredde ?? '1fr').join(' ')
  const semanticTable = !(interactive && !!radOnClick)

  function Cell({ align, role, ariaSort, stretch, children }: {
    align?: 'venstre' | 'hoyre'
    role?: 'columnheader' | 'cell'
    ariaSort?: 'ascending' | 'descending' | 'none'
    /** A sortable header button fills the WHOLE cell (height + width) instead
     *  of just wrapping the label — mobile sweep 2026-09-19 measured 92x16px,
     *  well under the 40px tap-target target. Cell drops its own padding when
     *  `stretch` is set and lets flex's default `align-items: stretch` grow
     *  the button to the cell's full `min-h-11`. */
    stretch?: boolean
    children: ReactNode
  }) {
    return (
      <div role={role} aria-sort={ariaSort} className={cx('min-w-0 min-h-11 flex', stretch ? undefined : cx('px-3 py-2 items-center', align === 'hoyre' ? 'justify-end text-right tabular-nums' : 'justify-start text-left'))}>
        {children}
      </div>
    )
  }

  return (
    <div className={cx(!isPrint && 'rounded-[var(--frv-radius-md)] overflow-hidden border border-(color:--frv-border)', className)}>
      {minBredde && (
        <p
          className={cx(
            'sm:hidden type-label-12 flex items-center gap-1 px-3 py-1.5 border-b',
            isPrint ? 'text-(color:--frv-print-text-muted) border-(color:--frv-print-border)' : 'text-(color:--frv-text-tertiary) border-(color:--frv-border)',
          )}
        >
          <ArrowRightIcon size={11} /> Swipe the table to see everything
        </p>
      )}
      <div className="overflow-x-auto relative" tabIndex={0} aria-label="Table, scroll sideways as needed">
        <div
          role={semanticTable ? 'table' : undefined}
          className={minBredde ? 'min-w-(--table-min-bredde)' : undefined}
          style={{ '--table-grid-cols': gridTemplateColumns, '--table-min-bredde': minBredde } as CSSProperties}
        >
          <div
            role={semanticTable ? 'row' : undefined}
            className={cx(
              'grid grid-cols-(--table-grid-cols) border-b',
              isPrint ? 'bg-transparent border-(color:--frv-print-text-strong)' : 'bg-(color:--frv-surface-2) border-(color:--frv-border-2)',
            )}
          >
            {kolonner.map(k => {
              const active = !!k.sorterbar && sortKey === k.key
              const ariaSort = semanticTable && k.sorterbar ? (active ? (sortRetning === 'stigende' ? 'ascending' as const : 'descending' as const) : 'none' as const) : undefined
              const ChevronIcon = active && sortRetning === 'synkende' ? ChevronDownIcon : ChevronUpIcon
              return (
                <Cell key={k.key} align={k.align} role={semanticTable ? 'columnheader' : undefined} ariaSort={ariaSort} stretch={!!k.sorterbar}>
                  {k.sorterbar ? (
                    <button
                      type="button"
                      onClick={() => onSorter?.(k.key)}
                      className={cx(
                        'w-full min-h-11 flex items-center gap-1 px-3 py-2 type-label-13-strong transition-colors',
                        !isPrint && 'hover:text-[var(--frv-text-primary)] hover:bg-[var(--frv-gray-alpha-100)]',
                        k.align === 'hoyre' ? 'justify-end text-right tabular-nums flex-row-reverse' : 'justify-start text-left',
                        isPrint
                          ? (active ? 'text-(color:--frv-print-text-strong)' : 'text-(color:--frv-print-text-muted)')
                          : (active ? 'text-(color:--frv-text-primary)' : 'text-(color:--frv-text-secondary)'),
                      )}
                    >
                      {k.label}
                      <ChevronIcon size={12} aria-hidden="true" className={cx('shrink-0', active ? 'opacity-100' : 'opacity-[0.35]')} />
                    </button>
                  ) : (
                    <span className={cx('type-label-13-strong', isPrint ? 'text-(color:--frv-print-text-muted)' : 'text-(color:--frv-text-secondary)')}>{k.label}</span>
                  )}
                </Cell>
              )
            })}
          </div>
          <div role={semanticTable ? 'rowgroup' : undefined} className={cx('divide-y', isPrint ? 'divide-[var(--frv-print-border-subtle)]' : 'divide-[var(--frv-border)]')}>
            {rader.length === 0 ? (
              <div role={semanticTable ? 'row' : undefined} className="grid grid-cols-(--table-grid-cols)">
                <div role={semanticTable ? 'cell' : undefined} className={cx('py-8 text-center type-copy-13 col-span-full', isPrint ? 'text-(color:--frv-print-text-secondary)' : 'text-(color:--frv-text-tertiary)')}>
                  {tomTekst}
                </div>
              </div>
            ) : rader.map((rad, i) => {
              const clickable = interactive && !!radOnClick
              return (
                <div
                  key={radKey(rad)}
                  onClick={radOnClick ? () => radOnClick(rad) : undefined}
                  role={clickable ? 'button' : semanticTable ? 'row' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={clickable ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); radOnClick!(rad) } } : undefined}
                  className={cx(
                    'grid grid-cols-(--table-grid-cols) items-center',
                    striped && i % 2 === 1 && (isPrint ? 'bg-[var(--frv-print-surface)]' : 'bg-[var(--frv-gray-alpha-100)]'),
                    interactive && (isPrint ? 'hover:bg-[var(--frv-print-surface)] transition-colors' : 'hover:bg-[var(--frv-gray-alpha-100)] transition-colors'),
                    clickable && 'cursor-pointer',
                  )}
                  // Kept as a real style override (not a competing class) on purpose:
                  // this file's `cx` is a plain joiner, not tailwind-merge, so it
                  // can't dedupe two `bg-*`/`shadow-*` classes the way the app's
                  // `cn()` does — inline `style` is the only reliable way to make
                  // "marked row" win over "striped row" when both are true.
                  style={merketRadKey != null && radKey(rad) === merketRadKey ? { background: 'var(--frv-accent-light)', boxShadow: 'inset 3px 0 0 var(--frv-accent-border)' } : undefined}
                >
                  {kolonner.map(k => <Cell key={k.key} align={k.align} role={semanticTable && !clickable ? 'cell' : undefined}>{celle(rad, k.key) ?? '—'}</Cell>)}
                </div>
              )
            })}
          </div>
          {fot && (
            <div
              role={semanticTable ? 'row' : undefined}
              className={cx(
                'grid grid-cols-(--table-grid-cols) items-center border-t',
                isPrint ? 'bg-(color:--frv-print-surface) border-(color:--frv-print-border)' : 'bg-(color:--frv-surface-2) border-(color:--frv-border)',
              )}
            >
              {kolonner.map(k => <Cell key={k.key} align={k.align} role={semanticTable ? 'cell' : undefined}>{fot(k.key)}</Cell>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* Dokument — A4 print/PDF primitive (2026-09-14). All 11 print pages in the
   app (invoice, minutes/AGM protocol, owner register, tax basis, broker
   pack, dunning letters, …) hand-roll their own sheet/header/table/footer in
   inline styles today; this is the shared primitive for NEW ones (migration
   of the 11 existing pages is a separate wave, not part of this port).
   `--frv-print-*` tokens ONLY inside this family — a print document must
   look identical regardless of the sender's app theme (light/dark), the
   same reasoning as the print token block itself.

   `DokumentNokkelverdi` is NOT `DescriptionList` reused: same "label over
   value" role, but `DescriptionList` is hardcoded to the THEME-DEPENDENT
   `--frv-text-*` tokens — reusing it here would leak the app's current
   theme into a document that must always render as white paper.
   `DokumentTabell` IS `Table` — just `variant="print"` locked, see the
   `variant` doc comment on `TableProps` above.

   Wiring note: this component assumes your global stylesheet defines
   `.no-print { display: none !important }` inside `@media print` (for the
   `actions` slot), a base `@page { size: A4; margin: 20mm }`, and a
   `.doc-sheet` rule under `@media (max-width: 767px)` that shrinks the
   sheet's padding/radius and lets it scroll horizontally as a fallback —
   these documents are opened from an email link, almost always on a phone,
   and the sheet's desktop padding (56/64px) otherwise eats most of a 375px
   screen. The token file only carries `--frv-*` custom properties, not
   layout rules, so add all three yourself once, project-wide. */
export function Dokument({ actions, children, maxBredde = '210mm', aksent, minHeight = '100vh', sideskiftEtter, className }: {
  /** Screen-only action row (back link / print button), rendered ON the
   *  canvas, above the sheet. Hidden at print time via `no-print`. */
  actions?: ReactNode
  children: ReactNode
  /** Sheet max width. @default '210mm' (physical A4 width). */
  maxBredde?: string
  /** Optional 3px accent top border, e.g. a status color for a dunning letter. */
  aksent?: string
  /** Canvas min-height. @default '100vh'. Set to 'auto' when embedding
   *  `Dokument` inside another page's layout (e.g. a docs preview). */
  minHeight?: string
  /** `break-after: page` on the sheet — for multi-document print runs that
   *  render one `Dokument` per record in a loop (an invoice per unit): set
   *  `true` on all but the LAST, so each record becomes its own page. */
  sideskiftEtter?: boolean
  className?: string
}) {
  return (
    <div
      className="frv-dokument-lerret bg-(color:--frv-print-canvas) min-h-(--dokument-min-h) px-4 py-8"
      style={{ '--dokument-min-h': minHeight } as CSSProperties}
    >
      {actions}
      <div
        className={cx(
          'frv-dokument-ark type-copy-14 doc-sheet max-w-(--dokument-max-w) mx-auto rounded-[14px] shadow-(--frv-print-shadow) px-16 py-14 bg-(color:--frv-print-paper) text-(color:--frv-print-text)',
          aksent && 'border-t-[3px] border-t-(color:--dokument-aksent)',
          sideskiftEtter && 'break-after-page',
          className,
        )}
        style={{
          '--dokument-max-w': maxBredde,
          '--dokument-aksent': aksent,
        } as CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

export function DokumentHode({ orgNavn, tittel, undertittel, meta }: {
  /** Org/building name, shown as a small uppercase eyebrow. */
  orgNavn: string
  tittel: string
  undertittel?: ReactNode
  /** Meta row — date/version/org number. Free content, typically "·"-joined. */
  meta?: ReactNode
}) {
  return (
    <div className="mb-8">
      <p className="type-label-12-strong uppercase tracking-[0.1em] text-(color:--frv-print-text-muted) m-0">{orgNavn}</p>
      <h1 className="type-heading-24 text-(color:--frv-print-text-strong) mt-3 mx-0 mb-0">{tittel}</h1>
      {undertittel && <p className="type-copy-14 text-(color:--frv-print-text-secondary) mt-1.5 mx-0 mb-0">{undertittel}</p>}
      {meta && <p className="type-label-12 text-(color:--frv-print-text-muted) mt-2.5 mx-0 mb-0">{meta}</p>}
      <div className="border-b border-(color:--frv-print-border) mt-6" />
    </div>
  )
}

/** Recipient address block for a letter — placed right under `DokumentHode`,
 *  left-aligned. NOT `DokumentNokkelverdi`: an address reads as ONE
 *  continuous block, not scannable label/value pairs in columns. */
export function DokumentMottaker({ navn, adresselinjer, att, className }: {
  navn: string
  /** Street address, postal code/city, etc. — one line per element. */
  adresselinjer?: string[]
  /** "Att: NN", shown above the name — for a letter addressed to a named
   *  person at a recipient that is otherwise an organization/unit. */
  att?: string
  className?: string
}) {
  return (
    <div className={cx('mb-8', className)}>
      {att && <p className="type-label-12 text-(color:--frv-print-text-muted) mt-0 mx-0 mb-0.5">Att: {att}</p>}
      <p className="type-copy-14 text-(color:--frv-print-text-strong) m-0"><strong>{navn}</strong></p>
      {adresselinjer?.map((linje, i) => (
        <p key={i} className="type-copy-14 text-(color:--frv-print-text-secondary) m-0">{linje}</p>
      ))}
    </div>
  )
}

/** `tittel` optional — omit it to render only `children` (e.g. a document
 *  whose first section IS the content itself). `breakInside: avoid`: a
 *  section must never be split across a page break. `sideskiftFoer`:
 *  `break-before: page` on the section — force a page break RIGHT BEFORE it
 *  (e.g. to start an appendix on its own page). Same role as `sideskiftEtter`
 *  on `Dokument` above, just "before" and at section level. */
export function DokumentSeksjon({ tittel, children, sideskiftFoer, className }: { tittel?: string; children: ReactNode; sideskiftFoer?: boolean; className?: string }) {
  return (
    <div className={cx('mb-6 break-inside-avoid', sideskiftFoer && 'break-before-page', className)}>
      {tittel && <h2 className="type-heading-16 text-(color:--frv-print-text-strong) mt-0 mx-0 mb-3 pb-2 border-b border-(color:--frv-print-border)">{tittel}</h2>}
      {children}
    </div>
  )
}

export interface DokumentNokkelverdiItem { label: string; verdi: ReactNode }

export function DokumentNokkelverdi({ items, minColBredde = '10rem', className }: {
  items: DokumentNokkelverdiItem[]
  minColBredde?: string
  className?: string
}) {
  return (
    <div
      className={cx('grid grid-cols-(--dokument-nv-cols) gap-x-6 gap-y-3', className)}
      style={{ '--dokument-nv-cols': `repeat(auto-fit, minmax(${minColBredde}, 1fr))` } as CSSProperties}
    >
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <p className="type-label-12-strong mb-0.5 text-(color:--frv-print-text-secondary)">{it.label}</p>
          <p className="type-copy-14 text-(color:--frv-print-text)">{it.verdi}</p>
        </div>
      ))}
    </div>
  )
}

/** `Table` with `variant="print"` locked — full cell freedom, sort, `fot`
 *  sum row and "—" for unknown values are all inherited unchanged. */
export function DokumentTabell<T>(props: Omit<TableProps<T>, 'variant'>) {
  return <Table {...props} variant="print" />
}

/** Bounded box for payment info (KID/account number/amount) or a fund
 *  recommendation, etc. — content that should stand apart from running text
 *  without being a whole `DokumentSeksjon`. `break-inside: avoid`, same
 *  reason as the section: must never be split across a page break. */
export function DokumentMerknad({ tittel, children, tone = 'default', className }: {
  /** Omit to render only `children` — e.g. a payment-info box with no
   *  heading of its own (today's pattern in invoice/dunning letters). */
  tittel?: string
  children: ReactNode
  /** `viktig` adds a left accent border (`--frv-print-accent`, decor only —
   *  see the token's warning comment) for content that should stand out more
   *  than a plain payment-info box, e.g. a fund recommendation. `advarsel`
   *  switches the WHOLE box to `--frv-print-status-danger-*` (bg/border/text)
   *  for content that needs immediate action, e.g. urgent findings in a
   *  condition report — not just something that should stand out a little. */
  tone?: 'default' | 'viktig' | 'advarsel'
  className?: string
}) {
  const advarsel = tone === 'advarsel'
  return (
    <div
      className={cx(
        'type-copy-14 rounded-[10px] py-[18px] px-[22px] border break-inside-avoid',
        advarsel
          ? 'bg-(color:--frv-print-status-danger-bg) border-(color:--frv-print-status-danger-border) text-(color:--frv-print-status-danger-text)'
          : 'bg-(color:--frv-print-surface) border-(color:--frv-print-border) text-(color:--frv-print-text)',
        tone === 'viktig' && 'border-l-[3px] border-l-(color:--frv-print-accent)',
        className,
      )}
    >
      {tittel && (
        <p
          className={cx(
            'type-label-12-strong uppercase tracking-[0.06em] mt-0 mx-0 mb-2',
            advarsel ? 'text-(color:--frv-print-status-danger-text)' : 'text-(color:--frv-print-text-secondary)',
          )}
        >
          {tittel}
        </p>
      )}
      {children}
    </div>
  )
}

/** Small status/priority pill for use inside a `DokumentTabell` cell or next
 *  to running text — 2px 9px, radius full, 10px/600. `noytral` is added on
 *  top of the four priorities, for a label that isn't a priority (status,
 *  category). `--frv-print-status-*`/`--frv-print-*` tokens ONLY, never
 *  `--frv-*` theme tokens — same rule as the rest of the Dokument family. */
const DOKUMENT_ETIKETT_TONE: Record<'akutt' | 'hoy' | 'middels' | 'lav' | 'noytral', string> = {
  akutt:   'bg-(color:--frv-print-status-danger-bg) text-(color:--frv-print-status-danger-text)',
  hoy:     'bg-(color:--frv-print-status-warning-bg) text-(color:--frv-print-status-warning-text)',
  middels: 'bg-(color:--frv-print-status-info-bg) text-(color:--frv-print-status-info-text)',
  lav:     'bg-(color:--frv-print-status-success-bg) text-(color:--frv-print-status-success-text)',
  noytral: 'bg-(color:--frv-print-surface) text-(color:--frv-print-text)',
}
export function DokumentEtikett({ tone = 'noytral', children, className }: {
  tone?: 'akutt' | 'hoy' | 'middels' | 'lav' | 'noytral'
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cx('inline-block py-0.5 px-[9px] rounded-(--frv-radius-full) text-[10px] font-semibold', DOKUMENT_ETIKETT_TONE[tone], className)}>
      {children}
    </span>
  )
}

/** Generalized from the two existing AGM-protocol pages' `.signature-line`/
 *  `.sig` idiom (always three role names there). Default is the two fields
 *  requested — place/date and signature — but any number of labels works to
 *  reproduce role-based signing (e.g. `['Chair', 'Deputy chair', 'Board member']`). */
export function DokumentSignatur({ felter = ['Sted og dato', 'Underskrift'], className }: { felter?: string[]; className?: string }) {
  return (
    <div
      className={cx('grid grid-cols-(--dokument-sig-cols) gap-8 mt-12', className)}
      style={{ '--dokument-sig-cols': `repeat(${felter.length}, minmax(0, 1fr))` } as CSSProperties}
    >
      {felter.map((felt, i) => (
        <div key={i} className="border-t border-t-(color:--frv-print-text-muted) pt-2">
          <div className="h-9" aria-hidden="true" />
          <p className="type-label-12 text-(color:--frv-print-text-secondary) m-0">{felt}</p>
        </div>
      ))}
    </div>
  )
}

export function DokumentFot({ orgNavn, generertDato, className }: {
  orgNavn?: string
  /** Pre-formatted date, e.g. "14 September 2026" — the component doesn't format it itself. */
  generertDato: string
  className?: string
}) {
  return (
    <div className={cx('flex items-center justify-between flex-wrap gap-2 mt-10 pt-4 border-t border-(color:--frv-print-border)', className)}>
      <span className="type-label-12 text-(color:--frv-print-text-faint)">{orgNavn}</span>
      <span className="type-label-12 text-(color:--frv-print-text-faint)">Generated by Frivio {generertDato}</span>
    </div>
  )
}

/** Field — metadata inside an existing surface: a small key (`label-12-strong`
 *  — it NAMES the field, same three-weight rule as `Text` above) over a
 *  value (`label-14`). Chrome-less — inherits the surface it sits on; a KPI
 *  number with card chrome is `StatCard`, not this. */
export function Field({ label, mono = false, valueStyle, className, children }: {
  /** The label above the value. `ReactNode` so a small icon can accompany the text. */
  label: ReactNode
  /** Mono value (reference numbers, org numbers). */
  mono?: boolean
  /** Override the value color (e.g. a status color on an expiry date). */
  valueStyle?: CSSProperties
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cx('flex flex-col gap-[var(--frv-space-1)] min-w-0', className)}>
      {/* 13px, not 12: same role ("label/field name") and size as Input/Select/Table's
          label, so "Email" looks the same in read and edit mode (typography hierarchy, 2026-09-13). */}
      <span className="type-label-13-strong flex items-center gap-1 text-(color:--frv-text-primary)">{label}</span>
      <div className={cx(mono ? 'type-label-14-mono' : 'type-label-14', 'text-(color:--frv-text-primary)')} style={valueStyle}>{children}</div>
    </div>
  )
}

/** Prop names mirror the source exactly (`verdi`, `minColBredde`) — this is
 *  Frivio's own Norwegian system API, not translated. */
export interface DescriptionItem { label: string; verdi: ReactNode }

/** DescriptionList — shared "label over value" grid for a set of plain fact
 *  fields on a surface (a section's key figures, a property's data). Not for
 *  longer free text (use `Text`) or lists of uniform rows (use `ListRow`). */
export function DescriptionList({ items, minColBredde = '10rem', className }: {
  items: DescriptionItem[]
  /** Minimum column width before the grid drops to fewer columns. */
  minColBredde?: string
  className?: string
}) {
  return (
    <div
      className={cx('grid grid-cols-(--desclist-cols) gap-x-6 gap-y-3', className)}
      style={{ '--desclist-cols': `repeat(auto-fit, minmax(${minColBredde}, 1fr))` } as CSSProperties}
    >
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          {/* label-13-strong in text-secondary, not tertiary — 500 weight in tertiary measures too weak.
              13px, same as Input's label: same role, same size (typography hierarchy, 2026-09-13). */}
          <p className="type-label-13-strong mb-0.5 text-(color:--frv-text-primary)">{it.label}</p>
          <p className="type-copy-14 text-(color:--frv-text-primary)">{it.verdi}</p>
        </div>
      ))}
    </div>
  )
}

export interface PaginationProps {
  /** Current page, 1-indexed. */
  side: number
  /** Total number of pages. */
  antall: number
  onChange: (side: number) => void
  ariaLabel?: string
  className?: string
}

function paginationPageList(side: number, antall: number): (number | 'ellipse')[] {
  if (antall <= 7) return Array.from({ length: antall }, (_, i) => i + 1)
  const unique = Array.from(new Set([1, antall, side, side - 1, side + 1].filter(n => n >= 1 && n <= antall))).sort((a, b) => a - b)
  const result: (number | 'ellipse')[] = []
  unique.forEach((n, i) => { if (i > 0 && n - unique[i - 1]! > 1) result.push('ellipse'); result.push(n) })
  return result
}

/** Pagination — "Previous"/"Next" as `Button variant="tertiary" size="sm"`
 *  with a leading/trailing chevron; page numbers as the same button in
 *  `shape="square"`; the current page is `variant="secondary"` +
 *  `aria-current="page"`. More than 7 pages: always first, last, current and
 *  its neighbours, the rest collapsed into "…" per gap. Renders nothing at
 *  0-1 pages. Prop names (`side`, `antall`) mirror the source exactly. */
export function Pagination({ side, antall, onChange, ariaLabel = 'Page navigation', className }: PaginationProps) {
  if (antall <= 1) return null
  const pages = paginationPageList(side, antall)

  return (
    <nav aria-label={ariaLabel} className={cx('flex flex-wrap items-center gap-[var(--frv-space-1)]', className)}>
      <Button variant="tertiary" size="sm" aria-label="Previous page" disabled={side <= 1} onClick={() => onChange(side - 1)}>
        <ChevronLeftIcon size={14} /> Previous
      </Button>
      {pages.map((s, i) => s === 'ellipse' ? (
        <span key={`ellipse-${i}`} aria-hidden="true" className="type-label-13 px-1" style={{ color: 'var(--frv-text-tertiary)' }}>…</span>
      ) : (
        <Button key={s} variant={s === side ? 'secondary' : 'tertiary'} size="sm" shape="square" aria-label={`Page ${s}`} aria-current={s === side ? 'page' : undefined} onClick={() => onChange(s)}>
          {s}
        </Button>
      ))}
      <Button variant="tertiary" size="sm" aria-label="Next page" disabled={side >= antall} onClick={() => onChange(side + 1)}>
        Next <ChevronRightIcon size={14} />
      </Button>
    </nav>
  )
}

export type LoadBarTone = 'default' | 'accent' | 'success' | 'warning' | 'error'

/** Exported so `Progress` can share the exact same color recipe. */
export const LOADBAR_TONE_COLOR: Record<LoadBarTone, string> = {
  default: 'var(--frv-text-primary)', accent: 'var(--frv-accent)', success: 'var(--frv-teal-700)', warning: 'var(--frv-amber-700)', error: 'var(--frv-red-700)',
}

/** LoadBar — a horizontal bar showing AMOUNT relative to the other rows in a
 *  set (`max` is the largest value in the SET, bars compare to EACH OTHER —
 *  "where is there a lot"). NOT `StatCard` (one number, no comparison) and
 *  NOT `Badge` (status, not amount). `tone` is explicit, not derived from
 *  the value — the caller knows what "a lot" means in context.
 *
 *  `label`/`verdi` (2026-09-12, optional): draw a heading row ABOVE the
 *  track — the label in `label-14`, the value in `heading-14 tabular-nums`,
 *  both `--frv-text-primary` (not secondary/tertiary, so they carry the
 *  same weight the source's Spectrum comparison asked for). Without the
 *  two props the output is exactly as before (just the track). Text never
 *  sits on top of the fill: the fill is a 700-step SURFACE and carries no
 *  text, so no `-fg` is needed. */
export function LoadBar({ value, max, tone = 'default', label, verdi, className }: {
  value: number
  /** Highest value in the set — the basis for how full the bar is. */
  max: number
  tone?: LoadBarTone
  /** Label in the heading row above the track (`label-14`, text-primary). */
  label?: string
  /** Pre-formatted value on the right of the heading row, e.g. "7 of 10" (`label-14-strong`, tabular-nums). */
  verdi?: string
  className?: string
}) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const hasHeading = label !== undefined || verdi !== undefined

  const track = (
    <div className={cx('h-1.5 w-full rounded-[var(--frv-radius-full)] overflow-hidden bg-(color:--frv-gray-alpha-200)', !hasHeading && className)} aria-hidden>
      <div
        className="h-full rounded-[var(--frv-radius-full)] transition-[width] duration-300 w-(--loadbar-w) bg-(color:--loadbar-color)"
        style={{ '--loadbar-w': `${share * 100}%`, '--loadbar-color': LOADBAR_TONE_COLOR[tone] } as CSSProperties}
      />
    </div>
  )

  if (!hasHeading) return track

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 mb-2 min-w-0">
        {label !== undefined && <span className="type-label-14 truncate min-w-0 text-(color:--frv-text-primary)">{label}</span>}
        {verdi !== undefined && <span className="type-heading-14 tabular-nums shrink-0 ml-auto text-(color:--frv-text-primary)">{verdi}</span>}
      </div>
      {track}
    </div>
  )
}

/** Progress — a horizontal bar showing the SHARE of ONE whole
 *  completed (`verdi` is already a percentage, 0-100 — "how far have WE
 *  come"), with no other rows to measure against. One line per row in a
 *  list is almost always `LoadBar`; ONE line summarizing progress is this.
 *  `ariaLabel` is required: `role="progressbar"` with no accessible name
 *  announces "progressbar, 75%" without saying 75% of WHAT. Prop names
 *  (`verdi`, `hoyde`) mirror the source exactly. */
export function Progress({ verdi, hoyde = 6, tone = 'accent', className, ariaLabel }: {
  /** 0-100. Clamped to the range. */
  verdi: number
  /** Track height in px. Default 6. */
  hoyde?: number
  tone?: LoadBarTone
  className?: string
  /** Accessible name — WHAT this is progress IN. Required. */
  ariaLabel: string
}) {
  const share = Math.min(100, Math.max(0, verdi))
  return (
    <div
      className={cx('rounded-full overflow-hidden bg-(color:--frv-gray-alpha-200) h-(--progress-h)', className)}
      style={{ '--progress-h': `${hoyde}px` } as CSSProperties}
      role="progressbar" aria-label={ariaLabel} aria-valuenow={Math.round(share)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="h-full rounded-full transition-[width] duration-300 w-(--progress-w) bg-(color:--progress-color)"
        style={{ '--progress-w': `${share}%`, '--progress-color': LOADBAR_TONE_COLOR[tone] } as CSSProperties}
      />
    </div>
  )
}

export type IconTileTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
export type IconTileSize = 'sm' | 'md' | 'lg'

/** Exported so `StepCard` can share the exact same tone recipe for its
 *  number-disc fallback. */
export const ICON_TILE_TONE: Record<IconTileTone, { bg: string; fg: string }> = {
  accent: { bg: 'var(--frv-accent-light)', fg: 'var(--frv-accent-text)' },
  success: { bg: 'var(--frv-success-light)', fg: 'var(--frv-success-text)' },
  warning: { bg: 'var(--frv-warning-light)', fg: 'var(--frv-warning-text)' },
  danger: { bg: 'var(--frv-error-light)', fg: 'var(--frv-error-text)' },
  neutral: { bg: 'var(--frv-neutral-light)', fg: 'var(--frv-text-secondary)' },
}

const IKONBRIKKE_SIZE: Record<IconTileSize, { box: number; icon: number; radius: string }> = {
  sm: { box: 20, icon: 12, radius: 'var(--frv-radius-sm)' },
  md: { box: 32, icon: 16, radius: 'var(--frv-radius-sm)' },
  lg: { box: 40, icon: 18, radius: 'var(--frv-radius-md)' },
}

/** IconTile — a rounded, tonally-tinted icon tile. The tone sets background
 *  AND icon color TOGETHER, never separately — a tinted background with an
 *  inconsistent icon color is exactly the drift this component prevents. */
export function IconTile({ icon: Icon, tone = 'accent', size = 'lg', className, style }: {
  icon: IconComponent
  tone?: IconTileTone
  size?: IconTileSize
  className?: string
  style?: CSSProperties
}) {
  const t = ICON_TILE_TONE[tone]
  const s = IKONBRIKKE_SIZE[size]
  return (
    <span className={cx('inline-flex items-center justify-center shrink-0', className)} style={{ width: s.box, height: s.box, borderRadius: s.radius, background: t.bg, color: t.fg, ...style }}>
      <Icon size={s.icon} />
    </span>
  )
}

/** StepCard — "icon tile + heading-14 + copy-13", the card that explains ONE
 *  step in a short explanatory sequence ("How it works", "Get started").
 *  `steg` (a number disc) is mutually exclusive with `icon` — for a sequence
 *  where ORDER is the point, not what each step symbolizes. Wave 3
 *  (founder: "subtle blue gets lost in the background"): default `tone` is
 *  `neutral`, and the neutral itself is STRONGER than IconTile's own
 *  neutral (gray-alpha-200 + text-primary here, vs. gray-alpha-100 +
 *  text-secondary elsewhere) via IconTile's own `style` override. The card
 *  carries its own border (`--frv-shadow-border`) and radius-md — it IS the
 *  card now, not just content an external `<Card>` wraps. */
export function StepCard({ icon: Icon, steg, title, description, tone = 'neutral', className }: {
  icon?: IconComponent
  /** Number disc instead of an icon. Mutually exclusive with `icon` — set only one. */
  steg?: number
  title: string
  description: string
  tone?: IconTileTone
  className?: string
}) {
  const isNeutral = tone === 'neutral'
  const t = ICON_TILE_TONE[tone]
  const neutralOverride = { background: 'var(--frv-gray-alpha-200)', color: 'var(--frv-text-primary)' }
  return (
    <div className={cx('flex flex-col gap-3 rounded-[var(--frv-radius-md)] p-5 shadow-(--frv-shadow-border)', className)}>
      {Icon ? (
        <IconTile icon={Icon} tone={tone} size="md" style={isNeutral ? neutralOverride : undefined} />
      ) : steg != null ? (
        <span className="w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0 type-button-12" style={isNeutral ? neutralOverride : { background: t.bg, color: t.fg }}>{steg}</span>
      ) : null}
      <div>
        <p className="type-heading-14">{title}</p>
        {/* max-w-[65ch]: running description text with no width cap stretched to
            the card's full width in a wide row — lines over ~90 characters are
            harder to read than the ~65-character readability standard for
            running text. */}
        <p className="type-copy-13 mt-1 max-w-[65ch] text-(color:--frv-text-tertiary)">{description}</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   5. NAVIGATION & OVERLAY — Tabs, PillTabs, YearSelector, PeriodeVelger,
      SectionHeader, Modal (+ ModalBody/ModalActions), ConfirmDialog,
      OverflowMenu, CollapsibleSection
   ══════════════════════════════════════════════════════════════════════════ */

/** True when `prefers-reduced-motion: reduce` is set — used to skip the
 *  sliding-underline animation on `Tabs`. */
function frvSubscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}
function frvReadReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches }
function frvReadReducedMotionServer() { return false }
function usePrefersReducedMotion() { return useSyncExternalStore(frvSubscribeReducedMotion, frvReadReducedMotion, frvReadReducedMotionServer) }

export interface TabItem {
  key: string
  label: string
  /** Required in link mode (default). Omitted in button mode (`onSelect` on the component). */
  href?: string
  icon?: IconComponent
  disabled?: boolean
  /** Count badge after the label. 0/undefined shows none. */
  badge?: number
}

interface TabsProps {
  tabs: TabItem[]
  activeKey: string
  /** Switches to button mode: every tab renders as `<button>` instead of `<a>`, and `tabs[].href` isn't needed. */
  onSelect?: (key: string) => void
  /** `default` = sliding underline. `secondary` = no underline, the active tab gets a background fill instead. */
  variant?: 'default' | 'secondary'
  /** Accessible name for the tab row. Set it when a page has more than one tab row. */
  ariaLabel?: string
  /** Kept for API parity with the source (which passes it to `next/link`) — a plain `<a>` always does a normal navigation, so this is a no-op here. */
  scroll?: boolean
  className?: string
}

/* Tabs
   Underline tabs (à la Linear/Vercel), replacing a button-like bottom-border
   pattern — see SKILL.md for why the SHAPE (not the color) is what separates
   a tab from a button. Kept: count badge, scroll-active-tab-into-view on
   mount, link-/button-mode. Dropped for portability: the `.tabs-fade`
   scroll-edge gradient hint (a CSS `:has()` rule in the app stylesheet) —
   the tab row still scrolls horizontally, it just has no fade cue at the
   edges. */
export function Tabs({ tabs, activeKey, onSelect, variant = 'default', ariaLabel, scroll = true, className }: TabsProps) {
  void scroll
  const scrollRef = useRef<HTMLElement | null>(null)
  const tabRefs = useRef(new Map<string, HTMLElement>())
  const underlineRef = useRef<HTMLSpanElement>(null)
  // First placement of the underline happens WITHOUT animation (otherwise it
  // slides in from the left edge on every mount) — only animated from the
  // second placement onward.
  const hasMounted = useRef(false)
  const reducedMotion = usePrefersReducedMotion()
  const buttonMode = !!onSelect

  const setScrollRef = useCallback((el: HTMLElement | null) => { scrollRef.current = el }, [])
  const setTabRef = useCallback((key: string) => (el: HTMLElement | null) => { if (el) tabRefs.current.set(key, el); else tabRefs.current.delete(key) }, [])

  const placeUnderline = useCallback((animated: boolean) => {
    const el = underlineRef.current
    if (!el) return
    const active = tabRefs.current.get(activeKey)
    if (!active) { el.style.opacity = '0'; return }
    el.style.transition = animated && !reducedMotion ? 'transform var(--frv-duration-state) var(--frv-ease-spring), width var(--frv-duration-state) var(--frv-ease-spring)' : 'none'
    el.style.opacity = '1'
    el.style.transform = `translateX(${active.offsetLeft}px)`
    el.style.width = `${active.offsetWidth}px`
  }, [activeKey, reducedMotion])

  useLayoutEffect(() => {
    if (variant !== 'default') return
    placeUnderline(hasMounted.current)
    hasMounted.current = true
  }, [variant, placeUnderline, tabs])

  // Scroll the active tab into view on mount/change — horizontally, within
  // the row itself only (never the document, via a manual `scrollLeft`
  // rather than `scrollIntoView`).
  useLayoutEffect(() => {
    const box = scrollRef.current
    const tab = tabRefs.current.get(activeKey)
    if (!box || !tab) return
    if (box.scrollWidth <= box.clientWidth) return
    const target = tab.offsetLeft - (box.clientWidth - tab.offsetWidth) / 2
    box.scrollLeft = Math.max(0, Math.min(target, box.scrollWidth - box.clientWidth))
  }, [activeKey])

  useLayoutEffect(() => {
    const box = scrollRef.current
    if (!box || variant !== 'default') return
    const ro = new ResizeObserver(() => placeUnderline(false))
    ro.observe(box)
    return () => ro.disconnect()
  }, [variant, placeUnderline])

  const enabled = tabs.filter(t => !t.disabled)

  function onKeyDown(e: ReactKeyboardEvent) {
    if (!onSelect || enabled.length === 0) return
    const idx = enabled.findIndex(t => t.key === activeKey)
    let target: TabItem | undefined
    if (e.key === 'ArrowRight') target = enabled[(idx + 1 + enabled.length) % enabled.length]
    else if (e.key === 'ArrowLeft') target = enabled[(idx - 1 + enabled.length) % enabled.length]
    else if (e.key === 'Home') target = enabled[0]
    else if (e.key === 'End') target = enabled[enabled.length - 1]
    if (!target) return
    e.preventDefault()
    onSelect(target.key)
    tabRefs.current.get(target.key)?.focus()
  }

  function tabClass(tab: TabItem, active: boolean) {
    return cx(
      'group relative flex shrink-0 items-center h-10 px-3 whitespace-nowrap transition-colors motion-reduce:transition-none',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
      'aria-disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none',
      active ? 'text-[var(--frv-text-primary)]' : 'text-[var(--frv-text-secondary)] hover:text-[var(--frv-text-primary)]',
    )
  }

  function tabContent(tab: TabItem, active: boolean) {
    const Icon = tab.icon
    return (
      <span className={cx('relative flex items-center gap-1.5 px-1.5 -mx-1.5 py-1 rounded-[var(--frv-radius-sm)] transition-colors motion-reduce:transition-none', variant === 'secondary' && active ? 'bg-[var(--frv-gray-alpha-200)]' : !tab.disabled && 'group-hover:bg-[var(--frv-gray-alpha-100)]')}>
        {Icon && <Icon size={16} />}
        {/* Active tab NAMES a view (400 reads, 500 names) → type-label-14-strong;
            inactive stays 400. The weight swap shifts glyph width a few px, so
            an invisible -strong copy sits in the same grid cell and always
            reserves the wider of the two — the tab never changes width when it
            becomes/stops being active. */}
        <span className="grid">
          <span aria-hidden className="invisible col-start-1 row-start-1 type-label-14-strong">{tab.label}</span>
          <span className={cx('col-start-1 row-start-1', active ? 'type-label-14-strong' : 'type-label-14')}>{tab.label}</span>
        </span>
        {typeof tab.badge === 'number' && tab.badge > 0 && (
          <span className="type-label-12 min-w-4 px-1 inline-flex items-center justify-center rounded-[var(--frv-radius-full)] bg-(color:--frv-gray-alpha-200)">{tab.badge}</span>
        )}
      </span>
    )
  }

  function renderTab(tab: TabItem) {
    const active = tab.key === activeKey
    const cls = tabClass(tab, active)
    if (buttonMode) {
      return (
        <button key={tab.key} ref={setTabRef(tab.key)} type="button" role="tab" aria-selected={active} disabled={tab.disabled} tabIndex={tab.disabled ? -1 : active ? 0 : -1} onClick={() => onSelect!(tab.key)} className={cls}>
          {tabContent(tab, active)}
        </button>
      )
    }
    return (
      <a key={tab.key} ref={setTabRef(tab.key) as unknown as (el: HTMLAnchorElement | null) => void} href={tab.disabled ? '#' : (tab.href ?? '#')} aria-current={active ? 'page' : undefined} aria-disabled={tab.disabled || undefined} tabIndex={tab.disabled ? -1 : undefined} onClick={tab.disabled ? e => e.preventDefault() : undefined} className={cls}>
        {tabContent(tab, active)}
      </a>
    )
  }

  const underline = variant === 'default' ? <span ref={underlineRef} aria-hidden className="absolute bottom-0 h-0.5 bg-[var(--frv-text-primary)] opacity-0" /> : null

  return (
    <div className={cx('border-b border-(color:--frv-border)', className)}>
      {buttonMode ? (
        <div ref={setScrollRef as unknown as (el: HTMLDivElement | null) => void} role="tablist" aria-label={ariaLabel} className="relative flex overflow-x-auto -mb-px" onKeyDown={onKeyDown}>
          {tabs.map(renderTab)}
          {underline}
        </div>
      ) : (
        <nav ref={setScrollRef as unknown as (el: HTMLElement | null) => void} aria-label={ariaLabel} className="relative flex overflow-x-auto -mb-px">
          {tabs.map(renderTab)}
          {underline}
        </nav>
      )}
    </div>
  )
}

export interface PillTab {
  key: string
  label: string
  /** Link mode: navigate to href. Omitted for button mode (`onSelect`). */
  href?: string
}

const PILLTABS_GAP = 6 // gap-1.5

/** PillTabs — compact SEGMENTED control (not loose pills): a shared track,
 *  the active tab lifted out of it by INVERTING (bg-text-primary/text-bg),
 *  not elevation. Loose pills of the same shape as `Button variant=
 *  "secondary"` read as two equal buttons instead of selected/unselected —
 *  the fix is the shape, not the color, so the two forms can never be
 *  confused even in grayscale. `overflow` (default true) measures available
 *  width and collapses tabs that don't fit into a trailing `OverflowMenu`
 *  trigger showing the COUNT of hidden tabs ("+2", not a bare "…") — the
 *  active tab is always kept visible even if that means swapping another
 *  one out. Falls back to `window.location.href` for overflow-menu
 *  navigation instead of `next/navigation`'s router. `size="md"` matches
 *  the 40px height of `SearchInput`/`Button` md for use inside a `Toolbar`;
 *  `size="sm"` (default) is for ordinary in-content filters. PillTabs is a
 *  FILTER within one view — a view switch is `Tabs`, a period is
 *  `YearSelector`; the three must never look alike. */
export function PillTabs({
  tabs, activeKey, onSelect, label, scroll = true, overflow = true, size = 'sm', fullBredde = false,
}: {
  tabs: PillTab[]
  activeKey: string
  /** Button mode: called with the selected key. Used when the tabs are client state, not routing. */
  onSelect?: (key: string) => void
  /** Optional small label in front of the pills (e.g. "Building"). */
  label?: string
  /** No-op here — kept for API parity with the source's `next/link` `scroll` prop. */
  scroll?: boolean
  /** Collapse tabs that don't fit into a trailing "…" `OverflowMenu`. Set `false` where wrapping to a second line is actually wanted. */
  overflow?: boolean
  /** `sm` (28px pills, 32px track) in content. `md` (36px pills, 40px track) next to a `SearchInput`/`Button` md in a `Toolbar`, so the row gets ONE height. */
  size?: 'sm' | 'md'
  /** Ported 2026-09-20 — the track and every pill fill the parent's width equally (`flex-1`, centered,
   *  truncates) instead of the track's own content width. Forces overflow collection off (all pills
   *  always shown). For a section switcher INSIDE A CARD — never in a `Toolbar`, where `PillTabs`
   *  should keep its own natural width next to search/buttons. */
  fullBredde?: boolean
}) {
  void scroll
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  // Before measuring, everything is shown — if the measurement never runs
  // (server, JS off), the result is the old wrapping behavior, never a row
  // with hidden tabs.
  const [visibleCount, setVisibleCount] = useState(tabs.length)
  // fullBredde overrides overflow collection regardless of the caller's value.
  const overflowAktiv = overflow && !fullBredde

  useLayoutEffect(() => {
    if (!overflowAktiv) return
    const wrap = wrapRef.current
    const measure = measureRef.current
    if (!wrap || !measure) return

    function recompute() {
      const measure = measureRef.current
      const wrap = wrapRef.current
      if (!measure || !wrap) return
      const kids = Array.from(measure.children) as HTMLElement[]
      const hasLabel = !!label
      const labelWidth = hasLabel ? kids[0].offsetWidth + 4 + PILLTABS_GAP : 0 // +4 = mr-1
      const pillWidths = kids.slice(hasLabel ? 1 : 0, -1).map(el => el.offsetWidth)
      const triggerWidth = kids[kids.length - 1].offsetWidth

      // Measured against the PARENT's inner width, not the row itself — the
      // row shrinks to its own content in a flex parent, so measuring itself
      // would shrink the moment a tab is hidden and never recover.
      const parent = wrap.parentElement
      if (!parent) return
      const pcs = getComputedStyle(parent)
      const TRACK_CHROME = 6 // p-0.5 (2px) + 1px border on each side
      const available = parent.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight) - labelWidth - TRACK_CHROME
      if (available <= 0) { setVisibleCount(tabs.length); return }

      const fits = (count: number, withTrigger: boolean) => {
        let sum = withTrigger ? triggerWidth + PILLTABS_GAP : 0
        for (let i = 0; i < count; i++) sum += pillWidths[i] + (i > 0 || withTrigger ? PILLTABS_GAP : 0)
        return sum <= available
      }

      if (fits(pillWidths.length, false)) { setVisibleCount(tabs.length); return }
      let n = pillWidths.length - 1
      while (n > 1 && !fits(n, true)) n--
      setVisibleCount(n)
    }

    recompute()
    const ro = new ResizeObserver(recompute)
    if (wrap.parentElement) ro.observe(wrap.parentElement)
    return () => ro.disconnect()
  }, [tabs, overflowAktiv, label])

  const pillClass = (active: boolean) =>
    cx(
      'min-h-10 lg:min-h-0 inline-flex items-center rounded-[var(--frv-radius-full)] transition-colors motion-reduce:transition-none whitespace-nowrap',
      fullBredde ? 'flex-1 justify-center text-center min-w-0 px-0.5 sm:px-3' : 'px-3',
      size === 'md' ? 'h-9' : 'h-7',
      active ? 'bg-[var(--frv-text-primary)] text-[var(--frv-bg)]' : 'text-[var(--frv-text-secondary)] hover:bg-[var(--frv-gray-alpha-100)]',
    )
  const trackClass = cx(
    'items-center gap-1.5 p-px rounded-[var(--frv-radius-full)] bg-[var(--frv-surface)] border border-[var(--frv-border)] min-w-0',
    fullBredde ? 'flex w-full' : 'inline-flex',
  )

  /* Active pill NAMES (400 reads, 500 names) → -strong, which shifts glyph
     width a few px. An invisible -strong copy in the same grid cell always
     reserves the wider of the two, so a pill never changes width on
     activation — same trick as `Tabs` above. Used for BOTH the real pills
     and the measuring row, so the overflow calculation measures the real
     (reserved) width, not the narrower 400 width. */
  const strongClass = size === 'md' ? 'type-label-14-strong' : 'type-label-13-strong'
  const baseClass = size === 'md' ? 'type-label-14' : 'type-label-13'
  const pillLabel = (label: string, active: boolean) => (
    <span className={cx('grid', fullBredde && 'min-w-0 w-full')}>
      <span aria-hidden className={cx('invisible col-start-1 row-start-1', strongClass, fullBredde && 'truncate')}>{label}</span>
      <span className={cx('col-start-1 row-start-1', active ? strongClass : baseClass, fullBredde && 'truncate')}>{label}</span>
    </span>
  )

  function renderPill(t: PillTab) {
    const active = t.key === activeKey
    return t.href ? (
      <a key={t.key} href={t.href} className={pillClass(active)} aria-current={active ? 'page' : undefined}>{pillLabel(t.label, active)}</a>
    ) : (
      <button key={t.key} type="button" onClick={() => onSelect?.(t.key)} className={pillClass(active)} aria-pressed={active}>{pillLabel(t.label, active)}</button>
    )
  }

  const visibleCountResolved = overflowAktiv ? visibleCount : tabs.length
  let shown = tabs.slice(0, visibleCountResolved)
  let hidden = tabs.slice(visibleCountResolved)

  // The ACTIVE tab is always kept visible — swapped in for the last shown
  // slot rather than left in the "…" menu, so "what am I looking at" always
  // matches what's on screen.
  if (hidden.some(t => t.key === activeKey) && shown.length > 0) {
    const active = tabs.find(t => t.key === activeKey)!
    const displaced = shown[shown.length - 1]
    shown = [...shown.slice(0, -1), active]
    hidden = [displaced, ...hidden.filter(t => t.key !== activeKey)]
  }

  return (
    <div ref={wrapRef} className={cx('relative flex items-center gap-1.5 min-w-0', fullBredde && 'w-full')}>
      {/* Measuring row: same markup, no space in the layout. Widths can't be
          computed from character count (the font isn't guaranteed loaded at
          first render), so the real pill is measured. Clipped to zero width
          so it can't stretch the nearest scroll container sideways. */}
      <div ref={measureRef} aria-hidden className="absolute left-0 top-0 flex items-center invisible pointer-events-none w-0 overflow-hidden whitespace-nowrap [&>*]:shrink-0">
        {label && <span className="type-label-12 mr-1">{label}</span>}
        {tabs.map(t => <span key={t.key} className={pillClass(false)}>{pillLabel(t.label, false)}</span>)}
        <OverflowMenu items={[{ label: 'measure', onClick: () => {} }]} />
      </div>

      {label && <span className="type-label-12 mr-1 shrink-0" style={{ color: 'var(--frv-text-tertiary)' }}>{label}</span>}
      <div className={trackClass}>{shown.map(renderPill)}</div>
      {hidden.length > 0 && (
        <OverflowMenu
          ariaLabel={`${hidden.length} more`}
          // Shows the COUNT of hidden tabs ("+2") instead of a bare ellipsis —
          // an ellipsis alone doesn't say how MUCH is hidden.
          triggerContent={<span className="type-label-12 tabular-nums" aria-hidden>+{hidden.length}</span>}
          items={hidden.map(t => ({ label: t.label, onClick: () => { if (t.href) window.location.href = t.href; else onSelect?.(t.key) } }))}
        />
      )}
    </div>
  )
}

/* YearSelector — shared year stepper. The arrows should be AVAILABLE, not
   DOMINANT: one shared frame (same border/surface as `Button variant=
   "secondary"`) around the whole control, so the frame alone carries the
   control's visual weight and the year in the middle stays the heaviest
   element. The arrows grow to 44px height under the same `lg:` breakpoint
   the frame itself uses, so they're never cramped on touch.

   NOTE — kit-only deviation: the source's arrows are `IconButton size="sm"`
   (32px desktop / 44px touch). This kit's `IconButton` has no `size` prop
   (always a fixed 44×44, see its own section) and would overflow this
   control's 32px-tall desktop frame, so the two arrow buttons are hand-rolled
   here instead, matching `IconButton`'s own default-tone hover recipe at the
   `sm` dimensions — everything else is a 1:1 port.

   An "all years" toggle lived here briefly (added 2026-09-14 night, for
   `PeriodeVelger`) and was REMOVED again the same morning: `PeriodeVelger`
   was rebuilt into a single trigger + anchored panel with its OWN year row
   (see that section below) and no longer uses `YearSelector` at all — the
   contract here is back to plain `number`, unchanged for ordinary callers. */
export function YearSelector({ year, onChange, max, className }: {
  year: number
  onChange: (year: number) => void
  /** Disable the "next year" button at this value (e.g. the current year, for history that doesn't exist yet). No limit: always possible to go forward. */
  max?: number
  /** Extra classes on the outer frame — e.g. to override the height to match a `Toolbar`'s 40px contract (`lg:h-10`) when used inside one. */
  className?: string
}) {
  const atMax = max !== undefined && year >= max
  const arrowClass = 'inline-flex items-center justify-center shrink-0 rounded-[var(--frv-radius-sm)] transition-colors w-11 h-11 lg:w-8 lg:h-8 text-[var(--frv-text-secondary)] hover:bg-[var(--frv-gray-alpha-100)] hover:text-[var(--frv-text-primary)] disabled:pointer-events-none'

  return (
    <div
      className={cx(
        'inline-flex items-center h-11 lg:h-8 rounded-[var(--frv-radius-sm)] bg-[var(--frv-surface)] border border-[var(--frv-gray-alpha-400)] shrink-0',
        className,
      )}
    >
      <button type="button" onClick={() => onChange(year - 1)} aria-label="Previous year" className={arrowClass}>
        <ChevronLeftIcon size={14} />
      </button>
      <span className="type-label-14 tabular-nums text-center px-1 text-(color:--frv-text-primary)">
        {year}
      </span>
      <button
        type="button"
        onClick={() => onChange(atMax ? year : year + 1)}
        disabled={atMax}
        aria-label="Next year"
        className={cx(arrowClass, atMax && 'opacity-40')}
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  )
}

export interface PeriodeVerdi {
  /** `'alle'` = "since the start" — the entire history, no year bound. */
  aar: number | 'alle'
  /** 1-12. Only valid when `aar` is a concrete number — "since the start" has no month. */
  maaned?: number
}

const PERIODE_VELGER_MANEDSNAVN_LANG = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]
const PERIODE_VELGER_MANEDSNAVN_KORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** Pure label helper — mirrors `periodeEtikett` in the source, tested there
 *  without any DOM. */
export function periodeEtikett(verdi: PeriodeVerdi): string {
  if (verdi.aar === 'alle') return 'Since the start'
  if (verdi.maaned) return `${PERIODE_VELGER_MANEDSNAVN_LANG[verdi.maaned - 1]} ${verdi.aar}`
  return String(verdi.aar)
}

/** Pure helper — a period value to a year range for filtering, mirrors
 *  `periodeTilAar` in the source. A concrete year gives that same year at
 *  both ends (month filtering, if any, is the CALLER's job — this helper only
 *  cares about the year). `'alle'` gives an empty range (no bound). */
export function periodeTilAar(verdi: PeriodeVerdi): { fra?: number; til?: number } {
  if (verdi.aar === 'alle') return {}
  return { fra: verdi.aar, til: verdi.aar }
}

/* PeriodeVelger — REBUILT 2026-09-14 morning (founder feedback on the toggle
   + stepper version built the night before: "isn't intuitive" — it read as
   TWO separate controls, plus a confusing empty "—" state for the year while
   "all years" was active). Now a SINGLE trigger button (same chrome as
   `Dropdown` variant="field" — deliberately NOT a `Button` instance, see
   that section's own note for why) whose label always shows the current
   period in plain text ("Since the start" | "2026" | "september 2026"),
   opening an anchored panel: a year row (arrows step the year immediately,
   without closing the panel), "Whole year" plus a 4x3 month grid, and — below
   a divider — a row of year chips ("This year", each older year with data,
   "Since the start" last).

   REBUILT AGAIN 2026-09-14 evening (founder, screenshot of the open panel):
   the "Last 3 years" / "All years" full-width buttons became ONE row of
   small pill chips — one click per year instead of a fixed three-year
   window nobody asked for. `'siste3'` is therefore removed from
   `PeriodeVerdi` again (short-lived: added earlier the same day) — a
   concrete year covers the same ground, one chip click away.

   No longer built from `YearSelector` or a month `Dropdown` — the year row
   and month grid are this component's own panel content now, all inside
   ONE anchored panel. That panel is hand-rolled with `useFloatingPosition` +
   a portal, the same reason `OverflowMenu`/`Dropdown` above don't build on
   the app's shared `Popover`: Popover isn't part of this kit, and there is
   no mobile bottom-sheet mode here either (see `Dropdown`'s `mobilArk` prop
   note above) — this panel stays anchored at every width.
   REJECTED ALTERNATIVE (unchanged from before): a from/to date pair — a
   board member thinks in year and month ("show me September"), not date
   ranges.

   `bareAar` added 2026-09-14 (Frivio's own Bygghistorikk/build-history page):
   hides the "Whole year"/"Hele året" button and the month grid — only the
   year row and year-chip row remain. For lists whose rows can carry only a
   YEAR (no month-accurate date), so the UI never offers a month choice the
   data can't answer precisely. */
export function PeriodeVelger({
  verdi, onChange, aarListe, className, bareAar = false,
}: {
  verdi: PeriodeVerdi
  onChange: (verdi: PeriodeVerdi) => void
  /** Years that have data. Disables "previous year" at the SMALLEST year in
   *  the list. "Next year" is always disabled at the current year, regardless
   *  of this. */
  aarListe?: number[]
  className?: string
  /** Hides the "Whole year" button and month grid — only the year row and
   *  year-chip row remain. For lists with year-only rows. */
  bareAar?: boolean
}) {
  const montert = useMontert()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const maanedRefs = useRef<(HTMLButtonElement | null)[]>([])

  const naa = new Date().getFullYear()
  const naaManed = new Date().getMonth() + 1
  // The year the year row shows and steps from. "All years" has no year of
  // its own — the current year is a sensible starting point for the arrows.
  const visningAar = typeof verdi.aar === 'number' ? verdi.aar : naa
  const minAar = aarListe && aarListe.length ? Math.min(...aarListe) : undefined
  const atMin = minAar !== undefined && visningAar <= minAar
  const atMax = visningAar >= naa
  const heleAaretAktiv = typeof verdi.aar === 'number' && !verdi.maaned
  // Bottom chip row: only years STRICTLY OLDER than the current one (which
  // already has its own "This year" chip), newest first, de-duplicated.
  const eldreAar = aarListe ? Array.from(new Set(aarListe.filter(a => a < naa))).sort((a, b) => b - a) : []

  const pos = useFloatingPosition(triggerRef, {
    open, panelRef, side: 'bottom', align: 'start', offset: 6,
    onAnchorOutOfView: () => setOpen(false),
  })

  useKlikkUtenfor([triggerRef, panelRef], arsak => {
    setOpen(false)
    if (arsak === 'escape') triggerRef.current?.focus()
  }, open)

  // Focus into the panel on open — same idea as `OverflowMenu`/`Dropdown`
  // above, landing on whichever button represents the CURRENT selection
  // (marked `data-periode-valgt` below) instead of always the first month.
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-periode-valgt="true"]')?.focus()
    }, 0)
    return () => clearTimeout(t)
  }, [open])

  function onManedKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>, i: number) {
    const KOLONNER = 4
    let neste: number | null = null
    if (e.key === 'ArrowRight') neste = i + 1
    else if (e.key === 'ArrowLeft') neste = i - 1
    else if (e.key === 'ArrowDown') neste = i + KOLONNER
    else if (e.key === 'ArrowUp') neste = i - KOLONNER
    if (neste === null || neste < 0 || neste > 11) return
    e.preventDefault()
    maanedRefs.current[neste]?.focus()
  }

  function velgManed(m: number) {
    onChange({ aar: visningAar, maaned: m })
    setOpen(false)
  }

  const arrowClass = 'inline-flex items-center justify-center shrink-0 rounded-[var(--frv-radius-sm)] transition-colors w-11 h-11 lg:w-8 lg:h-8 text-[var(--frv-text-secondary)] hover:bg-[var(--frv-gray-alpha-100)] hover:text-[var(--frv-text-primary)] disabled:pointer-events-none'

  return (
    <div className={cx('relative inline-flex min-w-0', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-between gap-1.5 min-w-0 min-h-11 lg:min-h-0 h-10 px-3 rounded-[var(--frv-radius-sm)] type-button-14 transition-colors text-[var(--frv-text-primary)] bg-[var(--frv-surface)] border border-[var(--frv-gray-alpha-400)] hover:border-[var(--frv-gray-alpha-500)] hover:bg-[var(--frv-gray-alpha-100)]"
      >
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <CalendarRangeIcon size={16} className="shrink-0 text-(color:--frv-text-secondary)" />
          <span className="truncate">{periodeEtikett(verdi)}</span>
        </span>
        <ChevronDownIcon size={12} className="shrink-0 text-(color:--frv-text-secondary)" />
      </button>
      {open && montert && createPortal(
        <div
          ref={el => { panelRef.current = el }}
          role="dialog"
          aria-label="Choose period"
          className={cx(
            'fixed z-50 rounded-[var(--frv-radius-md)] overflow-hidden min-w-[240px] bg-(color:--frv-surface) shadow-(--frv-shadow-menu) top-(--periodevelger-top) left-(--periodevelger-left)',
            pos ? 'visible' : 'invisible',
          )}
          style={{
            '--periodevelger-top': `${pos?.top ?? 0}px`,
            '--periodevelger-left': `${pos?.left ?? 0}px`,
          } as CSSProperties}
        >
          <div className="p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <button
                type="button"
                onClick={() => onChange({ aar: visningAar - 1 })}
                disabled={atMin}
                aria-label="Previous year"
                className={cx(arrowClass, atMin && 'opacity-40')}
              >
                <ChevronLeftIcon size={14} />
              </button>
              <span className="type-label-13-strong tabular-nums text-(color:--frv-text-primary)">{visningAar}</span>
              <button
                type="button"
                onClick={() => onChange({ aar: visningAar + 1 })}
                disabled={atMax}
                aria-label="Next year"
                className={cx(arrowClass, atMax && 'opacity-40')}
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>

            {!bareAar && (
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  data-periode-valgt={heleAaretAktiv || undefined}
                  onClick={() => { onChange({ aar: visningAar }); setOpen(false) }}
                  aria-pressed={heleAaretAktiv}
                  className={cx(
                    'min-h-10 px-2 rounded-[var(--frv-radius-sm)] type-label-13 text-left transition-colors hover:bg-[var(--frv-gray-alpha-100)]',
                    heleAaretAktiv ? 'text-(color:--frv-text-primary) bg-(color:--frv-gray-alpha-100)' : 'text-(color:--frv-text-secondary) bg-transparent',
                  )}
                >
                  Whole year
                </button>
                <div role="group" aria-label="Month" className="grid grid-cols-4 gap-1">
                  {PERIODE_VELGER_MANEDSNAVN_KORT.map((navn, i) => {
                    const m = i + 1
                    const fremtidig = visningAar === naa && m > naaManed
                    const aktiv = typeof verdi.aar === 'number' && verdi.aar === visningAar && verdi.maaned === m
                    return (
                      <button
                        key={navn}
                        ref={el => { maanedRefs.current[i] = el }}
                        type="button"
                        data-periode-valgt={aktiv || undefined}
                        disabled={fremtidig}
                        aria-pressed={aktiv}
                        onClick={() => velgManed(m)}
                        onKeyDown={e => onManedKeyDown(e, i)}
                        className={cx(
                          'h-9 rounded-[var(--frv-radius-sm)] type-label-13 tabular-nums transition-colors hover:bg-[var(--frv-gray-alpha-100)] disabled:opacity-40 disabled:pointer-events-none',
                          aktiv ? 'text-(color:--frv-text-primary) bg-(color:--frv-gray-alpha-100)' : 'text-(color:--frv-text-secondary) bg-transparent',
                        )}
                      >
                        {navn}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="h-px bg-(color:--frv-border)" />

            {/* Year chip row: "This year", then each OLDER year with data
               (newest first), "Since the start" last. One click sets the
               year and closes the panel right away — same result as "Whole
               year" for that year, without a detour through the year row.
               One line for a few years; more years wrap, intentionally. */}
            <div role="group" aria-label="Year" className="flex flex-wrap gap-1 px-1">
              {[{ nokkel: 'this-year', label: 'This year', aar: naa }, ...eldreAar.map(a => ({ nokkel: String(a), label: String(a), aar: a }))].map(chip => {
                const aktiv = verdi.aar === chip.aar && !verdi.maaned
                return (
                  <button
                    key={chip.nokkel}
                    type="button"
                    data-periode-valgt={aktiv || undefined}
                    onClick={() => { onChange({ aar: chip.aar }); setOpen(false) }}
                    aria-pressed={aktiv}
                    className={cx(
                      'min-h-10 px-3 rounded-[var(--frv-radius-full)] type-label-13 tabular-nums transition-colors whitespace-nowrap',
                      aktiv
                        ? 'bg-[var(--frv-text-primary)] text-[var(--frv-bg)]'
                        : 'text-[var(--frv-text-secondary)] hover:bg-[var(--frv-gray-alpha-100)]',
                    )}
                  >
                    {chip.label}
                  </button>
                )
              })}
              <button
                type="button"
                data-periode-valgt={verdi.aar === 'alle' || undefined}
                onClick={() => { onChange({ aar: 'alle' }); setOpen(false) }}
                aria-pressed={verdi.aar === 'alle'}
                className={cx(
                  'h-7 px-3 rounded-[var(--frv-radius-full)] type-label-13 transition-colors whitespace-nowrap',
                  verdi.aar === 'alle'
                    ? 'bg-[var(--frv-text-primary)] text-[var(--frv-bg)]'
                    : 'text-[var(--frv-text-secondary)] hover:bg-[var(--frv-gray-alpha-100)]',
                )}
              >
                Since the start
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

/** SectionHeader — heading for a SECTION inside a page (distinct from a page
 *  header, which is the page top with `h1`). Title is `type-heading-16`
 *  (optional leading accent icon), one short description line, an optional
 *  right-aligned action. `eyebrow` is a small overline above the title for a
 *  category/parent level. */
export function SectionHeader({ title, eyebrow, description, icon: Icon, action, className }: {
  title: string
  /** Small overline above the title (category/parent level). */
  eyebrow?: string
  /** One short sentence explaining the section. */
  description?: string
  icon?: IconComponent
  /** Right-aligned action (button/link). */
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-2', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="type-label-12 uppercase tracking-wide mb-1" style={{ color: 'var(--frv-text-tertiary)' }}>{eyebrow}</p>}
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={16} className="shrink-0" style={{ color: 'var(--frv-accent)' }} />}
          <h2 className="type-heading-16" style={{ color: 'var(--frv-text-primary)' }}>{title}</h2>
        </div>
        {/* max-w-[65ch] — same readability rule as StepCard's description. */}
        {description && <p className="type-copy-13 mt-1 max-w-[65ch]" style={{ color: 'var(--frv-text-secondary)' }}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Subtext right under the title — copy-14, secondary. Only with `title`. */
  subtitle?: string
  /** Accessible name when the dialog has no visible `title`. With `title` set you never need this. */
  ariaLabel?: string
  children: ReactNode
  className?: string
  /** 'default' (480px) | 'wide' (640px, for a two-column form). */
  size?: 'default' | 'wide'
}

const MODAL_FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Slot for content: `var(--frv-space-6)` padding all round. Used together
 *  with `ModalActions` — see `Modal`'s comment for why the two are always
 *  used TOGETHER, never mixed with raw children. */
export function ModalBody({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={cx('px-6 py-6', className)} style={style}>{children}</div>
}

/** Bottom action row: top border, right-aligned, gap 8px — typically
 *  `<Button variant="secondary">Cancel</Button>` plus one primary action.
 *  `sticky` keeps it visible while `ModalBody`'s content scrolls. */
export function ModalActions({ children, className, sticky, style }: { children: ReactNode; className?: string; sticky?: boolean; style?: CSSProperties }) {
  return (
    <div className={cx('flex items-center justify-end gap-2 px-6 py-4 border-t border-(color:--frv-border) bg-(color:--frv-surface)', sticky && 'sticky bottom-0 z-10', className)} style={style}>
      {children}
    </div>
  )
}

/* Modal
   Material (wave 3, 2026-09-10): bg surface, radius-md, ONLY
   `--frv-shadow-modal` (it carries its own 1px border baked in — no
   separate border). Fixed width 480px, `size="wide"` 640px from the `sm`
   breakpoint (640px) up.

   Below 640px it's a BOTTOM SHEET, not a centered card: a sheet sits in the
   thumb's natural reach at the bottom of the screen, while a centered card
   on a 375px screen needs a stretch to the middle/top for the close button
   and fields. `title` is `heading-20` with an optional `subtitle`
   (`copy-14`, secondary) under it. `ModalBody`/`ModalActions` are optional
   slots — Modal looks for them among `children` and skips its own old
   content padding when found. USE THEM TOGETHER, never mixed with raw
   children in the same modal. Without them, the padding is unchanged.

   Dropped for portability (see the header note): mobile on-screen-keyboard
   avoidance and the decorative entrance animation. Escape, focus trap,
   focus restore and click-outside are intact. */
export function Modal({ open, onClose, title, subtitle, ariaLabel, children, className, size = 'default' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  // Where the mouse press STARTED. Without this, pressing inside the content
  // and releasing outside (which happens constantly when selecting text in a
  // form) would close the modal — click-outside should only fire when both
  // press and release happened on the backdrop.
  const pressStartedOnBackdrop = useRef(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const box = dialogRef.current
    const first = box?.querySelector<HTMLElement>(MODAL_FOCUSABLE)
    ;(first ?? box)?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !box) return
      const fields = [...box.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE)].filter(el => el.offsetParent !== null)
      if (fields.length === 0) { e.preventDefault(); return }
      const firstField = fields[0]
      const lastField = fields[fields.length - 1]
      if (e.shiftKey && document.activeElement === firstField) { e.preventDefault(); lastField.focus() }
      else if (!e.shiftKey && document.activeElement === lastField) { e.preventDefault(); firstField.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { document.removeEventListener('keydown', trap); previousFocus?.focus?.() }
  }, [open])

  if (!open) return null

  const usesNewSlots = Children.toArray(children).some(c => isValidElement(c) && (c.type === ModalBody || c.type === ModalActions))

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Click outside closes — the handlers live on the SCRIM div itself, not
          this outer container. The scrim covers the WHOLE container (`absolute
          inset-0`), so an `e.target === e.currentTarget` check on the outer
          container never matched — target was always the scrim (a CHILD of
          that container), never the container itself: clicking the backdrop
          never closed the modal via mouse. The scrim has no children of its
          own, so a click that actually hits IT needs no `target ===
          currentTarget` check at all — the dialog box is a SIBLING (not a
          descendant) and sits visually above at z-10, so a click there never
          reaches this handler. */}
      <div
        className="absolute inset-0 backdrop-blur-[2px] bg-(color:--frv-overlay)"
        onMouseDown={() => { pressStartedOnBackdrop.current = true }}
        onClick={() => { if (pressStartedOnBackdrop.current) onClose() }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title ?? 'Dialog'}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className={cx(
          'relative z-10 w-full bg-[var(--frv-surface)]',
          'rounded-t-[var(--frv-radius-md)] sm:rounded-[var(--frv-radius-md)]',
          // dvh, not vh: on iOS Safari `vh` is the LARGE viewport (without the
          // URL bar), so a tall modal could stretch behind it.
          'overflow-y-auto',
          size === 'wide' ? 'sm:max-w-[640px]' : 'sm:max-w-[480px]',
          'shadow-(--frv-shadow-modal) max-h-[calc(100dvh-var(--frv-space-8))]',
          className,
        )}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-(color:--frv-border)">
            <div className="min-w-0">
              <h2 className="type-heading-20 text-(color:--frv-text-primary)">{title}</h2>
              {subtitle && <p className="type-copy-14 mt-1 text-(color:--frv-text-secondary)">{subtitle}</p>}
            </div>
            <button onClick={onClose} aria-label="Close" className="w-11 h-11 -mr-3.5 -mt-3.5 shrink-0 flex items-center justify-center rounded-[var(--frv-radius-sm)] transition-colors hover:bg-[var(--frv-surface-2)] text-(color:--frv-text-tertiary)">
              <CloseIcon size={14} />
            </button>
          </div>
        )}
        {usesNewSlots ? children : (
          <div className={cx('px-5 pb-[max(var(--frv-space-5),_calc(var(--frv-space-5)_+_env(safe-area-inset-bottom)))]', title ? 'pt-5' : 'pt-8')}>{children}</div>
        )}
        {!title && (
          <button onClick={onClose} aria-label="Close" className="absolute top-2 right-2.5 w-11 h-11 flex items-center justify-center rounded-[var(--frv-radius-sm)] transition-colors hover:bg-[var(--frv-surface-2)] text-(color:--frv-text-tertiary)">
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export interface ConfirmOptions {
  /** Title at the top of the dialog. Default "Are you sure?". */
  title?: string
  /** The body text: what the user is confirming. */
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger`/`error` gives a red confirm button (for deletion etc.) — both accepted, same treatment. */
  tone?: 'default' | 'danger' | 'error'
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/** ConfirmDialog — replaces native `window.confirm()` with a dialog in the
 *  design system. Wrap the app once with `ConfirmProvider`; components call
 *  `useConfirm()`. Built on `Modal` + `ModalActions`: the confirm button is
 *  `variant="error"` for a destructive tone, otherwise `primary`; cancel is
 *  always `variant="secondary"`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((ok: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o)
    return new Promise<boolean>(resolve => { resolverRef.current = resolve })
  }, [])

  const settle = useCallback((ok: boolean) => {
    resolverRef.current?.(ok)
    resolverRef.current = null
    setOpts(null)
  }, [])

  const destructive = opts?.tone === 'danger' || opts?.tone === 'error'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => settle(false)} title={opts?.title ?? 'Are you sure?'}>
        {/* Two SEPARATE children (not one fragment around both) — Modal's
            slot detection looks at its direct children, not inside a fragment. */}
        {opts && (
          <ModalBody className="pb-2">
            <p className="type-copy-14" style={{ color: 'var(--frv-text-secondary)' }}>{opts.message}</p>
          </ModalBody>
        )}
        {opts && (
          <ModalActions>
            <Button variant="secondary" onClick={() => settle(false)}>{opts.cancelLabel ?? 'Cancel'}</Button>
            <Button variant={destructive ? 'error' : 'primary'} onClick={() => settle(true)} autoFocus>{opts.confirmLabel ?? 'Yes, continue'}</Button>
          </ModalActions>
        )}
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside a ConfirmProvider')
  return ctx
}

export interface SidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  /** Small overline line above the title — source/category (e.g. "Board duty"). */
  eyebrow?: string
  /** One short sentence under the title (capped at 65ch). */
  description?: string
  /** Scrollable body. */
  children: ReactNode
  /** Bottom action row — ONE primary action plus secondaries. Omitted: no footer. */
  footer?: ReactNode
  /** 400 / 480 (default) / 640 / 704px (`xl`) on desktop. Always full width below 768px. */
  bredde?: 'sm' | 'md' | 'lg' | 'xl'
  /** aria-label on the close button. */
  lukkeetikett?: string
}

const SIDE_PANEL_WIDTH: Record<NonNullable<SidePanelProps['bredde']>, string> = {
  sm: 'md:w-[400px]',
  md: 'md:w-[480px]',
  lg: 'md:w-[640px]',
  xl: 'md:w-[704px]',
}

const SIDE_PANEL_FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/* SidePanel
   Slides in from the RIGHT over the content on desktop (scrim behind it,
   same as `Modal`), full-screen as a bottom sheet below 768px — for "do
   this" flows where the list/page behind should stay visible and in
   context (a task opened from a list, without navigating away from it).
   `Modal` is still the right choice when there's no context worth keeping
   visible (a form, a confirmation).

   Same family as `Modal` (fixed, full-viewport overlay with its own scrim —
   not anchored to a trigger element), so it doesn't need `Popover` or a
   portal: it's already `position: fixed` against the viewport. Unlike
   `Modal`'s own hand-rolled backdrop mousedown/click tracking, this uses the
   kit's shared `useKlikkUtenfor` above for Escape + click-outside — a single
   `pointerdown` snapshot at press time, so it has no drag-to-select-then-
   release-outside false close to guard against in the first place (only the
   panel ref is passed; the scrim is already "outside" it).

   Drops the decorative directional slide animation the Frivio source adds
   (`.panel-in`, a CSS keyframe in the app's stylesheet) — same reason
   `Modal` above drops `modal-in`/`overlay-in`: portability. Escape, focus
   trap, focus restore, click-outside, body-scroll lock and the responsive
   width/full-screen-sheet layout are all intact. */
export function SidePanel({ open, onClose, title, eyebrow, description, children, footer, bredde = 'md', lukkeetikett = 'Close' }: SidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useKlikkUtenfor([panelRef], () => onClose(), open)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const box = panelRef.current
    const first = box?.querySelector<HTMLElement>(SIDE_PANEL_FOCUSABLE)
    ;(first ?? box)?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !box) return
      const fields = [...box.querySelectorAll<HTMLElement>(SIDE_PANEL_FOCUSABLE)].filter(el => el.offsetParent !== null)
      if (fields.length === 0) { e.preventDefault(); return }
      const firstField = fields[0]
      const lastField = fields[fields.length - 1]
      if (e.shiftKey && document.activeElement === firstField) { e.preventDefault(); lastField.focus() }
      else if (!e.shiftKey && document.activeElement === lastField) { e.preventDefault(); firstField.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { document.removeEventListener('keydown', trap); previousFocus?.focus?.() }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-(color:--frv-overlay)" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'relative z-10 flex w-full flex-col bg-[var(--frv-surface)]',
          // Top corners rounded on mobile; only the top-LEFT one from 768px up
          // (the panel hangs off the right edge on desktop — the other three
          // corners always sit flush against the viewport edge).
          'rounded-t-[var(--frv-radius-md)] md:rounded-tr-none',
          SIDE_PANEL_WIDTH[bredde],
          'h-dvh shadow-(--frv-shadow-modal)',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-(color:--frv-border)">
          <div className="min-w-0">
            {eyebrow && <p className="type-overline mb-1 text-(color:--frv-text-tertiary)">{eyebrow}</p>}
            <h2 id={titleId} className="type-heading-16 text-(color:--frv-text-primary)">{title}</h2>
            {description && <p className="type-copy-13 mt-1 max-w-[65ch] text-(color:--frv-text-secondary)">{description}</p>}
          </div>
          <button onClick={onClose} aria-label={lukkeetikett} className="shrink-0 -mr-2 -mt-2 w-11 h-11 flex items-center justify-center rounded-[var(--frv-radius-sm)] transition-colors hover:bg-[var(--frv-surface-2)] text-(color:--frv-text-tertiary)">
            <CloseIcon size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-(color:--frv-border) bg-(color:--frv-surface)">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export interface OverflowItem {
  label: string
  onClick: () => void
  icon?: ReactNode
  /** `error` gives red text — for destructive choices. `danger` is a kept alias, same treatment. */
  tone?: 'default' | 'error' | 'danger'
  disabled?: boolean
}

export interface OverflowSection {
  /** Section heading, `label-12` secondary. Omitted: no visible title, but still a divider against the previous section. */
  title?: string
  items: OverflowItem[]
}

/* OverflowMenu
   The "…" button: secondary ACTIONS gathered behind one trigger. Use it once
   an action row grows past three or four buttons.

   NOT the same as a value-picker (`Dropdown` below): this performs an
   ACTION and has `role="menu"`, with no "selected" state and always closes
   afterward.

   Reimplements its own minimal anchored-dropdown chrome instead of using the
   app's shared `Popover` (see the header note for why Popover isn't
   ported): Escape + click-outside to close, arrow-key navigation, no
   mobile bottom-sheet, no scrim. PORTALED (2026-09-12/13) via the
   `useFloatingPosition` hook from the FloatingLayer section above — anchored
   to the trigger's RIGHT edge (`align: 'end'`) with automatic flip (both
   vertical side and horizontal edge) and a `ResizeObserver` on the panel,
   instead of the old `position: absolute` that got clipped by any
   `overflow` ancestor (a docs example box, a scrollable table). `sections`
   groups actions with an optional heading per group, separated by a
   divider. A disabled item is shown (grayed out, unclickable) rather than
   removed — so arrow-key navigation correctly skips over it instead of it
   vanishing from the list. */
export function OverflowMenu({ items, sections, ariaLabel = 'More actions', triggerContent }: {
  /** Flat list — for a single group with no section heading. */
  items?: OverflowItem[]
  /** Grouped actions. Overrides `items` if both are set. */
  sections?: OverflowSection[]
  ariaLabel?: string
  /** Overrides the trigger's CONTENT (default: the "…" icon). `PillTabs`
   *  below uses this to show the count of hidden tabs ("+2") instead of a
   *  bare ellipsis. Purely additive — every other caller is unaffected. */
  triggerContent?: ReactNode
}) {
  const montert = useMontert()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const groups: OverflowSection[] = sections ?? (items ? [{ items }] : [])
  const allSelectable = groups.flatMap(s => s.items.filter(i => !i.disabled))

  const pos = useFloatingPosition(triggerRef, {
    open, panelRef: menuRef, side: 'bottom', align: 'end', offset: 6,
    onAnchorOutOfView: () => setOpen(false),
  })

  useEffect(() => { if (open) setTimeout(() => menuRef.current?.focus(), 0) }, [open])

  // Escape + click outside — shared hook (see its own section comment above,
  // pulled out of exactly this effect and MultiSelect's near-identical copy
  // below). The panel is portaled to document.body, outside the trigger's
  // own DOM tree — "outside" is checked against BOTH refs.
  useKlikkUtenfor([triggerRef, menuRef], arsak => {
    setOpen(false)
    if (arsak === 'escape') triggerRef.current?.focus()
  }, open)

  function select(item: OverflowItem) {
    setOpen(false)
    triggerRef.current?.focus()
    item.onClick()
  }

  function menuKeyDown(e: ReactKeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive(i => Math.min(allSelectable.length - 1, i + 1)); break
      case 'ArrowUp': e.preventDefault(); setActive(i => Math.max(0, i - 1)); break
      case 'Home': e.preventDefault(); setActive(0); break
      case 'End': e.preventDefault(); setActive(allSelectable.length - 1); break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (allSelectable[active]) select(allSelectable[active])
        break
    }
  }

  if (!groups.some(s => s.items.length)) return null

  return (
    <div className="relative inline-flex">
      <IconButton
        ref={triggerRef}
        // stopPropagation (mobile sweep 2026-09-19, finding 1): used as
        // `trailing` inside a clickable row, an unstopped click bubbles to
        // the row's own onClick/Link and navigates instead of opening the
        // menu — confirmed identical in Chromium and WebKit.
        onClick={e => { e.stopPropagation(); setActive(0); setOpen(o => !o) }}
        onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); setActive(0); setOpen(true) } }}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="text-(color:--frv-text-tertiary)"
      >
        {triggerContent ?? <MoreIcon size={16} />}
      </IconButton>
      {open && montert && createPortal(
        <div
          ref={el => { menuRef.current = el }}
          role="menu"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={menuKeyDown}
          className={cx(
            'fixed z-50 rounded-[var(--frv-radius-md)] overflow-hidden min-w-[220px] max-w-[min(320px,calc(100vw-2rem))] bg-(color:--frv-surface) shadow-(--frv-shadow-menu) p-(--frv-space-1) top-(--overflowmenu-top) left-(--overflowmenu-left)',
            pos ? 'visible' : 'invisible',
          )}
          style={{
            '--overflowmenu-top': `${pos?.top ?? 0}px`,
            '--overflowmenu-left': `${pos?.left ?? 0}px`,
          } as CSSProperties}
        >
          {groups.map((section, si) => (
            <div key={si}>
              {si > 0 && <div role="separator" className="h-px my-(--frv-space-1) bg-(color:--frv-border)" />}
              {section.title && <p className="type-label-12 px-3 pt-1.5 pb-1 text-(color:--frv-text-secondary)">{section.title}</p>}
              {section.items.map(item => {
                const disabled = !!item.disabled
                const selectIndex = disabled ? -1 : allSelectable.indexOf(item)
                const isActive = !disabled && selectIndex === active
                const isError = item.tone === 'error' || item.tone === 'danger'
                return (
                  <button
                    key={item.label}
                    role="menuitem"
                    disabled={disabled}
                    aria-disabled={disabled || undefined}
                    onClick={e => { e.stopPropagation(); if (!disabled) select(item) }}
                    onMouseEnter={() => { if (!disabled) setActive(selectIndex) }}
                    className={cx(
                      'w-full flex items-center gap-[var(--frv-space-2)] h-9 px-3 text-left type-label-14 rounded-[var(--frv-radius-sm)] transition-colors disabled:cursor-not-allowed',
                      disabled ? 'text-(color:--frv-text-tertiary) opacity-50' : isError ? 'text-(color:--frv-error-text)' : 'text-(color:--frv-text-primary)',
                      isActive ? (isError ? 'bg-(color:--frv-error-light)' : 'bg-(color:--frv-gray-alpha-100)') : 'bg-transparent',
                    )}
                  >
                    {item.icon && <span className={cx('shrink-0 flex items-center', disabled ? 'text-(color:--frv-text-tertiary)' : 'text-(color:--frv-text-secondary)')}>{item.icon}</span>}
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

// Shared collapse state (open/closed + remembers the choice in localStorage).
// `storageKey` is the FULL key — the caller owns its own prefix.
const collapsibleListeners = new Set<() => void>()
function collapsibleSubscribe(onChange: () => void) { collapsibleListeners.add(onChange); return () => { collapsibleListeners.delete(onChange) } }

export function useCollapsible(storageKey: string, defaultOpen = true) {
  const open = useSyncExternalStore(
    collapsibleSubscribe,
    () => { const stored = localStorage.getItem(storageKey); return stored === null ? defaultOpen : stored === 'true' },
    () => defaultOpen,
  )
  function toggle() {
    const next = !open
    localStorage.setItem(storageKey, String(next))
    collapsibleListeners.forEach(l => l())
  }
  return { open, toggle }
}

interface CollapsibleSectionProps {
  title: string
  storageKey: string
  defaultOpen?: boolean
  badge?: string | number
  /** `default`: section heading, chevron on the left (−90°→0°), muted title,
   *  a divider running out to the right — for hiding a group of rows/cards
   *  under a heading ("Older checks", "History"). `ghost` (2026-09-12): a
   *  tight row for a list of Q&A-style items — no border/card, only a
   *  divider UNDER the row, title in primary color, chevron on the right
   *  (0°→180°). Several in a row read as one list; content is text, a card
   *  inside a ghost row is the wrong variant. */
  variant?: 'default' | 'ghost'
  children: ReactNode
}

const COLLAPSIBLE_CHEVRON_MOTION = 'shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--frv-duration-popover)] motion-safe:ease-[var(--frv-ease-spring)]'

/** CollapsibleSection — hides a group of rows behind a clickable heading.
 *  Open/closed state is remembered per browser via localStorage. The
 *  collapse itself is the shared `.collapsible-rows`/`.collapsible-inner`
 *  CSS (grid-rows 0fr→1fr + opacity, `--frv-duration-popover`/
 *  `--frv-ease-spring`) — same classes `ReasoningTrace` uses below. The
 *  chevron rotates with the SAME duration/curve as the content, so head and
 *  body move as one thing; both respect `prefers-reduced-motion` via the
 *  shared CSS. */
export function CollapsibleSection({ title, storageKey, defaultOpen = true, badge, variant = 'default', children }: CollapsibleSectionProps) {
  const { open, toggle } = useCollapsible(`section:${storageKey}`, defaultOpen)
  const ghost = variant === 'ghost'

  return (
    <div className={ghost ? 'border-b border-[var(--frv-border)]' : undefined}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cx(
          'w-[calc(100%+0.75rem)] -mx-1.5 px-1.5 min-h-11 lg:min-h-0 flex items-center text-left rounded-[var(--frv-radius-sm)] hover:bg-[var(--frv-gray-alpha-100)] transition-colors group',
          ghost ? 'gap-3 py-2.5' : 'gap-2.5 py-1.5 mb-3',
        )}
      >
        {!ghost && (
          <ChevronDownIcon size={14} className={cx(COLLAPSIBLE_CHEVRON_MOTION, 'text-(color:--frv-text-secondary)', open ? 'rotate-0' : '-rotate-90')} />
        )}
        <span
          className={cx(
            'transition-colors',
            ghost ? 'type-label-14 flex-1 min-w-0 text-(color:--frv-text-primary)' : 'type-heading-14 text-(color:--frv-text-tertiary) group-hover:text-[var(--frv-text-secondary)]',
          )}
        >
          {title}
        </span>
        {badge !== undefined && badge !== '' && <Badge variant="gray" contrast="low" size="sm">{badge}</Badge>}
        {ghost ? (
          <ChevronDownIcon size={16} className={cx(COLLAPSIBLE_CHEVRON_MOTION, 'text-[var(--frv-text-tertiary)] group-hover:text-[var(--frv-text-secondary)]', open ? 'rotate-180' : 'rotate-0')} />
        ) : (
          <div className="flex-1 h-px bg-(color:--frv-border)" />
        )}
      </button>

      <div className="collapsible-rows" data-open={open}>
        <div className="collapsible-inner">
          {/* The ghost content's bottom air lives on a child, not on
              `.collapsible-inner` — padding there would stay as height while the row is 0fr. */}
          {ghost ? <div className="pb-3">{children}</div> : children}
        </div>
      </div>
    </div>
  )
}

/** Tilstandsgrad (TG0–TG3) as a Badge tone — pure function, no deps. Reads the
 *  HIGHEST digit in the string (source data is free text and also occurs as
 *  "TG2-3" — reading it down to TG2 would understate it). NS 3424: TG0 "no
 *  deviation" is calm, TG3 "severe deviation" is urgent. */
export function tgVariant(tg: string): 'lav' | 'default' | 'middels' | 'akutt' {
  const digits = (tg.match(/\d/g) ?? []).map(Number)
  const worst = digits.length ? Math.max(...digits) : -1
  if (worst >= 3) return 'akutt'
  if (worst === 2) return 'middels'
  if (worst === 0) return 'lav'
  return 'default'
}

/* BygningsdelKort — added 2026-09-18, ported 2026-09-18 (with the
 * `onRegistrerMateriale`/`onLastOppFdv` secondary actions from day one, so
 * there is no separate "port it later" step for this wave).
 *
 * Source docstring (components/ui/BygningsdelKort.tsx) explains the shape:
 * one recurring card per "building component" (roof, facade, elevator, …)
 * composing status + history + materials + FDV documents that a user test
 * found read as unrelated facts when spread across four separate pages.
 * `Card` chrome, a TG badge (`tgVariant` above) when a grade exists, one
 * "last done" line, an open-tasks link, and a closed-by-default
 * `CollapsibleSection` with three read-only subsections. The card's ONE
 * PRIMARY action is "register an event" (`onRegistrerHendelse`); the two
 * newer props below are SECONDARY actions, one per subsection — the card
 * itself makes no API calls or modals, the caller opens them.
 *
 * KIT DIFFERENCES from the source (generic-port constraints, see header
 * note): `componentKey`/`entry` are generalized to `string`/`{year, note}`
 * instead of the app's closed `ComponentKey`/`ComponentEntry` union — this
 * kit has no `BUILDING_COMPONENTS` registry to key against. The main tile
 * icon is a caller-supplied `IconComponent` (optional — omit it to skip the
 * tile) rather than a hardcoded `Layers` import, following this kit's
 * "components take icons as props" rule (header note). Materials/FDV row
 * icons and the external-link glyph are omitted rather than inventing three
 * more baked chrome SVGs for a documentation port — content icons belong at
 * the call site, same rule. */
export interface BygningsdelHistorikkRad {
  id: string
  /** ISO date (YYYY-MM-DD). Year-only events store `YYYY-01-01` with `kunAar: true`. */
  dato: string
  kunAar: boolean
  tittel: string
  utfortAv: string | null
  materiale: string | null
  href: string | null
}
export interface BygningsdelMateriale {
  id: string
  produkt: string
  kode: string
  leverandor: string
  aar: string
}
export interface BygningsdelFdvDokument {
  id: string
  title: string
  supplierName: string | null
  docUrl: string | null
  utfortDato: string | null
}

export interface BygningsdelKortProps {
  /** Only used to derive the accordion's `storageKey` — no display effect. */
  componentKey: string
  label: string
  sublabel?: string
  /** Optional tile icon for the header. Omitted = no tile. */
  icon?: IconComponent
  entry: { year: string; note: string }
  /** Worst TG among the part's OPEN tasks, e.g. "TG2". Omitted = no assessment yet — never shown as TG0. */
  tilstandsgrad?: string | null
  apneTiltak: number
  apneTiltakHref?: string
  historikk?: BygningsdelHistorikkRad[]
  materialer?: BygningsdelMateriale[]
  fdv?: BygningsdelFdvDokument[]
  /** The card's ONE primary action. */
  onRegistrerHendelse?: () => void
  /** Secondary action in the materials subsection. Omitted = no button. */
  onRegistrerMateriale?: () => void
  /** Secondary action in the FDV subsection. Omitted = no button. */
  onLastOppFdv?: () => void
  /** Whether the expandable section starts open. Default closed — the card is an overview, not a page of its own. */
  defaultOpen?: boolean
  /** `standard` (default) | `kompakt` — a sketch (2026-09-20) that replaces the
   *  three-heading accordion with one fact line and three collapsed `PillTabs`
   *  sections (one open at a time). See the function body for the split. */
  variant?: 'standard' | 'kompakt'
  className?: string
}

function bdkSisteLinjeKompakt(entry: { year: string; note: string }, nyeste?: BygningsdelHistorikkRad): string {
  if (nyeste) return `Last done ${nyeste.kunAar ? nyeste.dato.slice(0, 4) : nyeste.dato}`
  if (entry.year) return `Last done ${entry.year}`
  return 'Last done unknown'
}

/** Inline tap target for a number inside the fact line: padding + negative
 *  margin grows the hit area to 40px without changing the line's own height
 *  (same trick `Begrep`'s inline hint link uses below). */
function bdkFaktaTrykk(children: ReactNode, onClick?: () => void, href?: string) {
  const cls = 'inline-block py-3 -my-3 px-1 -mx-1 type-label-13-strong underline'
  const style = { color: 'var(--frv-accent-text)' }
  return href
    ? <a href={href} className={cls} style={style}>{children}</a>
    : <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>
}

function bdkSisteLinje(entry: { year: string; note: string }, nyeste?: BygningsdelHistorikkRad): string {
  if (nyeste) {
    const delene = [nyeste.kunAar ? nyeste.dato.slice(0, 4) : nyeste.dato, nyeste.utfortAv, nyeste.materiale].filter(Boolean)
    return `Last done: ${delene.join(' · ')}`
  }
  if (entry.year) return `Last done: ${[entry.year, entry.note].filter(Boolean).join(' · ')}`
  return 'No date on record — assumed original to the build year'
}

function bdkRadBeholder(children: ReactNode) {
  return (
    <div className="rounded-[var(--frv-radius-md)] overflow-hidden divide-y divide-[var(--frv-border)]" style={{ background: 'var(--frv-surface-2)' }}>
      {children}
    </div>
  )
}

export function BygningsdelKort({
  componentKey, label, sublabel, icon: Icon, entry, tilstandsgrad, apneTiltak, apneTiltakHref,
  historikk = [], materialer = [], fdv = [], onRegistrerHendelse, onRegistrerMateriale, onLastOppFdv,
  defaultOpen = false, variant = 'standard', className,
}: BygningsdelKortProps) {
  const nyeste = historikk[0]
  const totalDetaljer = historikk.length + materialer.length + fdv.length
  // Declared unconditionally (hooks rule) even though only the "kompakt"
  // branch reads it — this single-file kit has no server/client split to
  // protect (unlike `components/ui/BygningsdelKort.tsx`, which delegates to a
  // separate client file for exactly this reason).
  const [apneSeksjon, setApneSeksjon] = useState<'historikk' | 'materialer' | 'fdv' | null>(null)

  if (variant === 'kompakt') {
    const veksle = (s: 'historikk' | 'materialer' | 'fdv') => setApneSeksjon(g => (g === s ? null : s))
    const faner: PillTab[] = [
      { key: 'historikk', label: historikk.length > 0 ? `History ${historikk.length}` : 'History' },
      { key: 'materialer', label: materialer.length > 0 ? `Materials ${materialer.length}` : 'Materials' },
      { key: 'fdv', label: fdv.length > 0 ? `FDV ${fdv.length}` : 'FDV' },
    ]
    const fakta: ReactNode[] = [bdkSisteLinjeKompakt(entry, nyeste)]
    if (apneTiltakHref) fakta.push(bdkFaktaTrykk(`${apneTiltak} open ${apneTiltak === 1 ? 'task' : 'tasks'}`, undefined, apneTiltakHref))
    else if (apneTiltak > 0) fakta.push(`${apneTiltak} open ${apneTiltak === 1 ? 'task' : 'tasks'}`)
    if (materialer.length > 0) fakta.push(bdkFaktaTrykk(`${materialer.length} ${materialer.length === 1 ? 'material' : 'materials'}`, () => veksle('materialer')))
    if (fdv.length > 0) fakta.push(bdkFaktaTrykk(`${fdv.length} FDV`, () => veksle('fdv')))

    return (
      <Card className={cx('p-4 flex flex-col gap-2', className)}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && <IconTile icon={Icon} tone="neutral" size="md" />}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="type-heading-16 truncate">{label}</span>
                {tilstandsgrad && <Badge variant={tgVariant(tilstandsgrad)}>{tilstandsgrad}</Badge>}
              </div>
              {sublabel && <span className="type-label-12 block" style={{ color: 'var(--frv-text-tertiary)' }}>{sublabel}</span>}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onRegistrerHendelse}>
            <PlusIcon size={14} />Register event
          </Button>
        </div>

        <p className="type-label-13 flex flex-wrap items-baseline gap-x-1.5" style={{ color: 'var(--frv-text-secondary)' }}>
          {fakta.map((del, i) => (
            <span key={i} className="inline-flex items-baseline gap-x-1.5">
              {i > 0 && <span aria-hidden style={{ color: 'var(--frv-text-quaternary)' }}>·</span>}
              {del}
            </span>
          ))}
        </p>

        <PillTabs tabs={faner} activeKey={apneSeksjon ?? ''} onSelect={k => veksle(k as 'historikk' | 'materialer' | 'fdv')} />

        {apneSeksjon === 'historikk' && historikk.length > 0 && (
          <div className="pt-1">
            {bdkRadBeholder(historikk.map(h => (
              <ListRow key={h.id} title={h.tittel} secondary={[h.utfortAv ? `By ${h.utfortAv}` : null, h.materiale ? `Material: ${h.materiale}` : null].filter((x): x is string => x != null)} value={h.kunAar ? h.dato.slice(0, 4) : h.dato} href={h.href ?? undefined} />
            )))}
          </div>
        )}
        {apneSeksjon === 'materialer' && (
          <div className="pt-1 flex flex-col gap-2 items-start">
            {materialer.length > 0 && bdkRadBeholder(materialer.map(m => (
              <ListRow key={m.id} title={m.produkt || 'Unnamed product'} secondary={[m.kode, m.leverandor].filter(Boolean)} value={m.aar || undefined} />
            )))}
            {onRegistrerMateriale && <Button variant="link" size="sm" onClick={onRegistrerMateriale}><PlusIcon size={12} />Add material</Button>}
          </div>
        )}
        {apneSeksjon === 'fdv' && (
          <div className="pt-1 flex flex-col gap-2 items-start">
            {fdv.length > 0 && bdkRadBeholder(fdv.map(f => (
              <ListRow key={f.id} title={f.title} secondary={[f.supplierName, f.utfortDato].filter(Boolean)} href={f.docUrl ?? undefined} />
            )))}
            {onLastOppFdv && <Button variant="link" size="sm" onClick={onLastOppFdv}><PlusIcon size={12} />Upload FDV</Button>}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={cx('p-5 flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <IconTile icon={Icon} tone="neutral" size="md" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="type-heading-16 truncate">{label}</span>
              {tilstandsgrad && <Badge variant={tgVariant(tilstandsgrad)}>{tilstandsgrad}</Badge>}
            </div>
            {sublabel && <span className="type-label-12 block" style={{ color: 'var(--frv-text-tertiary)' }}>{sublabel}</span>}
          </div>
        </div>
        <Button variant="soft" size="sm" onClick={onRegistrerHendelse}>
          <PlusIcon size={14} />Register event
        </Button>
      </div>

      <p className="type-copy-13" style={{ color: 'var(--frv-text-secondary)' }}>{bdkSisteLinje(entry, nyeste)}</p>

      {apneTiltakHref ? (
        // `inline-flex items-center min-h-10` (mobile sweep 2026-09-19: measured
        // 90-93x16px) — a plain text link with no box/padding of its own had a
        // tap target equal to just the text's line height.
        <a href={apneTiltakHref} className="inline-flex items-center min-h-10 type-label-13-strong underline w-fit" style={{ color: 'var(--frv-accent-text)' }}>
          {apneTiltak} open tasks →
        </a>
      ) : (
        <span className="type-label-13-strong" style={{ color: apneTiltak > 0 ? 'var(--frv-accent-text)' : 'var(--frv-text-tertiary)' }}>{apneTiltak} open tasks</span>
      )}

      <CollapsibleSection
        title="History, materials & FDV"
        storageKey={`bygningsdel-${componentKey}`}
        defaultOpen={defaultOpen}
        badge={totalDetaljer > 0 ? totalDetaljer : undefined}
      >
        <div className="flex flex-col gap-5 pt-1">
          <div>
            <span className="type-label-12-strong mb-2 block" style={{ color: 'var(--frv-text-tertiary)' }}>History</span>
            {historikk.length === 0 ? (
              <p className="type-copy-13" style={{ color: 'var(--frv-text-tertiary)' }}>No history on record yet.</p>
            ) : bdkRadBeholder(historikk.map(h => {
              const secondary = [h.utfortAv ? `By ${h.utfortAv}` : null, h.materiale ? `Material: ${h.materiale}` : null].filter((x): x is string => x != null)
              return (
                <ListRow
                  key={h.id}
                  title={h.tittel}
                  secondary={secondary}
                  value={h.kunAar ? h.dato.slice(0, 4) : h.dato}
                  href={h.href ?? undefined}
                  trailing={h.href ? <ChevronRightIcon size={14} style={{ color: 'var(--frv-text-quaternary)' }} /> : undefined}
                />
              )
            }))}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="type-label-12-strong" style={{ color: 'var(--frv-text-tertiary)' }}>Materials & codes</span>
              {onRegistrerMateriale && <Button variant="tertiary" size="xs" onClick={onRegistrerMateriale}><PlusIcon size={12} />Add material</Button>}
            </div>
            {materialer.length === 0 ? (
              <p className="type-copy-13" style={{ color: 'var(--frv-text-tertiary)' }}>No materials on record for this part.</p>
            ) : bdkRadBeholder(materialer.map(m => (
              <ListRow key={m.id} title={m.produkt || 'Unnamed product'} secondary={[m.kode, m.leverandor].filter(Boolean)} value={m.aar || undefined} />
            )))}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="type-label-12-strong" style={{ color: 'var(--frv-text-tertiary)' }}>FDV documents</span>
              {onLastOppFdv && <Button variant="tertiary" size="xs" onClick={onLastOppFdv}><PlusIcon size={12} />Upload FDV</Button>}
            </div>
            {fdv.length === 0 ? (
              <p className="type-copy-13" style={{ color: 'var(--frv-text-tertiary)' }}>No FDV documents for this part.</p>
            ) : bdkRadBeholder(fdv.map(f => (
              <ListRow
                key={f.id}
                title={f.title}
                secondary={[f.supplierName, f.utfortDato].filter(Boolean)}
                href={f.docUrl ?? undefined}
                trailing={f.docUrl ? <ChevronRightIcon size={14} style={{ color: 'var(--frv-text-quaternary)' }} /> : undefined}
              />
            )))}
          </div>
        </div>
      </CollapsibleSection>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   6. NEW (2026-09-11, "Veien til 9,5" UX wave) — Begrep, ActionBar, Toolbar,
      PageHeader
   ══════════════════════════════════════════════════════════════════════════ */

// Kept in sync with the literal `max-w-[280px]` on the FloatingLayer panel
// below by hand — a Tailwind class built from this constant at runtime
// (`` max-w-[${BEGREP_PANEL_MAX_WIDTH}px] ``) would be invisible to
// Tailwind's static scanner, which only sees literal class text in the
// source, never an evaluated JS expression.
const BEGREP_PANEL_MAX_WIDTH = 280

export interface BegrepProps {
  /** The term/word shown with a dotted underline. */
  term: string
  /** Explanation shown on hover/focus (tooltip) and tap (panel) — keep it to
   *  5–15 words, plain language, no further jargon. */
  explanation: string
  /** Overrides the VISIBLE text (e.g. an abbreviation in a table cell); the
   *  explanation is still `explanation`. */
  children?: ReactNode
  className?: string
}

/** Begrep — an inline term with its explanation right where the word
 *  appears, instead of in a paragraph above. Renders as a button with a
 *  dotted underline: hover/focus shows the explanation as a tooltip
 *  (mouse/keyboard); a tap/click opens the SAME explanation as a small panel
 *  under the word (works on touch, where a plain tooltip is inert).
 *
 *  Keyboard: it's a native `<button>`, so Enter/Space already activate it —
 *  no extra wiring needed. Escape closes the panel AND clears hover state
 *  (without the latter, the panel could stay visible after Escape if the
 *  pointer was still resting on the word).
 *
 *  Portal (2026-09-14): the panel renders through `FloatingLayer` on
 *  `document.body` (side bottom, align start, up to 280px wide), so a table's
 *  scroll container or a card with `overflow: hidden` never clips it, and
 *  `computeFloatingPosition` keeps it inside the viewport near the edges —
 *  the earlier "flip to right-aligned" measurement is gone. Outside click and
 *  Escape close it through `useKlikkUtenfor`.
 *
 *  Reduced motion: uses the kit's `.pop-in`/`prefers-reduced-motion` pairing
 *  in `frivio-tokens.css` — disables the entrance animation automatically,
 *  no extra handling here.
 *
 *  See the header note ("Differences…") for why this takes `term`/
 *  `explanation` directly instead of the Frivio source's `id` into a
 *  hardcoded `lib/ordliste.ts` glossary. */
export function Begrep({ term, explanation, children, className }: BegrepProps) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const panelId = useId()
  const visible = open || hover

  function close() { setOpen(false); setHover(false) }
  useKlikkUtenfor([ref, panelRef], close, open)

  return (
    <span ref={ref} className={cx('inline-block', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-describedby={visible ? panelId : undefined}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="bg-transparent border-0 p-0 m-0 cursor-help underline decoration-dotted underline-offset-[0.16em] [font:inherit] text-inherit decoration-(color:--frv-text-tertiary)"
      >
        {children ?? term}
      </button>
      <FloatingLayer
        open={visible}
        anchorRef={ref}
        side="bottom"
        align="start"
        offset={4}
        id={panelId}
        role="tooltip"
        panelRef={el => { panelRef.current = el }}
        onAnchorOutOfView={close}
        className="type-label-13 pop-in w-max max-w-[280px] bg-(color:--frv-text-primary) text-(color:--frv-bg) rounded-(--frv-radius-sm) shadow-(--frv-shadow-tooltip) py-(--frv-space-1) px-(--frv-space-2)"
      >
        <strong className="font-medium">{term}</strong> · {explanation}
      </FloatingLayer>
    </span>
  )
}

/* If your app has its OWN fixed bottom navigation bar, `position: sticky;
 * bottom: 0` lands in the SAME strip as that bar and gets hidden behind it
 * whenever the bar's z-index is higher (the Frivio source's `BottomNav` is
 * `fixed bottom-0 z-50`, and hid a `z-20` ActionBar this way — verified in
 * the browser, 2026-09-11). Set `--frv-bottom-clearance` (a CSS custom
 * property, not defined by this token layer) to your bar's rendered height
 * so ActionBar sticks ABOVE it instead of behind it. Default is `0px` — no
 * bottom bar assumed. */

/** ActionBar — the page's primary action, always visible on mobile, and
 *  always the LAST element in the page's content (it IS the page's
 *  conclusion, not a row in the middle of it). Under 640px the row sticks
 *  to the bottom of the nearest scrolling container (same material as
 *  `ModalActions`: surface bg, top edge, `--frv-shadow-menu`); from 640px
 *  it renders as a PLAIN row with no bar chrome at all, where it sits in
 *  the markup. Max two buttons: primary on the right, one secondary on the
 *  left. `label` is a short status line ("3 of 5 filled in"), not an
 *  explanation — use a note component for that.
 *
 *  Chrome (bg/border/shadow/bottom) is all Tailwind arbitrary-value CLASSES,
 *  not inline `style` — deliberately, so the `sm:bg-transparent`/
 *  `sm:border-0`/`sm:shadow-none` overrides actually win at 640px. An inline
 *  style has higher precedence than any class regardless of breakpoint, so a
 *  version that set `style={{ background: ... }}` kept the mobile bar chrome
 *  baked in permanently and the desktop overrides never took effect — found
 *  in the source, 2026-09-11. */
export function ActionBar({ children, label, className }: { children: ReactNode; label?: ReactNode; className?: string }) {
  return (
    <div
      data-ui="actionbar"
      className={cx(
        'sticky z-20 -mx-4 px-4 py-3 flex items-center justify-end gap-2 bottom-[calc(var(--frv-bottom-clearance,0px)+env(safe-area-inset-bottom))]',
        'bg-[var(--frv-surface)] border-t border-[var(--frv-border)] shadow-[var(--frv-shadow-menu)]',
        'sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:shadow-none',
        className,
      )}
    >
      {label != null && <span className="type-label-13 mr-auto truncate text-(color:--frv-text-secondary)">{label}</span>}
      {children}
    </div>
  )
}

/** Toolbar — one toolbar over a list or table, with ONE height. Found
 *  `SearchInput` (40px), `PillTabs` (32px) and buttons (40px) set side by
 *  side with page-specific flex classes, so the heights and mobile wrap
 *  differed from page to page. Contract: all children are 40px tall on
 *  desktop (`SearchInput`, `Button` md, a field-style `Dropdown`, `PillTabs
 *  size="md"`), `end` sits on the right. Under 640px the row wraps cleanly:
 *  `children` keep their own wrap, `end` drops to its own line via
 *  `ml-auto`. */
export function Toolbar({ children, end, className }: { children?: ReactNode; end?: ReactNode; className?: string }) {
  return (
    <div data-ui="toolbar" className={cx('flex flex-wrap items-center gap-2 mb-4', className)}>
      <div className="flex flex-wrap items-center gap-2 min-w-[16rem] flex-1">{children}</div>
      {end && <div className="flex flex-wrap items-center gap-2 shrink-0 ml-auto">{end}</div>}
    </div>
  )
}

/** PageHeader — the shared page top: a clear `h1`, an optional "i" popover
 *  for deeper detail, an optional page-context switcher, an optional
 *  action. The explanatory purpose line is `children` (one `copy-14`
 *  secondary sentence) — `info` is for DEEPER detail (methodology, legal
 *  references), not the primary purpose statement.
 *
 *  `context` (e.g. a building/period switcher) ALWAYS lives here, in the
 *  header's right side, next to `action` — never as its own row under the
 *  title. A context switcher that gets its own row steals a full row of
 *  height on every page that has one; found in the source, 2026-09-11.
 *
 *  Layout note: `flex-1 min-w-[16rem]` on the title block, not just
 *  `min-w-0`. `flex-wrap` decides the line break from each flex item's
 *  HYPOTHETICAL size (max-content) BEFORE shrink applies — with only
 *  `min-w-0`, the title block's hypothetical width was the full purpose
 *  sentence on one line, so a long enough sentence pushed `action`/`context`
 *  onto their own line, where `justify-between` puts them on the LEFT.
 *  `flex-1` gives the block a flex-basis of 0 so the sentence can never
 *  dictate the break; `min-w-[16rem]` keeps a real break on narrow screens.
 *
 *  `info`'s popover is a minimal port: hover/focus via the shared `Tooltip`
 *  (so it's the same experience as everywhere else in this kit), WITHOUT the
 *  source's separate touch-tap fallback panel (`InfoHint` isn't ported —
 *  it depends on the app's own coarse-pointer click-to-open logic, which
 *  duplicates `Tooltip`'s inertness on touch rather than composing with it).
 *  On touch, `Tooltip` renders the button unchanged with no way to open the
 *  explanation — put anything touch users must see in `children` instead. */
export function PageHeader({
  title,
  info,
  context,
  action,
  children,
}: {
  title: string
  /** Deeper detail (methodology, legal references) in an "i" popover next to the title. Not the primary purpose line — that's `children`. */
  info?: ReactNode
  /** Page context switcher (e.g. a building/period picker) — ALWAYS here, in the header's right side, never its own row. Sits to the left of `action`. */
  context?: ReactNode
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div className="flex-1 min-w-[16rem]">
        <div className="flex items-center gap-2">
          <h1 className="type-page-title">{title}</h1>
          {info && (
            <Tooltip content={info} side="bottom">
              <button
                type="button"
                aria-label={`About ${title}`}
                className="inline-flex items-center justify-center w-11 h-11 -m-3 rounded-full transition-colors"
                style={{ color: 'var(--frv-text-tertiary)' }}
              >
                <InfoIcon size={14} />
              </button>
            </Tooltip>
          )}
        </div>
        {/* max-w-[65ch]: the purpose line is running text, same readability rule
            as StepCard/SectionHeader. Every call site sends one short sentence
            here, not wide content that needs full width. */}
        {children && <div className="mt-3 max-w-[65ch]">{children}</div>}
      </div>
      {(context || action) && (
        /* NOT `shrink-0`: on a narrow viewport the title has ALREADY wrapped to
           its own line (its `min-w-[16rem]` leaves no room beside it), so this
           block stands alone on its own row. `shrink-0` refused to let it
           shrink below its OWN unwrapped content width (a period switcher +
           every action button on one line) — the result was an element that
           stuck out past the screen edge, uncropped by any `body` scroll, just
           silently clipped by the layout's `overflow-x-hidden`, instead of
           falling back to its OWN `flex-wrap`. Without `shrink-0` the block
           shrinks down toward its widest SINGLE child, and its own `flex-wrap`
           actually gets to break the period switcher/buttons across lines, as
           intended. Doesn't change layouts where content+action share one row
           on wider screens — there's room enough there that nothing shrinks. */
        <div className="flex flex-wrap items-center gap-2">
          {context}
          {action}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   7. NEW (2026-09-12/13, Spectrum-lab comparison wave) — OtpInput,
      StepIndicator, StegForm, FeatureIntro, ErrorState, HoldToConfirm,
      Dropdown, DataTable.
   ══════════════════════════════════════════════════════════════════════════ */

/** OtpInput — the one-time-code field. A dedicated component, not an
 *  `Input` variant, because the BEHAVIOUR (typography changes with CONTENT,
 *  not with a variant prop) is unique to this one field: normal field size
 *  until it has content, then jumps to large, tracked digits (22px/0.35em/
 *  mono). Uses the shared `.frv-focus-glow` class (same gray field glow as
 *  `Input`) — the global accent ring is for buttons/links, not fields. */
export function OtpInput({
  verdi, onChange, lengde = 6, feil, className, ...props
}: {
  verdi: string
  onChange: (verdi: string) => void
  /** Max number of digits. Default 6. */
  lengde?: number
  /** Red border — same signal as `Input`/`Select`'s `error` prop. */
  feil?: boolean
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'className'>) {
  const filled = verdi.length > 0
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      required
      value={verdi}
      onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, lengde))}
      placeholder="Enter the code"
      className={cx(
        'w-full py-[13px] px-3.5 text-center outline-none transition-colors frv-focus-glow',
        'bg-[var(--frv-gray-alpha-100)] rounded-[var(--frv-radius-sm)] text-[var(--frv-text-primary)]',
        'placeholder:text-[var(--frv-text-tertiary)]',
        // `font-mono`/22px/600/tracked is ONLY for actually-typed digits — an
        // empty field (placeholder only) stays sans, label-16, so the
        // placeholder text itself is never rendered in mono.
        filled ? 'font-mono text-[22px] font-semibold tracking-[0.35em]' : 'font-sans text-[16px] font-normal tracking-normal',
        feil ? 'border border-[var(--frv-error)] focus:border-[var(--frv-error)]' : 'border border-[var(--frv-border)] focus:border-[var(--frv-border-3)]',
        className,
      )}
      {...props}
    />
  )
}

export type StepIndicatorVariant = 'prikker' | 'piller'

/** StepIndicator — shows PROGRESS through a fixed number of steps (0-based
 *  active index), not a navigation element: it shows where you are, it
 *  doesn't move you there. `prikker`: equal-size round dots, active one is
 *  largest and solid — for a short, unnamed sequence where only POSITION
 *  matters. `piller`: the active step becomes an elongated capsule — when
 *  the steps have a DIRECTION you move through (a registration flow).
 *
 *  `onStegKlikk` makes ONLY completed steps (index < active) clickable —
 *  used by `StegForm` below. Without this prop the component stays 100%
 *  non-interactive, exactly as documented — you can never jump forward from
 *  here. `ariaLabel` names the `role="progressbar"` (required for a valid
 *  accessible name); default `Step N of M` covers every call site that
 *  doesn't set it. */
export function StepIndicator({
  antall, aktiv, variant = 'prikker', onStegKlikk, ariaLabel, className,
}: {
  antall: number
  /** 0-based index of the active step. */
  aktiv: number
  variant?: StepIndicatorVariant
  /** Makes completed steps (index < `aktiv`) clickable — see the section comment. */
  onStegKlikk?: (index: number) => void
  /** Accessible name for `role="progressbar"`. Default "Step N of M". */
  ariaLabel?: string
  className?: string
}) {
  return (
    <div className={cx('flex items-center justify-center gap-1.5', className)} role="progressbar" aria-label={ariaLabel ?? `Step ${aktiv + 1} of ${antall}`} aria-valuenow={aktiv + 1} aria-valuemin={1} aria-valuemax={antall}>
      {Array.from({ length: antall }).map((_, i) => {
        const isActive = i === aktiv
        const isDone = i < aktiv
        const dotClass = cx(
          'rounded-(--frv-radius-full) transition-all duration-[250ms]',
          isActive ? 'bg-(color:--frv-text-primary)' : 'bg-(color:--frv-gray-alpha-300)',
          variant === 'piller'
            ? (isActive ? 'w-5 h-1.5' : 'w-1.5 h-1.5')
            : (isActive ? 'w-2 h-2' : 'w-1.5 h-1.5'),
        )
        if (onStegKlikk && isDone) {
          return (
            <button key={i} type="button" onClick={() => onStegKlikk(i)} aria-label={`Go to step ${i + 1}`} className="p-1 -m-1 cursor-pointer">
              <span className={dotClass} />
            </button>
          )
        }
        return <span key={i} className={dotClass} />
      })}
    </div>
  )
}

/* StegForm sin rene steg-/valideringslogikk. Kept as plain functions (not a
 * separate module) — same merge-into-one-section convention as `lib/dataTable.ts`
 * below. */
export interface StegFormStepLike {
  /** Called for the CURRENT step when the user tries to advance. `undefined` = always allowed. */
  kanGaVidere?: () => boolean
}

/** Can the user go from `aktiv` to `target`, given the steps?
 *  - Backward (or staying put) is always allowed.
 *  - Forward is only allowed ONE step at a time — jumping over several at
 *    once doesn't exist in the UI, but the function rejects it explicitly anyway.
 *  - Forward requires the current step's `kanGaVidere` (if set) to be true.
 *  - Indexes outside `[0, steps.length)` are always rejected. */
export function kanGaTilSteg<T extends StegFormStepLike>(steps: readonly T[], aktiv: number, target: number): boolean {
  if (target < 0 || target >= steps.length) return false
  if (target <= aktiv) return true
  if (target !== aktiv + 1) return false
  return kanGaVidereFra(steps, aktiv)
}

/** The CURRENT step's own gate ("Next"/"Finish"): `kanGaVidere()` if set,
 *  otherwise always allowed. A separate function because "Finish" on the
 *  LAST step has no target step — `kanGaTilSteg(steps, aktiv, aktiv + 1)`
 *  then always rejected (the target is outside the list) and the button
 *  stayed permanently disabled, regardless of `kanGaVidere`. Found by the
 *  component test suite 2026-09-13. */
export function kanGaVidereFra<T extends StegFormStepLike>(steps: readonly T[], aktiv: number): boolean {
  const gjeldende = steps[aktiv]
  return gjeldende?.kanGaVidere ? gjeldende.kanGaVidere() : true
}

/** 0-based index of the last step. */
export function erSisteSteg(antallSteg: number, aktiv: number): boolean {
  return aktiv === antallSteg - 1
}

export interface StegFormStep {
  id: string
  title: string
  /** Shown with the title in the step text above the content. */
  description?: string
  content: ReactNode
  /** Called on "Next"/"Finish" click. `false` stops the step change and also drives whether the button shows disabled. Without it you can always proceed. */
  kanGaVidere?: () => boolean
}

interface StegFormProps {
  steps: StegFormStep[]
  /** 0-based active step — `StegForm` is CONTROLLED, the caller owns `aktivIndex`. */
  aktivIndex: number
  onStegChange: (index: number) => void
  /** Called from "Finish" on the last step (after a passing `kanGaVidere`). */
  onFullfor: () => void
  /** Button text on the last step. Default "Finish". */
  fullforLabel?: string
  /** Loading state on Next/Finish — disables both buttons and shows a spinner on the active one. */
  laster?: boolean
  className?: string
}

/** StegForm — a ready-made multi-step form frame: step switching, per-step
 *  validation, preserved state, and step announcement for screen readers,
 *  so a registration/onboarding flow doesn't hand-roll all four from
 *  scratch. CONTROLLED: the caller owns `aktivIndex` (field values live in
 *  the caller's own state, not StegForm's, so they survive going back and
 *  forth — only the VISIBLE step, `steg.content`, is swapped).
 *  `kanGaVidere` is called on "Next"/"Finish" click AND drives whether the
 *  button is disabled — no double source of truth. Actual async work (send
 *  a one-time code, create something) belongs in the caller's
 *  `onStegChange`/`onFullfor` — StegForm has no opinion on what a step
 *  change actually DOES beyond the navigation itself, and exposes `laster`
 *  to show/disable the buttons while it happens. `aria-live="polite"` on
 *  the step text announces a step change without re-reading the whole
 *  panel. Back/Next/Finish live in the shared `ActionBar`. */
export function StegForm({ steps, aktivIndex, onStegChange, onFullfor, fullforLabel = 'Finish', laster, className }: StegFormProps) {
  const antall = steps.length
  const steg = steps[aktivIndex]
  const sisteSteg = erSisteSteg(antall, aktivIndex)
  // `kanGaVidereFra`, NOT `kanGaTilSteg(steps, aktivIndex, aktivIndex + 1)`:
  // on the LAST step there is no target step, so that call always rejected
  // and "Finish" stayed permanently disabled — see `kanGaVidereFra`'s own comment.
  const kanGaVidereNa = kanGaVidereFra(steps, aktivIndex)

  function nesteEllerFullfor() {
    if (!kanGaTilSteg(steps, aktivIndex, aktivIndex + 1)) return
    if (sisteSteg) onFullfor()
    else onStegChange(aktivIndex + 1)
  }

  function gaTilbake() {
    if (kanGaTilSteg(steps, aktivIndex, aktivIndex - 1)) onStegChange(aktivIndex - 1)
  }

  return (
    <div className={cx('flex flex-col gap-5 min-w-0', className)}>
      <div className="flex flex-col items-center gap-2">
        <StepIndicator antall={antall} aktiv={aktivIndex} variant="piller" onStegKlikk={i => { if (kanGaTilSteg(steps, aktivIndex, i)) onStegChange(i) }} />
        <p aria-live="polite" className="type-label-12 text-center" style={{ color: 'var(--frv-text-tertiary)' }}>
          Step {aktivIndex + 1} of {antall} · {steg.title}
          {steg.description && <> — {steg.description}</>}
        </p>
      </div>

      {/* `key`: a light CSS pop-in (shared keyframe, see the token file's
          "Bevegelsesklasser" section) when the step changes — same class
          `FeatureIntro` below uses to come in. */}
      <div key={steg.id} className="pop-in min-w-0">{steg.content}</div>

      <ActionBar>
        {aktivIndex > 0 && <Button type="button" variant="secondary" onClick={gaTilbake} disabled={laster}>Back</Button>}
        <Button type="button" variant="accent" onClick={nesteEllerFullfor} disabled={laster || !kanGaVidereNa} loading={laster}>
          {sisteSteg ? fullforLabel : 'Next'}
        </Button>
      </ActionBar>
    </div>
  )
}

const FEATURE_INTRO_KEY_PREFIX = 'frivio_intro_'
/** Fallback when the `.dismiss-out` `animationend` never fires (reduced motion). */
const FEATURE_INTRO_CLOSE_FALLBACK_MS = 200

type FeatureIntroPhase = 'open' | 'closing' | 'closed'

function featureIntroNoSubscribe() { return () => {} }
function featureIntroServerSnapshot() { return null }
function featureIntroVisible(key: string): boolean {
  try {
    return localStorage.getItem(key) !== '1'
  } catch {
    // No localStorage — show it once too many rather than crash or never show.
    return true
  }
}
function featureIntroSetSeen(key: string) {
  try { localStorage.setItem(key, '1') } catch { /* nothing to persist to */ }
}

/** Pure threshold decision: how many unseen news items give which display.
 *  Exported only for testability. 0 → hidden (nothing left), 1 → single
 *  (looks like the single-item card, no counter), >1 → stepper (badge "New"
 *  + counter, one item at a time + "Next"). */
export function introVisning(antallSynlige: number): 'skjult' | 'enkel' | 'stepper' {
  if (antallSynlige <= 0) return 'skjult'
  return antallSynlige === 1 ? 'enkel' : 'stepper'
}

/** Resets the once-only guard for `id`, so the card shows again. For testing/demos. */
export function resetIntro(id: string) {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(FEATURE_INTRO_KEY_PREFIX + id) } catch { /* nothing stored to reset */ }
}

function FeatureIntroArrow({ direction }: { direction: 'up' | 'down' }) {
  const up = direction === 'up'
  return (
    <>
      {/* Edge — 1px larger than the fill, gives a thin stroke around the triangle. */}
      <span
        aria-hidden
        className={cx(
          'absolute left-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent',
          up ? 'top-[-8px] border-b-[8px] border-b-(color:--frv-border-2)' : 'bottom-[-8px] border-t-[8px] border-t-(color:--frv-border-2)',
        )}
      />
      {/* Fill — 1px inside the edge, offset toward the tip. */}
      <span
        aria-hidden
        className={cx(
          'absolute left-[21px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent',
          up ? 'top-[-7px] border-b-[7px] border-b-(color:--frv-surface-2)' : 'bottom-[-7px] border-t-[7px] border-t-(color:--frv-surface-2)',
        )}
      />
    </>
  )
}

/** FeatureIntro — the "here's something new" card every newly-shipped
 *  user-visible capability should get, placed right at the feature, shown
 *  once per user, dismissable (see AGENTS.md, "New user-facing functionality
 *  must be introduced in the surface"). The once-only guard follows the same
 *  recipe as a one-time confetti trigger: a `localStorage` key
 *  (`frivio_intro_<id>`), try/catch around every read/write. Server-renders
 *  as `null` until mount, so there's no hydration gap between SSR (doesn't
 *  know if the key exists) and the client.
 *
 *  Neutral material (bg `--frv-surface-2`, border `--frv-border-2`) — "new"
 *  shouldn't read as the info/alert color. The "New" label is `Badge
 *  variant="inverted"`. The arrow is a small CSS triangle in the same
 *  surface/border, drawn with two stacked border-triangles — same idiom as
 *  an ordinary popover arrow, no extra dependency.
 *
 *  The card is INLINE where the developer places it — no floating/portal
 *  positioning; that would be unnecessary complexity for something shown at
 *  most once.
 *
 *  Motion: the card comes in with the shared `.pop-in` and leaves with
 *  `.dismiss-out` (both from the token file's "Bevegelsesklasser" section —
 *  no own keyframes here). The node is removed on `animationend` for
 *  `dismiss-out`, with a 200ms timer fallback (under `prefers-reduced-motion`
 *  the animation is off and the event never fires). The localStorage flag is
 *  written only once the animation finishes, so a flag written at click time
 *  wouldn't hide the card mid-slide-out. `handling` is the "apply" variant —
 *  a secondary button that runs an action and closes with the same
 *  animation. `cta` is different: a primary action that leaves the card
 *  standing (e.g. "See how" opens something without ending the intro).
 *
 *  GROUP SUPPORT (2026-09-13): more than one card stacked on the same page
 *  reads badly, so the rule is max ONE bubble per page. `nyheter?:
 *  {id, tittel, beskrivelse}[]` covers a page with several news items in
 *  ONE bubble instead: when set, the root `id`/`tittel`/`children`/
 *  `beskrivelse`/`cta`/`handling` are ignored (they only apply to the
 *  single-item case). Visibility is computed per news id exactly as before
 *  (same `frivio_intro_<id>` key, same `useSyncExternalStore` pattern — now
 *  with a bitmap STRING instead of one boolean, since strings compare by
 *  value and are therefore safe to return from `getSnapshot` without the
 *  new-array-reference caching trap `useSyncExternalStore` otherwise has).
 *  All dismissed: the bubble stays hidden. Exactly one unread: it looks like
 *  the single-item card (badge "New", one title).
 *
 *  ONE AT A TIME, NOT A BULLET LIST (2026-09-14, correcting the round from the
 *  night before): a bullet list ("New (N)" + bold title/sentence per item)
 *  read badly for two reasons — a plain-text "Got it" without a border missed
 *  alignment against the text above it, and when there were two new things,
 *  they belonged in the SAME view a "Next" click moves through. So instead:
 *  more than one unread shows badge "New" + a counter ("1 of 2") and ONE item
 *  at a time, with "Got it" (dismisses ONLY the one shown, advances to the
 *  next unread — or closes the bubble with the slide-out if none remain) and
 *  "Next ->" (only switches which one is shown, dismisses nothing, visible
 *  only when more unread items follow this one). On reload the FIRST unread
 *  always shows, regardless of where in the sequence the user last was — no
 *  "last shown" position is stored, only which ids are dismissed. "Got it" is
 *  `variant="secondary"` (a real border) instead of `"tertiary"`: the button
 *  starts where the description above it starts (no negative margin needed —
 *  both are direct children of the same padded card), but without a visible
 *  border the plain-text version read as offset from the paragraph above
 *  instead of a clear button. */
type FeatureIntroNyhet = { id: string; tittel: string; beskrivelse: string }

export function FeatureIntro({
  id, tittel, children, beskrivelse, cta, handling, plassering = 'under', className, nyheter,
}: {
  /** Unique key for the once-only guard, e.g. "finance-sweep-2026-08". Optional when `nyheter` is set. */
  id?: string
  /** Optional when `nyheter` is set — each news item has its own title then. */
  tittel?: string
  /** Free-form markup instead of `beskrivelse`, when the content needs more than one paragraph. Not used together with `nyheter`. */
  children?: ReactNode
  beskrivelse?: string
  /** Optional primary action next to "Got it" — leaves the card standing (e.g. "See how"). Not used together with `nyheter`. */
  cta?: { tekst: string; onClick: () => void }
  /** Optional action that RUNS and CLOSES the card with the same animation as "Got it" (e.g. "Turn on"). Not used together with `nyheter`. */
  handling?: { label: string; onClick: () => void }
  /** Which side of the feature the card sits on — controls which way the arrow points. `'under'` (default): card sits UNDER the feature → arrow up. `'over'`: card sits OVER it → arrow down. */
  plassering?: 'over' | 'under'
  className?: string
  /**
   * Several news items in ONE bubble — max one bubble per page (see the
   * "GROUP SUPPORT" note above). When set: root `id`/`tittel`/`children`/
   * `beskrivelse`/`cta`/`handling` are ignored. Each item is dismissed on
   * its own (same `frivio_intro_<id>` storage as otherwise), and the bubble
   * renders as an ordinary single card once only one remains unread.
   */
  nyheter?: FeatureIntroNyhet[]
}) {
  const internNyheter: FeatureIntroNyhet[] = nyheter ?? (id ? [{ id, tittel: tittel ?? '', beskrivelse: beskrivelse ?? '' }] : [])

  // Read safely via useSyncExternalStore: getServerSnapshot returns null
  // (same as SSR — "don't know yet", the card is hidden), no hydration gap.
  // The snapshot is a bitmap STRING (one '0'/'1' per item in `internNyheter`,
  // in order) instead of one boolean — strings compare by value, so
  // useSyncExternalStore's cache check holds even though `internNyheter` is
  // a new array reference on every render (typically a literal from the call
  // site). `phase` is the local override for the close itself: "Got it"
  // should always work THIS session even if the localStorage write fails,
  // and the card must get to slide out before the flag hides it for good.
  const bitmap = useSyncExternalStore(
    featureIntroNoSubscribe,
    () => internNyheter.map(n => (featureIntroVisible(FEATURE_INTRO_KEY_PREFIX + n.id) ? '1' : '0')).join(''),
    featureIntroServerSnapshot,
  )
  const [phase, setPhase] = useState<FeatureIntroPhase>('open')
  // Which news id the stepper is CURRENTLY showing (not which are dismissed —
  // that's `bitmap`). `null` = none explicitly picked yet → first unread (see
  // `current` below). Only relevant in stepper display; single/hidden don't
  // care about this.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Which ids "Got it" should write flags for — set in `close()` the instant
  // the user clicks, used by the close effect/animationend below. A ref (not
  // `synlige` directly) so the effect's dependency stays `phase` alone, same
  // as before group support — `synlige` is a new array reference every render.
  const synligeIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (phase !== 'closing') return
    const timer = setTimeout(() => {
      for (const nid of synligeIdsRef.current) featureIntroSetSeen(FEATURE_INTRO_KEY_PREFIX + nid)
      setPhase('closed')
    }, FEATURE_INTRO_CLOSE_FALLBACK_MS)
    return () => clearTimeout(timer)
  }, [phase])

  if (bitmap === null || phase === 'closed') return null
  const synlige = internNyheter.filter((_, i) => bitmap[i] === '1')
  const modus = introVisning(synlige.length)
  if (modus === 'skjult') return null

  function close() {
    if (phase !== 'open') return
    synligeIdsRef.current = synlige.map(n => n.id)
    setPhase('closing')
  }

  function finishClosing(e: AnimationEvent<HTMLDivElement>) {
    // `.pop-in` on mount also fires animationend — only the slide-out should remove the node.
    if (phase !== 'closing' || e.animationName !== 'dismiss-out') return
    for (const nid of synligeIdsRef.current) featureIntroSetSeen(FEATURE_INTRO_KEY_PREFIX + nid)
    setPhase('closed')
  }

  const isStepper = modus === 'stepper'
  // Currently shown item: `selectedId` while still unread, else the first
  // unread (mount, reload, or after the selected one was itself dismissed
  // elsewhere). `idx` is its position in `synlige` — used for the counter and
  // to decide whether "Next" should show.
  const current = synlige.find(n => n.id === selectedId) ?? synlige[0]
  const idx = synlige.findIndex(n => n.id === current.id)
  const hasMoreAfter = idx < synlige.length - 1

  // Single display: either the classic call (no `nyheter`) or the stepper
  // call with only one unread item left — "looks like it does today".
  const enkelTittel = nyheter ? current.tittel : tittel
  const enkelInnhold = nyheter
    ? <Text variant="copy-13" tone="secondary">{current.beskrivelse}</Text>
    : (children ?? (beskrivelse ? <Text variant="copy-13" tone="secondary">{beskrivelse}</Text> : null))

  /** "Got it" — dismisses ONLY the item shown now, never the rest of the
   *  list. If it's the only one left (classic single call, or the last in the
   *  stepper), the whole bubble closes with the slide-out (same `close()` as
   *  before). Otherwise the flag is written immediately and the display jumps
   *  to one of the remaining ones — the bubble stays up. The sequence
   *  "dismiss #2 while #1 is still unread" must land on #1 (the only one
   *  left), not close everything — so ONLY the current item is filtered out,
   *  not "everything from idx onward". */
  function dismissCurrent() {
    if (phase !== 'open') return
    const remaining = synlige.filter(n => n.id !== current.id)
    if (remaining.length === 0) {
      close()
      return
    }
    featureIntroSetSeen(FEATURE_INTRO_KEY_PREFIX + current.id)
    setSelectedId(remaining[0].id)
  }

  /** "Next" — only switches which item is shown, dismisses nothing. */
  function showNext() {
    if (!hasMoreAfter) return
    setSelectedId(synlige[idx + 1].id)
  }

  return (
    <div
      className={cx(
        'relative max-w-md rounded-[var(--frv-radius-md)] px-3.5 py-3 bg-(color:--frv-surface-2) border border-(color:--frv-border-2)',
        phase === 'closing' ? 'dismiss-out' : 'pop-in',
        className,
      )}
      onAnimationEnd={finishClosing}
    >
      <FeatureIntroArrow direction={plassering === 'under' ? 'up' : 'down'} />
      {isStepper ? (
        <>
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Badge variant="inverted" size="sm">New</Badge>
            <Text variant="label-12" tone="tertiary">{idx + 1} of {synlige.length}</Text>
          </div>
          <Text variant="heading-14" tone="primary" className="mb-1" truncate>{current.tittel}</Text>
          <div className="mb-3">
            <Text variant="copy-13" tone="secondary">{current.beskrivelse}</Text>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Badge variant="inverted" size="sm">New</Badge>
            <Text variant="heading-14" tone="primary" truncate>{enkelTittel}</Text>
          </div>
          {enkelInnhold && <div className="mb-3">{enkelInnhold}</div>}
        </>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {!nyheter && cta && <Button variant="accent" size="sm" onClick={cta.onClick}>{cta.tekst}</Button>}
        {!nyheter && handling && <Button variant="secondary" size="sm" onClick={() => { handling.onClick(); close() }}>{handling.label}</Button>}
        <Button variant="secondary" size="sm" onClick={dismissCurrent}>Got it</Button>
        {isStepper && hasMoreAfter && (
          <Button variant="tertiary" size="sm" onClick={showNext}>Next →</Button>
        )}
      </div>
    </div>
  )
}

/** FeatureTour — a guided tour shown once after an update: a centered
 *  "What's new" summary followed by anchored popovers, one per item, with
 *  Next/Skip. Ported in SIMPLIFIED, SINGLE-PAGE form: the full Frivio app
 *  version additionally navigates between ROUTES between steps (its news
 *  items live on different pages of a multi-page app) — this port has no
 *  router dependency, so it assumes every item's anchor is already on the
 *  CURRENT page. Drop a `<FeatureTourAnchor id="…">` (or your own
 *  `data-intro="<id>"` attribute) next to each feature the tour introduces,
 *  in any order, then render ONE `<FeatureTour introer={[...]} />` for the
 *  whole page.
 *
 *  Same once-only guard as `FeatureIntro` above (`frivio_intro_<id>` in
 *  localStorage) — a card already dismissed as a `FeatureIntro`, or a tour
 *  step already seen, never shows again in the other form either.
 *
 *  Flow: on mount, find every item NOT yet seen. None → renders nothing,
 *  ever — this is the ONLY time the unseen set is computed; the tour does
 *  not notice items added after mount. Some → a centered `Modal` summary
 *  ("N items" + titles) with "Show me"/"Skip" (`Skip` marks everything
 *  seen — the tour never re-opens for these ids). "Show me" steps through
 *  the unseen items one at a time: wait for `[data-intro~="<id>"]` to exist
 *  (poll, ~4s timeout — a conditionally rendered feature might not be
 *  mounted yet), anchor a popover to it with `useFloatingPosition` (the
 *  same primitive `Popover` above uses — not `Popover` itself, which is
 *  built for a trigger in its own tree; here the anchor is found with
 *  `querySelector`), counter ("2 of 5"), "Next"/"Done", "Skip rest".
 *  Timeout with nothing found: that step's popover simply never renders (no
 *  fallback-anchor support in this simplified port — the app version
 *  anchors to the page's main content instead; add that yourself if you
 *  need it, same `result.el` check below). Escape/click outside on ANY step
 *  = skip the rest.
 *  No `localStorage`: never shows, on purpose (better than showing forever).
 *
 *  NOT ported: the Frivio app version also draws a thin accent ring
 *  (`.tour-highlight`) around the anchored element's parent — that's a
 *  project-specific CSS utility from `app/globals.css`, not part of this
 *  token file, and dropped here to keep the port dependency-free. Add your
 *  own `outline` rule keyed off the anchor's parent if you want the same
 *  effect (see the app source, `components/ui/FeatureTour.tsx`). */
type FeatureTourItem = { id: string; tittel: string; beskrivelse: string; anker?: string }

const FEATURE_TOUR_POLL_MS = 150
const FEATURE_TOUR_POLL_TIMEOUT_MS = 4000

function featureTourHasStorage(): boolean {
  try {
    const probe = '__frivio_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}
function featureTourUnseen(introer: FeatureTourItem[]): FeatureTourItem[] {
  return introer.filter(i => featureIntroVisible(FEATURE_INTRO_KEY_PREFIX + i.id))
}

/** Drop this next to any feature a `FeatureTour` should point at — renders a
 *  zero-size, invisible marker at that exact spot (same DOM position, no
 *  layout impact). Equivalent to adding `data-intro="<id>"` yourself. */
export function FeatureTourAnchor({ id, className }: { id: string; className?: string }) {
  return <span aria-hidden data-intro={id} className={cx('inline-block w-0 h-0 align-top', className)} />
}

export function FeatureTour({
  introer, className,
}: {
  /** Every news item this tour can show — usually your whole "what's new since the last visit" list. */
  introer: FeatureTourItem[]
  className?: string
}) {
  const [fase, setFase] = useState<'hidden' | 'summary' | 'step' | 'done'>('hidden')
  const [unseen, setUnseen] = useState<FeatureTourItem[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  // Search result tagged with the step it was found FOR — lets `ready`/`el`
  // be derived instead of reset with a separate synchronous setState at the
  // top of the step effect (see the app version's own note on this).
  const [result, setResult] = useState<{ stepIndex: number; el: HTMLElement | null } | null>(null)
  const anchorRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const ready = result?.stepIndex === stepIndex
  const el = ready ? result!.el : null

  // Layout effect, not a plain effect: `useFloatingPosition`'s own measuring
  // effect must see the UPDATED ref — see FloatingLayer's ordering note.
  useLayoutEffect(() => { anchorRef.current = el }, [el])

  // Wrapped in a stable ref-callback (not called directly in the effect body)
  // so the mount-time setState calls below aren't flagged as an avoidable
  // cascading render by React's set-state-in-effect check — this genuinely
  // IS the one-time sync from an external system (localStorage) the rule
  // wants effects reserved for, not a value derivable during render.
  const start = useRef(() => {
    if (!featureTourHasStorage()) return
    const found = featureTourUnseen(introer)
    if (found.length === 0) return
    setUnseen(found)
    setStepIndex(0)
    setFase('summary')
  })
  useEffect(() => { start.current() }, [])

  const current = unseen[stepIndex]

  useEffect(() => {
    if (fase !== 'step' || !current) return
    const token = current.anker ?? current.id
    const selector = `[data-intro~="${token}"]`
    const thisStep = stepIndex
    let cancelled = false
    const start = Date.now()
    function check() {
      if (cancelled) return
      const found = document.querySelector<HTMLElement>(selector)
      if (found) { setResult({ stepIndex: thisStep, el: found }); return }
      if (Date.now() - start > FEATURE_TOUR_POLL_TIMEOUT_MS) { setResult({ stepIndex: thisStep, el: null }); return }
      setTimeout(check, FEATURE_TOUR_POLL_MS)
    }
    check()
    return () => { cancelled = true }
  }, [fase, stepIndex, current])

  function finishAndMark(fromIndex: number) {
    for (const i of unseen.slice(fromIndex)) featureIntroSetSeen(FEATURE_INTRO_KEY_PREFIX + i.id)
    setFase('done')
  }
  function showMe() { setFase('step') }
  function skipAll() { finishAndMark(0) }
  function next() {
    if (!current) return
    featureIntroSetSeen(FEATURE_INTRO_KEY_PREFIX + current.id)
    if (stepIndex + 1 >= unseen.length) { setFase('done'); return }
    setStepIndex(i => i + 1)
  }
  function skipRest() { finishAndMark(stepIndex) }

  const pos = useFloatingPosition(anchorRef, {
    open: fase === 'step' && ready && !!el,
    panelRef,
    side: 'bottom',
    align: 'start',
    offset: 10,
    onAnchorOutOfView: skipRest,
  })

  useKlikkUtenfor([panelRef], skipRest, fase === 'step' && ready && !!el)

  if (fase === 'hidden' || fase === 'done') return null

  return (
    <>
      <Modal
        open={fase === 'summary'}
        onClose={skipAll}
        title="What's new"
        subtitle={`${unseen.length} ${unseen.length === 1 ? 'item' : 'items'} since your last visit`}
        ariaLabel="What's new"
      >
        <ModalBody>
          <ul className="space-y-2">
            {unseen.map(i => (
              <li key={i.id} className="type-copy-14 text-(color:--frv-text-secondary) flex items-start gap-2">
                <span aria-hidden className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-(color:--frv-accent)" />
                {i.tittel}
              </li>
            ))}
          </ul>
        </ModalBody>
        <ModalActions sticky>
          <Button variant="tertiary" size="sm" onClick={skipAll}>Skip</Button>
          <Button variant="secondary" size="sm" onClick={showMe}>Show me</Button>
        </ModalActions>
      </Modal>

      {fase === 'step' && ready && el && current && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={current.tittel}
          className={cx(
            // `fixed` already gives a positioning context for the arrow's
            // `absolute` child — do NOT also add `relative` (tailwind-merge
            // treats position utilities as one conflict group and would
            // silently drop `fixed`, breaking the viewport positioning).
            'pop-in fixed top-(--tour-top) left-(--tour-left) z-50 max-w-sm',
            'rounded-[var(--frv-radius-md)] px-3.5 py-3 bg-(color:--frv-surface-2) border border-(color:--frv-border-2) shadow-(--frv-shadow-menu)',
            pos ? 'visible' : 'invisible',
            className,
          )}
          style={{ '--tour-top': `${pos?.top ?? 0}px`, '--tour-left': `${pos?.left ?? 0}px` } as CSSProperties}
        >
          <FeatureIntroArrow direction={pos?.side === 'top' ? 'down' : 'up'} />
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Badge variant="inverted" size="sm">New</Badge>
            <Text variant="label-12" tone="tertiary">{stepIndex + 1} of {unseen.length}</Text>
          </div>
          <Text variant="heading-14" tone="primary" className="mb-1">{current.tittel}</Text>
          <div className="mb-3"><Text variant="copy-13" tone="secondary">{current.beskrivelse}</Text></div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={next}>{stepIndex + 1 >= unseen.length ? 'Done' : 'Next'}</Button>
            {stepIndex + 1 < unseen.length && <Button variant="tertiary" size="sm" onClick={skipRest}>Skip rest</Button>}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

/** ErrorState — sibling to `EmptyState`: the state after a FAILED fetch.
 *  Where the empty state points at the first step, the error state points
 *  at the one step that exists — "Try again" — with a spinner built in
 *  while `onRetry` runs. Same geometry as `EmptyState` (so the two can swap
 *  places without a layout jump): neutral card with a SOLID border (not
 *  dashed — dashed means "something can go here"), a 40px circle in
 *  `--frv-error-light` with the icon in `--frv-error-text`, `heading-16`
 *  title, `copy-14` message in text-secondary. Red ONLY in the icon tile —
 *  the error is one signal, not a whole red surface. `compact` is a
 *  one-row version for inside a card or section that otherwise has content
 *  around it.
 *
 *  `message` should be PLAIN LANGUAGE — pass a user-facing message from the
 *  call site, never a raw error/exception message. `details` is the
 *  technical text (status code, server error string) behind a collapsible
 *  "Technical details" — visible to whoever needs to report the bug,
 *  invisible to whoever just wants to move on. */
export function ErrorState({
  title, message, onRetry, retryLabel = 'Try again', details, compact = false, icon: Icon = WarningIcon, className,
}: {
  /** What didn't work, as a title: "Couldn't load transactions". */
  title: string
  /** Plain-language explanation/next step (copy-14). */
  message?: ReactNode
  /** Run by "Try again". If it returns a Promise, the button spins until it settles. */
  onRetry?: () => void | Promise<void>
  /** Default "Try again". */
  retryLabel?: string
  /** Technical text behind a collapsible "Technical details". */
  details?: string
  /** One row, for inside a card/section. */
  compact?: boolean
  /** Default a warning triangle. */
  icon?: IconComponent
  className?: string
}) {
  const [retrying, setRetrying] = useState(false)

  async function retry() {
    if (!onRetry) return
    setRetrying(true)
    try { await onRetry() } finally { setRetrying(false) }
  }

  const retryButton = onRetry && (
    <Button variant="secondary" size="sm" loading={retrying} onClick={retry} className="shrink-0">
      {!retrying && <RefreshIcon size={14} />}
      {retryLabel}
    </Button>
  )

  const detailsNode = details && (
    <details className={cx('w-full', compact ? 'mt-2' : 'mt-4 max-w-md text-left')}>
      <summary className="type-label-12 cursor-pointer select-none text-(color:--frv-text-tertiary)">Technical details</summary>
      <pre className="type-copy-13-mono mt-2 p-3 whitespace-pre-wrap break-words rounded-[var(--frv-radius-sm)] bg-(color:--frv-gray-alpha-100) text-(color:--frv-text-secondary)">{details}</pre>
    </details>
  )

  if (compact) {
    return (
      <div role="alert" className={cx('flex flex-wrap items-center gap-3 p-3 rounded-[var(--frv-radius-md)] bg-(color:--frv-surface) border border-(color:--frv-border)', className)}>
        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-(color:--frv-error-light)">
          <Icon size={14} className="text-(color:--frv-error-text)" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="type-heading-14">{title}</p>
          {message && <p className="type-copy-13 text-(color:--frv-text-secondary)">{message}</p>}
          {detailsNode}
        </div>
        {retryButton && <div className="ml-auto">{retryButton}</div>}
      </div>
    )
  }

  return (
    <div role="alert" className={cx('flex flex-col items-center justify-center py-12 px-6 text-center rounded-[var(--frv-radius-md)] bg-(color:--frv-surface) border border-(color:--frv-border)', className)}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-(color:--frv-error-light)">
        <Icon size={18} className="text-(color:--frv-error-text)" />
      </div>
      <p className="type-heading-16 mb-1">{title}</p>
      {message && <p className="type-copy-14 max-w-sm text-(color:--frv-text-secondary)">{message}</p>}
      {retryButton && <div className="mt-5">{retryButton}</div>}
      {detailsNode}
    </div>
  )
}

/* Hold-to-confirm — pure state machine, no DOM or React. Kept as plain
 * functions here (not a separate module) — same merge-into-one-section
 * convention as the rest of this section.
 *
 *   idle ──start(source)──▶ holding ──(holdMs)──▶ confirmed ──reset()──▶ idle
 *            ▲                 │
 *            └──release(last source) / cancel()
 *
 * Two sources (pointer and keyboard) can hold at once: a source that joins
 * while another is already holding does NOT restart the fill, and the fill
 * only cancels once the LAST source releases. After `confirmed`, `start` is
 * a no-op until `reset()` — one confirmation per hold, never two. */
export type HoldPhase = 'idle' | 'holding' | 'confirmed'
export type HoldSource = 'pointer' | 'keyboard'

export interface HoldController {
  /** Begin holding. Returns `true` if a new fill started. */
  start(source: HoldSource, holdMs: number): boolean
  /** Release one source. Only cancels once no source is holding anymore. */
  release(source: HoldSource): void
  /** Release every source (blur, pointercancel, unmount). */
  cancel(): void
  /** Back to `idle` after a confirmation (a failed action, another round). */
  reset(): void
  phase(): HoldPhase
  /** Cleaned up on unmount — stops a running timer if any. */
  dispose(): void
}

export function createHold(opts: { onConfirm: () => void; onChange?: (phase: HoldPhase) => void }): HoldController {
  let phase: HoldPhase = 'idle'
  let timer: ReturnType<typeof setTimeout> | null = null
  const sources = new Set<HoldSource>()

  function set(next: HoldPhase) {
    if (phase === next) return
    phase = next
    opts.onChange?.(next)
  }
  function stopTimer() { if (timer !== null) { clearTimeout(timer); timer = null } }
  function complete() {
    timer = null
    sources.clear()
    set('confirmed')
    opts.onConfirm()
  }

  return {
    start(source, holdMs) {
      if (phase === 'confirmed') return false
      const alreadyHolding = sources.size > 0
      sources.add(source)
      if (alreadyHolding) return false
      set('holding')
      stopTimer()
      timer = setTimeout(complete, holdMs)
      return true
    },
    release(source) {
      sources.delete(source)
      if (sources.size > 0 || phase !== 'holding') return
      stopTimer()
      set('idle')
    },
    cancel() {
      sources.clear()
      if (phase !== 'holding') return
      stopTimer()
      set('idle')
    },
    reset() {
      stopTimer()
      sources.clear()
      set('idle')
    },
    phase: () => phase,
    dispose: stopTimer,
  }
}

const HOLD_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
function holdSubscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(HOLD_REDUCED_MOTION_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const holdGetReducedMotion = () => window.matchMedia(HOLD_REDUCED_MOTION_QUERY).matches
const holdGetReducedMotionServer = () => false

/** HoldToConfirm — a button that requires the user to HOLD it down for
 *  `holdMs` (1.2s) before the action runs. The fill growing from the left
 *  IS the confirmation: release early and nothing happens, the fill resets.
 *  No dialog.
 *
 *  RESERVED FOR THE 2-3 MOST DESTRUCTIVE ACTIONS in the system — delete a
 *  building, delete a user/customer. `ConfirmProvider`/`useConfirm` remains
 *  the standard for everything else destructive, and a `Toast` with "Undo"
 *  for what's reversible. Hold-to-confirm removes mis-click risk entirely,
 *  but costs a new gesture the user has to learn — reserve it for where the
 *  stakes are highest.
 *
 *  Built ON `Button variant="secondary"` with error text/border, NOT
 *  `variant="error"` (a solid filled button) — the destructive button
 *  shouldn't shout at rest, and the fill needs a tint (`--frv-error-light`)
 *  visible against a card surface where the text still holds AA contrast
 *  from empty to full. The fill is the shared `.fill-x` class (`--hold-ms` =
 *  hold duration) — no own keyframes here.
 *
 *  `prefers-reduced-motion`: the fill can't just be turned off — it IS the
 *  confirmation. The button then falls back to `ConfirmDialog` with the
 *  same `onConfirm`, so `dialog` (title/message/button text) is required. */
export function HoldToConfirm({
  onConfirm, holdMs = 1200, size = 'sm', disabled, dialog, className, children,
}: {
  /** The action. Can be async — the button stays `busy` until it finishes. */
  onConfirm: () => void | Promise<void>
  /** Hold duration in ms. Default 1200. */
  holdMs?: number
  size?: ButtonProps['size']
  disabled?: boolean
  /** Text for the `ConfirmDialog` fallback under `prefers-reduced-motion` — required, since the fill can't be replaced by nothing. */
  dialog: Pick<ConfirmOptions, 'title' | 'message' | 'confirmLabel'>
  className?: string
  /** The button's content — a leading icon + verb ("Delete building"). */
  children: ReactNode
}) {
  const reducedMotion = useSyncExternalStore(holdSubscribeReducedMotion, holdGetReducedMotion, holdGetReducedMotionServer)
  const confirm = useConfirm()
  const hintId = useId()
  const [phase, setPhase] = useState<HoldPhase>('idle')
  const [busy, setBusy] = useState(false)

  const onConfirmRef = useRef(onConfirm)
  useEffect(() => { onConfirmRef.current = onConfirm })

  const holdRef = useRef<HoldController | null>(null)
  useEffect(() => {
    const ctrl = createHold({
      onChange: setPhase,
      onConfirm: () => {
        void (async () => {
          setBusy(true)
          try { await onConfirmRef.current() } finally { setBusy(false); ctrl.reset() }
        })()
      },
    })
    holdRef.current = ctrl
    return () => { ctrl.dispose(); holdRef.current = null }
  }, [])

  const classes = cx(
    'relative shrink-0 overflow-hidden touch-none border-[var(--frv-error-border)] text-[var(--frv-error-text)] hover:bg-[var(--frv-surface)] hover:border-[var(--frv-error)]',
    className,
  )

  if (reducedMotion) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={classes}
        disabled={disabled}
        loading={busy}
        onClick={async () => {
          const ok = await confirm({ ...dialog, tone: 'error' })
          if (!ok) return
          setBusy(true)
          try { await onConfirm() } finally { setBusy(false) }
        }}
      >
        {children}
      </Button>
    )
  }

  const start = (source: HoldSource) => holdRef.current?.start(source, holdMs)
  const release = (source: HoldSource) => holdRef.current?.release(source)
  const isKey = (key: string) => key === ' ' || key === 'Enter'

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        className={classes}
        disabled={disabled}
        loading={busy}
        aria-describedby={hintId}
        onPointerDown={e => {
          if (e.button !== 0) return
          try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already inactive */ }
          start('pointer')
        }}
        onPointerUp={() => release('pointer')}
        onPointerCancel={() => release('pointer')}
        onPointerLeave={() => release('pointer')}
        onKeyDown={e => {
          if (!isKey(e.key)) return
          e.preventDefault()
          if (e.repeat) return
          start('keyboard')
        }}
        onKeyUp={e => {
          if (!isKey(e.key)) return
          e.preventDefault()
          release('keyboard')
        }}
        onBlur={() => holdRef.current?.cancel()}
        onContextMenu={e => e.preventDefault()}
      >
        {phase === 'holding' && (
          <span aria-hidden className="fill-x absolute inset-0 pointer-events-none bg-(color:--frv-error-light)" style={{ '--hold-ms': `${holdMs}ms` } as CSSProperties} />
        )}
        <span className="relative inline-flex items-center gap-1.5">{children}</span>
      </Button>
      <span id={hintId} className="sr-only">Hold to confirm</span>
      <span role="status" className="sr-only">{busy ? 'Confirmed, working' : ''}</span>
    </>
  )
}

export interface DropdownItem {
  id: string
  /** Full name — NEVER truncated in the list, only in the trigger button. */
  label: string
  /** Navigation mode: renders as a link and navigates here on selection. Omit for button mode (client state via `onSelect`). */
  href?: string
  /** Thin divider above this item — to separate a leading "All" row from the list. */
  sectionBreakBefore?: boolean
}

/* Dropdown — ONE shared primitive for "pick one item from a list, see
   what's active" (a building switcher, an org switcher). NOT the same as
   `OverflowMenu` above: that performs an action (`role="menu"`); this picks
   a VALUE (`role="listbox"`, a "selected" item, `aria-activedescendant`) —
   not a native `<select>`, since call sites need custom row rendering (a
   check on the active item, a footer, a divider before an "All" row) a
   `<select><option>` can't render.

   Keyboard: Enter/Space/ArrowDown opens from the button. In the list: arrow
   keys move the highlight, Enter/Space selects, Escape closes and returns
   focus to the button, Home/End jump to first/last, and typing does a
   simple first-letter-match typeahead.

   `groupLabel` does NOT prefix the trigger's value (only the value itself
   is shown, e.g. "Solvang" not "Building: Solvang") — it's used as (1) aria
   context (`ariaLabel` defaults to `${groupLabel}: ${value}` when omitted)
   and (2) a heading at the top of the list. A call site where the value
   ALONE is ambiguous without the prefix (e.g. "All") needs a self-contained
   label instead (e.g. "All building parts").

   Reimplements its own minimal anchored-listbox chrome via the
   `useFloatingPosition` hook from the FloatingLayer section above, instead
   of depending on the app's shared `Popover` (see the header note for why
   Popover isn't ported) — portal, automatic flip, no mobile bottom-sheet.
   `mobilArk` is accepted for API parity with the source but has no effect
   here. */
export function Dropdown({
  items, selectedId, onSelect, ariaLabel, groupLabel, icon: Icon, footer,
  variant = 'field', size = 'sm', prominent = false, fill = false, busy = false,
  className, defaultOpen = false, mobilArk = true,
}: {
  items: DropdownItem[]
  selectedId: string
  /** Called on selection — ALWAYS (both button and link mode), so the call site can react (close, track) regardless of which mode the item uses. */
  onSelect?: (id: string) => void
  /** Accessible name on the trigger button. Omitted: derived as `${groupLabel}: ${value}` (or just the value, without `groupLabel`). */
  ariaLabel?: string
  /** Short label — no longer shown in front of the value in the trigger. Used as aria context and as a heading in the list. */
  groupLabel?: string
  /** Optional icon in front of the trigger's label (e.g. `CalendarRangeIcon` for a due-date filter) — added for `FristVelger` below. Omitted: no icon, trigger unchanged. */
  icon?: React.ComponentType<{ size?: number; className?: string }>
  footer?: ReactNode
  /** `nav`: transparent sidebar/topbar toggle. `field`: bordered field-style button, same body as a pill/Select trigger. */
  variant?: 'nav' | 'field'
  /** `sm` (32px, default — mirrors Button sm) in navigation/content. `md` (40px) when the trigger sits in a Toolbar next to SearchInput/PillTabs md/Button md, so the row has ONE height. */
  size?: 'sm' | 'md'
  prominent?: boolean
  fill?: boolean
  /** Disables selection while an action is in flight (e.g. saving a switch). */
  busy?: boolean
  className?: string
  /** Showcase/demo only — starts open. Never in real usage. */
  defaultOpen?: boolean
  /** Accepted for API parity with the source; has no effect (no mobile bottom-sheet mode in this kit). */
  mobilArk?: boolean
}) {
  void mobilArk // accepted for API parity only — see the prop's own doc comment
  const montert = useMontert()
  const [open, setOpen] = useState(defaultOpen)
  const [activeIndex, setActiveIndex] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const typeaheadRef = useRef<{ buf: string; t: ReturnType<typeof setTimeout> | null }>({ buf: '', t: null })
  const baseId = useId()

  const selectedIndex = Math.max(0, items.findIndex(i => i.id === selectedId))
  const selected = items[selectedIndex] ?? items[0] ?? null

  const pos = useFloatingPosition(buttonRef, {
    open, panelRef: listRef, side: 'bottom', align: 'start', offset: 6,
    onAnchorOutOfView: () => close(),
  })

  function close(returnFocus = false) {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  function openList(startAt = selectedIndex) {
    setActiveIndex(startAt)
    setOpen(true)
    setTimeout(() => listRef.current?.focus(), 0)
  }

  useEffect(() => {
    if (!open) return
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  function commit(item: DropdownItem) {
    close(true)
    onSelect?.(item.id)
    // eslint-disable-next-line react-hooks/immutability -- only ever runs from the click/keyboard select handler (an event), never during render
    if (item.href) window.location.href = item.href
  }

  function onButtonKeyDown(e: ReactKeyboardEvent) {
    if (busy) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openList()
    }
  }

  function onListKeyDown(e: ReactKeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex(i => Math.min(items.length - 1, i + 1)); break
      case 'ArrowUp': e.preventDefault(); setActiveIndex(i => Math.max(0, i - 1)); break
      case 'Home': e.preventDefault(); setActiveIndex(0); break
      case 'End': e.preventDefault(); setActiveIndex(items.length - 1); break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (items[activeIndex] && !busy) commit(items[activeIndex])
        break
      case 'Escape':
        e.preventDefault()
        close(true)
        break
      case 'Tab':
        close()
        break
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const ta = typeaheadRef.current
          ta.buf += e.key.toLowerCase()
          if (ta.t) clearTimeout(ta.t)
          ta.t = setTimeout(() => { ta.buf = '' }, 500)
          const match = items.findIndex(i => i.label.toLowerCase().startsWith(ta.buf))
          if (match >= 0) setActiveIndex(match)
        }
    }
  }

  if (!selected) return null

  const triggerLabel = selected.label
  const effectiveAriaLabel = ariaLabel ?? (groupLabel ? `${groupLabel}: ${triggerLabel}` : triggerLabel)
  const listboxId = `${baseId}-listbox`
  const optionId = (i: number) => `${baseId}-opt-${i}`

  const optionClass = (active: boolean) => cx(
    'w-full flex items-center justify-between gap-2 h-9 px-3 rounded-[var(--frv-radius-sm)] text-left type-label-14 transition-colors',
    active && 'bg-[var(--frv-gray-alpha-100)]',
  )

  const renderOption = (item: DropdownItem, i: number) => {
    const isSelected = item.id === selectedId
    const isActive = i === activeIndex
    const content = (
      <>
        <span className="truncate text-(color:--frv-text-primary)">{item.label}</span>
        {isSelected && <CheckIcon size={14} className="shrink-0 text-(color:--frv-text-primary)" />}
      </>
    )
    const sharedProps = {
      id: optionId(i),
      role: 'option' as const,
      'aria-selected': isSelected,
      ref: (el: HTMLElement | null) => { itemRefs.current[i] = el },
      onMouseEnter: () => setActiveIndex(i),
      className: cx(optionClass(isActive), item.sectionBreakBefore && 'border-t border-(color:--frv-border)'),
    }
    if (item.href && !busy) {
      return <a key={item.id} {...sharedProps} href={item.href} onClick={() => { close(); onSelect?.(item.id) }}>{content}</a>
    }
    return <button key={item.id} {...sharedProps} type="button" disabled={busy} onClick={() => commit(item)}>{content}</button>
  }

  return (
    <div className={cx('relative inline-flex min-w-0', fill ? 'flex-1' : '', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={effectiveAriaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKeyDown}
        disabled={busy}
        className={cx(
          'inline-flex items-center justify-between gap-1.5 min-w-0 min-h-11 lg:min-h-0 px-3',
          size === 'md' ? 'h-10' : 'h-8',
          'rounded-[var(--frv-radius-sm)] type-button-14 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
          variant === 'nav'
            ? 'bg-transparent text-[var(--frv-text-primary)] hover:bg-[var(--frv-gray-alpha-100)]'
            : 'text-[var(--frv-text-primary)] bg-[var(--frv-surface)] border border-[var(--frv-gray-alpha-400)] hover:border-[var(--frv-gray-alpha-500)] hover:bg-[var(--frv-gray-alpha-100)]',
          fill && 'w-full',
        )}
      >
        <span className={cx('inline-flex items-center gap-1.5 min-w-0', variant === 'field' && 'max-w-[200px]')}>
          {Icon && <Icon size={14} className="shrink-0 text-(color:--frv-text-secondary)" />}
          <span className={cx('truncate', prominent && 'type-heading-14')}>{triggerLabel}</span>
        </span>
        <ChevronDownIcon size={12} className="shrink-0 text-(color:--frv-text-secondary)" />
      </button>
      {open && montert && createPortal(
        <div
          ref={el => { listRef.current = el }}
          role="listbox"
          id={listboxId}
          tabIndex={-1}
          aria-label={effectiveAriaLabel}
          aria-activedescendant={items[activeIndex] ? optionId(activeIndex) : undefined}
          onKeyDown={onListKeyDown}
          className={cx(
            'fixed z-50 rounded-[var(--frv-radius-md)] overflow-hidden min-w-[220px] max-w-[min(320px,calc(100vw-2rem))] bg-(color:--frv-surface) shadow-(--frv-shadow-menu) p-(--frv-space-1) top-(--dropdown-top) left-(--dropdown-left)',
            pos ? 'visible' : 'invisible',
          )}
          style={{
            '--dropdown-top': `${pos?.top ?? 0}px`,
            '--dropdown-left': `${pos?.left ?? 0}px`,
          } as CSSProperties}
        >
          {groupLabel && <p className="px-3 pt-2.5 pb-1 type-label-12 text-(color:--frv-text-tertiary)">{groupLabel}</p>}
          <div className="max-h-[280px] overflow-y-auto">{items.map((item, i) => renderOption(item, i))}</div>
          {footer}
        </div>,
        document.body,
      )}
    </div>
  )
}

/* FristVelger (NEW, 2026-09-21, founder: "the overdue/this month/next 3
   months/this year filter should be a dropdown with a counter on the button,
   same as the building/source pickers" — reversing an EARLIER decision, a
   week prior, to keep it as a pill row). Built ON `Dropdown` above (its new
   `icon` prop), not a fresh popover implementation: only translates a set of
   "due date bucket" tabs + counts into `DropdownItem[]`. Generic over the key
   type `K` so a consuming project's own bucket union (its equivalent of the
   source's `FristFaneNokkel`) plugs straight in — port the PATTERN, not
   Frivio's specific five buckets. */
export interface FristValgFane<K extends string = string> {
  nokkel: K
  label: string
}

export function FristVelger<K extends string>({
  verdi, tellere, onChange, size = 'md', className,
}: {
  /** Selected bucket key. */
  verdi: K
  /** Buckets with a count already computed — same shape the call site uses to render "Overdue (2)" today. */
  tellere: (FristValgFane<K> & { antall: number })[]
  onChange: (verdi: K) => void
  /** `md` (40px, default — matches Button md/Select md in a Toolbar) or `sm` (32px). */
  size?: 'sm' | 'md'
  className?: string
}) {
  const items: DropdownItem[] = tellere.map(f => ({ id: f.nokkel, label: `${f.label} (${f.antall})` }))
  return (
    <Dropdown
      items={items}
      selectedId={verdi}
      onSelect={id => onChange(id as K)}
      icon={CalendarRangeIcon}
      groupLabel="Due date"
      variant="field"
      size={size}
      className={className}
    />
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   8. DataTable (NEW, 2026-09-12/13, Spectrum-lab round 3) — a faceted,
      searchable, sortable, paginated data grid built ON the `Table` grid
      above, plus its own pure filter/sort/paginate engine (`lib/dataTable.ts`
      in the source — kept as plain functions in this same section instead of
      a separate module, same convention as `StegForm`'s step logic earlier
      in this file). NO table library dependency: the source evaluated and
      rejected `@tanstack/react-table` (sorting/pagination/row-selection for a
      40-200 row client-side table is realistically ~150 lines, comparable to
      this file's own `Pagination`/`Table`).

      Tabs are PREDICATE-based (`DataTableFane.test`), not column-value-based
      — a real tab like "overdue" often crosses several fields at once (status
      AND unpaid AND a due date already passed), which a single
      column-equals-value match can't express.

      The column picker (the "Columns" button, `kolonnevelger` prop) is
      reimplemented here as its own small anchored panel using
      `useFloatingPosition` + a portal — same reason `OverflowMenu` above
      doesn't build on the app's shared `Popover` (see this file's header
      note): Popover isn't part of this kit. `skjulUnder` (hide a column
      below a breakpoint) is resolved in JS via `matchMedia` in this
      component, not as a `Table` change — `Table` stays a plain grid of
      whatever it's handed.

      Row selection is always PER PAGE (the current pagination) — select-all
      and ⌘/Ctrl+A act on the visible rows only. Selections from other
      pages/tabs are never cleared automatically, so a bulk action can freely
      gather rows across several page visits.

      `urlNokkel` persists the active tab + page in `?`-params via
      `URLSearchParams`/`history.replaceState` directly (no router
      dependency, so this works the same in Next.js, Vite, CRA, Remix). */

export type DataTableVerdi = string | number | boolean | Date | null | undefined
export type DataTableSortRetning = 'stigende' | 'synkende'

export interface DataTableFane<T> {
  nokkel: string
  label: string
  /** Tab membership test. Omitted (typically only an "All" tab): matches every row. */
  test?: (rad: T) => boolean
}

/** Rows belonging to `aktivNokkel`. An unknown key, or a tab with no `test`,
 *  returns every row — same "show everything rather than hide wrongly"
 *  fallback `FeatureIntro`/`PillTabs` use elsewhere in this file. */
export function filtrerPaFane<T>(rader: readonly T[], faner: readonly DataTableFane<T>[], aktivNokkel: string): T[] {
  const fane = faner.find(f => f.nokkel === aktivNokkel)
  if (!fane?.test) return [...rader]
  return rader.filter(fane.test)
}

/** Row count PER tab, against the given set — typically search-filtered, not
 *  tab-filtered, so the counts track the search live. */
export function tellPerFane<T>(rader: readonly T[], faner: readonly DataTableFane<T>[]): Record<string, number> {
  const ut: Record<string, number> = {}
  for (const fane of faner) ut[fane.nokkel] = fane.test ? rader.filter(fane.test).length : rader.length
  return ut
}

/** Search across one or more fields per row. `felter` returns the fields to
 *  match — `null`/`undefined` fields are skipped (a missing field is never a
 *  search hit). An empty/blank query returns every row. */
export function sokIRader<T>(
  rader: readonly T[],
  sok: string,
  felter: (rad: T) => Array<string | number | null | undefined>,
): T[] {
  const q = sok.trim().toLowerCase()
  if (!q) return [...rader]
  return rader.filter(rad =>
    felter(rad).some(felt => felt != null && String(felt).toLowerCase().includes(q)),
  )
}

function dataTableSammenlign(a: string | number | boolean | Date, b: string | number | boolean | Date): number {
  if (a instanceof Date || b instanceof Date) {
    const at = a instanceof Date ? a.getTime() : new Date(String(a)).getTime()
    const bt = b instanceof Date ? b.getTime() : new Date(String(b)).getTime()
    return at - bt
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1
  return String(a).localeCompare(String(b))
}

/** Stable sort (decorate-sort-undecorate with the original index as
 *  tie-breaker — doesn't rely on the runtime's own `Array.sort` being
 *  stable). `null`/`undefined` always sorts LAST regardless of direction —
 *  an empty due date or unknown amount is "unknown", not "smallest", and
 *  must never float to the top of a descending sort. */
export function sorterRader<T>(
  rader: readonly T[],
  verdi: (rad: T) => DataTableVerdi,
  retning: DataTableSortRetning = 'stigende',
): T[] {
  const dekorert = rader.map((rad, i) => ({ rad, i, v: verdi(rad) }))
  dekorert.sort((x, y) => {
    if (x.v == null && y.v == null) return x.i - y.i
    if (x.v == null) return 1
    if (y.v == null) return -1
    const cmp = dataTableSammenlign(x.v, y.v)
    const justert = retning === 'synkende' ? -cmp : cmp
    return justert !== 0 ? justert : x.i - y.i
  })
  return dekorert.map(d => d.rad)
}

export interface DataTablePaginering<T> {
  rader: T[]
  /** Actual page after clamping — never outside [1, antallSider]. */
  side: number
  antallSider: number
  totalt: number
}

/** Clamps `side` to a valid range BEFORE slicing — switching tab/search into
 *  a smaller result must never strand the user on an empty page 4 of 2. */
export function paginer<T>(rader: readonly T[], side: number, sideStorrelse: number): DataTablePaginering<T> {
  const totalt = rader.length
  const antallSider = Math.max(1, Math.ceil(totalt / sideStorrelse))
  const sideTrygg = Math.min(Math.max(1, side), antallSider)
  const start = (sideTrygg - 1) * sideStorrelse
  return { rader: rader.slice(start, start + sideStorrelse), side: sideTrygg, antallSider, totalt }
}

/** Toggles `id` in the selection. Always returns a NEW `Set` — React state is never mutated in place. */
export function toggle(valgt: ReadonlySet<string>, id: string): Set<string> {
  const neste = new Set(valgt)
  if (neste.has(id)) neste.delete(id)
  else neste.add(id)
  return neste
}

/** Sets ALL `ider` to the same state (`velg` true/false) in the selection —
 *  other entries in `valgt` (rows on other pages/tabs) are untouched, so a
 *  selection survives a page change. */
export function velgAlle(valgt: ReadonlySet<string>, ider: readonly string[], velg: boolean): Set<string> {
  const neste = new Set(valgt)
  for (const id of ider) {
    if (velg) neste.add(id)
    else neste.delete(id)
  }
  return neste
}

/** Every one of `ider` is selected (and the list isn't empty) — for the header checkbox's `checked` state. */
export function erAlleValgt(valgt: ReadonlySet<string>, ider: readonly string[]): boolean {
  return ider.length > 0 && ider.every(id => valgt.has(id))
}

/** At least one, but not all, of `ider` is selected — for the header checkbox's `indeterminate` state. */
export function erNoenValgt(valgt: ReadonlySet<string>, ider: readonly string[]): boolean {
  return ider.some(id => valgt.has(id)) && !erAlleValgt(valgt, ider)
}

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  /** Full per-cell freedom, same idea as `Table`'s own `celle()`. Omitted: falls back to a plain text render of `verdi()`. */
  celle?: (rad: T, indeks: number) => ReactNode
  /** Comparable/searchable/summable value behind a cell that otherwise renders markup. Required for the column to be sortable or counted in `totaler`. */
  verdi?: (rad: T) => DataTableVerdi
  sorterbar?: boolean
  justering?: 'venstre' | 'hoyre'
  bredde?: string
  /** Hidden below the breakpoint instead of forcing sideways scroll — the rest still scrolls inside `Table`'s own container with its swipe hint. */
  skjulUnder?: 'sm' | 'md' | 'lg'
  /** Hidden by default, toggled on via the column picker (needs `kolonnevelger`). */
  valgfri?: boolean
  /** Custom formatting for the column's footer sum. Default: `toLocaleString()`. */
  formatTotal?: (sum: number) => ReactNode
}

export interface DataTableRadvalgCtx<T> { ider: string[]; rader: T[]; tom: () => void }

export interface DataTableProps<T> {
  data: readonly T[]
  kolonner: DataTableColumn<T>[]
  radKey: (rad: T) => string
  /** Human-readable identifier for the row checkbox's screen-reader label, e.g. `r => \`invoice from ${r.leverandor}\`` */
  radEtikett?: (rad: T) => string
  faner?: DataTableFane<T>[]
  /** Controlled active tab — same controlled/uncontrolled idiom as this kit's `Dropdown`. Omitted: DataTable owns the tab state itself (starts on `faner[0]`). */
  aktivFane?: string
  onFaneEndret?: (nokkel: string) => void
  sok?: { felter: (rad: T) => Array<string | number | null | undefined>; plassholder?: string }
  standardSortering?: { kolonneId: string; retning: DataTableSortRetning }
  /** Turns row selection ON. `masseHandlinger` renders inside an `ActionBar` once at least one row is selected. */
  radvalg?: { masseHandlinger: (ctx: DataTableRadvalgCtx<T>) => ReactNode }
  sideStorrelse?: number
  /** Column ids to sum in the footer row (needs `verdi()` on the column). */
  totaler?: string[]
  /** Replaces the WHOLE table (not just the rows) when the result is empty — typically an `EmptyState`. The function form gets the active tab and whether search is active. Omitted: a plain "No rows" text row. */
  tomTilstand?: ReactNode | ((ctx: { fane: string; sokAktiv: boolean }) => ReactNode)
  tomTekst?: string
  laster?: boolean
  skeletonRader?: number
  /** Turns ON the picker for `valgfri` columns (no effect without at least one such column). */
  kolonnevelger?: boolean
  minBredde?: string
  /** Persists tab + page in `?`-params (prefixed with this key) so the view can be linked to. */
  urlNokkel?: string
  className?: string
}

type DataTableBrytpunkt = 'sm' | 'md' | 'lg'
const DATATABLE_MEDIA_QUERY: Record<DataTableBrytpunkt, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
}

/** Before mount: show EVERYTHING (same principle as `PillTabs`'s own
 *  measure-before-layout) — guessing "hidden" before JS has run would flash
 *  columns on/off during hydration, and server-rendered markup with no JS
 *  should show it all. */
function useDataTableBrytpunkter(): Record<DataTableBrytpunkt, boolean> {
  const [synlig, setSynlig] = useState<Record<DataTableBrytpunkt, boolean>>({ sm: true, md: true, lg: true })
  useEffect(() => {
    const mql = { sm: window.matchMedia(DATATABLE_MEDIA_QUERY.sm), md: window.matchMedia(DATATABLE_MEDIA_QUERY.md), lg: window.matchMedia(DATATABLE_MEDIA_QUERY.lg) }
    function oppdater() { setSynlig({ sm: mql.sm.matches, md: mql.md.matches, lg: mql.lg.matches }) }
    oppdater()
    mql.sm.addEventListener('change', oppdater)
    mql.md.addEventListener('change', oppdater)
    mql.lg.addEventListener('change', oppdater)
    return () => {
      mql.sm.removeEventListener('change', oppdater)
      mql.md.removeEventListener('change', oppdater)
      mql.lg.removeEventListener('change', oppdater)
    }
  }, [])
  return synlig
}

function dataTableLesFraUrl(urlNokkel: string | undefined, felt: string): string | null {
  if (!urlNokkel || typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(`${urlNokkel}_${felt}`)
}

function dataTableSkrivTilUrl(urlNokkel: string | undefined, verdier: Record<string, string | null>) {
  if (!urlNokkel || typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  for (const [felt, verdi] of Object.entries(verdier)) {
    const key = `${urlNokkel}_${felt}`
    if (verdi == null) params.delete(key)
    else params.set(key, verdi)
  }
  const q = params.toString()
  window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname)
}

/** Row-select checkbox (header "select all" + per row): mobile sweep 2026-09-19
 *  measured 16x44px — `Checkbox`'s own `min-h-11 lg:min-h-0` already gives it
 *  44px HEIGHT, but no width beyond the 16px square itself (no `label` here).
 *  Padding grows the real button box to 44px WIDTH on mobile; negative margin
 *  pulls the flow footprint back to the original 16px so the column width
 *  (`bredde: '36px'` below) doesn't need to change — same recipe as the chip
 *  remove-button in MultiSelect. `lg:` removes it (same breakpoint Checkbox
 *  itself uses for height). */
const DATATABLE_ROW_SELECT_HITAREA = 'px-[14px] -mx-[14px] lg:px-0 lg:mx-0'

function dataTableRenderStandardverdi(v: DataTableVerdi): ReactNode {
  if (v == null) return undefined
  if (v instanceof Date) return v.toLocaleDateString()
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

function DataTableSkeleton({ kolonneAntall, rader }: { kolonneAntall: number; rader: number }) {
  const bredder = Array.from({ length: Math.min(kolonneAntall, 5) }, (_, i) => (i === 0 ? '32%' : '14%'))
  return (
    <div className="rounded-[var(--frv-radius-md)] overflow-hidden border border-(color:--frv-border)">
      <div className="h-11 flex items-center gap-4 px-3 bg-(color:--frv-surface-2) border-b border-(color:--frv-border-2)">
        {bredder.map((b, i) => <Skeleton key={i} width={b} />)}
      </div>
      <div className="divide-y divide-[var(--frv-border)]">
        {Array.from({ length: rader }, (_, i) => (
          <div key={i} className="h-11 flex items-center gap-4 px-3">
            {bredder.map((b, j) => <Skeleton key={j} width={b} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Column visibility picker ("Columns" button) behind `kolonnevelger` — its
 *  own small anchored panel (portal + `useFloatingPosition`), not the app's
 *  `Popover` (see this file's header note for why). Same recipe `OverflowMenu`
 *  above uses for its own menu: Escape + click-outside to close, no mobile
 *  bottom-sheet, no `auto` placement. */
function DataTableKolonnevelger<T>({ kolonner, skjulte, onToggle }: {
  kolonner: DataTableColumn<T>[]
  skjulte: Set<string>
  onToggle: (id: string) => void
}) {
  const montert = useMontert()
  const [apen, setApen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const pos = useFloatingPosition(triggerRef, {
    open: apen, panelRef, side: 'bottom', align: 'end', offset: 6,
    onAnchorOutOfView: () => setApen(false),
  })

  useEffect(() => {
    if (!apen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { setApen(false); triggerRef.current?.focus() } }
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setApen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouseDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onMouseDown) }
  }, [apen])

  return (
    <div className="relative inline-flex">
      <Button ref={triggerRef} variant="secondary" size="md" onClick={() => setApen(o => !o)} aria-haspopup="true" aria-expanded={apen}>
        <LayoutGridIcon size={14} /> Columns
      </Button>
      {apen && montert && createPortal(
        <div
          ref={el => { panelRef.current = el }}
          role="group"
          aria-label="Show or hide columns"
          className={cx(
            'fixed z-50 rounded-[var(--frv-radius-md)] overflow-hidden min-w-[220px] bg-(color:--frv-surface) shadow-(--frv-shadow-menu) p-(--frv-space-1) top-(--kolonnevelger-top) left-(--kolonnevelger-left)',
            pos ? 'visible' : 'invisible',
          )}
          style={{
            '--kolonnevelger-top': `${pos?.top ?? 0}px`,
            '--kolonnevelger-left': `${pos?.left ?? 0}px`,
          } as CSSProperties}
        >
          <div className="flex flex-col gap-0.5">
            {kolonner.map(k => (
              <Checkbox
                key={k.id}
                size="sm"
                checked={!skjulte.has(k.id)}
                onChange={() => onToggle(k.id)}
                label={k.header}
                className="w-full rounded-[var(--frv-radius-sm)] px-2 py-1.5 hover:bg-[var(--frv-gray-alpha-100)]"
              />
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

export function DataTable<T>({
  data, kolonner, radKey, radEtikett,
  faner, aktivFane: aktivFaneProp, onFaneEndret, sok, standardSortering, radvalg,
  sideStorrelse = 10, totaler, tomTilstand, tomTekst = 'No rows', laster, skeletonRader = 5,
  kolonnevelger, minBredde, urlNokkel, className,
}: DataTableProps<T>) {
  const brytpunkter = useDataTableBrytpunkter()
  const harFaner = !!faner?.length

  const [sokTekst, setSokTekst] = useState('')
  const [aktivFaneState, setAktivFaneState] = useState(() => dataTableLesFraUrl(urlNokkel, 'fane') ?? faner?.[0]?.nokkel ?? '')
  // Controlled/uncontrolled idiom — same as this kit's `Dropdown`.
  const faneKontrollert = aktivFaneProp !== undefined
  const aktivFane = faneKontrollert ? aktivFaneProp! : aktivFaneState
  const [side, setSide] = useState(() => Number(dataTableLesFraUrl(urlNokkel, 'side')) || 1)
  const [sortKolonneId, setSortKolonneId] = useState(standardSortering?.kolonneId)
  const [sortRetning, setSortRetning] = useState<DataTableSortRetning>(standardSortering?.retning ?? 'stigende')
  const [valgt, setValgt] = useState<Set<string>>(new Set())
  const [skjulteKolonner, setSkjulteKolonner] = useState<Set<string>>(new Set())

  const sokFiltrert = sok ? sokIRader(data, sokTekst, sok.felter) : [...data]
  const faneTeller = harFaner ? tellPerFane(sokFiltrert, faner!) : {}
  const faneFiltrert = harFaner ? filtrerPaFane(sokFiltrert, faner!, aktivFane) : sokFiltrert

  const sortKolonne = kolonner.find(k => k.id === sortKolonneId)
  const sortert = sortKolonne?.verdi ? sorterRader(faneFiltrert, sortKolonne.verdi, sortRetning) : faneFiltrert

  const { rader: sideRader, side: sideTrygg, antallSider } = paginer(sortert, side, sideStorrelse)

  // Writes ONLY the clamped, actual page to the URL — never a page the user
  // is no longer on (see `paginer`'s own clamping).
  useEffect(() => {
    dataTableSkrivTilUrl(urlNokkel, { fane: harFaner ? aktivFane : null, side: String(sideTrygg) })
  }, [urlNokkel, aktivFane, sideTrygg, harFaner])

  function byttFane(nokkel: string) {
    if (!faneKontrollert) setAktivFaneState(nokkel)
    onFaneEndret?.(nokkel)
    setSide(1)
  }
  function endreSok(verdi: string) { setSokTekst(verdi); setSide(1) }

  function handleSorter(kolonneKey: string) {
    if (kolonneKey === sortKolonneId) setSortRetning(r => (r === 'stigende' ? 'synkende' : 'stigende'))
    else { setSortKolonneId(kolonneKey); setSortRetning('stigende') }
  }

  const synligeIder = sideRader.map(radKey)
  const alleValgt = erAlleValgt(valgt, synligeIder)
  const noenValgt = erNoenValgt(valgt, synligeIder)

  function toggleRad(rad: T) { setValgt(v => toggle(v, radKey(rad))) }
  function toggleAlleSynlige(v: boolean) { setValgt(prev => velgAlle(prev, synligeIder, v)) }

  /* ⌘/Ctrl+A selects all VISIBLE rows (this page) — but only when focus is
   * inside the table. The handler sits on a wrapper around ONLY `<Table>`
   * (not Toolbar/SearchInput), so a keypress in the search field never
   * bubbles here at all — no separate exception needed for the field. */
  function handleTabellTaster(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (!radvalg) return
    const cmdA = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a'
    if (!cmdA) return
    e.preventDefault()
    toggleAlleSynlige(true)
  }

  const brede = kolonner
    .filter(k => !k.valgfri || !skjulteKolonner.has(k.id))
    .filter(k => !k.skjulUnder || brytpunkter[k.skjulUnder])

  const effektiveKolonner = radvalg
    ? [
        {
          key: '__valg__',
          label: (
            <Checkbox
              size="sm"
              checked={alleValgt}
              indeterminate={noenValgt}
              onChange={v => toggleAlleSynlige(v)}
              ariaLabel="Select all visible rows"
              className={DATATABLE_ROW_SELECT_HITAREA}
            />
          ),
          bredde: '36px',
        },
        ...brede.map(k => ({ key: k.id, label: k.header, align: k.justering, bredde: k.bredde, sorterbar: k.sorterbar })),
      ]
    : brede.map(k => ({ key: k.id, label: k.header, align: k.justering, bredde: k.bredde, sorterbar: k.sorterbar }))

  const indeksPerRad = new Map(sideRader.map((r, i) => [radKey(r), i] as const))

  function renderCelle(rad: T, kolonneKey: string): ReactNode {
    if (kolonneKey === '__valg__') {
      return (
        <Checkbox
          size="sm"
          checked={valgt.has(radKey(rad))}
          onChange={() => toggleRad(rad)}
          ariaLabel={radEtikett ? `Select ${radEtikett(rad)}` : 'Select row'}
          className={DATATABLE_ROW_SELECT_HITAREA}
        />
      )
    }
    const kolonne = kolonner.find(k => k.id === kolonneKey)
    if (!kolonne) return undefined
    if (kolonne.celle) return kolonne.celle(rad, indeksPerRad.get(radKey(rad)) ?? 0)
    return dataTableRenderStandardverdi(kolonne.verdi?.(rad))
  }

  const harTotaler = !!totaler?.length
  const forsteDatakolonne = effektiveKolonner.find(k => k.key !== '__valg__')

  function renderFot(kolonneKey: string): ReactNode {
    if (kolonneKey === '__valg__') return null
    const kolonne = kolonner.find(k => k.id === kolonneKey)
    if (!totaler?.includes(kolonneKey) || !kolonne?.verdi) {
      return forsteDatakolonne?.key === kolonneKey ? <span className="type-heading-14">Total</span> : undefined
    }
    const sum = sortert.reduce((s, rad) => {
      const v = kolonne.verdi!(rad)
      return s + (typeof v === 'number' ? v : 0)
    }, 0)
    return <span className="type-heading-14">{kolonne.formatTotal ? kolonne.formatTotal(sum) : sum.toLocaleString()}</span>
  }

  const valgfrieKolonner = kolonner.filter(k => k.valgfri)
  const visKolonnevelger = !!kolonnevelger && valgfrieKolonner.length > 0
  const visToolbar = harFaner || !!sok || visKolonnevelger

  const pillTabs: PillTab[] = harFaner ? faner!.map(f => ({ key: f.nokkel, label: `${f.label} (${faneTeller[f.nokkel] ?? 0})` })) : []

  return (
    <div className={cx('space-y-3', className)}>
      {visToolbar && (
        <Toolbar end={visKolonnevelger ? <DataTableKolonnevelger kolonner={valgfrieKolonner} skjulte={skjulteKolonner} onToggle={id => setSkjulteKolonner(s => toggle(s, id))} /> : undefined}>
          {harFaner && <PillTabs size="md" tabs={pillTabs} activeKey={aktivFane} onSelect={byttFane} />}
          {sok && (
            <div className="min-w-[200px] flex-1">
              <SearchInput value={sokTekst} onChange={e => endreSok(e.target.value)} placeholder={sok.plassholder} />
            </div>
          )}
        </Toolbar>
      )}

      {laster ? (
        <DataTableSkeleton kolonneAntall={effektiveKolonner.length} rader={skeletonRader} />
      ) : sortert.length === 0 ? (
        (typeof tomTilstand === 'function' ? tomTilstand({ fane: aktivFane, sokAktiv: !!sokTekst.trim() }) : tomTilstand)
          ?? <Table kolonner={effektiveKolonner} rader={[]} celle={() => null} radKey={() => ''} tomTekst={tomTekst} minBredde={minBredde} />
      ) : (
        <>
          <div onKeyDown={handleTabellTaster}>
            <Table
              kolonner={effektiveKolonner}
              rader={sideRader}
              celle={renderCelle}
              radKey={radKey}
              fot={harTotaler ? renderFot : undefined}
              minBredde={minBredde}
              sortKey={sortKolonneId}
              sortRetning={sortRetning}
              onSorter={handleSorter}
              tomTekst={tomTekst}
            />
          </div>
          <Pagination side={sideTrygg} antall={antallSider} onChange={setSide} />
        </>
      )}

      {radvalg && valgt.size > 0 && (
        <ActionBar label={`${valgt.size} selected`}>
          {radvalg.masseHandlinger({ ider: [...valgt], rader: data.filter(r => valgt.has(radKey(r))), tom: () => setValgt(new Set()) })}
          <Button variant="tertiary" size="sm" onClick={() => setValgt(new Set())}>Clear selection</Button>
        </ActionBar>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   9. AGENT UI (NEW, 2026-09-12/13, Spectrum-lab comparison wave) — AgentPlan,
      AgentSteps (+ ThinkingDots), ReasoningTrace, ProposalCard.

      Source note ("Kari — on hold"): these four implement the vocabulary of
      Frivio's own AI assistant, internally named "Kari" — visible in the
      source's Norwegian prop names (`tittel`, `steg`, `valgt`, `kjorer`,
      `feilet`, `foreslatt`, `godkjent`, `avvist`) and defaults ("Kjør
      planen", "Godkjenn", "Avvis"). The feature itself is currently HIDDEN
      behind a flag in the source app (disabled since 2026-08-15, most
      recently reconfirmed 2026-08-22) — the assistant isn't live for end
      users yet — but the four components are real, reviewed primitives in
      `components/ui/` regardless, so they're ported like everything else in
      this file. Defaults below are translated to English text (same rule as
      the rest of this kit); prop/type names stay Norwegian, 1:1 with source. */

export interface AgentPlanStep {
  id: string
  tittel: string
  beskrivelse?: string
  valgt: boolean
}

/** AgentPlan — a plan the assistant PROPOSES before anything runs: several
 *  ordered actions, each individually toggle-able, with one combined run/
 *  cancel row. Built entirely on this kit's own `Checkbox` and `Button` —
 *  only the container, counter and layout are new here. */
export function AgentPlan({
  title = 'Suggested plan',
  steps,
  onToggle,
  onRun,
  onCancel,
  runLabel = 'Run plan',
  cancelLabel = 'Cancel',
  busy = false,
  className,
}: {
  title?: string
  steps: AgentPlanStep[]
  /** Called when the user checks/unchecks ONE step. */
  onToggle?: (id: string) => void
  /** Called with the ids of the SELECTED steps, in their original order. */
  onRun?: (valgteIds: string[]) => void
  onCancel?: () => void
  runLabel?: string
  cancelLabel?: string
  /** Disables both buttons — e.g. while the previous click is still being processed. */
  busy?: boolean
  className?: string
}) {
  const headingId = useId()
  const antallValgt = steps.filter(s => s.valgt).length

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className={cx('w-full max-w-[420px] rounded-[var(--frv-radius-md)] overflow-hidden bg-(color:--frv-surface) border border-(color:--frv-border)', className)}
    >
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-(color:--frv-border)">
        <h3 id={headingId} className="type-heading-14">{title}</h3>
        <span className="type-label-12-mono tabular-nums shrink-0 text-(color:--frv-text-tertiary)">
          {antallValgt}/{steps.length} steps
        </span>
      </div>

      <ol role="list" className="px-2 py-1.5 space-y-0.5">
        {/* An unchecked step is tertiary text + strikethrough, NOT opacity —
            50% opacity measured 2.1-3.4:1 against the surface (axe, 2026-09-12
            sweep). */}
        {steps.map((step, i) => (
          <li key={step.id} className={cx('transition-colors duration-150', !step.valgt && 'line-through decoration-[var(--frv-text-tertiary)] text-(color:--frv-text-tertiary)')}>
            <Checkbox
              size="sm"
              checked={step.valgt}
              onChange={() => onToggle?.(step.id)}
              className="w-full px-1.5 py-1.5 rounded-[var(--frv-radius-sm)] hover:bg-[var(--frv-gray-alpha-100)]"
              label={
                <span>
                  <span className="type-label-12-mono mr-1.5 text-(color:--frv-text-tertiary)">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {step.tittel}
                </span>
              }
              description={step.beskrivelse}
            />
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-end gap-2 px-3 py-2.5 border-t border-(color:--frv-border)">
        <Button size="sm" variant="tertiary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
        <Button
          size="sm"
          variant="accent"
          onClick={() => onRun?.(steps.filter(s => s.valgt).map(s => s.id))}
          disabled={antallValgt === 0}
          loading={busy}
        >
          {runLabel}
        </Button>
      </div>
    </div>
  )
}

export type AgentStepStatus = 'venter' | 'kjorer' | 'ferdig' | 'feilet'

export interface AgentStep {
  id: string
  tittel: string
  status: AgentStepStatus
  /** Short explanation under the title — typically the error message on `feilet`. */
  detalj?: string
}

function agentStagger(i: number): CSSProperties {
  return { '--stagger-i': i } as CSSProperties
}

/** "Assistant thinking/running" — three dots (default) on the shared
 *  `.thinking-dot` class. Exported for reuse outside `AgentSteps` (a chat
 *  bubble while a response streams in). */
export function ThinkingDots({ label = 'Thinking', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={cx('inline-flex items-center gap-2.5 text-(color:--frv-text-secondary)', className)}>
      <span aria-hidden className="inline-flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-current" style={agentStagger(i)} />
        ))}
      </span>
      <span className="type-copy-13">{label}</span>
    </div>
  )
}

function AgentStepStatusIcon({ status }: { status: AgentStepStatus }) {
  if (status === 'ferdig') {
    return (
      <span className="check-pop grid place-items-center w-4 h-4 rounded-full shrink-0 bg-(color:--frv-success-solid) text-(color:--frv-success-fg)">
        <CheckIcon size={10} />
      </span>
    )
  }
  if (status === 'feilet') {
    return (
      <span className="check-pop grid place-items-center w-4 h-4 rounded-full shrink-0 bg-(color:--frv-error-solid) text-(color:--frv-error-fg)">
        <CloseIcon size={10} />
      </span>
    )
  }
  if (status === 'kjorer') return <LoaderIcon size={16} className="animate-spin shrink-0 text-(color:--frv-accent-text)" />
  return <CircleOutlineIcon size={14} className="shrink-0 text-(color:--frv-text-tertiary)" />
}

const AGENT_STEP_STATUS_LABEL: Record<AgentStepStatus, string | null> = {
  venter: 'waiting',
  kjorer: 'running',
  ferdig: null,
  feilet: 'failed',
}

function AgentStepRow({ step, last }: { step: AgentStep; last: boolean }) {
  return (
    <li className="relative flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <AgentStepStatusIcon status={step.status} />
        {!last && <span className="w-px flex-1 mt-1 bg-(color:--frv-border)" />}
      </div>
      <div className={cx('min-w-0 flex-1', last ? 'pb-0' : 'pb-3')}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={cx('type-label-13 truncate', step.status === 'venter' ? 'text-(color:--frv-text-tertiary)' : 'text-(color:--frv-text-primary)')}>
            {step.tittel}
          </span>
          {AGENT_STEP_STATUS_LABEL[step.status] && (
            <span className={cx('type-label-12-mono uppercase shrink-0', step.status === 'feilet' ? 'text-(color:--frv-error-text)' : 'text-(color:--frv-text-tertiary)')}>
              {AGENT_STEP_STATUS_LABEL[step.status]}
            </span>
          )}
        </div>
        {step.detalj && (
          <p className={cx('type-copy-13 mt-1', step.status === 'feilet' ? 'text-(color:--frv-error-text)' : 'text-(color:--frv-text-secondary)')}>
            {step.detalj}
          </p>
        )}
      </div>
    </li>
  )
}

/** AgentSteps — progress WHILE assistant-suggested actions actually run, one
 *  step at a time, with a status and error message per step. Distinct from
 *  `Progress` (share of ONE whole) and `StepIndicator` (position in a fixed,
 *  non-running sequence) elsewhere in this file. `reasoningTrace` is a slot
 *  for a `ReasoningTrace` right below the steps. */
export function AgentSteps({ steps, thinking = false, thinkingLabel, reasoningTrace, className }: {
  steps: AgentStep[]
  /** Shown above the steps while the assistant is still preparing the run (before step 1 starts). */
  thinking?: boolean
  thinkingLabel?: string
  reasoningTrace?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('w-full max-w-[420px]', className)}>
      {thinking && (
        <div className="mb-2.5">
          <ThinkingDots label={thinkingLabel} />
        </div>
      )}
      <ol role="list" aria-live="polite" className="space-y-0">
        {steps.map((step, i) => <AgentStepRow key={step.id} step={step} last={i === steps.length - 1} />)}
      </ol>
      {reasoningTrace && <div className="mt-3">{reasoningTrace}</div>}
    </div>
  )
}

export interface ReasoningStep {
  id: string
  content: string
}

/** ReasoningTrace — a collapsible "here's how the assistant reasoned" log for
 *  `AgentSteps`'s `reasoningTrace` slot. NOT built on `CollapsibleSection`:
 *  that component persists its open/closed state to `localStorage` per
 *  `storageKey` (right for a fixed section on a page), but each assistant
 *  response has its OWN transient reasoning — a persisted key here would
 *  either collide across messages (same key) or leak one localStorage entry
 *  per message (a unique key). Reuses the SAME shared CSS
 *  (`.collapsible-rows`/`.collapsible-inner`) `CollapsibleSection` itself
 *  uses for its soft expand/collapse — only the state (plain `useState`, not
 *  persisted) is local and new here. */
export function ReasoningTrace({ steps, status = 'ferdig', defaultOpen = false, className }: {
  steps: ReasoningStep[]
  status?: 'tenker' | 'ferdig'
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (steps.length === 0) return null

  return (
    <div className={cx('w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="group inline-flex items-center gap-2 rounded-[var(--frv-radius-sm)] py-1 transition-colors duration-150 hover:text-[var(--frv-text-primary)] text-(color:--frv-text-secondary)"
      >
        <SparklesIcon size={14} className={status === 'tenker' ? 'motion-safe:animate-pulse' : undefined} />
        <span className="type-label-12">{status === 'tenker' ? 'Thinking…' : 'How the assistant reasoned'}</span>
        <ChevronDownIcon size={12} className={cx('text-(color:--frv-text-tertiary) transition-transform duration-200 ease-[ease]', open ? 'rotate-180' : 'rotate-0')} />
      </button>

      <div className="collapsible-rows" data-open={open}>
        <div className="collapsible-inner">
          <ol role="list" className="ml-[7px] mt-1 pl-4 pb-1 pt-1 space-y-2 border-l border-(color:--frv-border)">
            {steps.map((step, i) => (
              <li key={step.id} className="type-copy-13-mono flex gap-2.5 text-(color:--frv-text-secondary)">
                <span className="type-label-12-mono shrink-0 text-(color:--frv-text-tertiary)">{String(i + 1).padStart(2, '0')}</span>
                <span>{step.content}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export type ProposalStatus = 'foreslatt' | 'godkjent' | 'avvist' | 'kjorer' | 'feilet'

/** ProposalCard — ONE assistant-suggested action awaiting approval.
 *  `status`: `foreslatt` (default) → `kjorer` (while the action call is in
 *  flight) → `godkjent` OR `feilet` (retryable → back to `kjorer`). `avvist`
 *  is a SEPARATE, immediate state (the user backed out before anything ran)
 *  — the card plays `.dismiss-out` and calls `onDismissed` once the
 *  animation ends, so the call site can remove it from its list without a
 *  jump. `godkjent` plays `.pop-in` on the confirmation block (same shared
 *  class this kit's `Button`/`Toast` confirmed state uses). Built entirely
 *  on this kit's own `Badge`/`Button`/`FormError`. */
export function ProposalCard({
  title,
  description,
  meta,
  status = 'foreslatt',
  onApprove,
  onReject,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
  error,
  onDismissed,
  className,
}: {
  title: string
  description: string
  /** Short metadata line under the description — typically an undo hint or the action's type. */
  meta?: string
  status?: ProposalStatus
  onApprove?: () => void
  onReject?: () => void
  approveLabel?: string
  rejectLabel?: string
  /** Error message shown when `status === 'feilet'`. */
  error?: string
  /** Called once the `avvist` `.dismiss-out` animation ends — remove the card from state here. */
  onDismissed?: () => void
  className?: string
}) {
  const busy = status === 'kjorer'
  const avvist = status === 'avvist'
  const godkjent = status === 'godkjent'

  return (
    <div
      role="group"
      aria-label={title}
      aria-live="polite"
      className={cx(
        'w-full max-w-[420px] rounded-[var(--frv-radius-md)] px-3.5 py-3 space-y-2 bg-(color:--frv-surface-2) border border-[color-mix(in_srgb,var(--frv-accent)_30%,var(--frv-border))]',
        avvist && 'dismiss-out',
        className,
      )}
      onAnimationEnd={avvist ? onDismissed : undefined}
    >
      {godkjent ? (
        <div className="pop-in flex items-center gap-2.5 py-0.5">
          <span className="grid place-items-center w-6 h-6 rounded-full shrink-0 bg-(color:--frv-success-solid) text-(color:--frv-success-fg)">
            <CheckIcon size={13} />
          </span>
          <div className="min-w-0">
            <p className="type-label-13 text-(color:--frv-text-primary)">Approved</p>
            {meta && <p className="type-label-12 truncate text-(color:--frv-text-tertiary)">{meta}</p>}
          </div>
        </div>
      ) : (
        <>
          <Badge>Suggestion</Badge>
          <p className="type-heading-14">{title}</p>
          <p className="type-copy-13 text-(color:--frv-text-secondary)">{description}</p>
          {meta && <p className="type-label-12 text-(color:--frv-text-tertiary)">{meta}</p>}
          {status === 'feilet' && error && <FormError size="label-12">{error}</FormError>}
          <div className="flex gap-2 pt-0.5">
            <Button size="sm" variant="tertiary" onClick={onReject} disabled={busy || avvist}>{rejectLabel}</Button>
            <Button size="sm" variant="primary" onClick={onApprove} loading={busy} disabled={avvist}>{approveLabel}</Button>
          </div>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   10. MultiSelect (NEW, 2026-09-12/13) — search, select several, see the
       selection as chips, and (optional) create a new one from free text —
       in ONE control. THE ONE COMPONENT IN THIS FILE WITH A DEPENDENCY: it
       builds on `cmdk`'s `Command` primitive for filtering, grouping and
       arrow-key/Enter navigation (see this file's header and the import at
       the top) — the field body, chips, panel and every colour are 100%
       this kit's own tokens; cmdk supplies ONLY the interaction engine
       (`role`, filtering, `aria-*`, arrow keys), none of its own colours.

       NOT built on a `Popover`-style panel (this kit doesn't have one — see
       the header note by `OverflowMenu` above): that pattern UNMOUNTS the
       panel when closed, which conflicts with cmdk, whose `Command.Input`
       sets `aria-controls` to the list's id UNCONDITIONALLY, whether or not
       the list is actually mounted. The fix that works with cmdk's model:
       the panel is ALWAYS mounted, only the `hidden` attribute toggles
       visibility — positioned with the same `useFloatingPosition` + portal
       recipe `Dropdown`/`OverflowMenu` use above, so its own click-outside
       check covers BOTH the field (`wrapRef`) and the portaled panel
       (`panelRef`).

       TWO ACCEPTED cmdk LIMITATIONS (library constraints, not choices made
       here): (1) cmdk sets `aria-expanded="true"` on the field
       UNCONDITIONALLY — hardcoded in the library, no prop overrides it. The
       panel is still correctly `hidden` based on open state, so a screen
       reader loses no real information about the CONTENT, only that one
       attribute is inaccurate while the field is empty/closed. (2) cmdk's
       `aria-selected` on a row means "keyboard-highlighted", not "one of the
       chosen chips" — right for a command palette, a different concept from
       a real multi-select listbox. Solved with an extra `sr-only` ",
       selected" text in the row.

       KEYBOARD: arrow keys + Home/End + Enter come FREE from cmdk. Backspace
       on an empty search field removes the last chip (same idea as an email
       client's recipient field) and Escape closes — cmdk has neither built
       in, both are added here. */

export interface Valg {
  value: string
  label: string
  /** Subtext under the label — e.g. an owner + email, or "Missing email" when the row is disabled. */
  description?: string
  disabled?: boolean
}

export interface ValgGruppe {
  heading: string
  valg: Valg[]
}

function multiSelectHarTreff(query: string, valg: Valg[]): boolean {
  const q = query.trim().toLowerCase()
  return valg.some(v => v.value.trim().toLowerCase() === q || v.label.trim().toLowerCase() === q)
}

export function MultiSelect({
  verdi, onChange, alternativer, grupper, hentTreff, placeholder, creatable = false,
  validerNy, ariaLabel, maxValgt, tomTekst, disabled = false, className,
}: {
  verdi: Valg[]
  onChange: (verdi: Valg[]) => void
  /** Static, ungrouped list. Mutually exclusive with `grupper` — pass only one. */
  alternativer?: Valg[]
  /** Static, grouped list (with a heading per group). Mutually exclusive with `alternativer`. */
  grupper?: ValgGruppe[]
  /** Async search — called RAW on every keystroke (debounce/min-length is the caller's job, not the component's). Overrides `alternativer`/`grupper`. */
  hentTreff?: (query: string) => Promise<Valg[]>
  placeholder?: string
  /** Shows a "Create “x”" row for free text not already in the list. */
  creatable?: boolean
  /** Approves free text for the `creatable` row. Omitted: any non-empty text is approved. */
  validerNy?: (query: string) => boolean
  ariaLabel: string
  /** Max number of selected chips. Further rows (except already-selected ones, which can still be removed) become disabled once the cap is reached. */
  maxValgt?: number
  /** Shown when filtering has no matches. Omitted: no empty-state row. */
  tomTekst?: string
  disabled?: boolean
  className?: string
}) {
  const montert = useMontert()
  const [query, setQuery] = useState('')
  const [apen, setApen] = useState(false)
  const [treff, setTreff] = useState<Valg[]>([])
  const [laster, setLaster] = useState(false)
  // Controlled ONLY to reset cmdk's own highlighted-row pointer from the
  // outside (see `opprettNy` below) — never used to drive which row is
  // highlighted during ordinary arrow-key navigation (cmdk owns that itself
  // whenever this isn't explicitly set to something else).
  const [cmdVerdi, setCmdVerdi] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const sokRef = useRef(0)
  const hentetInitialt = useRef(false)

  const maksNaad = maxValgt !== undefined && verdi.length >= maxValgt

  // Position (flip + clamp) — see the FloatingLayer section above.
  // `matchWidth`: the panel spans the field's own width, clamped against the
  // viewport edge.
  const pos = useFloatingPosition(wrapRef, {
    open: apen,
    panelRef,
    side: 'bottom',
    align: 'start',
    offset: 6,
    matchWidth: true,
    // Same as this kit's Dropdown/OverflowMenu: an anchor scrolled out of
    // the viewport closes the list instead of clamping it, detached, into view.
    onAnchorOutOfView: () => lukk(),
  })

  // Stable identity (useCallback, empty deps) — called from the effect below
  // AND from the Escape handling on the `<Command>` root.
  const lukk = useCallback(() => {
    setApen(false)
    // Resets cmdk's highlighted-row pointer so `aria-activedescendant` isn't
    // left pointing at an id inside a now-hidden list — the list is still
    // MOUNTED (only `hidden`), but a highlighted row in the middle of a
    // closed panel is meaningless keyboard state to carry forward anyway.
    setCmdVerdi('')
  }, [])

  // Click outside closes — shared hook (see its own section comment above,
  // pulled out of exactly this effect and OverflowMenu's near-identical
  // copy). Escape is DELIBERATELY NOT part of this call (`escape: false`):
  // cmdk's own `<Command>` root captures Escape itself in `onRootKeyDown`
  // below and stops its propagation (so the same keypress doesn't also
  // close a surrounding Modal) — this component also doesn't build on a
  // Popover-style panel that assumes it unmounts on close (see the top
  // comment for why).
  useKlikkUtenfor([wrapRef, panelRef], () => lukk(), apen, { escape: false })

  function kjorSok(q: string) {
    if (!hentTreff) return
    const kall = ++sokRef.current
    setLaster(true)
    hentTreff(q)
      .then(res => { if (sokRef.current === kall) setTreff(res) })
      .catch(() => { if (sokRef.current === kall) setTreff([]) })
      .finally(() => { if (sokRef.current === kall) setLaster(false) })
  }

  function veksle(opt: Valg) {
    if (opt.disabled) return
    const valgtFraFor = verdi.some(v => v.value === opt.value)
    if (valgtFraFor) {
      onChange(verdi.filter(v => v.value !== opt.value))
      return
    }
    if (maksNaad) return
    onChange([...verdi, opt])
    setQuery('')
    if (hentTreff) kjorSok('')
  }

  function opprettNy() {
    const label = query.trim()
    if (!label || maksNaad) return
    onChange([...verdi, { value: label, label }])
    setQuery('')
    // The "Create …" row is the ONE row that vanishes momentarily on its own
    // selection (it exists only while `query` matches it) — without this,
    // cmdk's `aria-activedescendant` would keep pointing at a row id that
    // was just removed from the DOM (an `aria-valid-attr-value` violation).
    // Groups/sections stay put after a selection (see `veksle`), so they
    // don't need this reset.
    setCmdVerdi('')
    if (hentTreff) kjorSok('')
  }

  function fjernSiste() {
    if (verdi.length === 0) return
    onChange(verdi.slice(0, -1))
  }

  function onRootKeyDown(e: ReactKeyboardEvent) {
    if ((e.key === 'Backspace' || e.key === 'Delete') && query === '') fjernSiste()
    if (e.key === 'Escape' && apen) {
      e.stopPropagation()
      lukk()
    }
  }

  const grupperVisning: ValgGruppe[] = hentTreff
    ? [{ heading: '', valg: treff }]
    : grupper ?? [{ heading: '', valg: alternativer ?? [] }]

  const opprettGyldig = creatable
    && query.trim() !== ''
    && (validerNy ? validerNy(query.trim()) : true)
    && !multiSelectHarTreff(query, [...verdi, ...grupperVisning.flatMap(g => g.valg)])

  const field = (
    <div
      className={cx(
        'w-full flex flex-wrap items-center gap-1.5 min-h-11 lg:min-h-10 px-2.5 py-1.5',
        fieldChrome({ disabled, focusVariant: 'within' }),
        className,
      )}
      onClick={() => {
        if (disabled) return
        inputRef.current?.focus()
        // `onFocus` alone doesn't reopen when the field ALREADY has focus
        // (e.g. right after Escape, which returns focus to the field without
        // reopening the panel) — the focus EVENT only fires on an actual
        // focus change, not on a click that doesn't move focus. Set `apen`
        // directly here too, so a click always (re)opens regardless of prior focus.
        setApen(true)
      }}
    >
      {verdi.map(chip => (
        <span
          key={chip.value}
          className="inline-flex items-center gap-1 h-6 max-w-full pl-2 pr-1 rounded-[var(--frv-radius-full)] type-label-13 shrink-0 bg-(color:--frv-gray-alpha-100) text-(color:--frv-text-primary)"
        >
          <span className="truncate max-w-[220px]">{chip.label}</span>
          {!disabled && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(verdi.filter(v => v.value !== chip.value)) }}
              aria-label={`Remove ${chip.label}`}
              // Real hit area (padding + negative margin), not an invisible
              // `::before` overlay: mobile sweep 2026-09-19 still measured
              // 11x11px here even with the old before-inset trick — automated
              // measurement (and some engines) only read the element's OWN
              // box, not a pseudo-element's painted area. Padding grows the
              // real button box (32px mobile, 24px desktop), negative margin
              // pulls it back so the chip's own size is unchanged.
              className="relative shrink-0 inline-flex items-center justify-center rounded-full p-[10.5px] -m-[10.5px] lg:p-[6.5px] lg:-m-[6.5px] text-(color:--frv-text-secondary)"
            >
              <CloseIcon size={11} />
            </button>
          )}
        </span>
      ))}
      {/* `CommandPrimitive.Input` directly (not cmdk's own `<CommandInput>`
          wrapper with its search icon/border) — same move as the source: the
          field body (chips + icon-free text field) is built by hand, and
          `CommandPrimitive.Input` is the ONLY element that can write to
          cmdk's internal search state. A raw `<input>` here wouldn't talk to
          the `Command` tree at all, and arrow-key/Enter navigation would have
          no search text to filter against. */}
      <CommandPrimitive.Input
        ref={inputRef}
        value={query}
        disabled={disabled}
        onValueChange={q => { setQuery(q); setApen(true); if (hentTreff) kjorSok(q) }}
        onFocus={() => {
          setApen(true)
          if (hentTreff && !hentetInitialt.current) { hentetInitialt.current = true; kjorSok('') }
        }}
        placeholder={verdi.length === 0 ? placeholder : undefined}
        aria-label={ariaLabel}
        className={cx(
          'flex-1 min-w-[80px] bg-transparent border-0 outline-none',
          // The container already draws its own glow via `focus-within`
          // (`fieldChrome({ focusVariant: 'within' })` above) — one element
          // should draw focus, not two. `.frv-focus-clear` is defined in
          // `frivio-tokens.css`'s own `@layer base` for exactly this reason —
          // a layered class beats an unlayered Tailwind utility regardless
          // of specificity.
          'frv-focus-clear',
          FIELD_TEXT.md,
          // Without an explicit height the field only inherits the text's own
          // line-height — WebKit and Chromium compute that intrinsic height
          // differently for a bare `<input>` (Frivio measured 21px in WebKit
          // vs. ≥40px in Chromium for identical markup, 19 Sep 2026). Same
          // breakpoint as the row container's own `min-h-11 lg:min-h-10`.
          'min-h-11 lg:min-h-10', 'text-(color:--frv-text-primary)',
        )}
      />
    </div>
  )

  return (
    <CommandPrimitive
      ref={wrapRef}
      label={ariaLabel}
      value={cmdVerdi}
      onValueChange={setCmdVerdi}
      shouldFilter={!hentTreff}
      onKeyDown={onRootKeyDown}
      className="relative w-full"
    >
      {field}
      {montert && createPortal(
        <div
          ref={el => { panelRef.current = el }}
          hidden={!apen}
          className={cx(
            'fixed z-50 rounded-[var(--frv-radius-md)] overflow-hidden bg-(color:--frv-surface) shadow-(--frv-shadow-menu) top-(--ms-top) left-(--ms-left)',
            pos?.minWidth !== undefined && 'min-w-(--ms-min-w)',
            // Invisible until the FIRST measurement is done — see useFloatingPosition.
            pos ? 'visible' : 'invisible',
          )}
          style={{
            '--ms-top': `${pos?.top ?? 0}px`,
            '--ms-left': `${pos?.left ?? 0}px`,
            '--ms-min-w': pos?.minWidth !== undefined ? `${pos.minWidth}px` : undefined,
          } as CSSProperties}
        >
          <CommandPrimitive.List className="max-h-[280px] overflow-y-auto p-1" label={ariaLabel}>
            {laster ? (
              <div className="flex items-center gap-2 px-3 py-3 type-copy-13 text-(color:--frv-text-tertiary)">
                <Spinner size="xs" /> Searching…
              </div>
            ) : (
              <>
                {grupperVisning.map((g, gi) => (
                  // `heading` is DELIBERATELY not passed as cmdk's own
                  // `heading` prop: it renders an internal, unstylable
                  // `aria-hidden` div with no className hook. A plain `<p>`
                  // as the FIRST child instead — same recipe this kit's
                  // `Dropdown` uses for its own `groupLabel` row — lives
                  // inside cmdk's own hide/show toggling for the group (so it
                  // hides correctly along with the rest when the search has
                  // no matches in that group).
                  <CommandPrimitive.Group key={g.heading || gi} className="px-1">
                    {g.heading && (
                      <p className="px-2.5 pt-2 pb-1 type-label-12 text-(color:--frv-text-tertiary)">
                        {g.heading}
                      </p>
                    )}
                    {g.valg.map(opt => {
                      const valgt = verdi.some(v => v.value === opt.value)
                      const disabledRad = !!opt.disabled || (maksNaad && !valgt)
                      return (
                        <CommandPrimitive.Item
                          key={opt.value}
                          value={opt.value}
                          keywords={[opt.label, opt.description ?? ''].filter(Boolean)}
                          disabled={disabledRad}
                          onSelect={() => veksle(opt)}
                          onMouseDown={e => e.preventDefault()}
                          className={cx(
                            'flex items-center justify-between gap-2 px-2.5 py-2 rounded-[var(--frv-radius-sm)] type-label-14 cursor-pointer',
                            'data-[selected=true]:bg-[var(--frv-gray-alpha-100)]',
                            'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40',
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-(color:--frv-text-primary)">
                              {opt.label}
                              {valgt && <span className="sr-only">, selected</span>}
                            </span>
                            {opt.description && (
                              <span className="block truncate type-label-12 text-(color:--frv-text-tertiary)">
                                {opt.description}
                              </span>
                            )}
                          </span>
                          {valgt && <CheckIcon size={14} className="shrink-0 text-(color:--frv-text-primary)" />}
                        </CommandPrimitive.Item>
                      )
                    })}
                  </CommandPrimitive.Group>
                ))}
                {opprettGyldig && (
                  <CommandPrimitive.Item
                    value={`__create__${query.trim()}`}
                    onSelect={opprettNy}
                    onMouseDown={e => e.preventDefault()}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--frv-radius-sm)] type-label-14 cursor-pointer data-[selected=true]:bg-[var(--frv-gray-alpha-100)]"
                  >
                    <PlusIcon size={14} className="shrink-0 text-(color:--frv-text-secondary)" />
                    <span className="text-(color:--frv-text-primary)">Create “{query.trim()}”</span>
                  </CommandPrimitive.Item>
                )}
                <CommandPrimitive.Empty className="px-2.5 py-3 type-copy-13 text-(color:--frv-text-tertiary)">
                  {tomTekst ?? 'No matches'}
                </CommandPrimitive.Empty>
              </>
            )}
          </CommandPrimitive.List>
        </div>,
        document.body,
      )}
    </CommandPrimitive>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   11. CenteredPage (source dated 2026-08-31) — the shared shell for
       out-of-app surfaces (an invite/token page, a 404, a standalone
       agreement page): full height, a centered column, a max-width, an
       optional mark at the top. The source found the SAME centered-card
       shell hand-rolled identically in four places before this existed —
       full height, centered column, a mark up top, page background.

       DEVIATION from source: the source's `visLogo` boolean toggles a
       hardcoded `LogoMark` (Frivio's own brand mark, imported from its own
       `components/Logo`) — there's no foreign-project equivalent to fall
       back to, so this port replaces it with a plain `logo?: ReactNode`
       slot (omitted: nothing rendered, same as `visLogo={false}` upstream).
       Every other prop (`as`, `maxBredde`, `className`) is unchanged. */
export function CenteredPage({
  as: Tag = 'main',
  children,
  maxBredde = 420,
  logo,
  className,
}: {
  /** `main` (default): the page's own landmark — this component IS the page on a login/invite/token surface. `div` when rendered inside a page that already has its own `<main>` (a docs demo), so landmarks don't nest. */
  as?: 'main' | 'div'
  children: ReactNode
  /** Max width of the centered column, in px. Default 420 — an invite card's width. Wider content (running prose) overrides this per call site. */
  maxBredde?: number
  /** Rendered above `children`, centered — your own logo/mark. Omitted: nothing (avoids showing a mark twice when the content already carries its own, e.g. a 404's own icon tile). */
  logo?: ReactNode
  className?: string
}) {
  return (
    <Tag
      className={cx('min-h-dvh flex flex-col items-center justify-center gap-6 p-6', className)}
      style={{ background: 'var(--frv-bg)' }}
    >
      {logo}
      <div className="w-full" style={{ maxWidth: maxBredde }}>
        {children}
      </div>
    </Tag>
  )
}
