# Database and Security Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement audit triggers, RBAC views, performance indexes, and comprehensive security/ACID/BASE documentation for the Trans-Track System.

**Architecture:** PostgreSQL-based secure multi-tenant and role-based access control architecture, featuring robust audit logging via triggers, database views for role-specific data access, and rigorous ACID/BASE trade-off analysis.

**Tech Stack:** PostgreSQL, SQL, Markdown.

**Spec:** Database and Security Architecture Spec.

## Global Constraints
- PostgreSQL 14+ compatible SQL.
- Strict RBAC mapping to `user_role_enum` ('GATE_CLERK', 'OIC_LOADMASTER', 'EXECUTIVE', 'ADMIN').
- Comprehensive audit trail for all sensitive operations (waybills, voyages, user changes).

## Review Focus
- Unauthorised data access via direct table queries (mitigated by revoking direct permissions and forcing RBAC views).
- Audit trail tampering (mitigated by append-only audit logs).
- Performance degradation under high concurrency (mitigated by targeted indexing).

---

### Task 1: Audit Triggers and Logging Table
**Files:**
- Create: `schema/audit_triggers.sql`
- Test: `tests/test_audit.sql`

**Interfaces:**
- Produces: `audit_logs` table and generic audit trigger function.

- [ ] **Step 1: Create audit_logs table and trigger function**
- [ ] **Step 2: Attach audit triggers to `waybills`, `voyages`, and `users` tables**
- [ ] **Step 3: Verify audit logs capture INSERT, UPDATE, DELETE operations**

### Task 2: Role-Based Access Control (RBAC) Views
**Files:**
- Create: `schema/rbac_views.sql`
- Test: `tests/test_rbac.sql`

**Interfaces:**
- Consumes: Core operational tables (`waybills`, `voyages`, `clients`, etc.).
- Produces: Role-specific views (`v_gate_clerk_waybills`, `v_oic_voyages`, `v_executive_summary`, `v_admin_users`).

- [ ] **Step 1: Create view for GATE_CLERK (`v_gate_clerk_waybills`)**
- [ ] **Step 2: Create view for OIC_LOADMASTER (`v_oic_voyage_operations`)**
- [ ] **Step 3: Create view for EXECUTIVE (`v_executive_financials`)**
- [ ] **Step 4: Create view for ADMIN (`v_admin_audit_summary`)**

### Task 3: Security & Architecture Documentation
**Files:**
- Create: `docs/ARCHITECTURE_SECURITY.md`

**Interfaces:**
- Consumes: Database schema, RBAC matrix, ACID/BASE analysis.
- Produces: Comprehensive markdown documentation.

- [ ] **Step 1: Document Rationale and ACID/BASE analysis**
- [ ] **Step 2: Document RBAC matrix and access control policies**
- [ ] **Step 3: Document Audit and Compliance mechanisms**

