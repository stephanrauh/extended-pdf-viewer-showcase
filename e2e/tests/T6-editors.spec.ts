import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T6 editors — toolbar editor modes', () => {
  // Editor mode buttons live in the standard toolbar and only act when the
  // PDF has been rendered. /textlayer is a clean route that auto-loads a
  // text-bearing PDF and has the editor toolbar enabled.
  const ROUTE = '/extended-pdf-viewer/textlayer';

  for (const mode of ['highlight', 'draw', 'text', 'stamp'] as const) {
    test(`${mode} editor button toggles the editor mode`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(ROUTE);
      await viewer.waitForFirstPageRender();

      expect(await viewer.isEditorActive(mode)).toBe(false);
      await viewer.activateEditor(mode);
      await expect
        .poll(async () => await viewer.isEditorActive(mode), { timeout: 5_000 })
        .toBe(true);

      // Clicking again returns to the "no editor" mode.
      await viewer.activateEditor(mode);
      await expect
        .poll(async () => await viewer.isEditorActive(mode), { timeout: 5_000 })
        .toBe(false);
    });
  }
});

test.describe('T6 editors — adding-arbitrary-annotations', () => {
  test('clicking "Add Demo Annotation" rewrites the PDF with a new annotation', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/adding-arbitrary-annotations');
    await viewer.waitForFirstPageRender();

    // Baseline: demo's own counter is 0 and page 1's annotationLayer has
    // no annotation children. The counter alone could be Angular state
    // unrelated to the PDF — we also assert the DOM annotationLayer
    // grows, which only happens when pdf.js re-renders the rewritten PDF.
    await expect(page.getByText(/Current annotations:\s*0/)).toBeVisible();
    const annotationCount = page.locator(
      '.page[data-page-number="1"] .annotationLayer > *',
    );
    const beforeCount = await annotationCount.count();

    await page
      .getByRole('button', { name: /Add Demo Annotation/i })
      .click();

    await expect(page.getByText(/Current annotations:\s*1/)).toBeVisible({
      timeout: 15_000,
    });
    await viewer.waitForFirstPageRender();
    // The demo writes a square + sticky note pair via pdf-lib; pdf.js
    // renders both inside .annotationLayer once the rewritten bytes load.
    await expect
      .poll(async () => await annotationCount.count(), { timeout: 30_000 })
      .toBeGreaterThan(beforeCount);
  });
});

test.describe('T6 editors — annotation-layer-api', () => {
  test('addImage drops a stamp into the editor layer', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/annotation-layer-api');
    await viewer.waitForFirstPageRender();

    // Snapshot the editor-layer child count across all pages before the
    // click; after the API call there must be more.
    const editorChildren = page.locator(
      'ngx-extended-pdf-viewer .annotationEditorLayer > *',
    );
    const before = await editorChildren.count();

    await page
      .getByRole('button', { name: /^addImage\(/ })
      .first()
      .click();

    await expect
      .poll(async () => await editorChildren.count(), { timeout: 30_000 })
      .toBeGreaterThan(before);
  });
});

test.describe('T6 editors — annotation-layer (popups)', () => {
  test('Toggle popup synthesises a click on each popup trigger area', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/annotation-layer');
    await viewer.waitForFirstPageRender();

    // The "Toggle popup programmatically" button lives on the
    // "Manipulating" tab; switch there first.
    await page
      .getByRole('button', { name: /Manipulating the annotation layer/i })
      .click();

    // There must be popup trigger areas to toggle. If this precondition
    // fails the demo PDF changed and the test should be updated.
    await expect
      .poll(async () => await page.locator('.popupTriggerArea').count(), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0);

    // Counter increments each time any .popupTriggerArea is clicked, so we
    // can verify the button actually fans out clicks.
    await page.evaluate(() => {
      (window as any).__popupClicks = 0;
      document.querySelectorAll('.popupTriggerArea').forEach((el) => {
        el.addEventListener('click', () => ((window as any).__popupClicks += 1));
      });
    });

    await page
      .getByRole('button', { name: /Toggle popup programmatically/i })
      .click();

    await expect
      .poll(async () => await page.evaluate(() => (window as any).__popupClicks), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0);
  });
});
