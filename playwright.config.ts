import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { env } from './config/environment';

// Scenarios tagged @broken hold the intentionally brittle locators for the
// self-healing exercise. They are excluded unless INCLUDE_BROKEN=true.
const includeBroken = process.env.INCLUDE_BROKEN === 'true';
// Keep the broken run's artefacts apart so they never overwrite the main results.
const reportRoot = includeBroken ? 'reports/broken-run' : 'reports';

const testDir = defineBddConfig({
  features: 'tests/features/**/*.feature',
  steps: ['tests/steps/**/*.ts'],
  featuresRoot: 'tests/features',
  tags: includeBroken ? undefined : 'not @broken',
});

export default defineConfig({
  testDir,
  outputDir: `${reportRoot}/test-results`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: `${reportRoot}/playwright-html`, open: 'never' }],
    ['junit', { outputFile: `${reportRoot}/junit/results.xml` }],
    ['json', { outputFile: `${reportRoot}/json/results.json` }],
    cucumberReporter('html', { outputFile: `${reportRoot}/cucumber/report.html` }),
    cucumberReporter('json', { outputFile: `${reportRoot}/cucumber/report.json` }),
  ],
  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    screenshot: 'on',
    trace: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },
  projects: [
    { name: 'ui', testMatch: /ui[\\/].*\.spec\.js$/, use: { ...devices['Desktop Chrome'] } },
    { name: 'api', testMatch: /api[\\/].*\.spec\.js$/, use: { screenshot: 'off' } },
    { name: 'sql', testMatch: /sql[\\/].*\.spec\.js$/, use: { ...devices['Desktop Chrome'], screenshot: 'off' } },
    { name: 'self-healing', testMatch: /self-healing[\\/].*\.spec\.js$/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: env.startApp
    ? {
        command: 'node app/server.js',
        url: `${env.baseUrl}/health`,
        env: { PORT: String(env.appPort) },
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      }
    : undefined,
});
