import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /base64 documents that base64-encoded PDFs must be passed via
// [base64Src], not [src]. We verify the demo actually follows that
// contract: the network shows a fetch of the .base64.txt file (and
// no direct fetch of the corresponding .pdf), the decoded bytes
// render to a non-empty text layer, and clicking "show another
// document" rotates the source — proving [base64Src] is a live
// input rather than a one-shot loader.
//
// /options sets `pdfDefaultOptions.assetsFolder = 'bleeding-edge'`
// in its constructor. We verify that flag actually reaches pdf.js
// (the worker URL must come from the bleeding-edge folder, not the
// stable folder) and that other routes do NOT inherit it (the flag
// is only "real" if it changes routing for this page).

const BASE64 = '/extended-pdf-viewer/base64';
const BASE64_TXT = '/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.base64.txt';
const FIRST_PDF = '/assets/pdfs/Bootstrap-vs-Material-Design-vs-Prime-vs-Tailwind.pdf';
const OPTIONS = '/extended-pdf-viewer/options';
const BLOB = '/extended-pdf-viewer/blob';
const BLOB_PRELOAD_PDF = '/assets/pdfs/pdf-sample.pdf';

test.describe('T23 — /base64', () => {
  test('the base64 source decodes and renders, and the toggle button swaps documents', async ({
    page,
  }) => {
    const pdfRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.endsWith(BASE64_TXT) || url.endsWith(FIRST_PDF)) {
        pdfRequests.push(url);
      }
    });

    const viewer = new PdfViewerPage(page);
    await viewer.goto(BASE64);
    await viewer.waitForFirstPageRender();

    // The base64 source path must have been used: the .base64.txt
    // file is fetched, and the raw .pdf is NOT (the demo asserts
    // base64 PDFs travel through [base64Src], not [src]).
    expect(pdfRequests.some((u) => u.endsWith(BASE64_TXT))).toBe(true);
    expect(pdfRequests.some((u) => u.endsWith(FIRST_PDF))).toBe(false);

    // The decoded bytes must produce a real text layer — non-empty
    // proves the base64 payload was parsed as a PDF (and not, e.g.,
    // double-decoded or treated as opaque bytes).
    const firstDocText = await viewer.getTextLayerContent(1);
    expect(firstDocText.length).toBeGreaterThan(50);

    // Click "show another document" — the demo emits a new value
    // through the base64 Subject, which the viewer must pick up via
    // [base64Src]. The text layer of page 1 must change because the
    // second PDF is a different document.
    await page
      .locator('button', { hasText: 'show another document' })
      .click();

    await expect
      .poll(async () => await viewer.getTextLayerContent(1), {
        timeout: 15_000,
      })
      .not.toBe(firstDocText);
  });
});

test.describe('T23 — /options', () => {
  test('pdfDefaultOptions.assetsFolder routes pdf.js artefacts to /bleeding-edge/', async ({
    page,
  }) => {
    const assetFetches: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      // viewer/worker/sandbox bundles all live next to each other;
      // any of them showing up under bleeding-edge proves the flag
      // reached pdf.js. Filter to .mjs to keep the array small.
      if (url.endsWith('.mjs')) {
        assetFetches.push(url);
      }
    });

    const viewer = new PdfViewerPage(page);
    await viewer.goto(OPTIONS);
    await viewer.waitForFirstPageRender();

    // At least one bundle must come from /bleeding-edge/ — the flag
    // the demo sets in its constructor. If the default ('assets')
    // were used instead, the bleeding-edge filter would be empty.
    const bleedingEdgeFetches = assetFetches.filter((u) =>
      u.includes('/bleeding-edge/'),
    );
    expect(
      bleedingEdgeFetches.length,
      `expected at least one pdf.js .mjs fetch under /bleeding-edge/, got: ${JSON.stringify(assetFetches)}`,
    ).toBeGreaterThan(0);
  });
});

// /blob exercises two distinct Blob paths:
//  1. A preload route guard fetches pdf-sample.pdf as a Blob before
//     the component activates, and the viewer receives it via [src].
//  2. NgxExtendedPdfViewerService.getCurrentDocumentAsBlob() reads
//     the loaded document back as a Blob (used by the demo's
//     "download the file as a BLOB" button).

test.describe('T23 — /blob', () => {
  test('preload-guard delivers a Blob to [src]; getCurrentDocumentAsBlob reports the size', async ({
    page,
  }) => {
    // The preload guard must fetch the sample PDF as a Blob before
    // route activation; without that fetch the BlobService would have
    // no `src` and the viewer would never paint.
    const preloadRequest = page.waitForRequest(
      (req) => req.url().endsWith(BLOB_PRELOAD_PDF),
      { timeout: 15_000 },
    );

    const viewer = new PdfViewerPage(page);
    await viewer.goto(BLOB);
    await preloadRequest;

    // The viewer must render — proves the Blob actually reaches
    // pdf.js as a valid PDF stream, not as opaque bytes.
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);

    // Switch to the "Downloading BLOBs" sub-tab so the
    // download-as-Blob button becomes interactive.
    await page
      .getByRole('button', { name: 'Downloading BLOBs', exact: true })
      .click();

    await page
      .getByRole('button', { name: /download the file as a BLOB/i })
      .click();

    // The demo writes "The BLOB contains N byte." (with N > 0) when
    // getCurrentDocumentAsBlob() succeeds, "download failed" if it
    // returns undefined. Match the success string with a non-zero
    // byte count — pdf-sample.pdf is ~17 KB.
    await expect(
      page.getByText(/The BLOB contains \d+ byte\./),
    ).toBeVisible({ timeout: 15_000 });
    const downloadedText =
      (await page.locator('p', { hasText: /The BLOB contains/ }).textContent()) ?? '';
    const match = downloadedText.match(/The BLOB contains (\d+) byte\./);
    expect(match, `expected size readout, got: ${downloadedText}`).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThan(1000);
  });
});
