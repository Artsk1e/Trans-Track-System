# Component Inventory

**Last Updated:** 2026-11-24
**Phase:** 1 — Design System Foundation
**Totals:** 8 atoms · 7 molecules · 7 organisms · 2 layouts

Import via barrels: `@/components/ui`, `@/components/molecules`, `@/components/organisms`, `@/layouts`.

---

## Atoms (`src/components/ui/`)

| Component | File | Variants / Props | Notes |
|-----------|------|------------------|-------|
| `Button` | `button.tsx` | variants: `primary, secondary, ghost, link, danger` · sizes: `sm, md, lg, full-width` · `loading`, `disabled` | Navy primary; `full-width` used on auth forms; loading spinner state |
| `TextInput` | `text-input.tsx` | variants: `default, auth, search` · label, error, disabled, `children` slot | `auth` variant: filled dark 69px height for AuthCard; supports trailing icon via children (password eye) |
| `Select` | `select.tsx` | `options: SelectOption[]`, value, onChange, disabled | 16px radius, 45px height, right caret |
| `StatusBadge` | `status-badge.tsx` | `success, warning, info, default` | 9999px pill, 29px height; maps schedule status strings |
| `StatusDot` | `status-dot.tsx` | `success, warning, info` | 12px dot, used inside hero chip |
| `Icon` | `icon.tsx` | `name` (lucide set), `size: sm(16) / md(20) / lg(24)` | Wrapper over lucide-react; `currentColor`; `aria-hidden` expected from callers |
| `Avatar` | `avatar.tsx` | `with-badge` | User-circle icon; TopBar identity |
| `NotificationBell` | `notification-bell.tsx` | `unreadNotifications`, `onClick` | Bell + white dot badge |

Exports (with prop types): see `components/ui/index.ts`.

---

## Molecules (`src/components/molecules/`)

| Component | File | Composed of | Notes |
|-----------|------|-------------|-------|
| `NavItem` | `nav-item.tsx` | Icon + Label (Button) | Active: brandYellow pill, navy text; inactive: white text; Sidebar child |
| `SearchPanel` | `search-panel.tsx` | TextInput(search) + Select + Button(primary) + Button(secondary) | Waybill filter bar on Waybills; props: values, change handlers, `onSearch`, `onNewWaybill`, `statusOptions`, `loading` |
| `StatCard` | `stat-card.tsx` | Icon + Label + Value | Page-colored tile ~392×94; used 4× on Dashboard, 2× on Deck Allocation |
| `VesselSelect` | `vessel-select.tsx` | Label + Select + Ship icon | Outlined 1.5px, vessel picker on Deck Allocation |
| `CardHeader` | `card-header.tsx` | Icon + Title + optional `action` slot | Standard card title row; action slot hosts ghost "View all" buttons |
| `PublicNav` | `public-nav.tsx` | Brand + "Home \| Schedule" links | Bottom divider; used on Track & Schedule; `activeTab`, `onTabChange` |
| `TrackForm` | `track-form.tsx` | TextInput + Button(primary, full-width) | 669px-wide waybill entry; props: value, onChange, onSubmit, loading |

Planned in analysis but folded into other components during build: `SummaryStat` (= `StatCard`), `TableRow`/`TableHeader` (= `.table-*` CSS classes).

---

## Organisms (`src/components/organisms/`)

| Component | File | Composed of | Notes |
|-----------|------|-------------|-------|
| `Sidebar` | `sidebar.tsx` | Logo + NavItem[] + Logout | `role: 'STAFF'` → Waybills, Deck Allocation; `'EXEC'` → Dashboard. Photo bg + navy overlay, fixed 256px |
| `TopBar` | `top-bar.tsx` | Title + NotificationBell + Avatar + role menu | Mobile header (<lg); role label with profile/logout dropdown |
| `VesselScheduleTable` | `vessel-schedule-table.tsx` | `.table-*` classes + StatusBadge + "View all schedules" link | Cols: Vessel, Departure, Status; type `VesselSchedule { vessel, departure, status }`; `loading`, `onViewAll` |
| `ReportHistoryTable` | `report-history-table.tsx` | `.table-*` + Download buttons | Cols: Report ID, Date, Action; type `ReportHistoryItem`; `onDownload` |
| `AllocatedCargoTable` | `allocated-cargo-table.tsx` | `.table-*` + clickable waybills + pagination | Cols: Waybill No, Cargo Type, Space Used; type `AllocatedCargo`; `pagination: { currentPage, totalPages, onPageChange }` |
| `DonutChart` | `donut-chart.tsx` | SVG segments + legend + center total | Type `DonutData { onTime, delayed, inTransit }` + `total`; green/orange/blue segments, "248 Total" center |
| `DeckOverviewHero` | `deck-overview-hero.tsx` | Image + overlay chip (name + StatusDot + status) | 826×190, 16px radius; props: `vesselName`, `imageUrl`, `status` |
| `AuthCard` | `auth-card.tsx` | Title + Subtitle + Divider + children + info icon | `bg-authCard`, 24px radius, 28px padding, max-width 719px; shared by Login & Track; optional `infoContent` |

---

## Layouts (`src/layouts/`)

### `AppShell` — `app-shell.tsx`
Authenticated layout.

Props: `children`, `role: 'STAFF' | 'EXEC'`, `activeRoute`, `userName`, `onNavigate`, `onLogout`, `onNotificationClick?`, `unreadNotifications?`.

Structure: fixed 256px Sidebar (desktop) + fluid main (`container-page`) + mobile-only TopBar + floating FAB button (bottom-right, opens mobile drawer — drawer body is **not yet wired**, see [known-issues](./known-issues.md)).

### `AuthShell` — `auth-shell.tsx`
Public layout.

Props: `children`, `photoUrl?` (default `/images/auth-bg.jpg`, present in `client/public/`), `backHref?`, `className?`.

Structure: full-bleed photo + navy gradient overlay (left bright → right dark), back link top-left, brand logo (yellow Ship tile + "Trans-Track"), centered card slot `max-w-[719px]`.

---

## Shared Styling Hooks

- Cards: `card-base` class + `CardHeader`
- Tables: `.table-base` / `.table-header` / `.table-cell` / `.table-row-hover`
- Focus: `.focus-ring` utility or global `*:focus-visible`
- Touch: `.touch-target`

## Extension Points for Phase 2

Handlers currently logging to console, awaiting real wiring: `onNavigate`, `onLogout`, `onNotificationClick`, `onDownload`, `onWaybillClick`, `onPageChange`, `onViewAll`, `onNewWaybill`.
