# Khaled Portfolio — Design System

> Durable source of truth for the visual system. The design itself was produced in
> Claude Design (web) and is **not** committed to this repo — only this summary and the
> implementation under `/app` are. Re-fetch the full handoff bundle if you need the
> original prototype HTML/CSS.

**Handoff bundle:** `https://api.anthropic.com/v1/design/h/Ycw4A8xNBqBAQ714Dmk8yw`
(gzip tarball — `khaled-portfolio-design-system-439ddbeb`). Contains the prototype
(`Portfolio.dc.html`), the chat transcript with all locked content decisions, and the
token CSS the values below are ported from.

**Implementation:** tokens live in `app/src/app/globals.css`; primitives in
`app/src/components/ui/`; sections in `app/src/components/sections/`.

---

## Mood

Dark-dominant, warm, near-monochrome — "a well-made object, not a brochure." Apple-grade
restraint, editorial typography, exactly one accent, generous whitespace. Dry wit lives in
the words (micro-labels, section notes, footer, console easter egg) — never in loud
visuals. No stock imagery: project "thumbnails" are type + index numbers.

**Dark is the hero theme; light is a first-class alternate.** `:root` is dark;
`[data-theme="light"]` overrides.

---

## Color

One warm **stone ramp** carries the whole surface (paper `--stone-0` #FBF8F2 → ink
`--stone-950` #0E0C0A). Exactly one accent: **burnt orange `--orange-500` #F2552C** — the
single red thread (primary CTA, links/active states, the live status dot, case-study metric
numbers). In light mode the accent deepens to `--orange-600` #DC4419 for AA text contrast.
Support hues (green/amber/red) appear **only** for status.

### Semantic tokens — dark (default)

| Token | Value |
|---|---|
| `--bg` | `--stone-950` #0E0C0A |
| `--surface` / `--surface-card` | `--stone-900` #141210 |
| `--surface-inset` | #0B0908 |
| `--text` | #F3EEE4 |
| `--text-strong` | #FCFAF4 |
| `--text-muted` | #A89E8E |
| `--text-faint` | #6E6658 |
| `--border` | rgba(243,238,228,0.10) |
| `--border-strong` | rgba(243,238,228,0.20) |
| `--accent` | #F2552C |
| `--status-available` | #4FA374 |

### Semantic tokens — light (`[data-theme="light"]`)

| Token | Value |
|---|---|
| `--bg` | `--stone-0` #FBF8F2 |
| `--surface` / `--surface-card` | #FFFFFF |
| `--text` | #17140F |
| `--text-strong` | #0C0A07 |
| `--text-muted` | #6B6353 |
| `--text-faint` | #9A9080 |
| `--border` | rgba(23,20,15,0.12) |
| `--accent` | #DC4419 (orange-600) |
| `--status-available` | #2F8556 |

---

## Type

Editorial contrast across three families (Google Fonts, loaded via `next/font`):

- **Newsreader** (serif) — display + H1/H2, set light (300–400) and optically tight
  (`--tracking-display: -0.022em`). Italics carry headline emphasis.
- **Hanken Grotesk** — body, UI, controls. Body leads at `1.55` so EN and longer DE
  share one rhythm.
- **IBM Plex Mono** — the engineer cue: index numbers (`01 / 06`), uppercase eyebrow
  labels (`--tracking-label: 0.14em`), metric captions.

Scale: ~1.25 modular, fluid at the top via `clamp()` —
`--text-2xs` 11px · `--text-sm` 14px · `--text-base` 16px · `--text-md` 18px ·
`--text-lg` 22px · `--text-xl` 28px · `--text-2xl` 36px · `--text-3xl` 40→56 ·
`--text-4xl` 48→80 · `--text-5xl` 56→112.
Semantic roles: `--type-display`, `--type-h1…h4`, `--type-lead`, `--type-body`,
`--type-small`, `--type-label`.

---

## Spacing, radius, elevation, motion

- **Spacing** — 4px base. `--space-1` 4px → `--space-11` 192px (section air). Main column
  `--container` 72rem; reading measure `--container-prose` 40rem.
- **Radius** — tight: `--radius` 6px (buttons/inputs/tags), `--radius-lg` 12px (cards),
  `--radius-full` (dots/pills). Nothing bubbly.
- **Borders & elevation** — hairline borders carry structure in dark; soft warm-tinted
  shadows (`--shadow-sm/md`) lift cards in light. No glows except `--shadow-accent`.
- **Blur** — used once, with intent: the sticky nav frosts the page bg via
  `backdrop-filter: blur` over a `color-mix`.
- **Motion** — gentle, content-serving. Ease `--ease-out: cubic-bezier(0.22,1,0.36,1)`;
  durations 140/240/460ms, 720ms for reveals. Nothing bouncy. The only loop is the soft
  `StatusDot` pulse. **All motion respects `prefers-reduced-motion`** (entrance `kp-rise`
  disabled, `kp-pulse` neutralised, smooth scroll → auto).

---

## Components (`app/src/components/ui/`)

| Component | Notes |
|---|---|
| `Button` | `primary` = the single accent action; `secondary`/`ghost`/`link` quieter. Sizes sm/md/lg (32/42/52px). Calm hover (color/border shift), 0.99 press settle. |
| `Tag` | Compact mono label for the tech range. `outline` (default) / `solid`; sizes sm/md. |
| `StatusDot` | Live dot + soft pulse; `available` (green) is the only green in the UI. Pulse respects reduced-motion. |
| `Card` | Surface for projects. Hairline border + `--shadow-sm`; `interactive` lifts 2px and warms the border to `--accent-line` on hover. |
| `Input` / `Textarea` | Mono uppercase label, `--surface-inset` fill, accent focus ring (`0 0 0 3px --accent-soft`). |
| `icons.tsx` | Lucide-style line icons (1.75px stroke, currentColor): arrows + Mail/Github/Linkedin. |

Brand mark is typographic: `Khaled.` (Newsreader) with one accent period; favicon at
`app/public/favicon.svg`.

---

## Internationalization & theming behavior

- **Locale = route.** `/en` (default) and `/de` are static sub-paths via the `[locale]`
  segment + `generateStaticParams` (next-intl, **no middleware** — see §2). All copy lives
  in `app/src/messages/{en,de}.json`; German is native (formal *Sie*), ~30% longer, and
  every layout absorbs it. The EN/DE toggle is a real route switch.
- **Theme = client state.** Persisted to `localStorage` (`kp-theme`), applied as
  `data-theme` on `<html>` by a pre-paint script (default dark, no flash). Read via
  `useSyncExternalStore` in `ThemeProvider`.

---

## Screens implemented

Home (`/[locale]`): Nav (sticky, blurred, mono-indexed links, EN/DE + light/dark toggles,
CTA) · Hero (asymmetric split + live status dot + spec panel) · Selected Work (2-col card
grid + open-source/writing row) · Tech & tooling (4-col tag groups) · About (2-col + facts)
· Contact (form + direct links) · Footer (links, toggles, dry colophon).
Case study (`/[locale]/work/tmms`): long-scroll TMMS narrative.
Console easter egg fires on devtools open. Scroll/motion mechanics (Lenis/GSAP/Framer) are
intentionally deferred to a later code step — the composition leaves room for them.

---

## Substitutions / open items

- Fonts via Google Fonts (`next/font`) — deliberate brand choices, swappable to self-hosted.
- Accent locked to burnt orange (the prototype's blue/green/brass were preview-only).
- Placeholders to fill later: `telephony_sms` download count, Springer DOI link, CV (PDF)
  link, any shareable TMMS metric. DE copy is realistic native placeholder, refine when final.
