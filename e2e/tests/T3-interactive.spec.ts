import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T3 — find', () => {
  test('typing a search term and clicking Next reports matches', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/find');
    await viewer.waitForFirstPageRender();

    // The find demo loads a Portuguese book; pick a word it actually contains.
    await page.locator('#search-input').fill('para');
    await page.getByRole('button', { name: 'next', exact: true }).click();

    // The find component renders the result label in both the findapi panel
    // and the controller-comparison panel; either one is fine.
    await expect(
      page.getByText(/selected: result \d+ of \d+/).first(),
    ).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('T3 — find with customFindbarButtons', () => {
  // Reproduction of stephanrauh/ngx-extended-pdf-viewer#3210. The reporter
  // uses [customFindbarButtons] with their own <input id="findInput"> and
  // calls NgxExtendedPdfViewerService.find() from a debounced rxjs Subject.
  // On iPad they see total=0 for single-char queries. This test re-runs that
  // setup on desktop Chrome against the reporter's own PDF (dummy-manual.pdf):
  // if the find engine is generally broken, the counter never reaches > 0.
  test('service.find("H") on dummy-manual.pdf reports a non-zero total', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/find-custom-findbar');
    await viewer.waitForFirstPageRender();

    // Open the findbar — our custom <input id="findInput"> lives inside the
    // findbar template, which is `display: none` until the toolbar button
    // toggles it.
    await page.locator('#primaryViewFind').click();
    const findInput = page.locator('#findbar #findInput');
    await findInput.waitFor({ state: 'visible' });

    await findInput.fill('H');

    // The repro page exposes the live counter via #find-total. The debounce
    // is 250 ms and pdf.js extracts text per page before the first match
    // surfaces; 30 s is comfortable for a 42-page document on a cold start.
    await expect
      .poll(
        async () => {
          const text = await page
            .locator('#find-total')
            .textContent();
          const match = text?.match(/total=(\d+)/);
          return match ? Number(match[1]) : 0;
        },
        { timeout: 30_000, message: 'expected service.find("H") to report total > 0' },
      )
      .toBeGreaterThan(0);
  });
});

test.describe('T3 — custom-find', () => {
  test('Find button reports matches in the PDF', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-find');
    await viewer.waitForFirstPageRender();

    // The regex demo lives on the "Before version 2.13.0" tab; the default
    // tab only shows documentation, so #regex-search-input isn't rendered.
    await page.getByRole('button', { name: /before version/i }).click();

    await page.locator('#regex-search-input').fill('para');
    // Scope to the demo's own Find button — after the pdf-shy-button fix
    // (28.0.0-rc.4) the toolbar's #primaryViewFind also exposes the
    // accessible name "Find" via its inner data-l10n-id span.
    await page.locator('button.bg-primary-500', { hasText: /^Find$/ }).click();

    await expect(page.getByText(/Result \d+ of \d+/)).toBeVisible({
      timeout: 30_000,
    });
  });
});

test.describe('T3 — hidden-tabs', () => {
  test('switching to Tab 2 reveals and renders the viewer', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/hidden-tabs');
    await viewer.waitForViewerMounted();

    // Tab 2 is where the viewer lives; click it to make the host visible.
    await page.getByRole('button', { name: /^Tab\s*2/ }).click();
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();
  });
});

test.describe('T3 — multiple-documents', () => {
  test('selecting a PDF from the dropdown loads it', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/multiple-documents');
    await viewer.waitForViewerMounted();

    // Identity check via network: arm a request waiter BEFORE selecting,
    // so we observe the actual fetch of Introduction.pdf. The demo
    // deliberately runs without a text layer, so phrase checks aren't
    // available — the request URL is the next best signature.
    const pdfRequest = page.waitForRequest(
      (req) => req.url().endsWith('/assets/pdfs/Introduction.pdf'),
      { timeout: 15_000 },
    );

    // The page has several <select> elements; pick the one whose options
    // include the PDF paths.
    await page
      .locator('select:has(option[value="/assets/pdfs/Introduction.pdf"])')
      .selectOption('/assets/pdfs/Introduction.pdf');

    await pdfRequest;
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();
  });
});

test.describe('T3 — passwords', () => {
  test('selecting the correct password opens the PDF', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/passwords');
    await viewer.waitForViewerMounted();

    // The viewer opens with [password]=undefined and pops its native
    // <dialog id="passwordDialog">. Cancel it so the first hung attempt
    // resolves, then pick the "correct password" radio — its setter clears
    // src then restores it, which re-triggers the load with the password.
    const passwordDialog = page.locator('#passwordDialog');
    await passwordDialog.waitFor({ state: 'visible' });
    await passwordDialog.getByRole('button', { name: 'Cancel' }).click();

    // Identity-via-network: the unlocked PDF is GraalVM-password-protected.pdf.
    // The demo runs without a text layer, so we verify the right file was
    // requested rather than scanning page text. Arming the waiter before
    // the radio click captures the re-request triggered by the password.
    const pdfRequest = page.waitForRequest(
      (req) =>
        req.url().endsWith('/assets/pdfs/GraalVM-password-protected.pdf'),
      { timeout: 15_000 },
    );
    await page.getByLabel(/graalvm-rocks!.*correct password/).check();
    await pdfRequest;

    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();
  });
});

test.describe('T3 — zoom', () => {
  test('changing the zoom level re-renders the canvas at a larger size', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/zoom');
    await viewer.waitForFirstPageRender();
    const visiblePage = await viewer.waitForCurrentPage();
    const before = await viewer.getCanvasSize(visiblePage);

    // Use pdf.js's built-in zoom-in toolbar button; it has aria-label "Zoom In".
    const zoomIn = page.getByRole('button', { name: 'Zoom In' });
    await zoomIn.click();
    await zoomIn.click();

    // Poll on actual width growth — comparing structure (objectContaining)
    // passes immediately and doesn't wait for the re-render to land.
    await expect
      .poll(async () => (await viewer.getCanvasSize(visiblePage)).width, {
        timeout: 15_000,
      })
      .toBeGreaterThan(before.width);
    const after = await viewer.getCanvasSize(visiblePage);
    expect(after.height).toBeGreaterThan(before.height);
  });
});

test.describe('T3 — two-way-binding', () => {
  test('typing in the Angular page input scrolls the viewer to that page', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/two-way-binding');
    await viewer.waitForFirstPageRender();
    // Capture page-1 text so we can prove page 3 looks different — not just
    // that "a page rendered".
    const page1Text = await viewer.getTextLayerContent(1);

    // `#page-input` lives under the "Page and page label" tab (selectedTab=1).
    await page
      .getByRole('button', { name: /Page and page label/ })
      .click();

    const pageInput = page.locator('#page-input');
    await pageInput.fill('3');
    await pageInput.blur();

    await viewer.waitForPageRender(3);
    // The viewer's own layout must agree we're on page 3 (catches one-way
    // binding regressions where the Angular input updates but pdf.js
    // doesn't scroll). We use viewport-derived current page rather than
    // #pageNumber.value — this demo's two-way binding leaves the toolbar
    // input empty for several seconds even after the scroll lands.
    await viewer.expectViewportOnPage(3);
    // And page 3 must have its own content — different from page 1.
    const page3Text = await viewer.getTextLayerContent(3);
    expect(page3Text.length).toBeGreaterThan(0);
    expect(page3Text).not.toBe(page1Text);
  });
});
