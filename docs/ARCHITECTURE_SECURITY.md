# Trans-Track System: Database and Security Architecture

## Rationale
The Trans-Track System implements a robust, layered security and database architecture designed for reliability, auditability, and clear separation of concerns. Given the critical nature of cargo tracking and port operations, the system prioritizes data integrity and strict access control.

## ACID/BASE Analysis

### ACID Compliance
The core operational entities (Waybills, Voyages, Users, Payments) follow strict **ACID** (Atomicity, Consistency, Isolation, Durability) principles.
- **Atomicity**: Transactions involving waybill status changes and voyage capacity updates are atomic.
- **Consistency**: Enforced through foreign key constraints, check constraints, and custom triggers (e.g., ensuring voyage capacity never goes negative).
- **Isolation**: PostgreSQL default isolation levels prevent concurrent transactions from corrupting shared state.
- **Durability**: Achieved via PostgreSQL's Write-Ahead Logging (WAL).

### BASE Considerations
For non-critical telemetry data (e.g., driver location pings), we adopt a more **BASE** (Basically Available, Soft state, Eventual consistency) approach.
- Pings are high-frequency and can tolerate occasional data loss or eventual consistency in the tracking dashboard.
- This prevents telemetry traffic from impacting the performance of the core transactional database.

## RBAC Matrix

The system enforces Role-Based Access Control (RBAC) at the application and database view levels.

| Role | Permissions | Primary View |
| :--- | :--- | :--- |
| **GATE_CLERK** | View waybills, Check-in trucks, Update status to 'GATE_CHECKED_IN'. | `v_gate_clerk_waybills` |
| **OIC_LOADMASTER**| Full voyage management, Cargo staging, Vessel loading. | `v_oic_voyage_operations`|
| **EXECUTIVE** | Read-only access to financials and system-wide summaries. | `v_executive_summary` |
| **ADMIN** | Full system access, User management, Audit log review. | `v_admin_audit_summary` |

## Security & Audit

### Audit Triggers
Every change to `waybills`, `voyages`, and `users` is automatically captured in an `audit_logs` table via PostgreSQL triggers. This provides an immutable record of:
- Who made the change (User ID).
- When the change occurred (Timestamp).
- What changed (Old vs New state in JSONB format).

### Data Integrity
- **Foreign Keys**: Strict referential integrity across all related tables.
- **Enums**: Validates statuses and roles at the database level to prevent invalid data entry.
- **Indexes**: Strategic indexing on IDs and frequently queried columns (e.g., `waybill_id`, `voyage_number`, `audit_id`) ensure performance remains high as the database grows.

## Performance Optimization
- **B-Tree Indexes**: Standard for ID-based lookups and status filtering.
- **JSONB Indexing**: GIN indexes can be added to `audit_logs` if deep searches into data changes become frequent.
- **View Materialization**: Currently using dynamic views; materialized views can be considered for the `v_executive_summary` if reporting latency increases.
