import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /scripting toggles `pdfDefaultOptions.enableScripting`.
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

// Loading the sandbox is not the same as running the PDF's scripts. These tests
// watch the scripts' effect: pdf-actions-demo.pdf carries JavaScript in every
// place a PDF can, and each script appends a line to the form field "log".
// The bare viewer (src/app/e2e-harness) sets the pdfDefaultOptions per test.
test.describe('T25 — the PDF\'s scripts run, and only the ones that are allowed', () => {
  const ACTIONS = '/e2e/viewer?src=/assets/pdfs/pdf-actions-demo.pdf';
  const DOCUMENT_LEVEL = '1. Document-level JavaScript (/Names /JavaScript)';
  const PAGE_OPEN = 'PageOpen page 1 (/AA /O)';

  async function openWith(page: import('@playwright/test').Page, options: Record<string, boolean>) {
    const query = Object.entries(options)
      .map(([name, value]) => `&opt.${name}=${value}`)
      .join('');
    const viewer = new PdfViewerPage(page);
    await viewer.goto(ACTIONS + query);
    await viewer.waitForFirstPageRender();
    return page.locator('.annotationLayer [name="log"]');
  }

  test('with scripting off, no script runs', async ({ page }) => {
    const log = await openWith(page, { enableScripting: false });
    await expect(log).toBeAttached({ timeout: 15_000 });
    // Give a script that would run a chance to do so before checking.
    await page.waitForTimeout(2_000);
    await expect(log).toHaveValue('');
  });

  test('with scripting on, the document-level and page-open scripts run - in that order', async ({ page }) => {
    const log = await openWith(page, { enableScripting: true });
    await expect(log).toHaveValue(new RegExp(`${escape(DOCUMENT_LEVEL)}\\n2\\. ${escape(PAGE_OPEN)}`), {
      timeout: 15_000,
    });
    // The OpenAction script is blocked by default (enableOpenActionJavaScript).
    await expect(log).not.toHaveValue(/OpenAction/);
  });

  test('enableOpenActionJavaScript lets the /OpenAction script run', async ({ page }) => {
    const log = await openWith(page, { enableScripting: true, enableOpenActionJavaScript: true });
    await expect(log).toHaveValue(/OpenAction/, { timeout: 15_000 });
    await expect(log).toHaveValue(new RegExp(escape(DOCUMENT_LEVEL)));
  });

  for (const allowed of [true, false]) {
    test(`enableCatalogAAJavaScript=${allowed}: printing ${allowed ? 'runs' : 'skips'} WillPrint and DidPrint`, async ({ page }) => {
      await page.addInitScript(() => {
        // No OS print dialog; pdf.js still runs its whole print flow.
        window.print = () => undefined;
      });
      const log = await openWith(page, { enableScripting: true, enableCatalogAAJavaScript: allowed });
      await expect(log).toHaveValue(new RegExp(escape(PAGE_OPEN)), { timeout: 15_000 });

      // The print has to finish for "no DidPrint" to mean anything.
      await page.evaluate(() => {
        const w = window as any;
        w.__afterPrint = false;
        w.__ngxApp.eventBus.on('afterprint', () => (w.__afterPrint = true));
      });
      await page.locator('#printButton').click();
      await expect
        .poll(async () => await page.evaluate(() => (window as any).__afterPrint), { timeout: 30_000 })
        .toBe(true);
      if (allowed) {
        await expect(log).toHaveValue(/WillPrint[\s\S]*DidPrint/, { timeout: 10_000 });
      } else {
        await page.waitForTimeout(1_000);
        await expect(log).not.toHaveValue(/WillPrint|DidPrint/);
      }
    });
  }
});

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}
