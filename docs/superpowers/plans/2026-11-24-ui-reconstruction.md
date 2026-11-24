# UI Reconstruction Implementation Plan

> **Orchestrator:** trans-track-architect  
> **Delegates to:** frontend-react-dev (implementation), design (tokens), uiux-reviewer (validation), qa-testing-engineer (3G/accessibility)  
> **Source Analysis:** `docs/ui-screenshots/web/ui-analysis.json` (5 screens, shared design system)  
> **Target Stack:** React + Vite + Tailwind (shadcn/ui hybrid)  
> **Reference Images:** `docs/ui-screenshots/web/Trans-Track System Desktop_page-000[1-5].png`

---

## Global Constraints
- **Hybrid components**: shadcn/ui for complex (Select, Table, Dialog), custom for branded (Button, Badge, Card, Input)
- **Contrast fixes**: Phase 3 (known failures: lime badge, gold link, placeholder grey)
- **Data strategy**: Mock data matching designs for visual fidelity; realistic backend data for integration
- **Missing states**: Design-system defaults (skeletons, focus rings, red borders, empty states)
- **Accessibility**: WCAG 2.2 AA target; semantic HTML, ARIA labels, keyboard navigation
- **Responsive**: 3 breakpoints (mobile <768, tablet 768-1024, desktop >1024)

---

## Phase 1: Design System Foundation (Session 1)

### Files to Create/Modify
- `client/tailwind.config.ts` — extend with design tokens
- `client/src/styles/globals.css` — CSS variables, base styles
- `client/src/lib/utils.ts` — cn() helper (clsx + tailwind-merge)
- `client/src/components/ui/` — atomic components (Button, Input, Badge, etc.)

### Tasks
- [ ] **Task 1.1**: Extract Tailwind theme from `ui-analysis.json` → `tailwind.config.ts`
  - Colors: navy, page, heading, slate, brandYellow, gold, success, warning, info, chartGreen, authCard
  - Font: Inter
  - Radii: card, control, pill
  - Spacing: default 4px scale
- [ ] **Task 1.2**: Create CSS variables in `globals.css` for dynamic theming
- [ ] **Task 1.3**: Install shadcn/ui components: `button`, `input`, `select`, `table`, `card`, `badge`, `avatar`, `dropdown-menu`, `tooltip`, `scroll-area`
- [ ] **Task 1.4**: Build custom atomic components matching design:
  - `Button` — primary (navy), secondary, ghost, full-width variants
  - `TextInput` — outlined, filled (auth), with floating label support
  - `Select` — styled to match (dark caret, centered text)
  - `StatusBadge` — pill, variants: success/warning/info
  - `StatusDot` — small colored dot
  - `Icon` — Lucide wrapper with size prop
- [ ] **Task 1.5**: Build layout shells:
  - `AppShell` — sidebar (256px) + header + content, responsive drawer
  - `AuthShell` — split photo + card overlay, responsive stack

### Deliverables
- `docs/ui-reconstruction/design-tokens.json` (from analysis)
- `docs/ui-reconstruction/component-hierarchy.md`
- Working Storybook/component preview (optional)

---

## Phase 2: Screen Implementation (Sessions 2-4)

### Session 2: Login + AuthShell (Priority 1)
**Route:** `/login`  
**Components:** `AuthCard`, `TextInput (auth)`, `Button primary (full-width)`, `BackLink`, `InfoIcon`  
**Features:** Form validation, Enter submit, loading state, error banner, role-based redirect (STAFF→/waybills, EXEC→/dashboard)  
**Accessibility:** Real labels, autocomplete, aria-describedby for errors

### Session 3: Waybills + AppShell (Priority 2)
**Route:** `/waybills`  
**Components:** `Sidebar` (staff: Waybills + Deck Allocation), `TopBar` (title + bell + avatar + role menu), `SearchPanel` (TextInput + Select + Buttons), `VesselScheduleTable`  
**Features:** Search filters waybills (results table NOT designed — build generic `DataTable`), New Waybills opens modal (stub)  
**Responsive:** Sidebar→drawer, Search row stacks, Table→cards

### Session 4: Dashboard + Deck Allocation (Priorities 3-4)
**Routes:** `/dashboard` (EXEC), `/deck-allocation` (STAFF)  
**Dashboard Components:** `StatCard` (2×2), `DonutChart` (Chart.js or Recharts), `ReportHistoryTable`, `Button small`  
**Deck Allocation Components:** `VesselSelect`, `SummaryStat`, `DeckOverviewHero` (photo + chip), `AllocatedCargoTable`  
**Features:** Vessel change refetches data, pagination for tables, progress bar for deck usage

### Session 5: Track Shipment Public (Priority 5)
**Routes:** `/` (public), `/schedule`  
**Components:** `PublicNav`, `TrackForm`, `VesselScheduleTable (public)`  
**Features:** Track result states (found/not found/loading → timeline card), Schedule tab navigation

---

## Phase 3: Polish & Accessibility (Session 6)

### Tasks
- [ ] Fix contrast: lime badge → darker green, gold link → darker amber, placeholder → darker grey
- [ ] Add all hover/focus/loading/error/empty states
- [ ] Keyboard navigation audit (Tab order, Enter/Space, Escape)
- [ ] ARIA labels on icon-only elements (bell, avatar, info, caret)
- [ ] Date format: DD/MM/YYYY for Philippines locale
- [ ] Typos: "Login aa staff" → "Login as staff", "Todays" → "Today's"
- [ ] Playwright screenshots at 3 breakpoints per screen
- [ ] Visual comparison report: `docs/ui-reconstruction/comparison-report.md`

---

## Agent Delegation Map

| Task | Agent | File Scope |
|------|-------|------------|
| Design tokens, Tailwind config | `design` (skill) | `tailwind.config.ts`, `globals.css`, `design-tokens.json` |
| Atomic components, layout shells | `frontend-react-dev` | `client/src/components/ui/`, `client/src/layouts/` |
| Screen implementations | `frontend-react-dev` | `client/src/pages/`, `client/src/components/` |
| UI/UX review vs analysis | `uiux-reviewer` | All frontend changes |
| 3G performance, accessibility | `qa-testing-engineer` | Bundle size, Lighthouse, axe-core |
| Feature documentation | `feature-doc-reviewer` | `docs/features/` |

---

## Multi-Session Prompts

### Session 1: Design System Foundation
```bash
opencode run --agent frontend-react-dev "Implement Phase 1: Design System Foundation per docs/superpowers/plans/2026-11-24-ui-reconstruction.md. Create tailwind.config.ts with tokens from ui-analysis.json, install shadcn/ui components (button, input, select, table, card, badge, avatar, dropdown-menu, tooltip, scroll-area), build custom atomic components (Button, TextInput, Select, StatusBadge, StatusDot, Icon), build AppShell and AuthShell layouts. Output: design-tokens.json, component-hierarchy.md."
```

### Session 2: Login + AuthShell
```bash
opencode run --agent frontend-react-dev "Implement Phase 2 Session 2: Login page (/login) with AuthShell per ui-analysis.json screen 'Login (staff)'. Components: AuthCard, TextInput (auth variant), Button primary full-width, BackLink, InfoIcon. Features: form validation, Enter submit, loading/error states, role-based redirect. Accessibility: real labels, autocomplete, aria-describedby."
```

### Session 3: Waybills + AppShell
```bash
opencode run --agent frontend-react-dev "Implement Phase 2 Session 3: Waybills page (/waybills) with AppShell per ui-analysis.json screen 'Waybills (STAFF)'. Components: Sidebar (staff nav), TopBar (title, bell, avatar, role menu), SearchPanel (waybill input, status select, Search/+New Waybills buttons), VesselScheduleTable. Build generic DataTable for search results (not designed). Responsive: sidebar drawer, stacked search, table→cards."
```

### Session 4: Dashboard (EXEC)
```bash
opencode run --agent frontend-react-dev "Implement Phase 2 Session 4a: Executive Dashboard (/dashboard) per ui-analysis.json screen 'Dashboard (EXEC)'. Components: Sidebar (exec: single Dashboard item), StatCard 2x2 (total_shipments=248, on_time_pct=92.7, total_cargo_tons=12800, delayed_pct=7.3), DonutChart (Chart.js/Recharts) with center total + legend, ReportHistoryTable, Button small (Download). Responsive: stat tiles 1-col, donut/history stack."
```

### Session 5: Deck Allocation (STAFF)
```bash
opencode run --agent frontend-react-dev "Implement Phase 2 Session 4b: Deck Allocation (/deck-allocation) per ui-analysis.json screen 'Deck Allocation / Cargo Space (STAFF)'. Components: VesselSelect, SummaryStat (Total/Remaining Deck Space), DeckOverviewHero (ship photo + status chip), AllocatedCargoTable. Features: vessel change refetches, pagination, progress bar for used/remaining. Note data inconsistency in mock (19,000 allocated vs 32,000 implied) — use design mock numbers for visual fidelity."
```

### Session 6: Track Shipment Public
```bash
opencode run --agent frontend-react-dev "Implement Phase 2 Session 5: Track Shipment public page (/) and Schedule (/schedule) per ui-analysis.json screen 'Track Shipment (public)'. Components: PublicNav, TrackForm (waybill input + Track button), VesselScheduleTable (public). Features: Track result states (found/not found/loading → timeline card), Schedule tab navigation. Reuses AuthShell."
```

### Session 7: Polish & Accessibility
```bash
opencode run --agent frontend-react-dev "Implement Phase 3: Polish & Accessibility. Fix contrast (lime badge, gold link, placeholder), add all missing states (hover/focus/loading/error/empty), keyboard navigation audit, ARIA labels on icon-only elements, DD/MM/YYYY date format, typo fixes. Run Playwright screenshots at 3 breakpoints per screen. Generate comparison-report.md."
```

### Session 8: Review & Validation
```bash
opencode run --agent uiux-reviewer "Review all implemented screens against ui-analysis.json and design-taste-frontend checklist. Validate: visual fidelity, WCAG AA, 3G performance, hero entrance, dealt moments, equal edges, real photos (placeholder), micro-interactions."
```

```bash
opencode run --agent qa-testing-engineer "Run 3G throttling tests, Lighthouse audit, axe-core accessibility scan on all 5 routes. Report bundle size, Core Web Vitals, violations."
```

---

## Tracking

- [ ] Phase 1: Design System Foundation
- [ ] Phase 2 Session 2: Login + AuthShell
- [ ] Phase 2 Session 3: Waybills + AppShell
- [ ] Phase 2 Session 4a: Dashboard (EXEC)
- [ ] Phase 2 Session 4b: Deck Allocation (STAFF)
- [ ] Phase 2 Session 5: Track Shipment Public
- [ ] Phase 3: Polish & Accessibility
- [ ] Phase 4: Review & Validation

---

## Notes for Orchestrator
- Each session is independent but builds on previous outputs
- `design-tokens.json` and `component-hierarchy.md` are contracts between sessions
- `frontend-react-dev` owns all `client/src/` implementation
- `uiux-reviewer` and `qa-testing-engineer` validate, don't implement
- Backend API already exists (`server/routes/`, `server/services/`) — frontend consumes `/api/auth`, `/api/operations`, `/api/executive`
- Mock data should match `ui-analysis.json` exactly for visual fidelity