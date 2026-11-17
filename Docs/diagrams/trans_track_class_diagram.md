# Trans-Track System - Enterprise Inheritance & Interface Class Diagram

This document provides the fully corrected and verified object-oriented inheritance and interface implementation hierarchy for the Trans-Track PERN stack architecture, mapping repository patterns, base entity models, specialized domain objects, and strict relational associations.

```mermaid
classDiagram
    direction LR

    %% ABSTRACT BASE CLASSES
    class BaseEntity {
        <<abstract>>
        #created_at: Date
        #updated_at: Date
        +getCreatedAt() Date
        +getUpdatedAt() Date
    }

    class BaseAuditEntity {
        <<abstract>>
        #created_by: number
        #updated_by: number
        +getCreatedBy() number
        +getUpdatedBy() number
    }

    BaseEntity <|-- BaseAuditEntity
    BaseEntity <|-- Port
    BaseEntity <|-- Vessel
    BaseAuditEntity <|-- Voyage
    BaseAuditEntity <|-- Client
    BaseAuditEntity <|-- Waybill

    %% ENTITIES
    class Port {
        -port_id: number
        -port_code: string
        -port_name: string
        -city: string
        -province: string
        +updateDetails(code, name, city, province): void
    }

    class Vessel {
        -vessel_id: number
        -capacity: number
        -vessel_type: VesselType
        -vessel_name: string
        -total_deck_sqft: number
        -total_cabin_rooms: number
        -status: OperationalStatus
        -is_active: boolean
        +hasAvailableCapacity(sqft, rooms): boolean
        +updateOperationalStatus(newStatus): void
    }

    class Voyage {
        -voyage_id: number
        -vessel_id: number
        -origin_port_id: number
        -destination_port_id: number
        -voyage_number: string
        -departure: Date
        -estimated_arrival: Date
        -remaining_sqft: number
        -remaining_rooms: number
        -voyage_status: VoyageStatus
        +deductCapacity(sqft, rooms): void
        +restoreCapacity(sqft, rooms): void
        +updateStatus(status): void
    }

    class Client {
        -client_id: number
        -client_type: ClientType
        -company_name: string
        -contact_person: string
        -phone_number: string
        -email: string
        +updateContact(phone, email): void
    }

    class User {
        -user_id: number
        -username: string
        -password_hash: string
        -first_name: string
        -last_name: string
        -role: UserRole
        +verifyPassword(plainPassword): Promise~boolean~
        +authorize(requiredRole): boolean
    }

    class Waybill {
        -waybill_id: string
        -voyage_id: number
        -shipper_id: number
        -consignee_id: number
        -current_status: string
        -cargo_description: string
        -quantity: number
        -total_weight_kg: number
        -cargo_type: CargoType
        -cargo_sqft: number
        -booked_rooms: number
        -freight_charge: number
        -vehicle_plate: string
        -payment_mode: PaymentMode
        -official_receipt_no: string
        +transitionStatus(newStatusId, userId, location, remarks): void
        +computeFreight(): number
    }

    class WaybillStatusLog {
        -log_id: number
        -waybill_id: string
        -updated_by_user: number
        -previous_status: string
        -new_status: string
        -location_name: string
        -remarks: string
        -logged_at: Date
    }

    class TruckArrival {
        -arrival_id: number
        -waybill_id: string
        -gate_clerk_id: number
        -driver_phone: string
        -temp_gps_token: string
        -token_expires_at: Date
        -eta_timestamp: Date
        -gate_checkin_time: Date
        +generateTrackingToken(): string
        +isTokenValid(): boolean
    }

    class DriverLocationPing {
        -ping_id: number
        -arrival_id: number
        -ping_type: PingType
        -latitude: number
        -longitude: number
        -raw_sms_text: string
        -ping_timestamp: Date
        +processSmsReply(smsText): void
    }

    %% RELATIONSHIPS
    Port "1" -- "*" Voyage : origin
    Port "1" -- "*" Voyage : destination
    Vessel "1" -- "*" Voyage : assigned_to
    Client "1" -- "*" Waybill : shipper
    Client "1" -- "*" Waybill : consignee
    Voyage "1" -- "*" Waybill : contains
    Waybill "1" *-- "*" WaybillStatusLog : history
    User "1" -- "*" WaybillStatusLog : logged_by
    User "1" -- "*" TruckArrival : processed_by
    Waybill "1" -- "0..1" TruckArrival : tracks
    TruckArrival "1" *-- "*" DriverLocationPing : tracks_location
```
