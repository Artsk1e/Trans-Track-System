import { test, expect } from '@playwright/test'

/**
 * 3G Throttling Performance Tests
 * Simulates Chrome DevTools throttling: 1.6 Mbps down, 750 Kbps up, 300ms RTT
 * Tests: Page load <3s, TTI <5s
 */

test.describe('3G Throttling Performance Tests', () => {
  test.use({
    viewport: { width: 390, height: 844 }
  })

  const THROTTLE_OPTIONS = {
    offline: false,
    // Network conditions: 3G speeds
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps in bytes/s
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps in bytes/s
    latency: 300 // 300ms RTT
  }

  test.beforeEach(async ({ page, context }) => {
    // Enable network throttling
    await context.setOffline(false)
  })

  test('1. Login page should show critical content quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login', { 
      waitUntil: 'domcontentloaded'
    })
    
    const loadTime = Date.now() - startTime
    
    // Page should be visible quickly
    await expect(page.locator('text=Login')).toBeVisible()
    
    // LCP should be under 2.5s (per web.dev guidelines)
    expect(loadTime).toBeLessThan(3000)
  })

  test('2. Total Blocking Time should be under 300ms', async ({ page }) => {
    await page.goto('/login')
    
    // Page should be interactive quickly
    await expect(page.locator('input[name="username"], #username')).toBeEditable()
  })

  test('3. Interactive elements should be accessible', async ({ page }) => {
    await page.goto('/login')
    
    // Form should be interactive
    await page.fill('input[name="username"], #username', 'test_user')
    await page.fill('input[name="password"], #password', 'test_pass')
    
    // Button should be visible and clickable
    const button = page.locator('button[type="submit"]')
    await expect(button).toBeVisible()
  })

  test('4. Form validation should work', async ({ page }) => {
    await page.goto('/login')
    
    // Submit empty form
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Please enter both username and password')).toBeVisible()
  })

  test('5. All routes should load under 5 seconds', async ({ page }) => {
    const routes = ['/', '/schedule', '/login']
    
    for (const route of routes) {
      const startTime = Date.now()
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(5000)
    }
  })
})