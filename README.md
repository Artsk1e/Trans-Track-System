# Trans-Track: Operational Fleet & Cargo Visibility System

> **A logistics command center for Trans-Asia Shipping Lines (Iligan City Branch) bridging ground-truth maritime operations and executive digital oversight.**

---

## Executive Summary

**Trans-Track** is a role-based logistics web application designed for **Trans-Asia Shipping Lines** (Iligan City Branch) to resolve severe information asymmetry and key-person dependency centered on the Officer-in-Charge (OIC) and Branch Manager.

While executive-level financial metrics are successfully digitized, daily ground operations previously relied entirely on manual clipboards, unorganized Viber threads, and direct phone calls. Trans-Track digitizes ground operations—connecting Field Operations, Clients, and Upper Management into a unified command platform.

---

## The Core Problems Solved

| Operational Crisis | Impact | Trans-Track Solution |
| :--- | :--- | :--- |
| **Rolling Cargo Blind Spots** | Management has zero visibility on incoming trucks until they reach the port gate. | **Driver SMS/GPS Telemetry**: Real-time location pings provide accurate truck ETAs. |
| **Vessel Loading Delays** | Unknown truck arrival times force chaotic, last-minute deck space allocation. | **Pre-Allocation Engine**: Loadmasters pre-allocate ship deck space prior to arrival. |
| **Manual Viber Executive Reporting** | Upper management manually messages the OIC to check cabin & deck space availability. | **Read-Only Executive Dashboard**: Live auto-deducting cabin room and cargo deck space view. |
| **Client Interruption & OIC Burnout** | Customers call the OIC directly (even on weekends) to check schedules and waybill status. | **Trans-Serve Self-Service Portal**: Public tracking lookup and vessel schedule board. |

---

## System Architecture & 3-Tier Module Breakdown

```
                       +-----------------------------------+
                       |    TRANS-TRACK COMMAND CENTER     |
                       +-----------------------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
+------------------+           +-------------------+           +-------------------+
| FIELD OPERATIONS |           |  CLIENT PORTAL    |           | EXECUTIVE VIEW    |
| (Driver SMS &    |           |  (Trans-Serve     |           | (Capacity         |
| Gate Staging)    |           |   Self-Service)   |           |  Dashboard)       |
+------------------+           +-------------------+           +-------------------+
```

### 1. Driver SMS Tracking (Field Operations View)
* **Zero App Installation**: Drivers receive an expiring tracking link via SMS.
* **Dual Telemetry**: Tapping the link pings browser GPS coordinates; a two-way SMS fallback handles low-data mobile coverage.
* **Proactive Deck Allocation**: Feeds accurate ETAs into the OIC Dispatch Dashboard, allowing loadmasters to pre-assign ship deck space before trucks hit the pier.

### 2. Trans-Serve Client Portal (Client View)
* **Self-Service Tracker**: Customers enter their waybill number to monitor cargo progression across 7 standardized lifecycle stages.
* **Vessel Schedule Board**: Public display of active voyage schedules and departure times.
* **Auto-Responder Integration**: SMS/Viber auto-responders automatically redirect client inquiries to the portal.

### 3. Executive Capacity Dashboard (Executive View)
* **Live Deck & Cabin Monitoring**: Real-time read-only view of remaining vessel deck square footage (`total_deck_sqft`) and cabin room accommodations.
* **Auto-Deduction Engine**: Deducts cargo square footage and booked rooms the exact second a waybill is generated at the gate.

---

## 3-Phase Operational Workflow

### **Phase 1: Fleet Tracking & Deck Allocation**
1. Automated SMS tracking link sent to the driver's mobile device.
2. Driver taps GPS link (or text reply triggers SMS fallback).
3. Driver location and accurate ETA pinged to the OIC Dispatch Dashboard.
4. Loadmaster pre-allocates ship deck space to eliminate loading delays.

### **Phase 2: Port Arrival & Executive Reporting**
1. Truck arrives at the port gate; staff process entry via a **Single-Entry Gate** schema (`waybill_id` UNIQUE) to prevent double encoding.
2. Backend algorithm deducts allocated cargo space from `voyages.remaining_sqft` and `remaining_rooms`.
3. Live updates instantly push to the **Executive Capacity Dashboard**.

### **Phase 3: Client Self-Service**
1. Client contacts OIC via SMS/Viber and receives an automated link redirection.
2. Client accesses the **Trans-Serve Client Portal** to independently check vessel schedules and cargo status progress bars.

---

## Relational Database Architecture

The system is built on a **11-table PostgreSQL relational database** designed for low-bandwidth environments at the pier:

```
                          +-------------------+
                          |       PORTS       |
                          +---------+---------+
                                    |
                                    v
+-------------------+     +-------------------+     +-------------------+
|      VESSELS      |---->|      VOYAGES      |<----|      CLIENTS      |
+-------------------+     +---------+---------+     +-------------------+
                                    |
                                    v
+-------------------+     +-------------------+     +-------------------+
| PAYMENT_STATUSES  |---->|     WAYBILLS      |<----| WAYBILL_STATUSES  |
+-------------------+     +----+----+---------+     +-------------------+
                               |    |
             +-----------------+    +-----------------+
             |                                        |
             v                                        v
+-------------------+                      +-------------------+
|  TRUCK_ARRIVALS   |                      | WAYBILL_STATUS_LOG|
+---------+---------+                      +-------------------+
          |
          v
+-------------------+
|DRIVER_LOCATION_PINGS|
+-------------------+
```

### Table Summary
* **Master Reference**: `ports`, `vessels`, `payment_statuses`, `waybill_statuses`
* **Core Operations**: `voyages`, `clients`, `users`, `waybills`
* **Telemetry & Execution**: `truck_arrivals`, `driver_location_pings`, `waybill_status_log`

---

## Tech Stack & Prerequisites

* **Frontend**: React.js, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL (PERN Stack)
* **Telemetry**: Browser Geolocation API / SMS Gateway Integration

---

