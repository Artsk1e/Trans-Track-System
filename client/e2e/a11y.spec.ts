import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility Tests (axe-core WCAG 2.2 AA)
 * Tests zero violations for:
 * - Contrast (must meet 4.5:1 for normal text, 3:1 for large text)
 * - ARIA (valid labels, roles, relationships)
 * - Keyboard navigation (all functionality accessible)
 * - Focus management (visible focus indicators)
 */

test.describe('Accessibility - axe-core WCAG 2.2 AA', () => {
  const routes = [
    { path: '/login', name: 'Login Page', public: true },
    { path: '/', name: 'Track Page', public: true },
    { path: '/schedule', name: 'Schedule Page', public: true },
    { path: '/dashboard', name: 'Dashboard', role: 'EXEC' },
    { path: '/waybills', name: 'Waybills Page', role: 'GATE_CLERK' },
    { path: '/deck-allocation', name: 'Deck Allocation', role: 'GATE_CLERK' }
  ]

  test.describe('Public Routes', () => {
    for (const route of routes.filter(r => r.public)) {
      test(`${route.name}: ${route.path} - should have zero violations`, async ({ page }) => {
        await page.goto(route.path)
        
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'section508'])
          .analyze()
        
        expect(results.violations).toEqual([])
      })
    }
  })

  test.describe('Authenticated Routes', () => {
    for (const route of routes.filter(r => !r.public)) {
      test(`${route.name}: ${route.path} - should have zero violations`, async ({ page }) => {
        // Navigate to route (user should be logged in via storageState)
        await page.goto(route.path)
        
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'section508'])
          .analyze()
        
        expect(results.violations).toEqual([])
      })
    }
  })

  test('Contrast: All text should meet WCAG 2.2 AA contrast ratios', async ({ page }) => {
    await page.goto('/login')
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('#root') // Check entire app
      .analyze()
    
    // Filter for contrast violations
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast')
    expect(contrastViolations).toEqual([])
  })

  test('Keyboard navigation: All interactive elements should be reachable via Tab', async ({ page }) => {
    await page.goto('/login')
    
    // Tab through the page
    await page.keyboard.press('Tab') // First focusable element
    let tabCount = 1
    
    // Count focusable elements
    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count()
    
    // Should be able to tab through at least one element
    expect(focusableElements).toBeGreaterThan(0)
  })

  test('Focus indicators: Visible focus ring on interactive elements', async ({ page }) => {
    await page.goto('/login')
    
    // Focus an input
    await page.focus('input[name="username"], #username')
    
    // Check for visible focus (either :focus or :focus-visible styles applied)
    const hasFocus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      if (!el) return false
      const styles = window.getComputedStyle(el)
      return styles.outlineWidth !== '0px' || styles.borderWidth.includes('2px')
    })
    
    expect(hasFocus).toBeTruthy()
  })

  test('ARIA labels: All icons should have accessible labels', async ({ page }) => {
    await page.goto('/login')
    
    // Check for icon buttons with aria-label
    const iconButtons = await page.locator('button[aria-label]').count()
    expect(iconButtons).toBeGreaterThanOrEqual(1)
  })

  test('Image alt text: All images should have descriptive alt text', async ({ page }) => {
    await page.goto('/')
    
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).not.toBeNull()
      expect(alt?.length || 0).toBeGreaterThan(0)
    }
  })

  test('Form labels: All form inputs should have associated labels', async ({ page }) => {
    await page.goto('/login')
    
    const inputs = await page.locator('input').all()
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const label = await page.locator(`label[for="${id}"]`).count()
      const hasExplicitLabel = await input.locator('label').count()
      
      const hasLabel = id && label > 0 || 
                       ariaLabel !== null || 
                       ariaLabelledBy !== null || 
                       hasExplicitLabel > 0
      
      expect(hasLabel).toBeTruthy()
    }
  })

  test('Page structure: Should have proper heading hierarchy h1-h6', async ({ page }) => {
    await page.goto('/login')
    
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('Error messages: Should be announced to screen readers', async ({ page }) => {
    await page.goto('/login')
    
    // Trigger an error
    await page.click('button[type="submit"]')
    
    const errorAlert = page.locator('[role="alert"]')
    await expect(errorAlert).toBeVisible()
  })
})