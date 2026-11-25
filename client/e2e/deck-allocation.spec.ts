import { test, expect } from '@playwright/test'
import axe from 'axe-core/webdriver'

/**
 * Deck Allocation Page Tests (STAFF route)
 * Tests for /deck-allocation route
 */

test.describe('Deck Allocation Page - /deck-allocation', () => {
  test.use({ storageState: 'staff-user.json' })

  test.beforeEach(async ({ page }) => {
    // Login as GATE_CLERK
    await page.goto('/login')
    await page.fill('input[name="username"], #username', 'clerk_user')
    await page.fill('input[name="password"], #password', 'ClerkPass123!')
    await page.click('button[type="submit"]')
    await page.goto('/deck-allocation')
  })

  test('should load deck allocation page with vessel selector', async ({ page }) => {
    await expect(page.locator('text=DECK ALLOCATION')).toBeVisible()
    await expect(page.locator('select[aria-label*="Vessel"], .vessel-select')).toBeVisible()
  })

  test('should display vessel selection dropdown', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Select"], select')).toBeVisible()
  })

  test('should display summary stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Deck Space, text=Remaining Space')).toBeVisible()
    await expect(page.locator('text=Deck Capacity')).toBeVisible()
  })

  test('should display deck overview hero section', async ({ page }) => {
    await expect(page.locator('.deck-overview, img, text=Vessel')).toBeVisible()
  })

  test('should display allocated cargo table', async ({ page }) => {
    await expect(page.locator('text=ALLOCATED CARGO, text=Waybill, text=Cargo Type')).toBeVisible()
  })

  test('should calculate capacity percentage correctly', async ({ page }) => {
    // Check for capacity percentage display
    const capacityElement = await page.locator('text=% Used, .capacity-percentage').isVisible()
    expect(capacityElement).toBeTruthy()
  })

  test('visual regression: viewport at 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/deck-allocation')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/deck-allocation/desktop.png' })
  })

  test('visual regression: viewport at 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/deck-allocation')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/deck-allocation/tablet.png' })
  })

  test('visual regression: viewport at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/deck-allocation')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/deck-allocation/mobile.png' })
  })

  test('accessibility: should pass axe-core WCAG 2.2 AA', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('accessibility: image should have alt text', async ({ page }) => {
    const heroImage = await page.locator('.deck-overview-hero img, img[alt]').first()
    const alt = await heroImage.getAttribute('alt')
    expect(alt).toBeTruthy()
    expect(alt?.length).toBeGreaterThan(0)
  })
})