import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T8 — /forms', () => {
  test('renders interactive form widgets inside the annotation layer', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/forms');
    await viewer.waitForFirstPageRender();

    // Form fields are HTML inputs/selects/buttons that pdf.js injects into
    // .annotationLayer. The demo PDF has plenty of them.
    const widgets = page.locator(
      'ngx-extended-pdf-viewer .annotationLayer input, ngx-extended-pdf-viewer .annotationLayer select',
    );
    await expect
      .poll(async () => await widgets.count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
  });

  test('typing into a text-input form field persists the value', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/forms');
    await viewer.waitForFirstPageRender();

    const textInput = page
      .locator(
        'ngx-extended-pdf-viewer .annotationLayer input[type="text"], ngx-extended-pdf-viewer .annotationLayer input:not([type])',
      )
      .first();
    await textInput.waitFor({ state: 'attached', timeout: 20_000 });
    await textInput.fill('PdfViewer e2e');
    expect(await textInput.inputValue()).toBe('PdfViewer e2e');
  });

  test('checkbox form widget toggles when clicked', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/forms');
    await viewer.waitForFirstPageRender();

    // The /forms demo's PDF has at least one checkbox; pdf.js renders it
    // as <input type="checkbox"> inside .annotationLayer. We don't care
    // which one — just that toggling actually flips its checked state.
    const checkbox = page
      .locator(
        'ngx-extended-pdf-viewer .annotationLayer input[type="checkbox"]',
      )
      .first();
    await checkbox.waitFor({ state: 'attached', timeout: 20_000 });
    const before = await checkbox.isChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: !before, timeout: 5_000 });
  });
});

test.describe('T8 — /scripting', () => {
  test('"enable JavaScript" toggle reflects pdfDefaultOptions and renders form fields', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/scripting');
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();

    // The demo's checkbox is bound two-way to pdfDefaultOptions.enableScripting,
    // whose library default is `false`. Assert that the checkbox reflects
    // that default — a regression that flips the default to `true`
    // (or toggles the binding direction) should fail here.
    const toggle = page
      .locator(
        'label:has-text("enable JavaScript") input[type="checkbox"], label:has-text("enable scripting") input[type="checkbox"]',
      )
      .first();
    await expect(toggle).not.toBeChecked();

    // Form fields are rendered regardless of the scripting toggle (pdf.js
    // injects them based on the PDF's widget annotations). Asserting they
    // exist proves the demo PDF still loads correctly.
    const widgets = page.locator(
      'ngx-extended-pdf-viewer .annotationLayer input, ngx-extended-pdf-viewer .annotationLayer select, ngx-extended-pdf-viewer .annotationLayer button',
    );
    await expect
      .poll(async () => await widgets.count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
  });
});

test.describe('T8 — /file-info', () => {
  test('populates the metadata table after pagesLoaded fires', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/file-info');
    await viewer.waitForFirstPageRender();

    // The component renders the metadata table only after `pagesLoaded`
    // delivers fileInfo. Wait for any non-empty row to confirm we got data.
    const tableCells = page.locator('table td').filter({
      hasNotText: /^(author|creationDate|creator|keywords|linearized|maybeFileSize|modificationDate|pdfFormatVersion|producer|subject|title)$/,
    });
    await expect
      .poll(
        async () => {
          const texts = await tableCells.allTextContents();
          return texts.some((t) => t.trim().length > 0);
        },
        { timeout: 30_000 },
      )
      .toBe(true);
  });
});

test.describe('T8 — /links', () => {
  test('renders link annotations as anchor elements', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/links');
    await viewer.waitForFirstPageRender();

    // pdf.js renders external/internal links as <a> inside .annotationLayer.
    const anchors = page.locator('ngx-extended-pdf-viewer .annotationLayer a');
    await expect
      .poll(async () => await anchors.count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
  });

  test('external link annotations carry a non-empty href', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/links');
    await viewer.waitForFirstPageRender();

    // Inspect the first anchor: pdf.js encodes the external URL in
    // `href`. Don't follow the link (we'd leave the SUT) — just confirm
    // pdf.js generated a real URL, not an empty placeholder.
    const firstAnchor = page
      .locator('ngx-extended-pdf-viewer .annotationLayer a')
      .first();
    await firstAnchor.waitFor({ state: 'attached', timeout: 20_000 });
    const href = await firstAnchor.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!.length).toBeGreaterThan(0);
    // External links open in a new tab by default in pdf.js.
    const target = await firstAnchor.getAttribute('target');
    expect(target).toBe('_blank');
  });
});
