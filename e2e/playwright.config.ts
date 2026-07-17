import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4200';
const CI = !!process.env.CI;

// Local parallelism. Playwright's default (`undefined`) is 50% of CPU cores,
// which on a many-core laptop spins up enough Chromium/WebKit instances to
// overheat the machine (pdf.js rendering is CPU-heavy). Cap it lower locally
// and allow an override: E2E_WORKERS=6 npm run test:e2e, or E2E_WORKERS=25%.
// A plain integer must be passed to Playwright as a number; only a
// percentage stays a string (the `workers` option rejects a numeric string).
const workersEnv = process.env.E2E_WORKERS;
const LOCAL_WORKERS: number | string = workersEnv
  ? /^\d+$/.test(workersEnv)
    ? Number(workersEnv)
    : workersEnv
  : '25%';

export default defineConfig({
  testDir: './tests',
  outputDir: './.playwright-results',
  fullyParallel: true,
  forbidOnly: CI,
  // One local retry (CI already retries). The interaction tests that flake are
  // all annotation-editor gestures (highlight drag, free-text type, ink draw).
  // pdf.js loads the editor code lazily, and the first such gesture in a fresh
  // browser session — before that code is warm — can be dropped outright: the
  // annotation never lands, so no longer timeout would rescue it. The retry
  // re-runs the whole gesture in the now-warm session, which is exactly what
  // this needs. (A route-warmup project was tried and removed: the warm state
  // is per browser session, so warming a separate session didn't help.)
  // A genuine regression still fails both attempts (Playwright marks
  // retried-then-passed as "flaky", not "passed"), so this doesn't mask real
  // bugs. Override with E2E_RETRIES if needed.
  retries: process.env.E2E_RETRIES ? Number(process.env.E2E_RETRIES) : CI ? 1 : 1,
  workers: CI ? 2 : LOCAL_WORKERS,
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
