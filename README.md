# Trans-Track: Operational Fleet & Cargo Visibility System

> A logistics command center for Trans-Asia Shipping Lines (Iligan City Branch), bridging ground-truth maritime operations and executive digital oversight.

**Trans-Track** digitizes daily port ground operations — waybill booking, vessel deck allocation, gate check-in, driver GPS/SMS telemetry, and live capacity dashboards — replacing the manual clipboards and Viber threads that previously made the branch dependent on one person (the Officer-in-Charge).

| Operational problem | Trans-Track solution |
| :--- | :--- |
| Rolling cargo blind spots (no visibility on incoming trucks) | Driver SMS/GPS telemetry with real-time location pings |
| Vessel loading delays (unknown truck arrival times) | Deck pre-allocation + auto-deducting voyage capacity engine |
| Manual Viber executive reporting | Read-only executive dashboard with live capacity metrics |
| Client interruptions to the OIC | Public self-service portal: schedule lookup + waybill tracking |

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 3, Radix UI, React Router 7 |
| Backend | Node.js + Express 5 (REST API, CommonJS) |
| Database | PostgreSQL — hosted on **Supabase** (`db.uuvkomzzcwfyrtqqkhwh.supabase.co`), local PostgreSQL 16 as fallback |
| Auth | JWT (access + refresh), bcrypt password hashing |
| Security | helmet, express-rate-limit, express-validator, role-based access control (RBAC) |
| Testing | Playwright end-to-end suite (`client/e2e/`) |

## Roles & Access

Three staff roles can log in. **Clients do not log in** — they use the public tracking pages only.

| Role | Username (demo) | Can do |
| :--- | :--- | :--- |
| `GATE_CLERK` | `clerk` / `clerk123` | Waybill tracking, truck check-in at the gate, status updates |
| `EXECUTIVE` | `exec` / `exec123` | Read-only dashboards: revenue, capacity utilization |
| `ADMIN` | `admin` / `admin123` | Everything: voyage loading/deck allocation, user management, master data, audit |
| *(client)* | — no login — | Public schedule lookup + waybill tracking by waybill number / GPS token |

---

## Quick Start

### 1. Database

**Option A — Supabase (current setup):** create a project at [supabase.com](https://supabase.com), then restore the schema+data dump (see `docs/database/SCHEMA.md`) or run the SQL files below in the Supabase SQL editor, in order:

1. `schema/init.sql` — tables, enums, indexes, base seed users
2. `schema/audit_triggers.sql` — audit logging triggers
3. `schema/rbac_views.sql` — role-scoped views (`v_voyage_operations`, executive views)
4. `schema/seed_baseline.sql` — idempotent demo data (ports, vessels, clients, voyages, 1 waybill)

**Option B — local PostgreSQL:** create a database, then run the same four files against it.

### 2. Backend

```bash
npm install                 # from repo root
cp server/.env.example server/.env   # then fill in values (see below)
npm run dev                 # nodemon, or: npm start
```

Backend runs on **http://localhost:5000**.

### 3. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

### Environment variables (`server/.env`)

| Variable | Description |
| :--- | :--- |
| `PORT` | Backend port (default `5000`) |
| `DB_USER` / `DB_PASSWORD` | Database credentials (`postgres` / set at Supabase project creation) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `db.xxxx.supabase.co`, `5432`, `postgres` (or `localhost`/`5432`/`Trans_Track` for local) |
| `DB_SSL` | `true` for Supabase (TLS required), omit/false for local |
| `JWT_SECRET` | Random 64-hex string — generate with `openssl rand -hex 32` |

⚠️ `.env` files are **never committed** — `.gitignore` blocks all `.env*` including templates.

---

## Project Structure

```
├── server/                     Express backend
│   ├── server.js               Entry point; middleware chain + route mounting
│   ├── db.js                   pg Pool (SSL-aware for Supabase)
│   ├── middleware/             authMiddleware.js — JWT verify + authorizeRoles guard
│   ├── routes/                 One file per API area (thin: validate → authorize → delegate)
│   ├── services/               Business logic (orchestration, transactions)
│   │   └── autoDeductionEngine.js   ACID booking/cancellation with atomic capacity math
│   ├── models/                 OOP entity classes matching the class diagram
│   │   ├── baseEntity.js       Abstract base
│   │   └── Waybill.js, Voyage.js, Vessel.js, Client.js, User.js, Port.js,
│   │       TruckArrival.js, DriverLocationPing.js, WaybillStatusLog.js
│   └── seeds/test-data.sql     QA test users
├── client/                     React frontend (atomic design)
│   ├── src/components/ui/      Base primitives (Button, TextInput, Dialog, Table…)
│   ├── src/components/molecules/  Composite cards/forms (track-form, search-panel…)
│   ├── src/components/organisms/  Domain sections (sidebar, data-table, auth-card…)
│   ├── src/pages/              Route views (dashboard, waybills, deck-allocation,
│   │                           schedule, track, login)
│   ├── src/contexts/           auth-context (login, token, role mapping)
│   ├── src/layouts/            app-shell / auth-shell
│   └── e2e/                    Playwright specs per feature + infra
├── schema/                     SQL: init, audit triggers, RBAC views, demo seed
├── docs/                       Project documentation (see docs/README.md)
└── Docs/                       Original design assets (mockups, diagrams, PDFs)
```

**Layering rule:** `routes/` never touch SQL directly — they call `services/`, which use `models/` (or the pool) for data access.

---

## API Overview

Base URL: `http://localhost:5000/api` — full request/response contracts in [`docs/api/contracts.md`](docs/api/contracts.md).

| Mount | Routes file | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth` | authRoutes.js | public | Login, refresh, me, staff registration |
| `/api/public` | publicRoutes.js | no auth | Schedule lookup, waybill tracking, GPS telemetry ingest |
| `/api/gate` | gateRoutes.js | GATE_CLERK, ADMIN | Truck check-in, status updates, GPS token generation |
| `/api/waybills` | waybillRoutes.js | GATE_CLERK, ADMIN | Waybill booking (auto-deducts capacity), cancellation (restores) |
| `/api/operations` | operationsRoutes.js | ADMIN | Voyage loading, deck allocation, driver telemetry monitor |
| `/api/master` | masterRoutes.js | mixed (see file) | Master data encoding: clients, vessels, ports, voyages |
| `/api/executive` | executiveRoutes.js | EXECUTIVE | Read-only capacity/revenue dashboards |
| `/api/admin` | adminRoutes.js | ADMIN | User management, audit logs |

## Key Behaviors

- **Auto-deduction engine** (`server/services/autoDeductionEngine.js`): booking a waybill atomically deducts deck sqft / cabin rooms inside a transaction; overbooking returns **409**; cancellation restores capacity. New voyages always start at full vessel capacity.
- **Telemetry loop**: gate check-in generates a one-time GPS token → public `GET /api/public/track/:token` for the driver → `POST /api/public/track/:token/pings` ingests SMS/GPS location replies (parsed by `DriverLocationPing.processSmsReply`).
- **No hard deletes on master data**: vessels/clients are soft-deactivated to protect waybill history.
- **Audit trail**: `audit_triggers.sql` writes every INSERT/UPDATE/DELETE on sensitive tables to an audit log.
- **Demo data**: seeded rows are marked "DEMO" and meant to be replaced via the master-data API when real data arrives.

## Testing

```bash
cd client
npm run test:e2e              # Playwright suite (needs backend on :5000 + frontend dev server)
npm run lint                  # oxlint
npm run build                 # tsc + vite build check
```

The e2e specs (`client/e2e/`) cover login/RBAC, waybill booking + auto-deduction, deck allocation, tracking, a11y, and slow-network throttling.

## Git Conventions

- Branch names: `feature/<topic>` / `docs--<topic>`
- Commits follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` — scope suffix for frontend-only work (e.g. `feat(client): …`)
- Frontend and backend are committed separately; `client/` UI work may lag backend work

## Where to Look

| I want to… | Look at… |
| :--- | :--- |
| Understand the API contract | `docs/api/contracts.md` |
| Understand the database | `docs/database/SCHEMA.md` + `schema/init.sql` |
| Understand security/RBAC | `docs/architecture/SECURITY_ARCHITECTURE.md` |
| Add an endpoint | `server/routes/` (+ `services/` for logic) |
| Add a UI page | `client/src/pages/` + route in `client/src/App.tsx` |
| Change DB structure | `schema/init.sql` (schema changes are applied manually — see docs/README.md) |
| Original business design | `Docs/` (mockups, ERD, use case diagrams, PDF) |
