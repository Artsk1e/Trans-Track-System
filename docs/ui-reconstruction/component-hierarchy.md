# Component Hierarchy

> **Source:** `docs/ui-screenshots/web/ui-analysis.json` → `docs/ui-reconstruction/design-tokens.json`
> **Atomic Design Methodology:** Atoms → Molecules → Organisms → Templates → Pages

---

## Atomic Components (Atoms)

| Component | File | Variants | Description |
|-----------|------|----------|-------------|
| `Button` | `client/src/components/ui/button.tsx` | primary, secondary, ghost, link, danger \| sm, md, lg, full-width | Navy primary, brandYellow accent, full-width auth |
| `TextInput` | `client/src/components/ui/text-input.tsx` | default, auth, search | Outlined, filled auth variant (69px), floating label support |
| `Select` | `client/src/components/ui/select.tsx` | default | Dark caret, centered text, status enum options |
| `StatusBadge` | `client/src/components/ui/status-badge.tsx` | success, warning, info, default | Pill (9999px), lime/orange/blue backgrounds |
| `StatusDot` | `client/src/components/ui/status-dot.tsx` | success, warning, info | 12px colored dot |
| `Icon` | `client/src/components/ui/icon.tsx` | size: sm(16), md(20), lg(24) | Lucide wrapper, currentColor |
| `Avatar` | `client/src/components/ui/avatar.tsx` | default, with-badge | User circle, notification bell with dot |
| `NotificationBell` | `client/src/components/ui/notification-bell.tsx` | default | Bell icon + white dot badge |

---

## Molecular Components (Molecules)

| Component | File | Composition | Description |
|-----------|------|-------------|-------------|
| `NavItem` | `client/src/components/molecules/nav-item.tsx` | Icon + Label + Button | Active: brandYellow pill, dark text; Inactive: white text |
| `SearchPanel` | `client/src/components/molecules/search-panel.tsx` | TextInput (search) + Select + Button(primary) + Button(secondary) | Waybill number + Status filter + Search + New Waybill |
| `StatCard` | `client/src/components/molecules/stat-card.tsx` | Icon + Label + Value | Tile bg page color, 392×94, icon left (truck/check/box/clock) |
| `SummaryStat` | `client/src/components/molecules/summary-stat.tsx` | Icon + Label + Value | Same as StatCard, deck allocation context |
| `VesselSelect` | `client/src/components/molecules/vessel-select.tsx` | Label + Select + Ship Icon | Outlined 1.5px, 230×50, vessel enum |
| `TableRow` / `TableHeader` | `client/src/components/molecules/table-row.tsx` | Cells + Border | Gold 1px dividers, header band #E1E8F5 |
| `PublicNav` | `client/src/components/molecules/public-nav.tsx` | Brand text + Nav links | Bottom divider, "Home \| Schedule" |
| `TrackForm` | `client/src/components/molecules/track-form.tsx` | TextInput + Button(primary full-width) | 669×77 input, 669×61 button |
| `CardHeader` | `client/src/components/molecules/card-header.tsx` | Icon + Title | "Today's Shipment Status", "Shipment Status History" |

---

## Organism Components (Organisms)

| Component | File | Composition | Description |
|-----------|------|-------------|-------------|
| `Sidebar` | `client/src/components/organisms/sidebar.tsx` | Logo + Divider + NavItem[] + Divider + Logout | Staff: 2 items (Waybills, Deck Allocation); Exec: 1 item (Dashboard). Photo bg + navy overlay |
| `TopBar` | `client/src/components/organisms/top-bar.tsx` | Title + NotificationBell + Avatar + RoleMenu | Role label with caret dropdown (profile/logout) |
| `VesselScheduleTable` | `client/src/components/organisms/vessel-schedule-table.tsx` | TableHeader + TableRow[] + TextLink | 3 cols: Vessel, Departure, Status. Gold dividers. "View all schedules" link |
| `ReportHistoryTable` | `client/src/components/organisms/report-history-table.tsx` | TableHeader + TableRow[] | Cols: Report ID, Date, Action (Download btn). Gold dividers |
| `AllocatedCargoTable` | `client/src/components/organisms/allocated-cargo-table.tsx` | TableHeader + TableRow[] | Cols: Waybill No, Cargo Type, Space Used. Header band + outer border |
| `DonutChart` | `client/src/components/organisms/donut-chart.tsx` | Chart.js/Recharts + Legend | Segments: green/orange/blue. Center "248 Total". Legend: colored dots + pct |
| `DeckOverviewHero` | `client/src/components/organisms/deck-overview-hero.tsx` | Image + StatusChip | Rounded 16px, 826×190. Overlay chip: dark translucent, name + green dot + "On Schedule" |
| `AuthCard` | `client/src/components/organisms/auth-card.tsx` | Title + Subtitle + Divider + TextInput[] + Button + InfoIcon | bg authCard, radius 24px, padding 28px. Login/Track variants |

---

## Layout Templates

| Template | File | Slots | Description |
|----------|------|-------|-------------|
| `AppShell` | `client/src/layouts/app-shell.tsx` | sidebar, header, children | Fixed 256px sidebar + fluid content. Responsive: drawer <768px |
| `AuthShell` | `client/src/layouts/auth-shell.tsx` | photo, card | Full-bleed ship photo; left 31% bright, right 69% dark overlay. Card positioned right. Responsive: stack mobile |

---

## Pages (Routes)

| Page | Route | Template | Organisms Used |
|------|-------|----------|----------------|
| `LoginPage` | `/login` | `AuthShell` | `AuthCard` |
| `WaybillsPage` | `/waybills` | `AppShell` | `Sidebar` (staff), `TopBar`, `SearchPanel`, `VesselScheduleTable` |
| `DashboardPage` | `/dashboard` | `AppShell` | `Sidebar` (exec), `TopBar`, `StatCard`×4, `DonutChart`, `ReportHistoryTable` |
| `DeckAllocationPage` | `/deck-allocation` | `AppShell` | `Sidebar` (staff), `TopBar`, `VesselSelect`, `SummaryStat`×2, `DeckOverviewHero`, `AllocatedCargoTable` |
| `TrackPage` | `/` | `AuthShell` | `AuthCard` (track variant), `PublicNav`, `TrackForm`, `VesselScheduleTable` (public) |
| `SchedulePage` | `/schedule` | `AuthShell` | `PublicNav`, `VesselScheduleTable` (public) |

---

## Reuse Notes

1. **StatCard = SummaryStat** — same component, different data props
2. **Three tables share style** → generic `DataTable<T>` with column config
3. **VesselScheduleTable (staff) ≈ VesselScheduleTable (public)** — same component, different data
4. **AuthCard (login) ≈ AuthCard (track)** — same styling, different children
5. **Sidebar (staff) vs Sidebar (exec)** — same component, different nav items via role prop
6. **Button variants cover all cases** — primary (navy), secondary (slate), ghost, link (gold), danger (error)

---

## Shadcn/ui Components to Install

```bash
cd client && npx shadcn@latest add button input select table card badge avatar dropdown-menu tooltip scroll-area dialog
```

These will be **extended/wrapped** by our custom atomic components to match design tokens.

---

## Data Contracts (TypeScript Interfaces)

```typescript
// Waybills page
interface WaybillSearchFilters {
  waybillNumber: string;
  status: string; // waybill_status_enum
}

interface VesselSchedule {
  vessel: string;
  departure: string; // ISO date or '-'
  status: 'On schedule' | 'Delayed' | 'In transit';
}

// Dashboard
interface DashboardStats {
  totalShipments: number;
  onTimePct: number;
  totalCargoTons: number;
  delayedPct: number;
}

interface DonutData {
  onTime: number;
  delayed: number;
  inTransit: number;
}

interface ReportHistoryItem {
  reportId: string;
  date: string; // DD/MM/YYYY
  downloadUrl: string;
}

// Deck Allocation
interface VesselSummary {
  totalDeckSqft: number;
  remainingSqft: number;
}

interface AllocatedCargo {
  waybillNo: string;
  cargoType: string;
  spaceUsedSqft: number;
}

// Track
interface TrackResult {
  found: boolean;
  waybill?: WaybillData;
  timeline?: TimelineEvent[];
}
```

---

## Responsive Behavior Map

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|-----------|-----------------|---------------------|-------------------|
| `Sidebar` | Hamburger drawer | Collapsible (icons only) | Fixed 256px |
| `SearchPanel` | Stacked (3 rows) | 2-col (input+select / buttons) | 4-col inline |
| `StatCard` | 1-col | 2-col | 2×2 grid |
| `VesselScheduleTable` | Stacked cards | Horizontal scroll | Full table |
| `AllocatedCargoTable` | Stacked cards | Horizontal scroll | Full table |
| `AuthShell` | Card full-width, photo dimmed bg | Card centered, photo split | Split 31/69 |
| `DonutChart` | Full width | Full width | 44% width |
| `DeckOverviewHero` | Full width | Full width | Full width |