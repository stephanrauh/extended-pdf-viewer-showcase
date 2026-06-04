import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T9 — /export-text', () => {
  test('"Export as text" extracts a known phrase from blind-text-collection page 1', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/export-text');
    await viewer.waitForFirstPageRender();

    await page
      .getByRole('button', { name: 'Export as text', exact: true })
      .click();

    // The demo loads blind-text-collection.pdf, whose page 1 starts with
    // "Blind text collection" and includes the well-known "Vokalia and
    // Consonantia" / "Bookmarksgrove" lorem-ipsum phrases. Asserting a
    // specific phrase catches regressions where the export grabs the
    // wrong page or returns gibberish.
    const extracted = page.locator('.tab-content').last();
    await expect
      .poll(async () => await extracted.innerText(), { timeout: 20_000 })
      .toMatch(/Bookmarksgrove|Vokalia and Consonantia|Blind text collection/);
  });

  test('"Export as lines" produces multiple text lines', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/export-text');
    await viewer.waitForFirstPageRender();

    await page
      .getByRole('button', { name: 'Export as lines', exact: true })
      .click();

    // Each line is rendered as its own <div> inside the tab-content.
    await expect
      .poll(
        async () =>
          await page.locator('.tab-content').last().locator('div').count(),
        { timeout: 20_000 },
      )
      .toBeGreaterThan(1);
  });
});

test.describe('T9 — /export-file', () => {
  test('"Export the PDF file" produces a non-empty PDF blob', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/export-file');
    await viewer.waitForFirstPageRender();

    await page
      .getByRole('button', { name: 'Export the PDF file', exact: true })
      .click();

    // Type + size: the demo renders both as separate <p> elements once
    // the blob resolves. Type alone is a weak signal (a stubbed empty
    // blob can have the right type); asserting size > 1000 confirms the
    // export actually serialised the PDF.
    await expect(page.getByText(/Blob type:\s*application\/pdf/)).toBeVisible({
      timeout: 20_000,
    });
    const sizeText = await page.getByText(/Blob size:\s*\d+/).innerText();
    const size = Number(sizeText.match(/Blob size:\s*(\d+)/)?.[1] ?? '0');
    expect(size).toBeGreaterThan(1000);
  });
});

test.describe('T9 — /export-image', () => {
  test('"Export as image" produces a data URL of the requested width', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/export-image');
    await viewer.waitForFirstPageRender();

    // Fill the desired-width input. The form has three mutually-exclusive
    // inputs (width/height/scale) and each shows a unique placeholder, so
    // we target by placeholder to avoid relying on DOM order.
    await page.getByPlaceholder('1000', { exact: true }).fill('300');

    await page
      .getByRole('button', { name: 'Export as image', exact: true })
      .click();

    // The button click switches to the "extracted image" tab and populates
    // imageDataURL. Image dimensions are reported async via Image.onload,
    // so poll until both numbers render.
    const widthLine = page.getByText(/^Width:\s*\d+/);
    const heightLine = page.getByText(/^Height:\s*\d+/);
    await expect(widthLine).toBeVisible({ timeout: 20_000 });
    await expect(heightLine).toBeVisible({ timeout: 20_000 });

    // Asserting the requested width round-trips back from the rendered
    // image catches regressions where getPageAsImage silently falls back
    // to a default size or returns the original page size.
    expect(await widthLine.innerText()).toMatch(/Width:\s*300\b/);

    // The exported <img> must actually be a real raster, not a stub.
    const img = page.getByAltText('screenshot of the PDF');
    await expect(img).toBeVisible({ timeout: 20_000 });
    const src = (await img.getAttribute('src')) ?? '';
    expect(src).toMatch(/^data:image\//);
    // A 300px-wide PDF page raster is several KB even at the lightest
    // settings; 5000 bytes is well below the floor but well above any
    // trivial 1x1 placeholder.
    expect(src.length).toBeGreaterThan(5000);
  });
});

test.describe('T9 — /export-annotations', () => {
  test('"Add text editor" + "Export annotations" round-trip a FreeText payload', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/export-annotations');
    await viewer.waitForFirstPageRender();

    // The demo's addTextEditor() builds a FreeText annotation
    // (annotationType=3) on pageIndex 0 with the fixed string
    // "Hello world!" and calls addEditorAnnotation(). The click handler
    // is async, so wait for the editor to actually land on the
    // annotation editor layer before exporting.
    await page
      .getByRole('button', { name: 'Add text editor', exact: true })
      .click();
    await expect
      .poll(
        async () =>
          await page
            .locator('.page[data-page-number="1"] .annotationEditorLayer > *')
            .count(),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);

    await page
      .getByRole('button', { name: 'Export annotations', exact: true })
      .click();

    // Export populates rawAnnotations, which renders one <textarea> per
    // annotation with the JSON-pipe-formatted payload.
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    const json = await textarea.inputValue();
    expect(json).toMatch(/"annotationType"\s*:\s*3\b/);
    expect(json).toContain('"value": "Hello world!"');
    expect(json).toMatch(/"pageIndex"\s*:\s*0\b/);
  });
});
