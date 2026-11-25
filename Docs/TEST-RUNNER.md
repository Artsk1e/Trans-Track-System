# Trans-Track System - QA Test Runner

## Quick Start

```bash
# 1. Install dependencies
cd client && npm install

# 2. Set up environment (server side)
echo "JWT_SECRET=$(openssl rand -hex 32)" > server/.env

# 3. Seed the database
psql -d Trans_Track -f server/seeds/test-data.sql

# 4. Start servers
npm run dev & cd client && npm run dev &

# 5. Generate storage state for authenticated tests
npx ts-node e2e/setup-storage.ts

# 6. Run all QA tests
npm run test:e2e
```

## Test Results Summary

### Tests Implemented

| Test Category | Files | Routes Covered |
|--------------|-------|----------------|
| 3G Throttling | `throttling.spec.ts` | /login, /, /schedule |
| Accessibility | `a11y.spec.ts` | All 6 routes |
| Visual Regression | `login.spec.ts`, `dashboard.spec.ts`, `waybills.spec.ts`, `deck-allocation.spec.ts`, `schedule.spec.ts`, `track.spec.ts` | All 6 routes |
| API Integration | `api-integration.spec.ts` | /login → role redirect, /operations/waybills, /executive/metrics |
| Single-Entry Gate | `single-entry-gate.spec.ts` | POST /api/gate/check-in |
| Auto-Deduction | `auto-deduction.spec.ts` | POST /api/waybills |

### Screenshots Location

```
docs/ui-reconstruction/screenshots/
├── login/
├── waybills/
├── dashboard/
├── deck-allocation/
├── schedule/
└── track/
```

### Breakpoints

- Mobile: 390x844
- Tablet: 768x1024  
- Desktop: 1440x900

## Test Credentials

| Username | Password | Role | Redirect |
|----------|----------|------|----------|
| exec_user | ExecPass123! | EXECUTIVE | /dashboard |
| clerk_user | ClerkPass123! | GATE_CLERK | /waybills |

## Bundle Size

- CSS: 7.25 KB (gzipped)
- JS: 143.96 KB (gzipped)

---

## Run Commands

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/login.spec.ts

# Run with headed browser (see browser window)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Generate storage state for authenticated tests
npm run test:setup

# View HTML report
npm run test:report
```