import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// Print tests intercept `window.print` via addInitScript so the OS
// print dialog never opens. pdf.js still builds the print iframe and
// fires its (beforePrint) / (afterPrint) events, which is what the
// demos observe.

async function stubPrint(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __printCalls: number }).__printCalls = 0;
    const stub = function () {
      (window as unknown as { __printCalls: number }).__printCalls += 1;
    };
    // Replace both the host window and any iframe windows that
    // pdf.js opens for the print preview. Hooking `contentWindow`
    // via a MutationObserver covers iframes created after init.
    window.print = stub;
    const patchIframes = () => {
      document.querySelectorAll('iframe').forEach((f) => {
        try {
          if (f.contentWindow) f.contentWindow.print = stub;
        } catch {
          // cross-origin iframe — ignore
        }
      });
    };
    new MutationObserver(patchIframes).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    patchIframes();
  });
}

const printCalls = async (page: import('@playwright/test').Page): Promise<number> =>
  await page.evaluate(
    () => (window as unknown as { __printCalls: number }).__printCalls,
  );

// /print-range exposes printService.print(range) and the
// replaceBrowserPrint / enablePrintAutoRotate config flags. The
// useful assertion: triggering the service-driven print actually
// reaches `window.print` once the print iframe is ready.

test.describe('T21 — /print-range printService.print(range) reaches window.print', () => {
  const PRINT_RANGE = '/extended-pdf-viewer/print-range';

  test('clicking the demo print button eventually invokes window.print', async ({
    page,
  }) => {
    await stubPrint(page);

    const viewer = new PdfViewerPage(page);
    await viewer.goto(PRINT_RANGE);
    await viewer.waitForFirstPageRender();

    // From=1, To=2 by default in the demo (`from = 1`, `to = 10` actually,
    // but the demo's print() reuses them). Tighten the range to keep
    // the iframe render fast.
    await page.locator('#print-from-input').fill('1');
    await page.locator('#print-to-input').fill('2');

    // Click the "NgxExtendedPdfViewerService.print()" button.
    await page
      .getByRole('button', { name: 'NgxExtendedPdfViewerService.print()' })
      .first()
      .click();

    // pdf.js renders the pages into a hidden iframe then calls print
    // on it. Allow generous time on the build server.
    await expect
      .poll(async () => await printCalls(page), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });
});

// /custom-print-dialog wires (beforePrint) / (afterPrint) / (progress)
// into the demo's `showProgress` / `showCompleted` flags. With
// window.print stubbed, pdf.js still fires beforePrint, builds the
// iframe, fires progress events as pages render, and fires afterPrint
// once it's done. We assert the visible UI follows that lifecycle.

test.describe('T21 — /custom-print-dialog progress lifecycle', () => {
  const CUSTOM = '/extended-pdf-viewer/custom-print-dialog';

  test('clicking Print shows progress, then completion', async ({ page }) => {
    await stubPrint(page);

    const viewer = new PdfViewerPage(page);
    await viewer.goto(CUSTOM);
    await viewer.waitForFirstPageRender();

    // The demo's only <button>Print</button> is the print trigger.
    await page
      .getByRole('button', { name: /^Print$/ })
      .first()
      .click();

    // showProgress=true → "Processing page N of M" text appears.
    await expect(page.getByText(/Processing page \d+ of \d+/)).toBeVisible({
      timeout: 30_000,
    });

    // After the iframe finishes rendering, afterPrint fires →
    // showCompleted=true and either "Printing completed!" or
    // "Printing was cancelled!" appears.
    await expect(
      page.getByText(/Printing (completed|was cancelled)!/),
    ).toBeVisible({ timeout: 60_000 });
  });
});

// /presentations enables the presentation-mode button via
// [showPresentationModeButton]="true". Activating the actual
// fullscreen mode requires a user gesture that Playwright can't
// reliably synthesise across all platforms; the testable claim is
// that the button is exposed and clickable.

test.describe('T21 — /presentations exposes the presentation-mode button', () => {
  const PRESENTATIONS = '/extended-pdf-viewer/presentations';

  test('the #presentationMode toolbar button is rendered and enabled', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(PRESENTATIONS);
    await viewer.waitForFirstPageRender();

    // pdf-presentation-mode.component sets primaryToolbarId="presentationMode"
    // (no `primary` prefix — see the file directly).
    const button = page.locator('#presentationMode');
    await expect(button).toBeVisible({ timeout: 15_000 });
    await expect(button).toBeEnabled();
  });
});
