import { readFileSync } from 'node:fs';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T36 — the two toolbar actions no other spec performs end to end.
 *
 * Download: T9 proves the in-memory export produces a PDF blob, but nobody
 * clicked the toolbar's download button and caught the browser download.
 * That path goes through pdf.js's DownloadManager and the `<a download>`
 * dance, plus ngx's `filenameForDownload` - a different code path.
 *
 * Presentation mode: T21 only asserts the button exists. Chromium honours
 * `requestFullscreen()` from a trusted click, so the mode can be entered and
 * left for real and pdf.js's `pdfPresentationMode` container class observed.
 */

test.describe.configure({ mode: 'parallel' });

test.describe('T36 — download button', () => {
  const SIMPLE = '/extended-pdf-viewer/simple';
  // /simple sets [filenameForDownload] to this name.
  const EXPECTED_FILENAME = 'The Public Domain - Enclosing the Commons of the Mind.pdf';

  test('clicking the toolbar download button saves the current PDF under filenameForDownload', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIMPLE);
    await viewer.waitForFirstPageRender();

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await page.locator('#downloadButton').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(EXPECTED_FILENAME);

    const savedPath = await download.path();
    expect(savedPath, 'download was written to disk').not.toBeNull();
    const bytes = readFileSync(savedPath!);
    // A real PDF, not an empty blob or an HTML error page.
    expect(bytes.length).toBeGreaterThan(10_000);
    expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});

test.describe('T36 — presentation mode', () => {
  const PRESENTATIONS = '/extended-pdf-viewer/presentations';

  test('the presentation-mode button enters fullscreen and leaving it restores the viewer', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'fullscreen from a synthetic click is only reliable in Chromium');

    const viewer = new PdfViewerPage(page);
    await viewer.goto(PRESENTATIONS);
    await viewer.waitForFirstPageRender();

    const container = page.locator('#viewerContainer').first();
    await page.locator('#presentationMode').click();

    // pdf.js flips the class on `fullscreenchange`, after the browser has
    // actually granted fullscreen - so this proves the whole chain fired.
    await expect(container).toHaveClass(/pdfPresentationMode/, { timeout: 15_000 });
    expect(
      await page.evaluate(() => document.fullscreenElement?.id ?? null),
      'the viewer container is the fullscreen element',
    ).toBe('viewerContainer');

    // Escape is handled by the browser chrome, which headless Chromium does
    // not emulate - so leave the way the browser would, through the
    // Fullscreen API. pdf.js still has to notice the `fullscreenchange` and
    // undo its presentation-mode state.
    await page.evaluate(() => document.exitFullscreen());

    await expect(container).not.toHaveClass(/pdfPresentationMode/, { timeout: 15_000 });
    expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
    // Leaving presentation mode must give back a working viewer.
    await viewer.assertCanvasHasContent(await viewer.waitForCurrentPage());
  });
});
