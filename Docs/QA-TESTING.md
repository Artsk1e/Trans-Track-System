# Trans-Track System - QA Testing Guide

## Overview

This document provides comprehensive QA testing instructions for the Trans-Track System shipping portal.

## Prerequisites

1. **PostgreSQL Database** - Running with schema created
2. **Server** - Node.js server running at `http://localhost:5000`
3. **Frontend** - Vite dev server running at `http://localhost:5173`
4. **Environment** - `.env` file with JWT_SECRET configured

## Quick Start

```bash
# 1. Install dependencies
cd client && npm install

# 2. Set up environment (server side)
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
psql -d Trans_Track -f server/seeds/test-data.sql

# 3. Start servers
npm run dev & cd client && npm run dev &

# 4. Run all QA tests
cd client && npx ts-node e2e/run-all-tests.ts
```

## Test Credentials

| Username | Password | Role | Redirect After Login |
|----------|----------|------|---------------------|
| exec_user | ExecPass123! | EXECUTIVE | /dashboard |
| clerk_user | ClerkPass123! | GATE_CLERK | /waybills |

## Test Routes

| Route | Description | Required Role |
|-------|-------------|---------------|
| `/login` | Login page | Public |
| `/` | Track shipment (public) | Public |
| `/schedule` | Vessel schedules | Public |
| `/dashboard` | Executive metrics | EXECUTIVE, ADMIN |
| `/waybills` | Waybill search/creation | GATE_CLERK, ADMIN |
| `/deck-allocation` | Deck overview | GATE_CLERK, ADMIN |

## Test Categories

### 1. 3G Throttling Test (`e2e/throttling.spec.ts`)
- Simulates Chrome DevTools: 1.6 Mbps down, 750 Kbps up, 300ms RTT
- Verifies page load <3s, TTI <5s
- Checks bundle size optimization

### 2. Accessibility Tests (`e2e/a11y.spec.ts`)
- axe-core WCAG 2.2 AA compliance
- Zero violations for contrast, ARIA, keyboard, focus
- All tests across all routes

### 3. Visual Regression Tests (`e2e/*.spec.ts`)
- Screenshots saved to: `docs/ui-reconstruction/screenshots/<route>/`
- Breakpoints: 390x844 (mobile), 768x1024 (tablet), 1440x900 (desktop)

### 4. API Integration Tests (`e2e/api-integration.spec.ts`)
- POST `/api/auth/login` → role redirect verification
- GET `/api/operations/waybills` (GATE_CLERK)
- GET `/api/executive/metrics` (EXECUTIVE)

### 5. Single-Entry Gate Tests (`e2e/single-entry-gate.spec.ts`)
- Duplicate waybill check-in returns 409 Conflict
- Verifies `waybill_id` UNIQUE constraint

### 6. Auto-Deduction Engine Tests (`e2e/auto-deduction.spec.ts`)
- Voyage capacity updates on waybill create
- Capacity deduction is atomic
- Cancellation restores capacity

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/login.spec.ts

# Run with headed browser (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Generate storage state for authenticated tests
npm run test:setup
```

## Known Issues

1. **Dashboard uses mock data** - Not consuming API endpoints (needs implementation)
2. **Waybills page uses mock data** - Not consuming API endpoints (needs implementation)
3. **Deck Allocation uses mock data** - Not consuming API endpoints (needs implementation)

## Test Data

Database seed file: `server/seeds/test-data.sql`

## Screenshot Baselines

```
docs/ui-reconstruction/screenshots/
├── login/
│   ├── desktop.png
│   ├── tablet.png
│   └── mobile.png
├── waybills/
│   ├── desktop.png
│   ├── tablet.png
│   └── mobile.png
├── dashboard/
│   ├── desktop.png
│   ├── tablet.png
│   └── mobile.png
├── deck-allocation/
│   ├── desktop.png
│   ├── tablet.png
│   └── mobile.png
├── schedule/
│   ├── desktop.png
│   ├── tablet.png
│   └── mobile.png
└── track/
    ├── desktop.png
    ├── tablet.png
    └── mobile.png
```

## CI/CD Integration

Recommended GitHub Actions workflow:

```yaml
name: QA Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: Trans_Track
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install
      - run: npm test
```