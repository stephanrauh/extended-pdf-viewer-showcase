import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4200';
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: './.playwright-results',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: './.playwright-report', open: 'never' }],
  ],

  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      // The pdf.js toolbar hides First/Last/Find/Tools/page-input at narrow
      // widths. 1920x1080 keeps the showcase + viewer in a layout that shows
      // the full toolbar.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      // Added for stephanrauh/ngx-extended-pdf-viewer#3210 — pdf.js's
      // `for await (const value of readableStream)` in getTextContent()
      // throws "undefined is not a function" in Safari, breaking find
      // across the whole document. Run the find tests against Playwright's
      // WebKit to gate the api.js patch.
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },
  ],

  webServer: {
    command: 'npm run ts',
    cwd: '..',
    url: BASE_URL,
    reuseExistingServer: !CI,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
