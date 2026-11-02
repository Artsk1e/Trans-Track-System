# Trans-Track System - Entity Relationship Diagram (ERD) Architecture

This document provides the complete Entity Relationship Diagram (ERD) representation and detailed schema documentation for the Trans-Track system, derived directly from the relational database specifications in `/Docs/trans-track erd explanation.pdf`.

## 1. High-Level ERD Overview (Mermaid.js Entity Relationship Diagram)

```mermaid
erDiagram
    ports {
        int port_id PK
        varchar port_code UK
        varchar port_name
        varchar city
        varchar province
    }

    vessels {
        int vessel_id PK
        int capacity
        enum vessel_type
        varchar vessel_name
        decimal total_deck_sqft
        int total_cabin_rooms
        enum status
        boolean is_active
    }

    voyages {
        int voyage_id PK
        int vessel_id FK
        int origin_port_id FK
        int destination_port_id FK
        varchar voyage_number UK
        timestamp departure
        timestamp estimated_arrival
        decimal remaining_sqft
        int remaining_rooms
        enum voyage_status
    }

    clients {
        int client_id PK
        enum client_type
        varchar company_name
        varchar contact_person
        varchar phone_number
        varchar email
    }

    payment_statuses {
        int payment_id PK
        varchar payment_code UK
        varchar payment_name
    }

    waybill_statuses {
        int status_id PK
        varchar status_code UK
        varchar status_name
        text description
        int sequence_order
    }

    users {
        int user_id PK
        varchar username UK
        varchar password_hash
        varchar first_name
        varchar last_name
        enum role
    }

    waybills {
        varchar waybill_id PK
        int voyage_id FK
        int shipper_id FK
        int consignee_id FK
        int current_status_id FK
        int payment_status_id FK
        text cargo_description
        int quantity
        decimal total_weight_kg
        enum cargo_type
        decimal cargo_sqft
        int booked_rooms
        decimal freight_charge
        varchar vehicle_plate
        enum payment_mode
        varchar official_receipt_no
        timestamp created_at
    }

    waybill_status_log {
        int log_id PK
        varchar waybill_id FK
        int updated_by_user FK
        int previous_status_id FK
        int new_status_id FK
        varchar location_name
        text remarks
        timestamp logged_at
    }

    truck_arrivals {
        int arrival_id PK
        varchar waybill_id FK, UK
        int gate_clerk_id FK
        varchar driver_phone
        varchar temp_gps_token UK
        timestamp token_expires_at
        timestamp eta_timestamp
        timestamp gate_checkin_time
    }

    driver_location_pings {
        int ping_id PK
        int arrival_id FK
        enum ping_type
        decimal latitude
        decimal longitude
        text raw_sms_text
        timestamp ping_timestamp
    }

    ports ||--o{ voyages : "origin_port"
    ports ||--o{ voyages : "destination_port"
    vessels ||--o{ voyages : "operates"
    clients ||--o{ waybills : "shipper"
    clients ||--o{ waybills : "consignee"
    voyages ||--o{ waybills : "carries"
    waybill_statuses ||--o{ waybills : "tracks_status"
    payment_statuses ||--o{ waybills : "tracks_payment"
    waybills ||--o{ waybill_status_log : "has_logs"
    users ||--o{ waybill_status_log : "updates_status"
    waybill_statuses ||--o{ waybill_status_log : "previous_status"
    waybill_statuses ||--o{ waybill_status_log : "new_status"
    users ||--o{ truck_arrivals : "clerks_entry"
    waybills ||--|| truck_arrivals : "single_entry_gate"
    truck_arrivals ||--o{ driver_location_pings : "receives_pings"
```

---

## 2. Relational Schema & Entity Specifications

### Master Reference Entities
- **ports**: Stores port terminals (`ILG` for Iligan City, `CEB` for Cebu City).
- **vessels**: Defines physical fleet specs, deck square footage (`total_deck_sqft`), and cabin room counts (`total_cabin_rooms`).
- **payment_statuses**: Standard payment codes (`UNPAID`, `PAID`, `PARTIAL`, `REFUNDED`).
- **waybill_statuses**: Controls tracking progress bars through ordered sequence steps (1 to 7: `BOOKED` through `DELIVERED`).

### Core Operational Entities
- **voyages**: Scheduled trips serving as the target for the **Auto-Deduction Engine** (automatically deducting `cargo_sqft` and `booked_rooms` from `remaining_sqft` and `remaining_rooms`).
- **clients**: Master directory for shippers and consignees.
- **users**: Internal staff accounts (`GATE_CLERK`, `OIC_LOADMASTER`, `EXECUTIVE`, `ADMIN`).
- **waybills**: Central cargo booking and staging entity linking voyages, clients, statuses, and dynamic freight charges.

### Execution & Telemetry Tracking
- **waybill_status_log**: Immutable audit trail tracking chronological state transitions.
- **truck_arrivals**: Handles gate check-ins, enforcing the **Single-Entry Gate** constraint (`waybill_id` is UNIQUE) and housing temporary GPS tracking tokens (`temp_gps_token`).
- **driver_location_pings**: Stores browser GPS pings or Two-Way SMS fallback replies (`ping_type`: `GPS_LINK`, `SMS_FALLBACK`).
