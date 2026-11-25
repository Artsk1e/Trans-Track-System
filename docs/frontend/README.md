# Trans-Track System — Frontend Documentation

**Last Updated:** 2026-11-24
**Phase Documented:** Phase 1 — Design System Foundation
**Status:** ✅ Complete

---

## Overview

Phase 1 of the Trans-Track System UI reconstruction delivered the complete design system foundation and page-level UI for the shipping logistics platform. This phase focused on:

- A **token-driven Tailwind + CSS custom property design system** extracted from UI screenshot analysis (`docs/ui-reconstruction/design-tokens.json`)
- An **Atomic Design component library**: 8 atoms, 7 molecules, 7 organisms
- **2 layout templates** (`AppShell`, `AuthShell`)
- **6 fully implemented pages** with mock data
- **Client-side routing** via React Router

All data is currently mocked (`setTimeout` simulations, hardcoded arrays). Backend integration is planned for Phase 2; accessibility and polish fixes are planned for Phase 3.

---

## Quick Facts

| Aspect | Value |
|--------|-------|
| Framework | React 18 + TypeScript (Vite) |
| Styling | Tailwind CSS + CSS custom properties |
| Routing | React Router (`Routes`/`Route`) |
| Icons | lucide-react (via `Icon` wrapper) |
| Animation | tailwindcss-animate |
| Design Source | `docs/ui-reconstruction/design-tokens.json` |
| Client Root | `client/` |

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [architecture.md](./architecture.md) | Atomic Design methodology, folder structure, layering decisions |
| [design-system.md](./design-system.md) | Tailwind config, CSS variables, typography, tokens |
| [components.md](./components.md) | Full component inventory with props and composition |
| [pages.md](./pages.md) | Page-by-page documentation with routes and data flow |
| [known-issues.md](./known-issues.md) | Contrast failures, typos, and items deferred to Phase 3 |

---

## Route Map

| Route | Page | Shell | Audience |
|-------|------|-------|----------|
| `/` | TrackPage | AuthShell | Public |
| `/schedule` | SchedulePage | AuthShell | Public |
| `/login` | LoginPage | AuthShell | Public |
| `/waybills` | WaybillsPage | AppShell (STAFF) | Staff |
| `/deck-allocation` | DeckAllocationPage | AppShell (STAFF) | Staff |
| `/dashboard` | DashboardPage | AppShell (EXEC) | Executive |
| `*` | → redirect to `/` | — | — |

---

## Getting Started

```bash
cd client
npm install
npm run dev
```

Path alias `@/` resolves to `client/src/`.

---

## Related Documentation

- [Component Hierarchy Analysis](../ui-reconstruction/component-hierarchy.md) — source analysis driving Phase 1
- [Design Tokens (JSON)](../ui-reconstruction/design-tokens.json) — canonical token source of truth
