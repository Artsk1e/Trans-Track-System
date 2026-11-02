# Trans-Track Database Documentation & Initialization Guide

## 1. Executive Summary & System Overview

**Trans-Track** is an operational fleet and cargo visibility web application designed for Trans-Asia Shipping Lines (Iligan City branch). It bridges the critical technological gap between executive-level financial metrics and ground-level logistics operations.

### The Operational Challenge Solved
Historically, daily ground operations relied heavily on fragmented communication (personal phone calls, physical paper waybills, and unorganized Viber messaging threads). This caused severe information asymmetry, key-person dependency on the Officer-in-Charge (OIC), rolling cargo blind spots, vessel loading delays, and client interruption burnout.

### Database Architecture Objectives
The underlying PostgreSQL database schema is meticulously structured across **11 core relational tables** and **8 custom PostgreSQL `ENUM` types** to support:
1. **Driver SMS & GPS Telemetry Tracking:** Eliminating rolling cargo blind spots by associating arriving trucks with temporary expiring SMS tokens and continuous location pings.
2. **Single-Entry Gate Enforcement:** Preventing double encoding and ensuring rigorous data integrity at the port gate via a 1-to-1 unique relationship constraint (`waybill_id` UNIQUE in `truck_arrivals`).
3. **Auto-Deduction Engine:** Instantly deducting deck square footage (`cargo_sqft`) and cabin room allocations (`booked_rooms`) from active `voyages` the exact moment a waybill is generated.
4. **Real-Time Executive Capacity & Client Self-Service Portals:** Supplying live data feeds to upper management and clients without requiring manual Viber messaging or tying up the OIC's personal phone.

---

## 2. Schema Structure & Table Breakdown

### A. Master Reference Tables
- **`ports`**: Stores port terminals (`ILG`, `CEB`) across the shipping route.
- **`vessels`**: Defines physical ship specifications, capacity limits, total deck space (`total_deck_sqft`), and cabin accommodations (`total_cabin_rooms`).
- **`payment_statuses`**: Standardizes payment codes (`UNPAID`, `PAID`, `PARTIAL`, `REFUNDED`).
- **`waybill_statuses`**: Controls valid operational lifecycle steps and client progress bar ordering (`sequence_order` 1 to 7).

### B. Core Operational Entities
- **`voyages`**: Scheduled trips between origin and destination ports maintaining dynamic capacity staging (`remaining_sqft`, `remaining_rooms`).
- **`clients`**: Master directory for shippers, consignees, and commercial customers.
- **`users`**: Internal staff accounts classified by role (`GATE_CLERK`, `OIC_LOADMASTER`, `EXECUTIVE`, `ADMIN`).
- **`waybills`**: Central booking and cargo manifest entity linking shipments to voyages, clients, and payment records.

### C. Execution & Telemetry Tracking
- **`waybill_status_log`**: Immutable chronological audit trail of every status transition.
- **`truck_arrivals`**: Manages port gate check-ins and tracks incoming trucks heading toward the pier.
- **`driver_location_pings`**: Records continuous location pings (GPS browser pings or Two-Way SMS fallback replies).

---

## 3. How to Execute the Database Initialization Script

To initialize the database in a PostgreSQL environment, run the following SQL script using your preferred database client (e.g., `psql`, pgAdmin, DBeaver):

```bash
psql -U your_username -d your_database_name -f schema/init.sql
```

### Safety Features Included:
- Cascading drop commands (`DROP TABLE IF EXISTS ... CASCADE`) ensuring safe script re-execution during development.
- Strict foreign key constraints with appropriate deletion rules (`RESTRICT`, `CASCADE`, `SET NULL`) to preserve historical accounting and operational integrity.
- Performance optimization indexes (`CREATE INDEX`) on all foreign key columns and frequently queried relational paths.
