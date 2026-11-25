# STATUS: Requirements ↔ Backend ↔ Frontend Audit

**Date:** 2026-11-25 · **Sources of truth:** `Docs/Trans-Track System.pdf` (requirements), `Docs/diagrams/trans_track_class_diagram.md`, `Docs/diagrams/trans_track_erd.md`

This audit verifies the backend and frontend against the approved design documents — nothing here is opinion. ✅ = implemented and verified, ⚠️ = partially done, ❌ = missing.

---

## 1. Class Diagram ↔ Backend Models — HUGGING ✅

All 15 diagrammed methods exist in `server/models/` on the correct classes:

| Diagrammed method | Location | Status |
| :--- | :--- | :--- |
| `BaseEntity.getCreatedAt/getUpdatedAt` | `baseEntity.js` | ✅ |
| `BaseAuditEntity.getCreatedBy/getUpdatedBy` | `baseEntity.js` | ✅ |
| `Port.updateDetails` | `Port.js` | ✅ |
| `Vessel.hasAvailableCapacity / updateOperationalStatus` | `Vessel.js` | ✅ |
| `Voyage.deductCapacity / restoreCapacity / updateStatus` | `Voyage.js` | ✅ |
| `Client.updateContact` | `Client.js` | ✅ |
| `User.verifyPassword / authorize` | `User.js` | ✅ |
| `Waybill.transitionStatus / computeFreight` | `Waybill.js` | ✅ |
| `TruckArrival.generateTrackingToken / isTokenValid` | `TruckArrival.js` | ✅ |
| `DriverLocationPing.processSmsReply` | `DriverLocationPing.js` | ✅ |

Inheritance (`BaseEntity → BaseAuditEntity → Voyage/Client/Waybill`) matches the diagram. **Addition beyond the diagram (allowed):** `Client.updateDetails` — same shape as `Port.updateDetails`, needed by the master-data API. **Do not "fix" this.**

## 2. ERD ↔ Live Database — HUGGING ✅

All 11 ERD tables exist with **100% column match** (verified column-by-column against the live database). The 7-step `waybill_statuses` pipeline (`BOOKED → EN_ROUTE → GATE_CHECKED_IN → STAGED → LOADED → IN_TRANSIT → DELIVERED`, with `sequence_order`) matches the ERD spec exactly. The Single-Entry Gate constraint (`truck_arrivals.waybill_id UNIQUE`) is in place.

**One table exists beyond the ERD:** the audit log written by `schema/audit_triggers.sql` — an implementation addition required by the security architecture. Not a conflict.

## 3. Requirements ↔ Backend

| Requirement (from the PDF) | Status | Evidence / Gap |
| :--- | :--- | :--- |
| Auto-deduction: capacity deducted "the exact second the waybill is generated" | ✅ | `autoDeductionEngine.js`, ACID transaction, 409 on overbooking — verified live |
| Single-Entry Gate schema preventing double encoding | ✅ | `truck_arrivals.waybill_id` UNIQUE — verified |
| Read-only Executive Capacity Dashboard data | ✅ | `v_executive_summary` view + `/api/executive` (read-only, EXECUTIVE role) |
| Client tracks waybill independently | ✅ | `GET /api/public/waybills/:waybillNumber`, `GET /api/public/track/:token` |
| **Client checks daily vessel schedules independently** | ❌ | **No public schedule endpoint exists.** `publicRoutes.js` only serves waybill lookup + tracking. This is a stated functional requirement — the backend must add `GET /api/public/voyages` (upcoming departures, remaining capacity). |
| GPS link pinged to operations dashboard | ✅ | Token generated at gate check-in; `POST /api/public/track/:token/pings` ingests (`GPS_LINK`, `SMS_FALLBACK`) |
| **"Automated SMS tracking link sent to the driver's mobile device"** | ❌ | **No SMS gateway integrated** (no provider dependency in the backend). Tokens are generated and pings are ingested, but nothing ever *sends* the link to the driver. |
| Two-Way SMS Fallback reads text replies | ⚠️ | Ingest + `processSmsReply` parser done; receiving SMS still needs a gateway/webhook |
| Viber/SMS auto-responder redirecting clients | ❌ (proposed drop) | External-phone automation. The requirements PDF itself notes *"di nako bet ang automated reply"* — recommend formally descope to a printed link instead. **Group decision needed.** |
| NFR: low-bandwidth optimization | ⚠️ | Throttled-network e2e spec exists (`client/e2e/throttling.spec.ts`); real 3G measurement not yet done |
| NFR: no GPS transponders / driver apps required | ✅ | Architecture uses browser geolocation or SMS replies only |

## 4. Frontend ↔ Backend — THE ACTUAL CONFLICT ⚠️

**The frontend calls exactly ONE backend endpoint: `POST /api/auth/login`.** Everything else renders hardcoded mock data:

| Page | Wired to backend? | Mock source |
| :--- | :--- | :--- |
| Login | ✅ | — |
| Dashboard | ❌ | `mockStats`, `mockDonutData`, `mockReports` in `dashboard-page.tsx` |
| Waybills | ❌ | mock rows in `waybills-page.tsx` / `data-table.tsx` |
| Deck allocation | ❌ | `mockData` in `deck-allocation-page.tsx` |
| Schedule | ❌ | `mockSchedules` in `schedule-page.tsx` — **and the backend endpoint it needs doesn't exist yet (see §3)** |
| Track (public) | ❌ | mock in `track-page.tsx` / `track-form.tsx` |

This is the source of most "conflicts between frontend and database": **the frontend was built from the mockups' invented numbers, not from the API.** Concrete shape mismatches to resolve when wiring:

- Dashboard donut uses `onTime/delayed/inTransit` — the backend's executive view exposes voyage capacity/utilization, not per-truck punctuality. Either the frontend adapts to the real fields or the backend adds a view (group decision).
- The UI must read status names from `waybill_statuses` (7 steps, ordered by `sequence_order`) for the tracking progress bar — not from mock strings.
- Booking requires `payment_mode` (`PREPAID`/`COLLECT`/`ACCOUNT`) and `payment_status_id` defaults to `UNPAID` — the waybill form must send these or the API rejects it (400).

## 5. Priority order (recommended for the group)

1. **Wire the frontend to the real API** — pages 4–6 above map 1:1 to endpoints that already exist and are tested. No backend work needed.
2. **Add `GET /api/public/voyages`** — small backend addition, unblocks the schedule page and satisfies a core functional requirement.
3. **Decide SMS scope** — minimal: send the tracking link via an SMS provider (e.g., Semaphore/Twilio) at gate check-in; or descope to "clerk shares link via any channel" per the PDF's constraint note and your own comment.
4. **Settle the dashboard metric shapes** (donut) — frontend adapts to `v_executive_summary`, or extend the view.
5. Only then: low-bandwidth perf pass, polish, seed replacement with real data.

---

**Bottom line for the group:** the backend is not the problem — it matches the ERD and class diagram line-for-line, and every requirement it claims is verified working. The conflict is that the frontend is still a mockup wearing a login form. Wire it to the API in §4's order and most "conflicts" disappear.
