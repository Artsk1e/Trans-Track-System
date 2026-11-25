# Trans-Track Documentation Index

Start here. Everything below lives in this repo; `../Docs/` (capital D) holds the original *design assets* (Figma mockup exports, ERD diagrams, the business-process PDF) — historical references, not living docs.

## Authoritative reference (keep up to date when you change code)

| Doc | Covers |
| :--- | :--- |
| [`../README.md`](../README.md) | **Start here** — system overview, setup, roles, API map, conventions |
| [`api/contracts.md`](api/contracts.md) | Every REST endpoint: method, path, access role, request/response JSON |
| [`database/SCHEMA.md`](database/SCHEMA.md) | Table-by-table schema explanation + why the system exists |
| [`architecture/SECURITY_ARCHITECTURE.md`](architecture/SECURITY_ARCHITECTURE.md) | RBAC model, roles, JWT flow, security layers, role-scoped views |
| [`architecture/engineering-standards.md`](architecture/engineering-standards.md) | Coding standards for frontend contributions (atomic design, naming) |
| [`schema/` SQL files](../schema/) | The database source of truth: `init.sql` (DDL), `audit_triggers.sql`, `rbac_views.sql`, `seed_baseline.sql` (demo data) |

## Working notes (AI-assisted development sessions)

These record *how* parts of the system were built and audited. Useful for context; don't treat as current spec.

| Doc | Covers |
| :--- | :--- |
| [`frontend/README.md`](frontend/README.md) + `frontend/*.md` | Frontend architecture, pages, components, design system, known issues |
| [`ui-reconstruction/`](ui-reconstruction/) | Analysis artifacts from rebuilding the UI from mockups (design tokens, component hierarchy) |
| [`workflows/`](workflows/) | Agent collaboration workflows used during the rebuild |
| [`ai-environment-guide.md`](ai-environment-guide.md) | How AI agents are configured in this repo |
| [`IMPLEMENTATION_REPORT_NOV_09.md`](IMPLEMENTATION_REPORT_NOV_09.md) | Implementation report for the Nov 9 backend security architecture |
| [`superpowers/`](superpowers/) | Session logs and implementation plans |
| [`../Docs/QA-TESTING.md`](../Docs/QA-TESTING.md), [`../Docs/TEST-RUNNER.md`](../Docs/TEST-RUNNER.md), [`../Docs/test-credentials.md`](../Docs/test-credentials.md) | QA test credentials and route matrices |

## Database changes policy

Schema changes are applied **manually** (psql / Supabase SQL editor) by editing the `schema/*.sql` files — there is no migration runner. When changing the schema:

1. Update the relevant `schema/*.sql` file.
2. Update `docs/database/SCHEMA.md` to match.
3. Note that live environments (local Postgres + Supabase) must be altered by hand — the SQL files only guarantee fresh installs.

## Current environment

| Environment | Where | Notes |
| :--- | :--- | :--- |
| **Production-ish** | Supabase project `db.uuvkomzzcwfyrtqqkhwh.supabase.co` | PostgreSQL 17; backend connects with SSL |
| **Fallback / local dev** | localhost PostgreSQL 16, database `Trans_Track` | Full copy of the same data |
