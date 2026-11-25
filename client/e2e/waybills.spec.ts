import { test, expect } from '@playwright/test'
import axe from 'axe-core/webdriver'

/**
 * Waybills Page Tests (GATE_CLERK route)
 * Tests for /waybills route
 * API: GET /api/operations/waybills
 */

test.describe('Waybills Page - /waybills', () => {
  test.use({ storageState: 'waybill-user.json' })

  test.beforeEach(async ({ page }) => {
    // Login as GATE_CLERK
    await page.goto('/login')
    await page.fill('input[name="username"], #username', 'clerk_user')
    await page.fill('input[name="password"], #password', 'ClerkPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/waybills')
  })

  test('should load waybills page with correct title', async ({ page }) => {
    await expect(page.locator('text=Waybills, h1')).toBeVisible()
  })

  test('should display search panel with correct inputs', async ({ page }) => {
    await expect(page.locator('input[placeholder*="waybill"], input[aria-label*="Waybill"]')).toBeVisible()
    await expect(page.locator('select[aria-label*="Status"], text=All Status')).toBeVisible()
  })

  test('should display vessel schedules section', async ({ page }) => {
    await expect(page.locator('text=Vessel Schedules, text=MV Trans Asia')).toBeVisible()
  })

  test('should display notification bell and avatar', async ({ page }) => {
    await expect(page.locator('[aria-label*="notification"], .bell, [role="button"] >> svg')).toBeVisible()
    await expect(page.locator('[aria-label*="avatar"], .avatar, img[alt*="User"]')).toBeVisible()
  })

  test('API integration: should call GET /api/operations/waybills on load', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/operations/waybills') && response.status() === 200
      ),
      page.goto('/waybills')
    ])
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  test('accessibility: should pass axe-core WCAG 2.2 AA', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('accessibility: should have proper table markup', async ({ page }) => {
    // Table should have proper headers
    const tableHeaders = await page.locator('th, [role="columnheader"], [role="rowheader"]').count()
    expect(tableHeaders).toBeGreaterThan(0)
  })

  test('visual regression: viewport at 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/waybills')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/waybills/desktop.png' })
  })

  test('visual regression: viewport at 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/waybills')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/waybills/tablet.png' })
  })

  test('visual regression: viewport at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/waybills')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/waybills/mobile.png' })
  })
})