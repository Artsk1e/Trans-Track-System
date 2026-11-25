# API Contracts

## Overview
Request/response examples for all Trans-Track REST endpoints. Used for contract testing and frontend integration.

---

## Authentication

### POST `/api/auth/login`
**Request**
```json
{ "email": "clerk@transasia.com", "password": "securePass123" }
```
**Response (200)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "user": { "id": 1, "email": "clerk@transasia.com", "role": "GATE_CLERK", "full_name": "Juan Dela Cruz" }
  },
  "message": "Login successful"
}
```

### POST `/api/auth/refresh`
**Request**
```json
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJl..." }
```
**Response (200)**
```json
{ "success": true, "data": { "accessToken": "eyJhbGciOiJIUzI1NiIs..." }, "message": "Token refreshed" }
```

---

## Public (No Auth)

### GET `/api/public/waybills/:waybillNumber`
**Response (200)**
```json
{
  "success": true,
  "data": {
    "waybill_number": "WB-2024-001234",
    "status": "LOADED",
    "client_name": "San Miguel Corp",
    "voyage_number": "V-101",
    "vessel_name": "MV Trans-Asia 1",
    "origin_port": "ILG",
    "destination_port": "CEB",
    "cargo_sqft": 120,
    "booked_rooms": 1,
    "etd": "2024-01-15T06:00:00Z",
    "eta": "2024-01-15T18:00:00Z",
    "status_history": [
      { "status": "BOOKED", "timestamp": "2024-01-10T08:00:00Z", "updated_by": "client" },
      { "status": "GATE_CHECKED_IN", "timestamp": "2024-01-14T22:00:00Z", "updated_by": "gate_clerk_1" },
      { "status": "LOADED", "timestamp": "2024-01-15T05:30:00Z", "updated_by": "admin_1" }
    ]
  }
}
```

---

## Gate Clerk (GATE_CLERK role)

### GET `/api/gate/waybills`
**Query**: `?status=PENDING_GATE&page=1&limit=20`
**Response (200)**
```json
{
  "success": true,
  "data": [
    { "waybill_number": "WB-2024-001235", "client_name": "Universal Robina", "cargo_sqft": 80, "booked_rooms": 0, "voyage_number": "V-101", "etd": "2024-01-15T06:00:00Z" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 47 }
}
```

### POST `/api/gate/check-in`
**Request**
```json
{ "waybill_id": 123, "truck_plate": "ABC-1234", "driver_name": "Pedro Santos", "driver_phone": "+639171234567" }
```
**Response (201)**
```json
{
  "success": true,
  "data": { "truck_arrival_id": 456, "check_in_time": "2024-01-14T22:15:00Z", "gps_token": "gps_abc123xyz" },
  "message": "Gate check-in recorded. GPS token issued for driver."
}
```
**Error (409)**: Duplicate check-in — `UNIQUE(waybill_id)` constraint on `truck_arrivals`

### PATCH `/api/gate/waybills/:id/status`
**Request**
```json
{ "status": "GATE_CHECKED_IN" }
```
**Response (200)**
```json
{ "success": true, "data": { "waybill_id": 123, "status": "GATE_CHECKED_IN", "updated_at": "2024-01-14T22:15:00Z" } }
```

---

## Operations (ADMIN role)

### GET `/api/operations/voyages`
**Query**: `?status=ACTIVE&page=1&limit=10`
**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "voyage_number": "V-101",
      "vessel_name": "MV Trans-Asia 1",
      "origin_port": "ILG",
      "destination_port": "CEB",
      "etd": "2024-01-15T06:00:00Z",
      "total_deck_sqft": 5000,
      "remaining_sqft": 3200,
      "total_cabin_rooms": 50,
      "remaining_rooms": 35,
      "waybills_count": 23,
      "trucks_checked_in": 18,
      "trucks_loaded": 12
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5 }
}
```

### GET `/api/operations/voyages/:id/waybills`
**Response (200)**
```json
{
  "success": true,
  "data": [
    { "waybill_number": "WB-2024-001234", "client_name": "San Miguel Corp", "cargo_sqft": 120, "booked_rooms": 1, "status": "LOADED", "truck_plate": "ABC-1234", "driver_name": "Pedro Santos" }
  ]
}
```

### POST `/api/operations/voyages/:id/load`
**Request**
```json
{ "waybill_ids": [123, 124, 125], "loaded_by": "admin_1" }
```
**Response (200)**
```json
{
  "success": true,
  "data": {
    "loaded_count": 3,
    "remaining_sqft": 2960,
    "remaining_rooms": 33,
    "loaded_waybills": [
      { "waybill_id": 123, "status": "LOADED" },
      { "waybill_id": 124, "status": "LOADED" },
      { "waybill_id": 125, "status": "LOADED" }
    ]
  },
  "message": "3 waybills marked as loaded. Voyage capacity updated."
}
```

### GET `/api/operations/drivers/active`
**Response (200)**
```json
{
  "success": true,
  "data": [
    { "truck_arrival_id": 456, "driver_name": "Pedro Santos", "truck_plate": "ABC-1234", "last_ping": "2024-01-14T23:45:00Z", "lat": 8.228, "lng": 124.245, "status": "EN_ROUTE" }
  ]
}
```

---

## Executive (EXECUTIVE role)

### GET `/api/executive/summary`
**Response (200)**
```json
{
  "success": true,
  "data": {
    "active_voyages": 3,
    "total_capacity_sqft": 15000,
    "used_capacity_sqft": 8400,
    "utilization_pct": 56,
    "total_cabin_rooms": 150,
    "used_cabin_rooms": 72,
    "room_utilization_pct": 48,
    "waybills_today": 47,
    "revenue_today": 1250000,
    "pending_payments": 230000
  }
}
```

### GET `/api/executive/voyages/:id/capacity`
**Response (200)**
```json
{
  "success": true,
  "data": {
    "voyage_number": "V-101",
    "vessel_name": "MV Trans-Asia 1",
    "deck": { "total": 5000, "used": 1800, "remaining": 3200, "utilization_pct": 36 },
    "cabins": { "total": 50, "used": 15, "remaining": 35, "utilization_pct": 30 },
    "waybills": [
      { "waybill_number": "WB-2024-001234", "client": "San Miguel Corp", "cargo_sqft": 120, "rooms": 1, "status": "LOADED" }
    ]
  }
}
```

---

## Admin (ADMIN role)

### GET `/api/admin/users`
**Response (200)**
```json
{
  "success": true,
  "data": [
    { "id": 1, "email": "clerk@transasia.com", "full_name": "Juan Dela Cruz", "role": "GATE_CLERK", "is_active": true, "created_at": "2024-01-01T00:00:00Z" }
  ]
}
```

### POST `/api/admin/users`
**Request**
```json
{ "email": "newclerk@transasia.com", "password": "TempPass123!", "full_name": "Maria Santos", "role": "GATE_CLERK" }
```
**Response (201)**
```json
{ "success": true, "data": { "id": 5, "email": "newclerk@transasia.com", "role": "GATE_CLERK" }, "message": "User created" }
```

### GET `/api/admin/audit-logs`
**Query**: `?table=waybills&limit=50`
**Response (200)**
```json
{
  "success": true,
  "data": [
    { "audit_id": 1, "table_name": "waybills", "record_id": 123, "operation": "UPDATE", "old_data": {"status":"GATE_CHECKED_IN"}, "new_data": {"status":"LOADED"}, "changed_by": 2, "changed_at": "2024-01-15T05:30:00Z" }
  ]
}
```

---

## Error Response Format (All Endpoints)

### 400 Validation Error
```json
{ "success": false, "error": "VALIDATION_ERROR", "message": "Invalid input", "details": [{ "field": "cargo_sqft", "message": "Must be positive integer" }] }
```

### 401 Unauthorized
```json
{ "success": false, "error": "UNAUTHORIZED", "message": "Invalid or expired token" }
```

### 403 Forbidden
```json
{ "success": false, "error": "FORBIDDEN", "message": "GATE_CLERK cannot access executive endpoints" }
```

### 404 Not Found
```json
{ "success": false, "error": "NOT_FOUND", "message": "Voyage V-999 not found" }
```

### 409 Conflict
```json
{ "success": false, "error": "CONFLICT", "message": "Waybill WB-2024-001234 already checked in at gate" }
```

### 500 Server Error
```json
{ "success": false, "error": "INTERNAL_ERROR", "message": "An unexpected error occurred" }
```