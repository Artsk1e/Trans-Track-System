# Pages

**Last Updated:** 2026-11-24
**Phase:** 1 — Design System Foundation
**Routing:** React Router in `client/src/App.tsx` — flat `<Routes>` table, wildcard redirects to `/`.

Route definitions (`App.tsx`):

```tsx
<Route path="/login" element={<LoginPage />} />
<Route path="/waybills" element={<WaybillsPage />} />
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/deck-allocation" element={<DeckAllocationPage />} />
<Route path="/" element={<TrackPage />} />
<Route path="/schedule" element={<SchedulePage />} />
<Route path="*" element={<Navigate to="/" replace />} />
```

> ⚠️ There is **no route-level authentication guard**. Role shells (`role` prop) are hardcoded per page. See [known-issues](./known-issues.md).

---

## 1. LoginPage — `/login`

**File:** `src/pages/login-page.tsx` · **Shell:** `AuthShell` · **Audience:** Public/Staff

- `AuthCard` titled "Login", subtitle "Login as staff" (typo fixed from analysis "Login aa staff")
- `TextInput variant="auth"` × 2 (Username, Password) with show/hide password eye toggle (aria-labeled)
- Mock submit: 1s `setTimeout`, accepts any non-empty credentials → `window.location.href = '/waybills'`
- Error banner (`role="alert"`) when fields empty; loading state on submit button
- "Forgot password? Contact administrator" caption

**Phase 2 wiring:** replace mock with real auth API; role-based redirect.

## 2. WaybillsPage — `/waybills`

**File:** `src/pages/waybills-page.tsx` · **Shell:** `AppShell` (STAFF) · **Audience:** Staff

- `h1` "Waybills"
- `SearchPanel`: waybill number input, status Select (`all / on-schedule / delayed / in-transit`), Search (500ms mock), New Waybill
- `VesselScheduleTable` with 4-row mock schedule
- Right-aligned primary "Search Waybills" button

**Known typo from analysis:** source design said "New Waybills"; page uses "New Waybill" (corrected).

**Phase 2 wiring:** `handleSearch` → API query; `handleNewWaybill` currently `console.log` → open create modal.

## 3. DashboardPage — `/dashboard`

**File:** `src/pages/dashboard-page.tsx` · **Shell:** `AppShell` (EXEC) · **Audience:** Executive

- `h1` "Dashboard"
- 4 `StatCard`s in responsive grid (1/2/4 cols): Total Shipments (248), On Time % (92.7%), Total Cargo (12,800 tons), Delayed % (7.3%)
- Bottom 12-col grid:
  - Left (5 cols, `card-base`): `CardHeader` + `DonutChart` (onTime 230 / delayed 18 / total 248, size 200)
  - Right (7 cols, `card-base`): `CardHeader` with ghost "View all" + `ReportHistoryTable` (3 mock reports with `onDownload`)

**Phase 2 wiring:** stats/donut/reports from API; `onDownload` → real file download.

## 4. DeckAllocationPage — `/deck-allocation`

**File:** `src/pages/deck-allocation-page.tsx` · **Shell:** `AppShell` (STAFF) · **Audience:** Staff

- `h1` uppercase "DECK ALLOCATION / CARGO SPACE"
- Top grid (1/3 cols): `VesselSelect` card (3 mock vessels; change triggers 500ms mock reload) + 2 `StatCard`s (Total Deck Space 50,000 sq.ft, Remaining 18,000 sq.ft)
- `CardHeader` "Deck Overview" + `DeckOverviewHero` (vessel "Trans-Asia 19", Unsplash placeholder image, on-schedule)
- `CardHeader` "Allocated Cargo" + `AllocatedCargoTable` (3 mock rows: WB-2026-001…003, 19,000 sq.ft total) with pagination mock (1 of 3 pages)

**Known data inconsistency (from design, carried into mocks):** allocated rows (19,000) don't reconcile with 50,000 − 18,000 remaining = 32,000 used. See [known-issues](./known-issues.md).

## 5. TrackPage — `/` (root)

**File:** `src/pages/track-page.tsx` · **Shell:** `AuthShell` · **Audience:** Public

- `PublicNav` (activeTab "home", tab change not wired)
- `AuthCard` "Track Your Shipment!" + `TrackForm` (waybill input + full-width submit)
- Mock track: 1s delay, always returns `{ found: true }` → result panel showing vessel "MV Trans Asia 1", departure, "On Schedule" status
- Below card: `VesselScheduleTable` (5-row mock) for public schedule visibility

**Phase 2 wiring:** real waybill lookup API; not-found and error states (currently only `found: true` handled).

## 6. SchedulePage — `/schedule`

**File:** `src/pages/schedule-page.tsx` · **Shell:** `AuthShell` · **Audience:** Public

- Simplest page: `PublicNav` (activeTab "schedule") + `card-base` `VesselScheduleTable` with 8-row mock
- No other content; no loading state (static render)

**Phase 2 wiring:** schedule data from API; date formatting standardization (currently `DD/MM/YYYY HH:mm` strings).

---

## Cross-Page Patterns

| Pattern | Where |
|---------|-------|
| Page title `h1.text-h1` + `mb-6` | AppShell pages |
| `card-base` + `CardHeader` sectioning | Dashboard, Deck Allocation |
| 500ms–1s `setTimeout` mocks | all interactive handlers |
| `console.log` placeholder handlers | navigation, logout, downloads, pagination, modals |
| Shared mock schedule arrays | Waybills (4 rows), Track & Schedule (5–8 rows) — duplicated inline, candidates for a fixtures module in Phase 2 |

---

## Responsive Behavior (implemented via Tailwind breakpoints)

- Stat grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Dashboard bottom: `grid-cols-1 lg:grid-cols-12`
- Deck top: `grid-cols-1 lg:grid-cols-3`
- `AppShell`: mobile TopBar (`lg:hidden`), desktop sidebar; mobile nav via FAB (incomplete — see known-issues)
- `AuthShell`: card `p-6 lg:pl-20`, max-width 719px
