import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

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

async function exportedJson(page: PdfViewerPage['page']): Promise<string> {
  await page
    .getByRole('button', { name: 'Export annotations', exact: true })
    .click();
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 10_000 });
  return await textarea.inputValue();
}

async function expectExportContains(
  page: PdfViewerPage['page'],
  pattern: RegExp,
): Promise<void> {
  expect(await exportedJson(page)).toMatch(pattern);
}

/**
 * Performs an editor gesture once, like a user who has just picked the tool,
 * and expects an annotation to land on page 1's editor layer.
 *
 * Why the pause: pdf.js drops an editor gesture that starts in the same instant as the click
 * on the tool (measured: 5 of 15 dropped at 0 ms, none of 45 at 100 ms or
 * more, cold browser sessions included). No human is that fast, so the tests
 * pause like a user after picking a tool and then perform every gesture
 * exactly once - a dropped gesture fails the test instead of being retried.
 */
async function landAnnotation(
  page: PdfViewerPage['page'],
  gesture: () => Promise<void>,
): Promise<void> {
  await page.waitForTimeout(150);
  await gesture();
  await expect
    .poll(
      async () =>
        await page
          .locator('.page[data-page-number="1"] .annotationEditorLayer > *')
          .count(),
      { message: 'the gesture created an editor', timeout: 10_000 },
    )
    .toBeGreaterThan(0);
}

test.describe('T27 — drawing editors produce persistent annotations', () => {
  test('ink: a real stroke lands a type-15 annotation in the export', async ({
    page,
  }) => {
    const viewer = await gotoExportRoute(page);
    await viewer.activateEditor('draw');

    // `.annotationEditorLayer` for page 1 is the full PDF-page height, often
    // taller than the viewer's visible scroll area. A percentage offset like
    // `box.height * 0.4` can land BELOW the viewer's viewport and route the
    // pointer event to <html> instead of the editor layer — pdf.js's
    // pointerdown handler then bails (`event.target !== this.div`) and no
    // stroke starts. Stay near the top-left, which is guaranteed visible
    // once we scroll the layer into view.
    const editorLayer = page
      .locator('.page[data-page-number="1"] .annotationEditorLayer')
      .first();
    await editorLayer.scrollIntoViewIfNeeded();
    const box = (await editorLayer.boundingBox())!;
    const x0 = box.x + 120;
    const y0 = box.y + 80;

    // Ink reports `supportMultipleDrawings = true`, so a single mouseup does
    // NOT auto-commit — the stroke stays in a shared draw-layer SVG until the
    // user ends the session. Escape routes through
    // `unselectAll → commitOrRemove → endDrawingSession(false)`, which
    // creates the editor on `.annotationEditorLayer`. Unusual semantics
    // (most apps cancel on Escape) but pdf.js treats it as commit-or-discard.
    await landAnnotation(page, async () => {
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      await page.mouse.move(x0 + 60, y0 + 40, { steps: 12 });
      await page.mouse.move(x0 + 120, y0 + 20, { steps: 12 });
      await page.mouse.up();
      await page.keyboard.press('Escape');
    });

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

    // FreeText: a click places the editor; its contenteditable child
    // (`.freeTextEditor .internal`) takes the text; Escape commits it.
    //
    // One click places the editor (after a user's pause, see landAnnotation);
    // then type into the contenteditable *element*, not via ambient keyboard
    // focus: WebKit can lose focus between the click and the keystrokes, which
    // would commit an empty type-3 box.
    const typed = 'T27 freetext canary';
    const content = page
      .locator('.page[data-page-number="1"] .freeTextEditor .internal')
      .first();
    await page.waitForTimeout(150);
    await page.mouse.click(x, y);
    await expect(content, 'the click placed a free-text editor').toBeVisible();
    await content.pressSequentially(typed);
    await expect
      .poll(async () => await content.evaluate((el) => (el as HTMLElement).innerText))
      .toContain(typed);
    await page.keyboard.press('Escape');

    await expectExportContains(page, /"annotationType"\s*:\s*3\b/);
    // Round-trip the actual typed text — proves it isn't an empty editor.
    expect(await exportedJson(page)).toContain(typed);
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

    await landAnnotation(page, async () => {
      await page.mouse.move(startX, midY);
      await page.mouse.down();
      await page.mouse.move(endX, midY, { steps: 10 });
      await page.mouse.up();
    });

    await expectExportContains(page, /"annotationType"\s*:\s*9\b/);
  });
});
