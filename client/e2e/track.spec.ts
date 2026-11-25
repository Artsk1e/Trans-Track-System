import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Track Page Tests (Public route)
 * Tests for / (root) route
 */

test.describe('Track Page - / (Public)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load track page with hero section', async ({ page }) => {
    await expect(page.locator('text=Track')).toBeVisible()
    await expect(page.locator('text=Ship')).toBeVisible()
  })

  test('should display track form', async ({ page }) => {
    await expect(page.locator('input[aria-label*="Waybill"], input[placeholder*="Waybill"]')).toBeVisible()
    await expect(page.locator('button[type="submit"], text=Track')).toBeVisible()
  })

  test('should display vessel schedules section below the fold', async ({ page }) => {
    // Scroll to see vessel schedules
    await page.locator('text=Vessel Schedules, text=Schedule').scrollIntoViewIfNeeded()
    await expect(page.locator('text=Vessel Schedules')).toBeVisible()
  })

  test('public form should be accessible without login', async ({ page }) => {
    // Refresh should still show the form
    await page.reload()
    await expect(page.locator('input[aria-label*="Waybill"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('track form should have accessible name', async ({ page }) => {
    const input = page.locator('input[aria-label*="Waybill"], input[placeholder*="Waybill"]').first()
    const ariaLabel = await input.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
  })

  test('visual regression: viewport at 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/track/desktop.png' })
  })

  test('visual regression: viewport at 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/track/tablet.png' })
  })

  test('visual regression: viewport at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.screenshot({ path: 'docs/ui-reconstruction/screenshots/track/mobile.png' })
  })

  test('accessibility: should pass axe-core WCAG 2.2 AA', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('keyboard navigation: form should be navigable', async ({ page }) => {
    // Tab to the input
    await page.keyboard.press('Tab')
    await page.keyboard.type('WB-2026-001')
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    
    // Verify focus is on button
    const isFocused = await page.keyboard.evaluate(() => document.activeElement?.tagName === 'BUTTON')
    expect(isFocused).toBeTruthy()
  })
})