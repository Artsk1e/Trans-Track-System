-- ============================================================================
-- Trans-Track System Database Initialization Script
-- Stack: PostgreSQL (PERN Stack)
-- Description: Creates master reference tables, core operational entities, 
--              execution/telemetry tables, enums, FK constraints, indexes, 
--              and initial seed data.
-- ============================================================================

-- Drop existing tables in reverse dependency order if rerunning init script
DROP TABLE IF EXISTS driver_location_pings CASCADE;
DROP TABLE IF EXISTS truck_arrivals CASCADE;
DROP TABLE IF EXISTS waybill_status_log CASCADE;
DROP TABLE IF EXISTS waybills CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS waybill_statuses CASCADE;
DROP TABLE IF EXISTS payment_statuses CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS voyages CASCADE;
DROP TABLE IF EXISTS vessels CASCADE;
DROP TABLE IF EXISTS ports CASCADE;

-- Drop existing ENUM types if they exist
DROP TYPE IF EXISTS vessel_type_enum CASCADE;
DROP TYPE IF EXISTS vessel_status_enum CASCADE;
DROP TYPE IF EXISTS client_type_enum CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS cargo_type_enum CASCADE;
DROP TYPE IF EXISTS payment_mode_enum CASCADE;
DROP TYPE IF EXISTS voyage_status_enum CASCADE;
DROP TYPE IF EXISTS ping_type_enum CASCADE;

-- ============================================================================
-- CREATE CUSTOM ENUMS
-- ============================================================================
CREATE TYPE vessel_type_enum AS ENUM ('PASSENGER_CARGO', 'CARGO_ONLY', 'RORO');
CREATE TYPE vessel_status_enum AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE client_type_enum AS ENUM ('SHIPPER', 'CONSIGNEE', 'BOTH');
CREATE TYPE user_role_enum AS ENUM ('GATE_CLERK', 'OIC_LOADMASTER', 'EXECUTIVE', 'ADMIN');
CREATE TYPE cargo_type_enum AS ENUM ('ROLLING_CARGO', 'LOOSE_CARGO', 'CONTAINER');
CREATE TYPE payment_mode_enum AS ENUM ('PREPAID', 'COLLECT', 'ACCOUNT');
CREATE TYPE voyage_status_enum AS ENUM ('SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED');
CREATE TYPE ping_type_enum AS ENUM ('GPS_LINK', 'SMS_FALLBACK');

-- ============================================================================
-- 1. MASTER REFERENCE TABLES
-- ============================================================================

CREATE TABLE ports (
    port_id SERIAL PRIMARY KEY,
    port_code VARCHAR(10) UNIQUE NOT NULL,
    port_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL
);

CREATE TABLE vessels (
    vessel_id SERIAL PRIMARY KEY,
    capacity INT NOT NULL,
    vessel_type vessel_type_enum NOT NULL,
    vessel_name VARCHAR(100) NOT NULL,
    total_deck_sqft DECIMAL(10,2) NOT NULL,
    total_cabin_rooms INT NOT NULL,
    status vessel_status_enum NOT NULL DEFAULT 'ACTIVE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE payment_statuses (
    payment_id SERIAL PRIMARY KEY,
    payment_code VARCHAR(30) UNIQUE NOT NULL,
    payment_name VARCHAR(50) NOT NULL
);

CREATE TABLE waybill_statuses (
    status_id SERIAL PRIMARY KEY,
    status_code VARCHAR(30) UNIQUE NOT NULL,
    status_name VARCHAR(50) NOT NULL,
    description TEXT,
    sequence_order INT NOT NULL
);

-- ============================================================================
-- INITIAL SEED INSERTS (LOOKUP TABLES)
-- ============================================================================

INSERT INTO payment_statuses (payment_code, payment_name) VALUES
    ('UNPAID', 'Unpaid'),
    ('PAID', 'Paid'),
    ('PARTIAL', 'Partially Paid'),
    ('REFUNDED', 'Refunded')
ON CONFLICT (payment_code) DO NOTHING;

INSERT INTO waybill_statuses (status_code, status_name, description, sequence_order) VALUES
    ('BOOKED', 'Booked', 'Cargo booking has been registered and allocated to a voyage.', 1),
    ('EN_ROUTE', 'En Route', 'Truck is traveling toward the port terminal.', 2),
    ('GATE_CHECKED_IN', 'Gate Checked In', 'Truck has arrived at the port gate and passed initial entry processing.', 3),
    ('STAGED', 'Staged', 'Cargo is staged in the port yard awaiting vessel loading.', 4),
    ('LOADED', 'Loaded', 'Cargo has been successfully loaded onto the vessel deck.', 5),
    ('IN_TRANSIT', 'In Transit', 'Vessel has departed and is currently traveling to the destination port.', 6),
    ('DELIVERED', 'Delivered', 'Cargo has arrived at the destination port and been handed over to the consignee.', 7)
ON CONFLICT (status_code) DO NOTHING;

-- ============================================================================
-- 2. CORE OPERATIONAL ENTITIES
-- ============================================================================

CREATE TABLE voyages (
    voyage_id SERIAL PRIMARY KEY,
    vessel_id INT NOT NULL REFERENCES vessels(vessel_id) ON DELETE RESTRICT,
    origin_port_id INT NOT NULL REFERENCES ports(port_id) ON DELETE RESTRICT,
    destination_port_id INT NOT NULL REFERENCES ports(port_id) ON DELETE RESTRICT,
    voyage_number VARCHAR(50) UNIQUE NOT NULL,
    departure TIMESTAMP NOT NULL,
    estimated_arrival TIMESTAMP NOT NULL,
    remaining_sqft DECIMAL(10,2) NOT NULL,
    remaining_rooms INT NOT NULL,
    voyage_status voyage_status_enum NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    client_type client_type_enum NOT NULL,
    company_name VARCHAR(150),
    contact_person VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role_enum NOT NULL
);

CREATE TABLE waybills (
    waybill_id VARCHAR(50) PRIMARY KEY,
    voyage_id INT NOT NULL REFERENCES voyages(voyage_id) ON DELETE RESTRICT,
    shipper_id INT NOT NULL REFERENCES clients(client_id) ON DELETE RESTRICT,
    consignee_id INT NOT NULL REFERENCES clients(client_id) ON DELETE RESTRICT,
    current_status_id INT NOT NULL REFERENCES waybill_statuses(status_id) ON DELETE RESTRICT,
    payment_status_id INT NOT NULL REFERENCES payment_statuses(payment_id) ON DELETE RESTRICT,
    cargo_description TEXT,
    quantity INT NOT NULL DEFAULT 1,
    total_weight_kg DECIMAL(10,2),
    cargo_type cargo_type_enum NOT NULL,
    cargo_sqft DECIMAL(10,2) NOT NULL,
    booked_rooms INT NOT NULL DEFAULT 0,
    freight_charge DECIMAL(12,2),
    vehicle_plate VARCHAR(20),
    payment_mode payment_mode_enum NOT NULL,
    official_receipt_no VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. EXECUTION & TELEMETRY TRACKING
-- ============================================================================

CREATE TABLE waybill_status_log (
    log_id SERIAL PRIMARY KEY,
    waybill_id VARCHAR(50) NOT NULL REFERENCES waybills(waybill_id) ON DELETE CASCADE,
    updated_by_user INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    previous_status_id INT REFERENCES waybill_statuses(status_id) ON DELETE SET NULL,
    new_status_id INT NOT NULL REFERENCES waybill_statuses(status_id) ON DELETE RESTRICT,
    location_name VARCHAR(100),
    remarks TEXT,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE truck_arrivals (
    arrival_id SERIAL PRIMARY KEY,
    waybill_id VARCHAR(50) UNIQUE NOT NULL REFERENCES waybills(waybill_id) ON DELETE CASCADE,
    gate_clerk_id INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    driver_phone VARCHAR(20) NOT NULL,
    temp_gps_token VARCHAR(100) UNIQUE,
    token_expires_at TIMESTAMP,
    eta_timestamp TIMESTAMP,
    gate_checkin_time TIMESTAMP
);

CREATE TABLE driver_location_pings (
    ping_id SERIAL PRIMARY KEY,
    arrival_id INT NOT NULL REFERENCES truck_arrivals(arrival_id) ON DELETE CASCADE,
    ping_type ping_type_enum NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    raw_sms_text TEXT,
    ping_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
CREATE INDEX idx_voyages_vessel ON voyages(vessel_id);
CREATE INDEX idx_voyages_ports ON voyages(origin_port_id, destination_port_id);
CREATE INDEX idx_waybills_voyage ON waybills(voyage_id);
CREATE INDEX idx_waybills_shipper ON waybills(shipper_id);
CREATE INDEX idx_waybills_consignee ON waybills(consignee_id);
CREATE INDEX idx_waybill_logs_waybill ON waybill_status_log(waybill_id);
CREATE INDEX idx_truck_arrivals_waybill ON truck_arrivals(waybill_id);
CREATE INDEX idx_location_pings_arrival ON driver_location_pings(arrival_id);
