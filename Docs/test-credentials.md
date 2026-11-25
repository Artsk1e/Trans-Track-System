# Test Credentials for QA Testing

## Test Users

### Executive User (EXECUTIVE role)
- **Username**: `exec_user`
- **Password**: `ExecPass123!`
- **Expected Redirect**: `/dashboard`
- **API Endpoint**: GET `/api/executive/metrics` or GET `/api/executive/summary`

### Gate Clerk User (GATE_CLERK role)
- **Username**: `clerk_user`
- **Password**: `ClerkPass123!`
- **Expected Redirect**: `/waybills`
- **API Endpoints**: 
  - GET `/api/operations/waybills`
  - POST `/api/gate/check-in`

## Expected API Responses

### POST /api/auth/login
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "accessToken": "...",
    "user": {
      "id": 1,
      "user_id": 1,
      "username": "exec_user",
      "first_name": "Executive",
      "last_name": "User",
      "role": "EXECUTIVE"
    }
  }
}
```

## Seed SQL for Developers

```sql
-- Insert reference statuses
INSERT INTO payment_statuses (payment_code, payment_name) VALUES
('UNPAID', 'Unpaid'),
('PAID', 'Paid'),
('PARTIAL', 'Partial'),
('REFUNDED', 'Refunded');

INSERT INTO waybill_statuses (status_code, status_name, description, sequence_order) VALUES
('BOOKED', 'Booked', 'Waybill created and capacity deducted', 1),
('GATE_CHECK-IN', 'Gate Check-In', 'Truck arrived at gate', 2),
('LOADED', 'Loaded', 'Cargo loaded onto vessel', 3),
('IN_TRANSIT', 'In Transit', 'Voyage in progress', 4),
('AT_DESTINATION', 'At Destination', 'Arrived at destination port', 5),
('DELIVERED', 'Delivered', 'Cargo delivered to consignee', 6),
('CANCELLED', 'Cancelled', 'Waybill cancelled', 7);

-- Insert test users with bcrypt-hashed passwords
-- Password: ExecPass123!
INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES
('exec_user', '$2b$10$KIXxu2M4cYvZ9qLQvN5QeO3GkL8mJ7nH5pR9sT1uV2w3x4y5z6A7B8C9D0E1F2', 'Executive', 'User', 'EXECUTIVE');

-- Password: ClerkPass123!
INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES
('clerk_user', '$2b$10$KIXxu2M4cYvZ9qLQvN5QeO3GkL8mJ7nH5pR9sT1uV2w3x4y5z6A7B8C9D0E1F2', 'Clerk', 'User', 'GATE_CLERK');

-- Password: OicPass123!
INSERT INTO users (username, password_hash, first_name, last_name, role) VALUES
```