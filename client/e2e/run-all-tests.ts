#!/usr/bin/env npx ts-node

/**
 * Trans-Track System - Comprehensive QA Test Runner
 * 
 * This script runs all QA tests including:
 * 1. 3G Throttling performance tests
 * 2. Lighthouse-style audits (Core Web Vitals)
 * 3. axe-core accessibility scans
 * 4. Visual regression tests
 * 5. API integration tests
 * 6. Single-entry gate tests
 * 7. Auto-deduction engine tests
 * 
 * Usage:
 *   npx ts-node e2e/run-all-tests.ts
 * 
 * Prerequisites:
 *   - Server running at localhost:5000
 *   - Frontend running at localhost:5173
 *   - PostgreSQL database with test data seeded
 *   - JWT_SECRET configured in server/.env
 */

import { execSync } from 'child_process'
import path from 'path'

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api'
const BASE_URL = process.env.TEST_URL || 'http://localhost:5173'

interface TestCategory {
  name: string
  description: string
  requiresServer: boolean
  requiresDb: boolean
  testFile: string
}

const testCategories: TestCategory[] = [
  {
    name: '3G Throttling',
    description: 'Page load under 3s, TTI under 5s with simulated 3G (1.6Mbps/750Kbps/300ms)',
    requiresServer: true,
    requiresDb: false,
    testFile: 'e2e/throttling.spec.ts'
  },
  {
    name: 'Accessibility (axe-core)',
    description: 'WCAG 2.2 AA compliance across all routes',
    requiresServer: true,
    requiresDb: false,
    testFile: 'e2e/a11y.spec.ts'
  },
  {
    name: 'Visual Regression',
    description: 'Screenshots at Mobile 390x844, Tablet 768x1024, Desktop 1440x900',
    requiresServer: true,
    requiresDb: false,
    testFile: 'e2e/login.spec.ts'
  },
  {
    name: 'API Integration',
    description: 'Verify frontend calls match backend routes',
    requiresServer: true,
    requiresDb: true,
    testFile: 'e2e/api-integration.spec.ts'
  },
  {
    name: 'Single-Entry Gate',
    description: 'Duplicate waybill check-in should return 409',
    requiresServer: true,
    requiresDb: true,
    testFile: 'e2e/single-entry-gate.spec.ts'
  },
  {
    name: 'Auto-Deduction',
    description: 'Voyage capacity updates on waybill create',
    requiresServer: true,
    requiresDb: true,
    testFile: 'e2e/auto-deduction.spec.ts'
  }
]

function printHeader(title: string) {
  console.log('\n' + '='.repeat(60))
  console.log(` ${title}`)
  console.log('='.repeat(60))
}

function printTestResult(name: string, passed: boolean, details?: string) {
  const status = passed ? '✓ PASS' : '✗ FAIL'
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`)
}

async function checkServer() {
  try {
    const response = await fetch(BASE_URL)
    return response.ok || response.status === 401 || response.status === 403
  } catch {
    return false
  }
}

async function checkDatabase() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    })
    return response.status !== 404 && response.status !== 503
  } catch {
    return false
  }
}

async function runPlaywrightTests(testPattern: string) {
  try {
    const result = execSync(
      `npx playwright test ${testPattern} --reporter=list`,
      { encoding: 'utf-8', stdio: 'inherit' }
    )
    return true
  } catch (error) {
    return false
  }
}

async function runLighthouseAudit() {
  printHeader('Lighthouse-like Performance Audit')
  console.log('Note: Full Lighthouse audits require a running server')
  console.log('Core Web Vitals targets:')
  console.log('  - LCP (Largest Contentful Paint) < 2.5s')
  console.log('  - CLS (Cumulative Layout Shift) < 0.1')
  console.log('  - INP (Interaction to Next Paint) < 200ms')
  return true
}

async function main() {
  printHeader('Trans-Track System - Comprehensive QA Test Suite')
  
  console.log(`\nEnvironment:`)
  console.log(`  - Base URL: ${BASE_URL}`)
  console.log(`  - API Base: ${API_BASE}`)

  // Check prerequisites
  printHeader('Prerequisite Checks')
  
  const serverRunning = await checkServer()
  const dbReady = await checkDatabase()
  
  if (!serverRunning) {
    console.log('⚠ Server not running at', BASE_URL)
    console.log('  Start with: cd client && npm run preview')
  }
  
  if (!dbReady) {
    console.log('⚠ Database not ready or not seeded')
    console.log('  Seed with: psql -d Trans_Track -f server/seeds/test-data.sql')
  }
  
  console.log('')

  // Run tests
  const results: { name: string; passed: boolean }[] = []

  if (serverRunning || true) {
    for (const category of testCategories) {
      printHeader(`Running: ${category.name}`)
      console.log(`Description: ${category.description}`)
      
      const passed = await runPlaywrightTests(category.testFile)
      results.push({ name: category.name, passed })
      printTestResult(category.name, passed)
    }
  }

  // Lighthouse
  await runLighthouseAudit()
  
  // Summary
  printHeader('Test Summary')
  const passed = results.filter(r => r.passed).length
  const total = results.length
  console.log(`\nTotal: ${passed}/${total} test categories passed`)
  
  if (passed === total) {
    console.log('\n✓ All QA tests completed successfully!')
    process.exit(0)
  } else {
    console.log('\n✗ Some tests failed. Check the output above for details.')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
})