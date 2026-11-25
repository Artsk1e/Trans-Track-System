/*
 * Trans-Track System - Test Data Seed
 * Run with: psql -d Trans_Track -f seeds/test-data.sql
 * 
 * Generated: 2026-11-24
 */

-- Payment Statuses (reference table)
INSERT INTO payment_statuses (payment_code, payment_name) VALUES
('UNPAID', 'Unpaid'),
('PAID', 'Paid'),
('PARTIAL', 'Partial'),
('REFUNDED', 'Refunded')
ON CONFLICT (payment_code) DO NOTHING;

-- Waybill Statuses (reference table) - Ordered sequence
INSERT INTO waybill_statuses (status_code, status_name, description, sequence_order) VALUES
('BOOKED', 'Booked', 'Waybill created and capacity deducted', 1),
('GATE_CHECK-IN', 'Gate Check In', 'Truck arrived at gate', 2),
('LOADED', 'Loaded', 'Cargo loaded onto vessel', 3),
('IN_TRANSIT', 'In Transit', 'Voyage in progress', 4),
('AT_DESTINATION', 'At Destination', 'Arrived at destination port', 5),
('DELIVERED', 'Delivered', 'Cargo delivered to consignee', 6),
('CANCELLED', 'Cancelled', 'Waybill cancelled', 7)
ON CONFLICT (status_code) DO NOTHING;

-- Ports
INSERT INTO ports (port_code, port_name, city, province) VALUES
('IGL', 'Iligan City Port', 'Iligan', 'Lanao del Sur'),
('CEB', 'Cebu City Port', 'Cebu City', 'Cebu'),
('DVO', 'Davao City Port', 'Davao City', 'Davao del Sur'),
('MLU', 'Metro Manila Port', 'Manila', 'Metro Manila')
ON CONFLICT (port_code) DO NOTHING;

-- Vessels
INSERT INTO vessels (vessel_name, vessel_type, total_deck_sqft, total_cabin_rooms, status, is_active) VALUES
('MV Trans Asia 1', 'ROLL_ON_ROLL_OFF', 50000, 120, 'ON_SCHEDULE', true),
('MV Trans Asia 2', 'CONTAINER', 45000, 100, 'ON_SCHEDULE', true),
('MV Trans Asia 3', 'BULK_CARRIER', 60000, 80, 'ON_SCHEDULE', true),
('MV Trans Asia 4', 'CAR_CARRIER', 40000, 150, 'ON_SCHEDULE', true)
ON CONFLICT (vessel_name) DO NOTHING;

-- Clients (Shippers/Consignees)
INSERT INTO clients (client_type, company_name, contact_person, phone_number, email) VALUES
('SHIPPER', 'Trans Asia Logistics Inc.', 'Juan Dela Cruz', '+639123456789', 'juan@transasia.com'),
('SHIPPER', 'Cebu Trading Co.', 'Maria Santos', '+639987654321', 'maria@cebutrading.com'),
('SHIPPER', 'Davao Freight Services', 'Pedro Reyes', '+639876543210', 'pedro@davaofreight.com'),
('CONSIGNEE', 'Manila Import Corp.', 'Ana Garcia', '+639765432109', 'ana@main_import.com'),
('CONSIGNEE', 'Baguio Goods Ltd', 'Carlos Mendoza', '+639654321098', 'carlos@baguiogoods.com')
ON CONFLICT (company_name) DO NOTHING;

-- Voyages
INSERT INTO voyages (vessel_id, origin_port_id, destination_port_id, voyage_number, departure, estimated_arrival, remaining_sqft, remaining_rooms, voyage_status) VALUES
(1, 1, 2, 'VY-2026-001', '2026-12-08 08:00:00', '2026-12-10 18:00:00', 32000, 60, 'ON_SCHEDULE'),
(2, 1, 3, 'VY-2026-002', '2026-12-09 06:00:00', '2026-12-11 16:00:00', 25000, 45, 'ON_SCHEDULE'),
(3, 2, 4, 'VY-2026-003', '2026-12-10 10:00:00', '2026-12-12 14:00:00', 45000, 80, 'ON_SCHEDULE'),
(4, 3, 1, 'VY-2026-004', '2026-12-11 14:00:00', '2026-12-13 10:00:00', 38000, 70, 'ON_SCHEDULE')
ON CONFLICT (voyage_number) DO NOTHING;

-- Test Users with bcrypt-hashed passwords
-- Password: ExecPass123!
INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES
('exec_user', '$2b$10$wLZ/IYBS0sNu4O43s/XAK.ZO27PZaUsGT5Vu/XJRPqMjJQOn/lfl.', 'Executive', 'User', 'EXECUTIVE')
ON CONFLICT (username) DO NOTHING;

-- Password: ClerkPass123!
INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES
('clerk_user', '$2b$10$bNmP3JDfp6VnRQXVfklR7utdclahvoDEPzPRsW.fdvNgVOrEUEoUi', 'Gate', 'Clerk', 'GATE_CLERK')
ON CONFLICT (username) DO NOTHING;

-- Password: AdminPass123!
INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES
('admin_user', '$2b$10$wLZ/IYBS0sNu4O43s/XAK.ZO27PZaUsGT5Vu/XJRPqMjJQOn/lfl.', 'System', 'Admin', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Sample Waybills (for GATE_CLERK testing)
-- Note: These are pre-BOOKED waybills for testing
INSERT INTO waybills (waybill_id, voyage_id, shipper_id, consignee_id, current_status_id, payment_status_id, cargo_description, quantity, total_weight_kg, cargo_type, cargo_sqft, booked_rooms, freight_charge, vehicle_plate, payment_mode, official_receipt_no, created_at) VALUES
('WB-2026-001', 1, 1, 4, 1, 1, 'Electronics Containers', 50, 2500, 'CONTAINERS', 9000, 0, 150000.00, 'ABC-123', 'CASH', 'RR-2026-001', NOW()),
('WB-2026-002', 1, 1, 5, 1, 1, 'General Cargo', 200, 1800, 'GENERAL', 5000, 0, 85000.00, 'XYZ-789', 'CASH', 'RR-2026-002', NOW()),
('WB-2026-003', 2, 2, 4, 1, 2, 'Vehicle Shipments', 15, 12000, 'VEHICLES', 8000, 0, 250000.00, 'CAR-456', 'CREDIT', 'RR-2026-003', NOW()),
('WB-2026-004', 3, 3, 5, 1, 1, 'Reefer Containers', 30, 8000, 'REEFER', 3500, 0, 95000.00, 'DEF-321', 'CASH', 'RR-2026-004', NOW())
ON CONFLICT (waybill_id) DO NOTHING;