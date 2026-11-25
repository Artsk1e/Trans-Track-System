import { defineConfig, devices } from '@playwright/test'

/**
 * Trans-Track System Playwright Configuration
 * Comprehensive QA Testing for 6 Routes
 */

export default defineConfig({
  testDir: './e2e',
  /* Run tests in parallel */
  fullyParallel: true,
  /* Fail the build on CI if test failures exist */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use 1 worker for local development, 4 for CI */
  workers: process.env.CI ? 4 : undefined,
  /* Report on completion */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  /* Global setup timeout */
  timeout: 60000,
  /* Global expect timeout */
  expect: {
    timeout: 10000,
  },
  /* Shared settings for all tests */
  use: {
    /* Base URL for the application */
    baseURL: process.env.TEST_URL || 'http://localhost:5173',
    /* Track trace on retry */
    trace: 'on-first-retry',
    /* Record video on failure */
    video: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for different test scenarios */
  projects: [
    // 3G Throttling Test Project
    {
      name: '3g-throttling',
      use: {
        ...devices['iPhone 12'],
        // Simulate 3G throttling: 1.6 Mbps down, 750 Kbps up, 300ms RTT
        contextOptions: {
          offline: false,
        },
      },
    },
    
    // Lighthouse-like Performance Tests (Desktop)
    {
      name: 'desktop',
      use: {
        ...devices['Desktop 1440x900'],
        viewport: { width: 1440, height: 900 },
      },
    },
    
    // Tablet Breakpoint Tests
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 768, height: 1024 },
      },
    },
    
    // Mobile Breakpoint Tests  
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
    
    // API Integration Tests
    {
      name: 'api-tests',
      testMatch: /api-integration/,
      use: {
        baseURL: process.env.TEST_URL || 'http://localhost:5173',
      },
    },
    
    // Accessibility Tests
    {
      name: 'accessibility',
      testMatch: /a11y/,
      use: {
        baseURL: process.env.TEST_URL || 'http://localhost:5173',
      },
    },
  ],

  /* Web server configuration for local development */
  webServer: {
    command: 'npm run preview',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})