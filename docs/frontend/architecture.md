# Architecture

**Last Updated:** 2026-11-24
**Phase:** 1 — Design System Foundation

---

## Methodology: Atomic Design

Components are organized in strict layers. Dependencies flow **downward only** — an organism may compose molecules and atoms; a molecule may compose only atoms; an atom composes nothing custom.

```
Pages (6)
  └── Layouts (2)          AppShell · AuthShell
        └── Organisms (7)  Sidebar · TopBar · AuthCard · tables · DonutChart · DeckOverviewHero
              └── Molecules (7)  NavItem · SearchPanel · StatCard · VesselSelect · CardHeader · PublicNav · TrackForm
                    └── Atoms (8)  Button · TextInput · Select · StatusBadge · StatusDot · Icon · Avatar · NotificationBell
```

### Layer Rules

| Layer | Location | May import from | Exports via |
|-------|----------|-----------------|-------------|
| Atom | `src/components/ui/` | `lib/utils`, lucide-react | `components/ui/index.ts` |
| Molecule | `src/components/molecules/` | `ui/` | `components/molecules/index.ts` |
| Organism | `src/components/organisms/` | `ui/`, `molecules/` | `components/organisms/index.ts` |
| Layout | `src/layouts/` | `organisms/`, `ui/` | `layouts/index.ts` |
| Page | `src/pages/` | `layouts/`, all component layers | `pages/index.ts` |

Each layer has a barrel `index.ts`; consumers import from the barrel (e.g. `@/components/ui`), never from individual files.

---

## Folder Structure

```
client/
├── tailwind.config.ts       # Token-driven theme extension
├── vite.config.ts           # React plugin + @ alias
├── tsconfig.json / .app.json / .node.json
├── postcss.config.cjs
└── src/
    ├── main.tsx             # Entry, mounts <App/> in BrowserRouter
    ├── App.tsx              # Route table
    ├── index.css            # Design tokens (CSS vars) + component/utility layers
    ├── styles/globals.css   # Additional global styles
    ├── lib/utils.ts         # cn() class merge helper
    ├── assets/              # hero.png, react.svg, vite.svg
    ├── components/
    │   ├── ui/              # 8 atoms + index.ts
    │   ├── molecules/       # 7 molecules + index.ts
    │   └── organisms/       # 7 organisms + index.ts
    ├── layouts/             # app-shell, auth-shell + index.ts
    └── pages/               # 6 pages + index.ts
```

---

## Key Architectural Decisions

### 1. Tokens as single source of truth
Every color, radius, and font used by components originates in `design-tokens.json`, mirrored into two places:
- `tailwind.config.ts` → Tailwind theme (utility classes like `bg-navy`, `text-brandYellow`)
- `src/index.css` → CSS custom properties (e.g. `--color-navy: #14304F`)

Components reference tokens, never raw hex values. See [design-system.md](./design-system.md).

### 2. Props-down / callbacks-up, no state library
All pages are self-contained: local `useState`, mock async via `setTimeout`, and `console.log` handlers where backend calls will go. No Redux/Zustand/React Query yet — deferred until real API contracts exist (Phase 2).

### 3. Two shells, role-driven
- **`AppShell`** — authenticated app: fixed 256px `Sidebar` + fluid content + mobile TopBar. Takes `role: 'STAFF' | 'EXEC'` to switch nav.
- **`AuthShell`** — public marketing/track pages: full-bleed vessel photo, dark gradient overlay, back link, brand logo, centered card slot (max-width 719px).

### 4. Path alias `@/`
`vite.config.ts` maps `@` → `./src`. All intra-src imports use `@/` for refactor safety.

### 5. Data contracts typed up front
Component props use the TypeScript interfaces defined in `docs/ui-reconstruction/component-hierarchy.md` (e.g. `VesselSchedule`, `DonutData`, `AllocatedCargo`, `ReportHistoryItem`). Organisms export these types from their barrels so pages and (later) API layers share one contract.

### 6. Reuse over duplication
- Three tables (`VesselScheduleTable`, `ReportHistoryTable`, `AllocatedCargoTable`) share the `.table-base` / `.table-header` / `.table-cell` CSS component classes.
- `AuthCard` serves both Login and Track pages via `children` slotting.
- `Sidebar` serves STAFF and EXEC via the `role` prop.

---

## Data Flow (current, mock)

```
User event → Page handler (useState + setTimeout mock)
           → props to Organisms/Molecules
           → render
```

Handlers marked with `console.log` (`onNavigate`, `onLogout`, `onDownload`, `onWaybillClick`, pagination) are the integration points for Phase 2.

---

## Related

- [design-system.md](./design-system.md) — token details
- [components.md](./components.md) — full inventory
- [pages.md](./pages.md) — route-level docs
