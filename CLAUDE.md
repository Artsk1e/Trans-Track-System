# Project Instructions

## What this is
Trans-Track — a PERN-stack logistics system for Trans-Asia Shipping Lines (Iligan branch): Express 5 backend (`server/`), React 19 + Vite frontend (`client/`), PostgreSQL hosted on Supabase.

## Critical rules
- **Never run DDL against a live database** — schema changes are applied manually by editing `schema/*.sql`. INSERT/UPDATE data changes are fine.
- **Never commit `.env` files** — `.gitignore` blocks all `.env*`. If `git add` would sweep one in, stop.
- **No hard DELETE on master data** (vessels, clients, ports) — soft-deactivate to protect waybill history.
- Roles are exactly 3: `GATE_CLERK`, `EXECUTIVE`, `ADMIN`. Clients have no login (public tracking only). Do not reintroduce other roles.

## Architecture
- Layering: `routes/` (validate + authorizeRoles) → `services/` (business logic, transactions) → `models/` (entity classes per the class diagram) → pool. Routes never run raw SQL.
- API mounts: `/api/auth`, `/api/public`, `/api/gate`, `/api/waybills`, `/api/operations` (was `/api/oic`), `/api/master`, `/api/executive`, `/api/admin`.
- Contracts in `docs/api/contracts.md` — update the doc whenever an endpoint changes.

## Code style
- Backend: CommonJS, one file per concern, kebab-case filenames, error handling via `next(err)` central handler.
- Frontend: atomic design (`ui/` → `molecules/` → `organisms/` → `pages/`), kebab-case files, React Context for auth state. See `client/CLAUDE.md` and `docs/architecture/engineering-standards.md`.

## Testing & commands
- Backend: `npm run dev` (root, port 5000) — no automated backend test suite; verify with curl against the contracts doc.
- Frontend: `cd client && npm run dev` (:5173), `npm run build` (tsc + vite), `npm run lint` (oxlint), `npm run test:e2e` (Playwright, needs both servers).

## Git
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`); scope `client` for frontend-only changes. Frontend and backend are committed separately.
- Database: local PostgreSQL 16 (`Trans_Track`) mirrors the Supabase project; keep both in sync when applying manual changes.
