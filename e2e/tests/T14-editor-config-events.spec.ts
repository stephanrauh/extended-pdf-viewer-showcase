import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T14 — /editor-setting', () => {
  test('editorInkThickness setter propagates to the pdf.js ink thickness slider', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/editor-setting');
    await viewer.waitForFirstPageRender();

    // The slider is always in the DOM (it lives inside the ink editor
    // params toolbar, which is hidden until ink mode is active). Its
    // .value reflects pdf.js's UIManager state and updates as soon as
    // an annotationeditorparamschanged event fires — which the
    // service setter dispatches synchronously.
    const slider = page.locator('#editorInkThickness');
    const initial = await slider.inputValue();

    // The demo's number input is uniquely identified by its
    // placeholder. (input) on the input calls the demo's setter, which
    // forwards to pdfViewerService.editorInkThickness.
    await page.getByPlaceholder('10 (1-20)').fill('15');

    await expect
      .poll(async () => await slider.inputValue(), { timeout: 5_000 })
      .toBe('15');
    // Sanity-check: the test would be vacuous if the slider was
    // already at 15 before we typed.
    expect(initial).not.toBe('15');
  });

  test('editorFontSize setter propagates to the pdf.js free-text font-size slider', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/editor-setting');
    await viewer.waitForFirstPageRender();

    const slider = page.locator('#editorFreeTextFontSize');
    const initial = await slider.inputValue();

    await page.getByPlaceholder('10 (1-100)').fill('42');

    await expect
      .poll(async () => await slider.inputValue(), { timeout: 5_000 })
      .toBe('42');
    expect(initial).not.toBe('42');
  });
});

test.describe('T14 — /editor-events', () => {
  test('drawing an ink stroke logs an annotationEditorEvent of type "drawingStopped"', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/editor-events');

    // The demo binds [page]="9" so the viewer scrolls to page 9 on
    // load. Wait for the canvas and the editor layer before sending
    // pointer events — the editor layer captures the drag, not the
    // page canvas.
    await viewer.waitForPageRender(9);

    await viewer.activateEditor('draw');

    const editorLayer = page
      .locator('.page[data-page-number="9"] .annotationEditorLayer')
      .first();
    await editorLayer.waitFor({ state: 'visible', timeout: 10_000 });

    const messages = page.locator('.messages > div');

    // Draw a short diagonal stroke. drawingStarted fires on mousedown
    // inside the editor layer; drawingStopped fires on mouseup. We
    // assert on drawingStopped because it's unambiguously caused by
    // the stroke ending (drawingStarted can arrive before the
    // assertion in the absence of mouseup if the drag fails midway).
    const box = await editorLayer.boundingBox();
    expect(box, 'editor layer on page 9 must have a layout').not.toBeNull();
    const startX = box!.x + box!.width * 0.3;
    const startY = box!.y + box!.height * 0.3;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 60, startY + 40, { steps: 10 });
    await page.mouse.move(startX + 120, startY + 20, { steps: 10 });
    await page.mouse.up();

    // The demo serialises every annotationEditorEvent into a message
    // line containing JSON.stringify(event).substring(0, 60). Match
    // the type discriminator rather than the whole string.
    await expect
      .poll(
        async () => {
          const texts = await messages.allInnerTexts();
          return texts.some(
            (t) =>
              t.includes('annotationEditorEvent') &&
              t.includes('"type":"drawingStopped"'),
          );
        },
        { timeout: 10_000 },
      )
      .toBe(true);
  });
});
