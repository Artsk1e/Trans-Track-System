# Project Instructions

## Tech Stack
- **Language**: TypeScript 7.x
- **Framework**: React 19.3 with Vite 8.x
- **Styling**: Tailwind CSS 3.4 with Radix UI components (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.)
- **Routing**: React Router DOM 7.x
- **Icons**: Lucide React & Custom SVG/PNG assets

## Code Style
- **File naming**: kebab-case for components and files (e.g., `vessel-schedule-table.tsx`, `auth-context.tsx`)
- **Component structure**: Atomic design pattern organization (`src/components/ui/`, `src/components/molecules/`, `src/components/organisms/`), pages in `src/pages/`, layouts in `src/layouts/`
- **State management**: React Context (`src/contexts/auth-context.tsx`) and local state

## Testing & Linting
- **Lint**: Oxlint (`npm run lint`)
- **Build**: TypeScript compiler check + Vite build (`npm run build`)

## Build & Run
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Project Structure
- `src/components/ui/` — Base primitive UI components
- `src/components/molecules/` — Composite components and cards
- `src/components/organisms/` — Complex domain sections, tables, and headers
- `src/pages/` — Top-level views (Dashboard, Schedule, Track, Waybills, Deck Allocation, Login)
- `src/layouts/` — Shell layouts (`app-shell.tsx`, `auth-shell.tsx`)
- `src/contexts/` — Global application contexts (Auth)
