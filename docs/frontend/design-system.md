# Design System

**Last Updated:** 2026-11-24
**Phase:** 1 — Design System Foundation

---

## Sources of Truth

1. **Canonical JSON:** `docs/ui-reconstruction/design-tokens.json` (extracted from screenshot analysis)
2. **Tailwind theme:** `client/tailwind.config.ts`
3. **CSS variables:** `client/src/index.css` (`:root` block)

All three are kept in sync manually. The JSON file is the reference; Tailwind + CSS vars are the runtime.

---

## Color Palette

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `navy` | `#14304F` | `bg-navy`, `text-navy` | Primary buttons, sidebar, chips |
| `navy.dark` | `#0D2238` | `bg-navy-dark` | Sidebar photo overlay |
| `navy.overlay` | `#12294A` | `bg-navy-overlay` | Auth gradient, focus ring offset |
| `page` | `#E1E8F5` | `bg-page` | App background, table header band |
| `heading` | `#16293F` | `text-heading` | Headings, stat values |
| `slate` | `#3B4C63` | `text-slate` | Table headers, secondary text |
| `brandYellow` | `#FFD81B` | `bg-brandYellow`, `text-brandYellow` | Brand accent, active nav pill, focus ring, selection |
| `gold.line` | `#E3C54A` | `border-gold-line` | Table row dividers |
| `gold.link` | `#8A6D00` | — | Text links (fixed from `#C9A800` for WCAG AA, see [known-issues](./known-issues.md)) |
| `success.bg` | `#66FF66` | `bg-success-bg` | Success badge bg ⚠️ contrast failure |
| `success.text` | `#065F13` | `text-success-text` | Success badge text (fixed from `#0B8A1F` for WCAG AA) |
| `warning` | `#F5822A` | `bg-warning` | Warning badges |
| `info` | `#2F6FED` | `bg-info` | Info badges |
| `chartGreen` | `#3DC47A` | `bg-chartGreen` | Donut chart "on time" segment |
| `authCard` | `#34475A` | `bg-authCard` | Auth card background |
| `authOverlay` | `#0B1624` | `bg-authOverlay` | Auth photo overlay |
| `surface` | `#FFFFFF` | `bg-surface` | Cards, panels |
| `textPrimary` | `#16293F` | `text-textPrimary` | Body text |
| `textMuted` | `#6B7280` | `text-textMuted` | Captions, placeholders (fixed from `#9CA3AF` for WCAG AA) |
| `inputBorder` | `#1A1A1A` | `border-inputBorder` | Input outlines |
| `error` | `#DC2626` | `bg-error`, `text-error` | Error states |

---

## Typography

Font: **Inter** (Google Fonts import, weights 400/500/600/700), fallback `system-ui, sans-serif`.

Text styles are defined as utility classes in `index.css` `@layer utilities`:

| Class | Size / Weight / Line-height | Color |
|-------|------------------------------|-------|
| `.text-h1` | 32px / 700 / 1.2 | heading |
| `.text-h2` | 20px / 600 / 1.3 | heading |
| `.text-h3` | 18px / 600 / 1.4 | heading |
| `.text-body` | 16px / 400 / 1.5 | textPrimary |
| `.text-body-large` | 17px / 400 / 1.5 | textPrimary |
| `.text-stat-value` | 32px / 500 / 1.0 | heading |
| `.text-small-caption` | 14px / 400 / 1.4 | textMuted |
| `.text-button-label` | 18px / 600 / 1.0 | white |
| `.text-button-label-sm` | 16px / 500 / 1.0 | white |

---

## Border Radius

| Token | Value | Class |
|-------|-------|-------|
| `card` | 24px | `rounded-card` / `card-base` |
| `control` | 16px | `rounded-[var(--radius-control)]` |
| `navPill` | 20px | active nav pill |
| `pill` / `badge` | 9999px | `StatusBadge` |

## Shadows

- Default: **none** (flat design)
- `subtle`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`

---

## Spacing & Layout Variables

| Variable | Value | Usage |
|----------|-------|-------|
| `--spacing-base` | 4px | Base unit (Tailwind default scale) |
| `--sidebar-width` | 256px | Fixed sidebar |
| `--header-height` | 64px | TopBar |
| `--content-padding` | 24px | Page gutters |
| `--section-spacing` | 16px | Between sections |
| `--gutter` | 20px | Grid gutter |
| `--min-touch-target` | 44px | `.touch-target` utility |

Breakpoints (renamed Tailwind screens): `mobile` 640px · `tablet` 768px · `desktop` 1024px · `wide` 1280px. Layout uses a 12-column grid (`lg:col-span-*`).

---

## CSS Component Classes (`@layer components`, `index.css`)

| Class | Definition |
|-------|-----------|
| `.container-page` | `max-w-7xl mx-auto px-5 py-6` — page wrapper |
| `.card-base` | White surface, 24px radius, `#f3f4f6` border |
| `.table-base` | Full-width, border-collapse |
| `.table-header` | `page`-colored header band, 16px top radius, semibold slate text |
| `.table-cell` | 16px padding, 14px text, `gold.line` bottom border |
| `.table-row-hover` | Hover `bg-page/50` transition |

---

## Accessibility Tokens

| Token | Value |
|-------|-------|
| `--focus-ring-width` | 2px |
| `--focus-ring-color` | `#FFD81B` (brandYellow) |
| `--focus-ring-offset` | 2px |
| `::selection` | brandYellow bg, navy text |
| Global `*:focus-visible` | Yellow ring, white offset |
| `.focus-ring` utility | Composable focus ring for controls |
| `.touch-target` | Enforces 44×44px minimum |

Target contrast: **WCAG AA** — but three current combinations fail; see [known-issues.md](./known-issues.md).

---

## Tailwind Configuration Notes

- `tailwind.config.ts` extends `theme.extend` with the colors/radii/screens above and `fontFamily.sans: ['Inter', ...]`.
- Plugin: `tailwindcss-animate`.
- ⚠️ `index.css` also hand-defines many utilities in `@layer utilities` (e.g. `.bg-page\/50`, `.hover\:bg-white\/10`, `.text-white\/80`) that duplicate Tailwind's built-in opacity-variant behavior. These exist to guarantee token-driven values; they can be pruned in Phase 3 once utilities are confirmed working natively from the theme extension.

---

## Adding a New Token (workflow)

1. Add to `docs/ui-reconstruction/design-tokens.json`
2. Add CSS variable in `client/src/index.css` `:root`
3. Add to `client/tailwind.config.ts` theme extension
4. Use the Tailwind class or `var(--…)` in components — never raw hex
