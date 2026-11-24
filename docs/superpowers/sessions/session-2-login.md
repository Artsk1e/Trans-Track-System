# Session 2: Login Page

**Date:** 2026-11-24
**Agent:** frontend-react-dev
**Status:** Not Started

## Focus
Implement the Login page at `/login` with AuthShell layout.

## Components Used
- `AuthShell` — Split photo + card layout
- `AuthCard` — Login form container
- `TextInput` (auth variant) — Username & Password fields
- `Button` (primary, full-width) — Sign In button
- `BackLink` — "Back >" link
- `InfoIcon` — Help tooltip trigger

## Features Implemented
- [ ] Form validation
- [ ] Enter submit support
- [ ] Loading state (spinner in button)
- [ ] Error banner
- [ ] Role-based redirect: STAFF→/waybills, EXEC→/dashboard
- [ ] Accessibility: real labels, autocomplete, aria-describedby

## Files Created/Modified
| File | Action |
|------|--------|
| `client/src/pages/login-page.tsx` | Create |

## Notes
- Split photo background with 31%/69% overlay
- Card dimensions: 719×533px