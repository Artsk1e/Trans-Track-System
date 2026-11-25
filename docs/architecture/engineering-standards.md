# Engineering Standards

## Code Readability & Maintainability

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Files (React) | PascalCase | `GatePanel.jsx`, `WaybillCard.jsx` |
| Files (Backend) | camelCase | `authRoutes.js`, `autoDeductionEngine.js` |
| Components | PascalCase | `function WaybillTable()` |
| Functions | camelCase | `function calculateRemainingSpace()` |
| Constants | UPPER_SNAKE_CASE | `MAX_DECK_SQFT = 5000` |
| Database Tables | snake_case | `waybills`, `truck_arrivals` |
| Database Columns | snake_case | `cargo_sqft`, `booked_rooms` |
| Environment Variables | UPPER_SNAKE_CASE | `JWT_SECRET`, `DB_POOL_SIZE` |

### File Organization
```
server/
  routes/        → API route handlers (thin)
  controllers/   → Business logic (if separated from routes)
  services/      → Reusable logic (auto-deduction, SMS, etc.)
  middleware/    → Auth, validation, error handling
  models/        → Data access / query builders
  db.js          → PG pool configuration

client/src/
  components/    → Reusable UI (Button, Card, Table, FormField)
  pages/         → Route-level views (PublicTracker, GatePanel, OICDashboard, Executive)
  hooks/         → Custom React hooks
  services/      → API clients (axios/fetch wrappers)
  utils/         → Helpers (formatters, validators)
  styles/        → Global CSS, Tailwind imports
```

### Type Safety
- **Backend**: JSDoc type annotations for all functions; consider migrating to TypeScript if project grows
- **Frontend**: PropTypes for components; TypeScript recommended for new components
- **Database**: Schema is source of truth (`schema/init.sql`); no ORM drift allowed

## Component Architecture

### React Patterns
- **Function components only** — no class components
- **Hooks discipline**: `useState`, `useEffect`, `useCallback`, `useMemo` — follow Rules of Hooks
- **Server/Client boundary**: All data fetching via `client/src/services/api.js`; no direct `fetch` in components
- **State management**: Local state by default; Context only for auth/user; no Redux/Zustand unless justified
- **Error boundaries**: Wrap each page in `<ErrorBoundary>`; graceful fallback UI

### Performance (3G Pier Networks)
- **Bundle size**: Target < 100KB gzipped initial load
- **Code splitting**: `React.lazy()` + `Suspense` for each page
- **Images**: WebP, responsive `srcSet`, lazy loading; no hero images on gate panel
- **Fonts**: System font stack; no external font requests
- **CSS**: Tailwind purge enabled; no unused utilities in production

## Separation of Concerns

| Layer | Responsibility | Must Not |
|-------|----------------|----------|
| Routes | HTTP handling, validation, response formatting | Business logic, SQL queries |
| Services | Business logic, transactions, external integrations | HTTP concerns, rendering |
| Models | Query builders, data access patterns | Business rules, HTTP |
| Components | UI rendering, user interaction | Data fetching, business logic |
| Hooks | Reusable stateful logic | Direct DOM manipulation |

## Database Integrity

- **All writes via parameterized queries** — `pg` pool, never string concatenation
- **Foreign keys enforced** — `ON DELETE RESTRICT` for core entities, `CASCADE` for logs
- **Enums for fixed domains** — `user_role_enum`, `waybill_status_enum`, etc.
- **Indexes on all FK columns** + frequent query paths (`voyage_number`, `waybill_id`, `truck_arrival_id`)
- **Triggers for audit** — `audit_triggers.sql` on `waybills`, `voyages`, `users`
- **RBAC views** — application queries views, not base tables (except admin)

## API Design

### REST Conventions
- **Resources**: Plural nouns (`/api/waybills`, `/api/voyages`)
- **Actions via HTTP verbs**: GET, POST, PATCH, DELETE
- **Nested only for true ownership**: `/api/voyages/:id/waybills`
- **Filtering**: `?status=LOADED&voyage=V-101`
- **Pagination**: `?page=1&limit=20` → `{ data: [], meta: { page, limit, total } }`

### Response Format
```json
// Success
{ "success": true, "data": {...}, "message": "Waybill created" }

// Error
{ "success": false, "error": "VALIDATION_ERROR", "message": "Invalid cargo_sqft", "details": [...] }
```

### Status Codes
| Code | Use Case |
|------|----------|
| 200 | GET, PATCH success |
| 201 | POST success (resource created) |
| 204 | DELETE success |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Unauthorized (RBAC) |
| 404 | Not found |
| 409 | Conflict (duplicate gate check-in) |
| 500 | Server error (logged, not exposed) |

## Error Handling

### Backend
- **Centralized error middleware** (`server/middleware/errorHandler.js`)
- **Custom error classes**: `ValidationError`, `AuthError`, `NotFoundError`, `ConflictError`
- **Async wrapper**: `asyncHandler(fn)` catches rejected promises
- **Logging**: Structured JSON logs (timestamp, level, requestId, error)

### Frontend
- **API service** normalizes errors → throws typed error objects
- **React Query / SWR** (if adopted) for cache + error retry
- **Toast/notification** for user-facing errors; console.error for debugging

## Security

- **JWT**: Short-lived access tokens (15min), refresh token rotation
- **bcrypt**: Cost factor 12 for password hashing
- **Rate limiting**: `/api/auth/*` stricter (5 req/min), general API (100 req/min)
- **Helmet**: CSP, HSTS, X-Frame-Options configured
- **CORS**: Explicit origin allowlist, credentials true
- **Input validation**: `express-validator` on all routes
- **SQL injection**: Parameterized queries only; `pg` driver handles escaping
- **Secrets**: `.env` never committed; `dotenv` loads at startup

## Testing

### Backend
- **Unit**: Pure functions in `services/` (Jest)
- **Integration**: Supertest against Express app (test DB)
- **Contract**: Verify response shapes match `docs/api/contracts.md`

### Frontend
- **Component**: React Testing Library + Vitest
- **Accessibility**: `axe-core` in component tests
- **E2E**: Playwright for critical flows (gate check-in, waybill lookup)

### Coverage Targets
- Services: 80%+
- Routes: 70%+
- Components: 60%+
- Critical paths (auto-deduction, gate check-in): 90%+

## Documentation

- **Code comments**: Only for *why*, not *what*
- **README**: Run commands, env vars, architecture overview
- **API**: `docs/api/contracts.md` — request/response examples
- **Database**: `schema/README.md` — ERD, table purposes, indexes
- **ADRs**: `docs/architecture/adr/` — numbered, dated decisions
- **Features**: `docs/features/<feature>.md` — generated by `feature-doc-reviewer`

## Git Practices

### Branching
- `main` — production-ready
- `feature/<slug>` — new work
- `fix/<slug>` — bug fixes
- `docs/<slug>` — documentation only

### Commits
- **Conventional Commits**: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`
- Scope: `api`, `db`, `ui`, `auth`, `docker`, `ci`

### PR Workflow
1. Feature branch from `main`
2. CI passes (lint, typecheck, tests)
3. At least one reviewer approval (security for auth, UI for frontend)
4. Squash merge to `main`
5. Delete feature branch