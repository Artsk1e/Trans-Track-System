# Screenshot Analysis Description Template

Use this template for each PNG screenshot in `Docs/`. Fill in all fields — mark "unknown" or "estimate" where unsure.

---

## Layout Grid
- Container width: ___px / fluid
- Column count: ___ (12-col? sidebar width?)
- Header height: ___px
- Section spacing: ___px between sections
- Gutter width: ___px

## Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Primary | #____ | Main brand, primary CTAs |
| Primary hover | #____ | |
| Secondary | #____ | Secondary actions |
| Background | #____ | Page background |
| Surface/Card | #____ | Card/panel backgrounds |
| Text primary | #____ | Headings, body |
| Text muted | #____ | Labels, help text |
| Border | #____ | Input borders, dividers |
| Accent/CTA | #____ | Primary buttons |
| Success | #____ | Success states |
| Warning | #____ | Warning states |
| Error | #____ | Error states |

## Typography
- Font family: ____ (system UI? Inter? Roboto? Source Sans?)
- Heading scale:
  - H1: ___px / ___ weight
  - H2: ___px / ___ weight
  - H3: ___px / ___ weight
- Body: ___px / ___ line-height / ___ weight
- Small/Caption: ___px
- Font weights used: 400, 500, 600, 700?

## Components Identified
| Component | Type (atomic/molecule/organism) | Variants | Data Mapping | Notes |
|-----------|--------------------------------|----------|--------------|-------|
| | | | | |
| | | | | |

## Spacing Scale
- Base unit: 4px / 8px?
- Scale values: 4, 8, 12, 16, 24, 32, 48, 64?

## Responsive Breakpoints
- Mobile (< 768px): ____
- Tablet (768-1024px): ____
- Desktop (> 1024px): ____

## Interactions
- Hover states: ____
- Focus states: ____
- Loading states: ____
- Click/press feedback: ____
- Form validation: ____
- Empty states: ____
- Error states: ____

## Accessibility Notes
- Contrast ratios visible: pass/fail/unknown
- Focus indicators: visible/hidden
- Touch target sizes: ≥44px / smaller
- ARIA labels visible: yes/no

## Observed vs. Estimated
Mark each measurement:
- ✅ **Observed** — clearly measurable from screenshot
- 📏 **Estimated** — inferred from context/standard patterns
- ❓ **Unknown** — cannot determine

---

## Example: Filled for `Docs/OIC.jpg`

## Layout Grid
- Container width: 1440px max, fluid below
- Column count: 12-col grid, 24px gutters
- Header height: 64px (fixed top nav)
- Section spacing: 32px between major sections
- Sidebar: 280px fixed left navigation

## Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Primary | #1E40AF | Blue-800, primary actions, active nav |
| Primary hover | #1E3A8A | Blue-900 |
| Secondary | #64748B | Slate-500, secondary buttons |
| Background | #F8FAFC | Slate-50, page bg |
| Surface/Card | #FFFFFF | White, cards, modals |
| Text primary | #0F172A | Slate-900, headings |
| Text muted | #64748B | Slate-500, labels |
| Border | #E2E8F0 | Slate-200, dividers |
| Accent/CTA | #1E40AF | Same as primary |
| Success | #059669 | Emerald-600 |
| Warning | #D97706 | Amber-600 |
| Error | #DC2626 | Red-600 |

## Typography
- Font family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- Heading scale:
  - H1: 32px / 700 (page title)
  - H2: 24px / 600 (section headers)
  - H3: 18px / 600 (card titles)
- Body: 14px / 1.5 / 400
- Small/Caption: 12px / 400
- Font weights used: 400, 500, 600, 700

## Components Identified
| Component | Type | Variants | Data Mapping | Notes |
|-----------|------|----------|--------------|-------|
| VoyageCard | organism | default, loading, empty | voyage object | Shows capacity bars |
| TruckTable | molecule | sortable, paginated, filterable | truck_arrivals[] | Columns: plate, driver, ETA, status |
| StatCard | organism | icon+value+trend | aggregate stats | Deck utilization, room utilization |
| StatusBadge | atomic | loaded, pending, in-transit | waybill_status_enum | Color-coded |
| FilterBar | molecule | date-range, status, search | query params | Sticky on scroll |

## Spacing Scale
- Base unit: 8px
- Scale: 8, 16, 24, 32, 48, 64

## Responsive Breakpoints
- Mobile (< 768px): Stack cards, hide sidebar (hamburger), table → cards
- Tablet (768-1024px): Sidebar collapsible, 2-col grid for stats
- Desktop (> 1024px): Full layout, sidebar always visible

## Interactions
- Hover: Table rows highlight, cards lift 2px, buttons darken
- Focus: 2px blue outline offset 2px
- Loading: Skeleton loaders for cards/table, spinner for actions
- Click: Button press (scale 0.98), row selection highlight
- Filter: Debounced 300ms, URL sync

## Accessibility Notes
- Contrast ratios: ✅ Pass (blue on white 8.5:1, slate on white 7:1)
- Focus indicators: ✅ Visible
- Touch targets: ✅ ≥44px (buttons 48px, table rows 52px)
- ARIA labels: ✅ On icon buttons, status badges

## Observed vs. Estimated
- Layout grid: ✅ Observed
- Color hex values: 📏 Estimated (from Tailwind defaults + visual matching)
- Typography scale: 📏 Estimated (standard system UI scale)
- Spacing: 📏 Estimated (8px base from visual rhythm)
- Components: ✅ Observed
- Interactions: ❓ Unknown (static image)