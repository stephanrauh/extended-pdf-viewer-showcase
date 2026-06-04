import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /scripting toggles `pdfDefaultOptions.enableScripting`. The
// existing T8 test verifies the *default* (unchecked / disabled)
// reflects the option but explicitly notes that form widgets render
// regardless of the toggle — so it doesn't prove the toggle actually
// reaches pdf.js's behaviour.
//
// pdf.js only loads the sandbox bundle (`pdf.sandbox-*.mjs`) when
// scripting is enabled, so a network-level A/B is the cleanest
// signal: with the option on, the sandbox must be fetched; with the
// option off, it must NOT be. The demo's in-UI toggle calls
// `window.location.reload()`, which is awkward to drive mid-test;
// we instead pre-seed the `localStorage` key the demo's constructor
// reads on mount, so the chosen scripting state is in effect by the
// first page render.

const SCRIPTING = '/extended-pdf-viewer/scripting';
const STORAGE_KEY = 'ngx-extended-pdf-viewer.enableScripting';
const SANDBOX_PATTERN = /pdf\.sandbox-[^/]+\.mjs(\?|$)/;

async function preseed(
  page: import('@playwright/test').Page,
  enabled: boolean,
): Promise<void> {
  await page.addInitScript((flag) => {
    try {
      localStorage.setItem(
        'ngx-extended-pdf-viewer.enableScripting',
        String(flag),
      );
    } catch {
      /* localStorage unavailable — Safari private mode etc. */
    }
  }, enabled);
}

test.describe('T25 — /scripting enableScripting controls sandbox loading', () => {
  test('enableScripting=true causes pdf.js to load the JavaScript sandbox', async ({
    page,
  }) => {
    await preseed(page, true);

    const sandboxFetches: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (SANDBOX_PATTERN.test(url)) sandboxFetches.push(url);
    });

    const viewer = new PdfViewerPage(page);
    await viewer.goto(SCRIPTING);
    await viewer.waitForFirstPageRender();

    // Sandbox boot is async — pdf.js fetches it after the document
    // is fully loaded, not at first paint. Poll until we see the
    // request, with a generous timeout for cold starts.
    await expect
      .poll(async () => sandboxFetches.length, {
        timeout: 15_000,
        message: `expected pdf.sandbox-*.mjs to be fetched when enableScripting=true`,
      })
      .toBeGreaterThan(0);

    // Verify the checkbox visibly reflects the pre-seeded state —
    // catches a regression where the storage key is renamed or the
    // demo stops honouring it.
    const toggle = page
      .locator(
        'label:has-text("enable JavaScript") input[type="checkbox"], label:has-text("enable scripting") input[type="checkbox"]',
      )
      .first();
    await expect(toggle).toBeChecked();

    // Confirm the storage key is what the demo wrote back, not just
    // what we set — a regression where the demo flips the storage
    // contract would silently break the seed-and-reload UX.
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).toBe('true');
  });

  test('enableScripting=false leaves the sandbox unloaded', async ({
    page,
  }) => {
    await preseed(page, false);

    const sandboxFetches: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (SANDBOX_PATTERN.test(url)) sandboxFetches.push(url);
    });

    const viewer = new PdfViewerPage(page);
    await viewer.goto(SCRIPTING);
    await viewer.waitForFirstPageRender();

    // Allow time for any pending late-loading fetches; with scripting
    // disabled the sandbox must never be requested.
    await page.waitForTimeout(2_000);
    expect(
      sandboxFetches,
      `expected no pdf.sandbox-*.mjs fetch when enableScripting=false`,
    ).toEqual([]);
  });
});
