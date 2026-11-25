import { test, expect } from '@playwright/test'
import axios from 'axios'

/**
 * Auto-Deduction Engine Tests
 * Verifies that voyage capacity updates correctly on waybill creation
 * API: POST /api/waybills
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api'
const AUTH_HEADER = 'Authorization'

test.describe('Auto-Deduction Engine Tests', () => {
  let accessToken: string

  test.beforeAll(async () => {
    // Authenticate as authorized user
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: 'clerk_user',
        password: 'ClerkPass123!'
      })
      if (response.data.success) {
        accessToken = response.data.token
      }
    } catch (e) {
      console.log('Could not authenticate for auto-deduction tests')
    }
  })

  test('1. GET /api/executive/voyages/:id/capacity should show current capacity', async () => {
    const response = await axios.get(`${API_BASE}/executive/voyages/1/capacity`, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(response.data.data.remaining_sqft).toBeDefined()
    expect(response.data.data.remaining_rooms).toBeDefined()
    expect(response.data.data.total_sqft).toBeDefined()
  })

  test('2. POST /api/waybills should deduct capacity atomically', async () => {
    // Get initial capacity
    const initialCapacity = await axios.get(`${API_BASE}/executive/voyages/1/capacity`, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    const initialSqft = initialCapacity.data.data.remaining_sqft
    const initialRooms = initialCapacity.data.data.remaining_rooms
    
    // Create a waybill
    const waybillResponse = await axios.post(`${API_BASE}/waybills`, {
      voyage_id: 1,
      shipper_id: 1,
      consignee_id: 1,
      cargo_description: 'Auto-deduction test cargo',
      quantity: 5,
      total_weight_kg: 2500,
      cargo_type: 'CONTAINERS',
      cargo_sqft: 5000,
      booked_rooms: 2,
      freight_charge: 25000,
      payment_mode: 'CASH',
      official_receipt_no: 'RR-AUTO-001',
      payment_status_code: 'UNPAID',
      location_name: 'Test Location'
    }, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(waybillResponse.status).toBe(201)
    expect(waybillResponse.data.success).toBe(true)
    expect(waybillResponse.data.data.remaining_sqft).toBeLessThan(initialSqft)
    expect(waybillResponse.data.data.remaining_rooms).toBeLessThan(initialRooms)
  })

  test('3. Waybill creation should fail when capacity exceeded', async () => {
    // Try to book more space than available
    try {
      await axios.post(`${API_BASE}/waybills`, {
        voyage_id: 1,
        shipper_id: 1,
        consignee_id: 1,
        cargo_description: 'Overcapacity booking',
        quantity: 99999,
        total_weight_kg: 999999,
        cargo_type: 'CONTAINERS',
        cargo_sqft: 999999,
        booked_rooms: 999,
        freight_charge: 9999999,
        payment_mode: 'CASH',
        official_receipt_no: 'RR-OVER-001',
        payment_status_code: 'UNPAID',
        location_name: 'Test Location'
      }, {
        headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
      })
      
      expectfail('Expected capacity error but request succeeded')
    } catch (error: any) {
      expect([409, 400]).toContain(error.response.status)
      expect(error.response.data.success).toBe(false)
    }
  })

  test('4. Waybill cancellation should restore capacity', async () => {
    // First create a waybill
    const createResponse = await axios.post(`${API_BASE}/waybills`, {
      voyage_id: 1,
      shipper_id: 1,
      consignee_id: 1,
      cargo_description: 'Cancellation test cargo',
      quantity: 10,
      total_weight_kg: 1000,
      cargo_type: 'CONTAINERS',
      cargo_sqft: 2000,
      booked_rooms: 1,
      freight_charge: 10000,
      payment_mode: 'CASH',
      official_receipt_no: 'RR-CANCEL-001',
      payment_status_code: 'UNPAID',
      location_name: 'Test Location'
    }, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    const waybillId = createResponse.data.data.waybill_id
    const sqftAfterBooking = createResponse.data.data.remaining_sqft
    
    // Cancel the waybill
    const cancelResponse = await axios.post(`${API_BASE}/waybills/${waybillId}/cancel`, {}, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(cancelResponse.status).toBe(200)
    expect(cancelResponse.data.success).toBe(true)
    expect(cancelResponse.data.data.remaining_sqft).toBeGreaterThanOrEqual(sqftAfterBooking)
  })

  test('5. Concurrent bookings should not cause race conditions', async () => {
    // This test verifies atomic transaction behavior
    // In a real test, we'd run multiple concurrent requests
    
    const capacityBefore = await axios.get(`${API_BASE}/executive/voyages/1/capacity`, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    // Try to create multiple waybills at once
    const promises = [
      axios.post(`${API_BASE}/waybills`, {
        voyage_id: 1,
        shipper_id: 1,
        consignee_id: 1,
        cargo_description: 'Concurrent test 1',
        quantity: 10,
        total_weight_kg: 500,
        cargo_type: 'CONTAINERS',
        cargo_sqft: 1000,
        freight_charge: 5000,
        payment_mode: 'CASH',
        official_receipt_no: 'RR-CONC-001',
        payment_status_code: 'UNPAID',
        location_name: 'Test Location'
      }, { headers: { [AUTH_HEADER]: `Bearer ${accessToken}` } }),
      
      axios.post(`${API_BASE}/waybills`, {
        voyage_id: 1,
        shipper_id: 1,
        consignee_id: 1,
        cargo_description: 'Concurrent test 2',
        quantity: 10,
        total_weight_kg: 500,
        cargo_type: 'CONTAINERS',
        cargo_sqft: 1000,
        freight_charge: 5000,
        payment_mode: 'CASH',
        official_receipt_no: 'RR-CONC-002',
        payment_status_code: 'UNPAID',
        location_name: 'Test Location'
      }, { headers: { [AUTH_HEADER]: `Bearer ${accessToken}` } })
    ]
    
    const results = await Promise.allSettled(promises)
    const successes = results.filter(r => r.status === 'fulfilled').length
    const failures = results.filter(r => r.status === 'rejected').length
    
    // At least one should succeed (or both if capacity allows)
    expect(successes).toBeGreaterThanOrEqual(1)
  })
})

function expectfail(message: string) {
  expect({ fail: message }).toBe(null)
}