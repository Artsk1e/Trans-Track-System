-- ============================================================================
-- Trans-Track System Role-Based Access Control (RBAC) Views
-- Description: Creates secure database views tailored to specific user roles
--              to restrict data visibility and enforce access control policies.
-- ============================================================================

-- 1. GATE CLERK VIEW: Focuses on Waybill arrivals and status updates.
CREATE OR REPLACE VIEW v_gate_clerk_waybills AS
SELECT 
    w.waybill_id,
    v.voyage_number,
    v.departure,
    w.shipper_id,
    w.consignee_id,
    ws.status_name AS current_status,
    w.vehicle_plate,
    ta.gate_checkin_time
FROM waybills w
JOIN voyages v ON w.voyage_id = v.voyage_id
JOIN waybill_statuses ws ON w.current_status_id = ws.status_id
LEFT JOIN truck_arrivals ta ON w.waybill_id = ta.waybill_id;

-- 2. VOYAGE OPERATIONS VIEW: Focuses on Voyage planning and loading operations.
CREATE OR REPLACE VIEW v_voyage_operations AS
SELECT 
    v.voyage_id,
    v.voyage_number,
    ves.vessel_name,
    p1.port_name AS origin,
    p2.port_name AS destination,
    v.departure,
    v.remaining_sqft,
    v.remaining_rooms,
    v.voyage_status,
    (SELECT COUNT(*) FROM waybills WHERE voyage_id = v.voyage_id) AS total_waybills
FROM voyages v
JOIN vessels ves ON v.vessel_id = ves.vessel_id
JOIN ports p1 ON v.origin_port_id = p1.port_id
JOIN ports p2 ON v.destination_port_id = p2.port_id;

-- 3. EXECUTIVE VIEW: Focuses on Financial summaries and High-level status.
CREATE OR REPLACE VIEW v_executive_summary AS
SELECT 
    v.voyage_number,
    ves.vessel_name,
    COUNT(w.waybill_id) AS total_bookings,
    SUM(w.freight_charge) AS total_revenue,
    SUM(w.cargo_sqft) AS total_deck_usage,
    v.voyage_status
FROM voyages v
JOIN vessels ves ON v.vessel_id = ves.vessel_id
LEFT JOIN waybills w ON v.voyage_id = w.voyage_id
GROUP BY v.voyage_id, v.voyage_number, ves.vessel_name;

-- 4. ADMIN AUDIT VIEW: Focuses on System security and Audit trails.
CREATE OR REPLACE VIEW v_admin_audit_summary AS
SELECT 
    al.audit_id,
    al.table_name,
    al.operation,
    al.record_id,
    u.username AS operator,
    al.changed_at,
    al.old_data,
    al.new_data
FROM audit_logs al
LEFT JOIN users u ON al.changed_by = u.user_id
ORDER BY al.changed_at DESC;
