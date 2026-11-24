-- ============================================================================
-- Trans-Track System Baseline Demo Seed
-- Idempotent: safe to re-run. INSERT-only, no DDL.
-- All rows are DEMO placeholders; replace via the master-data encoding API.
-- ============================================================================

-- Ports -----------------------------------------------------------------
INSERT INTO ports (port_code, port_name, city, province) VALUES
    ('ILG', 'Iligan Port', 'Iligan City', 'Lanao del Norte'),
    ('CEB', 'Cebu Base Port', 'Cebu City', 'Cebu'),
    ('CGY', 'Cagayan de Oro Port', 'Cagayan de Oro City', 'Misamis Oriental'),
    ('MNL', 'Manila South Harbor', 'Manila', 'Metro Manila'),
    ('OZC', 'Ozamiz Port', 'Ozamiz City', 'Misamis Occidental')
ON CONFLICT (port_code) DO NOTHING;

-- Vessels (DEMO fleet) ---------------------------------------------------
INSERT INTO vessels (capacity, vessel_type, vessel_name, total_deck_sqft, total_cabin_rooms) VALUES
    (50, 'RORO', 'DEMO RORO Vessel 1', 24000, 60),
    (80, 'PASSENGER_CARGO', 'DEMO Passenger Vessel 2', 18500, 120),
    (100, 'CARGO_ONLY', 'DEMO Cargo Vessel 3', 30000, 0)
ON CONFLICT DO NOTHING;

-- Clients (DEMO) ----------------------------------------------------------
INSERT INTO clients (client_type, company_name, contact_person, phone_number, email) VALUES
    ('BOTH', 'Demo Logistics Corp', 'Juan Dela Cruz', '09171112222', 'demo.logistics@example.com'),
    ('SHIPPER', 'Demo Container Depot Inc', 'Maria Santos', '09173334444', 'demo.depot@example.com'),
    ('CONSIGNEE', 'Demo Fresh Distributors', 'Pedro Ramos', '09175556666', 'demo.fresh@example.com')
ON CONFLICT DO NOTHING;

-- Voyages: start at full capacity; dates relative to seed time ------------
INSERT INTO voyages (vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival, remaining_sqft, remaining_rooms, voyage_status)
SELECT
    ve.vessel_id,
    po1.port_id,
    po2.port_id,
    v.voyage_number,
    CURRENT_TIMESTAMP + v.dept_offset,
    CURRENT_TIMESTAMP + v.arr_offset,
    ve.total_deck_sqft,
    ve.total_cabin_rooms,
    'SCHEDULED'
FROM (VALUES
    ('DEMO RORO Vessel 1', 'ILG', 'CEB', 'VOY-DEMO-001', INTERVAL '2 days', INTERVAL '3 days'),
    ('DEMO Passenger Vessel 2', 'CEB', 'CGY', 'VOY-DEMO-002', INTERVAL '3 days', INTERVAL '4 days'),
    ('DEMO Cargo Vessel 3', 'ILG', 'MNL', 'VOY-DEMO-003', INTERVAL '5 days', INTERVAL '6 days')
) AS v(vessel_name, origin_code, dest_code, voyage_number, dept_offset, arr_offset)
JOIN vessels ve ON ve.vessel_name = v.vessel_name
JOIN ports po1 ON po1.port_code = v.origin_code
JOIN ports po2 ON po2.port_code = v.dest_code
WHERE NOT EXISTS (SELECT 1 FROM voyages x WHERE x.voyage_number = v.voyage_number);

-- Demo waybill for public tracking (only if none exists yet) --------------
INSERT INTO waybills (
    waybill_id, voyage_id, shipper_id, consignee_id, current_status_id, payment_status_id,
    cargo_description, quantity, total_weight_kg, cargo_type, cargo_sqft, booked_rooms,
    freight_charge, vehicle_plate, payment_mode, official_receipt_no
)
SELECT
    'WB-DEMO-000001',
    vo.voyage_id,
    c1.client_id,
    c2.client_id,
    ws.status_id,
    ps.payment_id,
    'Demo cargo - 1 unit 10-wheeler truck',
    1,
    15000,
    'ROLLING_CARGO',
    600,
    0,
    12500.00,
    'DEMO-PLATE-1',
    'PREPAID',
    'OR-DEMO-000001'
FROM voyages vo, clients c1, clients c2, waybill_statuses ws, payment_statuses ps
WHERE vo.voyage_number = 'VOY-DEMO-001'
  AND c1.company_name = 'Demo Logistics Corp'
  AND c2.company_name = 'Demo Fresh Distributors'
  AND ws.status_code = 'BOOKED'
  AND ps.payment_code = 'PAID'
  AND NOT EXISTS (SELECT 1 FROM waybills w WHERE w.waybill_id = 'WB-DEMO-000001');

-- Keep voyage capacity consistent with the demo waybill deduction
UPDATE voyages
SET remaining_sqft = remaining_sqft - 600
WHERE voyage_number = 'VOY-DEMO-001'
  AND EXISTS (SELECT 1 FROM waybills WHERE waybill_id = 'WB-DEMO-000001')
  AND NOT EXISTS (
    SELECT 1 FROM waybill_status_log
    WHERE waybill_id = 'WB-DEMO-000001'
  );

INSERT INTO waybill_status_log (waybill_id, updated_by_user, new_status_id, location_name, remarks)
SELECT 'WB-DEMO-000001', u.user_id, ws.status_id, 'Booking Desk', 'Demo waybill generated; capacity auto-deducted'
FROM users u, waybill_statuses ws
WHERE u.username = 'admin'
  AND ws.status_code = 'BOOKED'
  AND NOT EXISTS (SELECT 1 FROM waybill_status_log WHERE waybill_id = 'WB-DEMO-000001');
