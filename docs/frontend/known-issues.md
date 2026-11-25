# Known Issues — Phase 3 Backlog

**Last Updated:** 2026-11-24
**Phase:** 1 — Design System Foundation
**Purpose:** Verified issues and deferred work discovered during/before Phase 1, tracked here for the Phase 3 accessibility & polish pass.

---

## 1. Contrast Failures (WCAG AA violations) — ✅ FIXED (2026-11-24, Phase 1 delta)

Source: `docs/ui-reconstruction/design-tokens.json` → `knownIssues.contrastFailures`. Tokens were implemented as designed (fidelity first); all three are now fixed at the token level. Ratios measured with WCAG relative-luminance formula.

| # | Element | Old fg | New fg | Background | Old ratio | New ratio | Fix applied |
|---|---------|--------|--------|------------|-----------|-----------|-------------|
| C1 | Success badge text (`StatusBadge success`, `text-success-text`) | `#0B8A1F` | `#065F13` | `#66FF66` (unchanged) | 3.44:1 | **6.05:1** ✅ | Darkened text token only — keeps the lime design intact |
| C2 | Gold link (`gold.link` on white) | `#C9A800` | `#8A6D00` | `#FFFFFF` | 2.31:1 | **4.92:1** ✅ | Note: the previously suggested `#B89600` only reaches 2.84:1 — insufficient; `#8A6D00` is the darkest hue-preserving value that passes |
| C3 | Placeholder / muted text (`textMuted`) | `#9CA3AF` | `#6B7280` | `#FFFFFF` | 2.54:1 | **4.83:1** ✅ | Standard Tailwind gray-500 |

**Files updated:** `client/tailwind.config.ts` (gold.link, success.text, textMuted), `client/src/index.css` (`--color-gold-link`, `--color-success-text`, `--color-text-muted`). No hardcoded color values existed in components — all consumers use the tokens, so the fix is app-wide.

---

## 2. Typos & Copy (verified in source analysis; several already fixed in Phase 1)

| Screen | Original | Status in Phase 1 |
|--------|----------|-------------------|
| Login | "Login aa staff" | ✅ Fixed → "Login as staff" |
| Dashboard | "Todays Shipment Status" | ✅ Fixed → "Today's Shipment Status" (`&apos;` in JSX) |
| Waybills | "New Waybills" | ✅ Fixed → "New Waybill" |

Remaining copy review for Phase 3: date format consistency (`DD/MM/YYYY HH:mm` strings across all tables — should come from a shared formatter), error-message wording (login validation copy is ad-hoc).

---

## 3. Data Inconsistencies

| Screen | Issue |
|--------|-------|
| Deck Allocation | Mock allocated rows sum **19,000 sq.ft** but Total (50,000) − Remaining (18,000) implies **32,000 used**. Fix the fixtures when wiring real data so the summary math reconciles. |

---

## 4. Incomplete Implementations (deferred from Phase 1)

### 4a. `AppShell` mobile drawer is not wired
`app-shell.tsx` has `sidebarOpen` state, a FAB with `aria-expanded`, and a mobile `TopBar` — but no drawer renders when `sidebarOpen` is true. The button opens nothing.

**Fix:** render the `Sidebar` in an overlay/slide-in panel conditioned on `sidebarOpen`, plus a scrim and Escape/close handling.

### 4b. `TrackPage` only handles the success path
`trackResult` is typed `{ found: boolean; waybill?: string }` but the mock always returns `found: true`. Not-found, invalid waybill format, and API error states have no UI.

### 4c. Auth background asset unverified visually
`AuthShell` defaults to `/images/auth-bg.jpg`, which exists in `client/public/`. Rendering (photo dimensions, gradient split 31/69) has not been visually QA'd in a browser yet — include in the Phase 3 audit pass.

### 4d. Missing interaction states
Analysis flagged that hover/focus/loading/error/empty/disabled states were under-specified. Phase 1 added `loading` to Button/tables and disabled props to inputs/selects, but these are still unverified/unbuilt:
- Table **empty states** (all three tables render nothing when `data.length === 0`)
- Select **error** state
- NotificationBell / Avatar disabled behavior
- Skeleton loaders (tables use boolean `loading` only)

### 4e. Navigation is simulated
`onNavigate` handlers log to console; `Sidebar`/`NavItem` don't use React Router `Link`/`useNavigate`. Login redirects via `window.location.href` (full reload). Phase 2 should switch all navigation to router APIs.

### 4f. No auth guard
Routes are unprotected; `role` is hardcoded per page. Needs a route guard + role context in Phase 2 (documented here so it isn't lost).

---

## 5. Technical Debt / Cleanup

| Item | Detail |
|------|--------|
| Duplicate utilities in `index.css` | `@layer utilities` hand-codes opacity/hover variants (`.bg-page\/50`, `.hover\:bg-white\/10`, `.text-white\/80`, …) that Tailwind can generate from the theme. Prune after verifying native generation matches. |
| `ring:` pseudo-property in `*:focus-visible` | `index.css:88` uses `ring: var(--focus-ring-width)` which is not valid CSS — focus ring relies on the `.focus-ring` utility instead. Remove the invalid lines and ensure every interactive control applies `.focus-ring`. |
| Inline `styles/globals.css` + `App.css` | Two leftover style files from the Vite template coexist with `index.css`; consolidate or delete in Phase 3. |
| Duplicated mock data | Schedule arrays copy-pasted across Waybills/Track/Schedule; extract to `src/fixtures/` in Phase 2. |
| Accessibility contrast target | `contrastTarget: AA` declared in tokens but not yet verified — run axe/Lighthouse audit as Phase 3 gate. |
| `button.tsx` `loading` + `disabled` interplay | Verify disabled-while-loading is enforced consistently across variants. |

---

## Phase 3 Suggested Order of Work

1. Fix the three contrast tokens (C1–C3) at the token level — single change, app-wide effect
2. Wire the mobile drawer (4a) — accessibility blocker
3. Add table empty states + remaining missing states (4d)
4. Migrate navigation to React Router (4e) + add auth guard (4f)
5. Asset/copy/consistency cleanup (4c, §2, §3, §5)
6. Automated audit: axe-core + Lighthouse, target AA
