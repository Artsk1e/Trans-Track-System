import { chromium, Browser, Page } from 'playwright'
import fs from 'fs'

/**
 * Setup script to generate storage state files for authenticated tests
 * Run with: npx ts-node e2e/setup-storage.ts
 * 
 * Generates:
 * - waybill-user.json (GATE_CLERK)
 * - dashboard-user.json (EXECUTIVE)
 * - staff-user.json (GATE_CLERK)
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api'
const BASE_URL = process.env.TEST_URL || 'http://localhost:5173'

interface TestUser {
  username: string
  password: string
  role: string
  outputPath: string
}

const testUsers: TestUser[] = [
  { username: 'clerk_user', password: 'ClerkPass123!', role: 'GATE_CLERK', outputPath: 'waybill-user.json' },
  { username: 'clerk_user', password: 'ClerkPass123!', role: 'GATE_CLERK', outputPath: 'staff-user.json' },
  { username: 'exec_user', password: 'ExecPass123!', role: 'EXECUTIVE', outputPath: 'dashboard-user.json' },
]

async function loginAndSaveStorage(browser: Browser, user: TestUser): Promise<Page> {
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log(`Logging in as ${user.username}...`)

  try {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
    
    // Fill in credentials
    await page.fill('input[name="username"], #username', user.username)
    await page.fill('input[name="password"], #password', user.password)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for redirect (determined by role)
    const expectedRedirect = user.role === 'EXECUTIVE' ? '/dashboard' : '/waybills'
    await page.waitForURL(expectedRedirect, { timeout: 10000 })
    
    // Save storage state
    await fs.promises.writeFile(
      user.outputPath,
      JSON.stringify(await context.storageState(), null, 2)
    )
    
    console.log(`✓ Saved storage state to ${user.outputPath}`)
    
    await context.close()
    return page
  } catch (error) {
    console.error(`✗ Failed to login as ${user.username}:`, error)
    await context.close()
    throw error
  }
}

async function main() {
  console.log('Starting auth storage setup...')
  console.log(`API Base: ${API_BASE}`)
  console.log(`Test URL: ${BASE_URL}`)
  
  const browser = await chromium.launch({ headless: true })
  
  try {
    // Test if server is running
    await browser.newContext().newPage().goto(BASE_URL).catch(() => {
      console.error('Server is not running. Start with: npm run preview')
      process.exit(1)
    })
  } catch (error) {
    console.error('Could not connect to server')
    console.error('Please start the server first: cd client && npm run preview')
    process.exit(1)
  }
  
  for (const user of testUsers) {
    try {
      await loginAndSaveStorage(browser, user)
    } catch (error) {
      console.error(`Error setting up ${user.username}:`, error)
    }
  }
  
  await browser.close()
  console.log('✓ Storage setup complete')
}

main().catch(console.error)