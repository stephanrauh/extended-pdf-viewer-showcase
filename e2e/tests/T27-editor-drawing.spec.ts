import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import * as fs from 'node:fs';

/**
 * T27 — real user gestures land annotations on the editor layer.
 *
 * T6 only checks that mode-toggle buttons flip; T14 checks that an ink
 * drag emits a `drawingStopped` event. Neither asserts that a complete
 * gesture produces a persistent annotation. This spec drives the
 * gesture and round-trips it through the export-annotations service to
 * prove the annotation actually exists in the model.
 *
 * Everything runs on /export-annotations so we can chain "draw" with
 * "Export annotations" in the same browser context — no need to
 * remember and replay editor state across navigation.
 *
 * Reference: pdf.js AnnotationEditorType (mypdf.js/src/shared/util.js)
 *   FREETEXT = 3, HIGHLIGHT = 9, STAMP = 13, INK = 15, SIGNATURE = 101.
 */
test.describe.configure({ mode: 'parallel' });

const ROUTE = '/extended-pdf-viewer/export-annotations';

async function gotoExportRoute(page: PdfViewerPage['page']): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(ROUTE);
  await viewer.waitForFirstPageRender();
  await viewer.waitForPageRender(1);
  return viewer;
}

async function editorLayerBox(page: PdfViewerPage['page']) {
  const editorLayer = page
    .locator('.page[data-page-number="1"] .annotationEditorLayer')
    .first();
  await editorLayer.waitFor({ state: 'visible', timeout: 10_000 });
  const box = await editorLayer.boundingBox();
  expect(box, 'editor layer on page 1 must have a layout').not.toBeNull();
  return box!;
}

async function expectExportContains(
  page: PdfViewerPage['page'],
  pattern: RegExp,
): Promise<void> {
  await page
    .getByRole('button', { name: 'Export annotations', exact: true })
    .click();
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 10_000 });
  const json = await textarea.inputValue();
  expect(json).toMatch(pattern);
}

test.describe('T27 — drawing editors produce persistent annotations', () => {
  // Control: prove my ink gesture works on a route where T14 verifies it
  // does. If this passes, /export-annotations is route-specific.
  test('CONTROL ink on /editor-events page 9', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/editor-events');
    await viewer.waitForPageRender(9);
    await viewer.activateEditor('draw');

    const editorLayer = page
      .locator('.page[data-page-number="9"] .annotationEditorLayer')
      .first();
    await editorLayer.waitFor({ state: 'visible', timeout: 10_000 });
    const box = await editorLayer.boundingBox();
    expect(box).not.toBeNull();
    // Match T14 exactly (0.3 position, 60→120 move). Use scrollIntoView so
    // box.y is the layout position of the page top WITHIN the viewport.
    await editorLayer.scrollIntoViewIfNeeded();
    const box2 = await editorLayer.boundingBox();
    const startX = box2!.x + box2!.width * 0.3;
    const startY = box2!.y + box2!.height * 0.3;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 60, startY + 40, { steps: 10 });
    await page.mouse.move(startX + 120, startY + 20, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    const diag = await page.evaluate(() => {
      const layer = document.querySelector(
        '.page[data-page-number="9"] .annotationEditorLayer',
      );
      return {
        layerChildCount: layer?.children.length ?? 0,
        innerHTML: layer ? layer.innerHTML.slice(0, 800) : null,
      };
    });
    fs.writeFileSync(
      '/tmp/t27-control.json',
      JSON.stringify(diag, null, 2),
    );

    expect(diag.layerChildCount).toBeGreaterThan(0);
  });

  test('ink: a real stroke lands a type-15 annotation in the export', async ({
    page,
  }) => {
    const viewer = await gotoExportRoute(page);
    await viewer.activateEditor('draw');

    const box = await editorLayerBox(page);
    // Stay inside the central 40 % of the page — Chromium ink mode opens
    // a "Color / Thickness / Opacity" params panel that floats over the
    // outer right edge of /export-annotations and swallows pointerdown.
    const x0 = box.x + box.width * 0.4;
    const y0 = box.y + box.height * 0.4;
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    await page.mouse.move(x0 + 60, y0 + 40, { steps: 12 });
    await page.mouse.move(x0 + 100, y0 + 20, { steps: 12 });
    await page.mouse.up();

    // Wait a moment for the commit, then dump diagnostic state.
    await page.waitForTimeout(800);
    const diag = await page.evaluate(() => {
      const layer = document.querySelector(
        '.page[data-page-number="1"] .annotationEditorLayer',
      );
      const editorLike = document.querySelectorAll(
        '.page[data-page-number="1"] .annotationEditorLayer *',
      );
      return {
        layerExists: !!layer,
        layerChildCount: layer?.children.length ?? 0,
        layerInnerHTML: layer ? layer.innerHTML.slice(0, 800) : null,
        descendantTagCounts: Array.from(editorLike).reduce(
          (m, el) => ({ ...m, [el.tagName.toLowerCase()]: (m[el.tagName.toLowerCase()] ?? 0) + 1 }),
          {} as Record<string, number>,
        ),
        editorModeAttr:
          document
            .querySelector('#primaryEditorInk')
            ?.classList.contains('toggled') ?? false,
      };
    });
    fs.writeFileSync(
      '/tmp/t27-ink-debug.json',
      JSON.stringify(diag, null, 2),
    );

    // pdf.js attaches the new ink editor as a child of .annotationEditorLayer
    // shortly after pointerup. Poll because the commit is async.
    await expect
      .poll(
        async () =>
          await page
            .locator('.page[data-page-number="1"] .annotationEditorLayer > *')
            .count(),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);

    await expectExportContains(page, /"annotationType"\s*:\s*15\b/);
  });

  test('freetext: clicking + typing lands a type-3 annotation with the typed text', async ({
    page,
  }) => {
    const viewer = await gotoExportRoute(page);
    await viewer.activateEditor('text');

    const box = await editorLayerBox(page);
    const x = box.x + box.width * 0.25;
    const y = box.y + box.height * 0.25;
    // FreeText: a single click on the editor layer places the editor;
    // keyboard input populates its contenteditable child.
    await page.mouse.click(x, y);

    const typed = 'T27 freetext canary';
    await page.keyboard.type(typed);
    // Escape commits the FreeText editor (clicking outside also works
    // but risks landing on another DOM element and starting a new editor).
    await page.keyboard.press('Escape');

    await expect
      .poll(
        async () =>
          await page
            .locator('.page[data-page-number="1"] .annotationEditorLayer > *')
            .count(),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);

    await expectExportContains(page, /"annotationType"\s*:\s*3\b/);
    // Round-trip the actual typed text — proves it isn't an empty editor.
    const json = await page.locator('textarea').first().inputValue();
    expect(json).toContain(typed);
  });

  test('highlight: drag-selecting page text lands a type-9 annotation', async ({
    page,
  }) => {
    const viewer = await gotoExportRoute(page);
    await viewer.activateEditor('highlight');

    // Highlight needs actual text spans to anchor onto. The export-
    // annotations demo loads blind-text-collection.pdf, whose page 1
    // text layer has many spans. Pick one and drag-select across it.
    const textLayer = page.locator(
      '.page[data-page-number="1"] .textLayer',
    );
    await textLayer.waitFor({ state: 'attached', timeout: 10_000 });

    // Use the first span with substantive content. Highlight only fires
    // when the selection lands on actual glyphs, not whitespace markers.
    const span = textLayer.locator('span').filter({ hasText: /\S{5,}/ }).first();
    await expect(span).toBeVisible({ timeout: 10_000 });
    const spanBox = await span.boundingBox();
    expect(spanBox, 'no measurable text-layer span found').not.toBeNull();

    const startX = spanBox!.x + 2;
    const midY = spanBox!.y + spanBox!.height / 2;
    const endX = spanBox!.x + spanBox!.width - 2;
    await page.mouse.move(startX, midY);
    await page.mouse.down();
    await page.mouse.move(endX, midY, { steps: 10 });
    await page.mouse.up();

    await expect
      .poll(
        async () =>
          await page
            .locator('.page[data-page-number="1"] .annotationEditorLayer > *')
            .count(),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);

    await expectExportContains(page, /"annotationType"\s*:\s*9\b/);
  });
});
