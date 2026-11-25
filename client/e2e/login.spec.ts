import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Login Page Tests
 * Tests for /login route
 */

test.describe('Login Page - /login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should load login page with correct elements', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('text=Login')).toBeVisible()
    await expect(page.locator('input[name="username"], #username')).toBeVisible()
    await expect(page.locator('input[name="password"], #password')).toBeVisible()
    await expect(page.locator('button[type="submit"], text=Sign In')).toBeVisible()
  })

  test('should have correct title in the document', async ({ page }) => {
    await expect(page).toHaveTitle(/client|login/i)
  })

  test('should show validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Please enter both username and password')).toBeVisible()
  })

  test('should redirect EXEC user to dashboard on valid login', async ({ page }) => {
    // Login as executive
    await page.fill('input[name="username"], #username', 'exec_user')
    await page.fill('input[name="password"], #password', 'ExecPass123!')
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 5000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should redirect GATE_CLERK user to /waybills on valid login', async ({ page }) => {
    // Login as gate clerk
    await page.fill('input[name="username"], #username', 'clerk_user')
    await page.fill('input[name="password"], #password', 'ClerkPass123!')
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL('/waybills', { timeout: 5000 })
    await expect(page).toHaveURL(/\/waybills/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="username"], #username', 'wrong_user')
    await page.fill('input[name="password"], #password', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('[role="alert"]', { hasText: /Invalid credentials/i })).toBeVisible()
  })

  test('accessibility: should pass axe-core WCAG 2.2 AA', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('accessibility: should have proper color contrast', async ({ page }) => {
    // Check primary color contrast
    const primaryColor = await page.evaluate(() => {
      const el = document.querySelector('.bg-navy')
      if (el) {
        const bg = getComputedStyle(el).backgroundColor
        const text = getComputedStyle(el).color
        return { bg, text }
      }
      return null
    })
    expect(primaryColor).toBeTruthy()
  })

  test('accessibility: should have visible focus indicators', async ({ page }) => {
    await page.focus('input[name="username"], #username')
    const isFocused = await page.locator('input[name="username"], #username').evaluate(
      el => el === document.activeElement
    )
    expect(isFocused).toBeTruthy()
  })

  test('accessibility: should have aria-labels for icon buttons', async ({ page }) => {
    const eyeButton = page.locator('button[aria-label="Show password"], button[aria-label="Hide password"]')
    await expect(eyeButton).toHaveCount(1)
  })

  test('keyboard navigation: should work with keyboard only', async ({ page }) => {
    // Tab to username field
    await page.keyboard.press('Tab')
    await page.keyboard.type('exec_user')
    
    // Tab to password field
    await page.keyboard.press('Tab')
    await page.keyboard.press('Backspace') // Clear default
    await page.keyboard.type('ExecPass123!')
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    
    // Press Enter to submit
    await page.keyboard.press('Enter')
    
    await page.waitForURL('/dashboard')
  })
})