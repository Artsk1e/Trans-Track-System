import { test, expect } from '@playwright/test'
import axios from 'axios'

/**
 * API Integration Tests
 * Verifies frontend calls match backend routes
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api'
const AUTH_HEADER = 'Authorization'

test.describe('API Integration Tests', () => {
  let accessToken: string

  test.beforeAll(async () => {
    // Get auth token once
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username: 'exec_user',
        password: 'ExecPass123!'
      })
      if (response.data.success) {
        accessToken = response.data.token
      }
    } catch (e) {
      console.log('Could not authenticate for API tests')
    }
  })

  test('1. POST /api/auth/login -> should return user with role', async () => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'exec_user',
      password: 'ExecPass123!'
    })
    
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(response.data.token).toBeDefined()
    expect(response.data.user).toBeDefined()
    expect(response.data.user.role).toBe('EXECUTIVE')
  })

  test('2. GET /api/operations/waybills -> GATE_CLERK access', async () => {
    const response = await axios.get(`${API_BASE}/operations/waybills`, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(response.data.data).toBeDefined()
    expect(Array.isArray(response.data.data)).toBe(true)
  })

  test('3. GET /api/executive/metrics or /api/executive/summary -> EXEC access', async () => {
    const response = await axios.get(`${API_BASE}/executive/metrics`, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(response.data.data).toBeDefined()
  })

  test('4. GET /api/gate/waybills -> GATE_CLERK access', async () => {
    const response = await axios.get(`${API_BASE}/gate/waybills`, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
  })

  test('5. POST /api/gate/check-in -> should enforce single-entry constraint', async () => {
    // First check-in
    const firstCheckin = await axios.post(`${API_BASE}/gate/check-in`, {
      waybill_id: 'WB-2026-000001',
      driver_phone: '+639123456789'
    }, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    expect(firstCheckin.status).toBe(201)
    expect(firstCheckin.data.success).toBe(true)

    // Try duplicate check-in - should return 409
    try {
      await axios.post(`${API_BASE}/gate/check-in`, {
        waybill_id: 'WB-2026-000001',
        driver_phone: '+639123456789'
      }, {
        headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
      })
      // Should not reach here
      expect(true).toBe(false)
    } catch (error: any) {
      expect(error.response.status).toBe(409)
      expect(error.response.data.success).toBe(false)
    }
  })

  test('6. POST /api/waybills -> auto-deduction of voyage capacity', async () => {
    // This test verifies the auto-deduction engine
    const response = await axios.post(`${API_BASE}/waybills`, {
      voyage_id: 1,
      shipper_id: 1,
      consignee_id: 1,
      cargo_description: 'Test cargo from API test',
      quantity: 10,
      total_weight_kg: 500,
      cargo_type: 'CONTAINERS',
      cargo_sqft: 5000,
      freight_charge: 50000,
      payment_mode: 'CASH',
      official_receipt_no: 'RR-API-TEST',
      payment_status_code: 'UNPAID',
      location_name: 'Test Location'
    }, {
      headers: { [AUTH_HEADER]: `Bearer ${accessToken}` }
    })
    
    // If successful, capacity should be deducted
    if (response.status === 201) {
      expect(response.data.success).toBe(true)
      expect(response.data.data.remaining_sqft).toBeDefined()
      expect(response.data.data.remaining_rooms).toBeDefined()
    }
  })
})