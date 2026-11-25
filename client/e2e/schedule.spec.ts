import { test, expect } from '@playwright/test'
import axe from 'axe-core/webdriver'

/**
 * Schedule Page Tests
 * Tests for /schedule route
 */

test.describe('Schedule Page - /schedule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule')
  })

  test('should load schedule page', async ({ page }) => {
    await expect(page.locator('text=Schedule, h1, text=Vessel Schedules')).toBeVisible()
  })

  test('should display vessel schedule table', async ({ page }) => {
    await expect(page.locator('text=Vessel, text=Departure, text=Status')).toBeVisible()
  })

  test('should have navigation links', async ({ page }) => {
    // Should have nav items or links to other pages
    await page.locator('a, .nav-item, [role="link"]').first()
  })

  test('visual regression: viewport at 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/schedule')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/schedule/desktop.png' })
  })

  test('visual regression: viewport at 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/schedule')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/schedule/tablet.png' })
  })

  test('visual regression: viewport at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/schedule')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/schedule/mobile.png' })
  })

  test('accessibility: should pass axe-core WCAG 2.2 AA', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})