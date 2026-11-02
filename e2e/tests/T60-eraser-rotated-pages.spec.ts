import type { Page } from '@playwright/test';
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { drawInk } from '../poms/editor-gestures';

/**
 * T60 — the eraser on rotated pages, and drawings restored with
 * `addEditorAnnotation()` (stephanrauh/pdf.js#16, a follow-up to #14 and #15).
 *
 * One test per problem the pull request fixes:
 *   1. on a page with `/Rotate 90` or `270`, the eraser didn't cover the page and
 *      its cursor wasn't under the pointer;
 *   2. a drawing whose rotation differs from its page's turned by 90 degrees
 *      once the eraser cut it;
 *   3. a restored drawing took two undo steps;
 *   4. an eraser whose editor layer was thrown away (a page that left the page cache,
 *      then the idle cleanup) threw on every mode change once the page came back;
 *   5. a drawing restored while the eraser is on caught the pointer instead of the eraser.
 *
 * The PDFs are generated here: one US Letter page with the given `/Rotate`.
 */

test.describe.configure({ mode: 'parallel' });

const ERASER = 103;

async function rotatedPdf(rotation: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pdfPage = doc.addPage([612, 792]);
  pdfPage.setRotation(degrees(rotation));
  pdfPage.drawText(`/Rotate ${rotation}`, { x: 72, y: 700, size: 36, font });
  return Buffer.from(await doc.save());
}

async function serve(page: Page, rotation: number): Promise<string> {
  const url = `/generated/rotate-${rotation}.pdf`;
  const body = await rotatedPdf(rotation);
  await page.route(`**${url}`, (route) => route.fulfill({ body, contentType: 'application/pdf' }));
  return url;
}

async function open(page: Page, rotation: number): Promise<void> {
  const url = await serve(page, rotation);
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${url}&show=always-visible`);
  await viewer.waitForFirstPageRender();
}

const layer = (page: Page) => page.locator('.page[data-page-number="1"] .annotationEditorLayer');
const eraserButton = (page: Page) => page.locator('#primaryEditorEraser');

async function editorMode(page: Page): Promise<number> {
  return await page.evaluate(() => (window as any).__ngxApp.pdfViewer.annotationEditorMode);
}

async function eraserOn(page: Page): Promise<void> {
  await eraserButton(page).click();
  await expect.poll(() => editorMode(page)).toBe(ERASER);
  await expect(layer(page).locator('.eraserEditor')).toBeAttached();
  // a gesture made in the same instant as the click on the tool can get lost
  await page.waitForTimeout(150);
}

/** The strokes of every ink annotation the editors would save. */
async function inkStrokes(page: Page): Promise<number[]> {
  return await page.evaluate(() =>
    ((window as any).__ngxApp.pdfViewer.getSerializedAnnotations() ?? [])
      .filter((a: any) => a.annotationType === 15)
      .map((a: any) => a.paths?.points?.length ?? 0),
  );
}

/** Drags the eraser in a straight line, in screen pixels relative to the page's editor layer. */
async function erase(page: Page, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> {
  const box = (await layer(page).boundingBox())!;
  await page.mouse.move(box.x + from.x, box.y + from.y);
  await page.mouse.down();
  await page.mouse.move(box.x + to.x, box.y + to.y, { steps: 20 });
  await page.mouse.up();
}

/**
 * A horizontal drawing from (100, 600) to (400, 600) in PDF units, with the given
 * rotation. `NaN` doesn't survive the trip into page.evaluate, so the drawing is
 * built in the page.
 */
async function restoreDrawing(page: Page, rotation = 0, y = 600): Promise<void> {
  await page.evaluate(
    async ([rot, yy]) => {
      await (window as any).__ngxApp.pdfViewer.addEditorAnnotation({
        annotationType: 15,
        color: [200, 0, 0],
        thickness: 6,
        opacity: 1,
        paths: {
          lines: [[NaN, NaN, NaN, NaN, 100, yy, 200, yy, 300, yy, 400, yy]],
          points: [[100, yy, 250, yy, 400, yy]],
        },
        pageIndex: 0,
        rect: [100, yy - 10, 400, yy + 10],
        rotation: rot,
      });
    },
    [rotation, y] as const,
  );
}

/** Where the drawings are on screen: the union of what the draw layer renders. */
async function drawingBox(page: Page): Promise<{ x: number; y: number; width: number; height: number }> {
  return await page.evaluate(() => {
    const rects = [...document.querySelectorAll('.page[data-page-number="1"] .canvasWrapper svg use')]
      .map((u) => u.getBoundingClientRect())
      .filter((r) => r.width > 0 || r.height > 0);
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    return { x: left, y: top, width: right - left, height: bottom - top };
  });
}

/** Cuts the drawing in the middle of its long side, perpendicular to it. */
async function cutThroughTheMiddle(page: Page): Promise<void> {
  const box = await drawingBox(page);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const across = box.width > box.height ? { dx: 0, dy: 40 } : { dx: 40, dy: 0 };
  await page.mouse.move(cx - across.dx, cy - across.dy);
  await page.mouse.down();
  await page.mouse.move(cx + across.dx, cy + across.dy, { steps: 20 });
  await page.mouse.up();
}

async function undo(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).__ngxApp.pdfViewer._layerProperties.annotationEditorUIManager.undo());
}

// 1 ─────────────────────────────────────────────────────────────────────────
for (const rotation of [0, 90, 270]) {
  test(`T60 — /Rotate ${rotation}: the eraser covers the whole page, follows the pointer and cuts a stroke near the top`, async ({ page }) => {
    await open(page, rotation);
    await page.locator('#primaryEditorInk').click();
    await drawInk(page, 1, { x: 100, y: 40 }, [
      { x: 0, y: 0 },
      { x: 300, y: 0 },
    ]);
    expect(await inkStrokes(page)).toEqual([1]);

    await eraserOn(page);
    const layerBox = (await layer(page).boundingBox())!;
    const eraserBox = (await layer(page).locator('.eraserEditor').boundingBox())!;
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(eraserBox[key] - layerBox[key]), `the eraser's ${key}`).toBeLessThanOrEqual(2);
    }

    // the cursor is centered on the pointer
    const pointer = { x: layerBox.x + 250, y: layerBox.y + 120 };
    await page.mouse.move(pointer.x, pointer.y);
    await page.mouse.move(pointer.x + 1, pointer.y + 1);
    const cursor = layer(page).locator('.eraserCursor');
    await expect(cursor).toBeVisible();
    const c = (await cursor.boundingBox())!;
    expect(Math.abs(c.x + c.width / 2 - (pointer.x + 1)), 'cursor x').toBeLessThanOrEqual(3);
    expect(Math.abs(c.y + c.height / 2 - (pointer.y + 1)), 'cursor y').toBeLessThanOrEqual(3);

    // the stroke runs 40 px below the top of the page
    await erase(page, { x: 250, y: 10 }, { x: 250, y: 70 });
    await expect.poll(() => inkStrokes(page), 'the stroke is cut in two').toEqual([2]);
  });
}

// 2 ─────────────────────────────────────────────────────────────────────────
test('T60 — a drawing saved with rotation 0 on a /Rotate 270 page keeps its orientation when the eraser cuts it, and on undo', async ({ page }) => {
  await open(page, 270);
  await restoreDrawing(page, 0);
  await expect.poll(() => inkStrokes(page)).toEqual([1]);
  const before = await drawingBox(page);
  const isWide = (b: { width: number; height: number }) => b.width > b.height;

  await eraserOn(page);
  await cutThroughTheMiddle(page);
  await expect.poll(() => inkStrokes(page), 'the drawing is cut in two').toEqual([2]);
  const cut = await drawingBox(page);
  expect(isWide(cut), `before ${JSON.stringify(before)}, after the cut ${JSON.stringify(cut)}`).toBe(isWide(before));

  await undo(page);
  await expect.poll(() => inkStrokes(page)).toEqual([1]);
  const undone = await drawingBox(page);
  expect(isWide(undone), `before ${JSON.stringify(before)}, after undo ${JSON.stringify(undone)}`).toBe(isWide(before));
});

// 3 ─────────────────────────────────────────────────────────────────────────
test('T60 — three drawings restored one by one take three undo steps, one each', async ({ page }) => {
  await open(page, 0);
  for (const y of [600, 500, 400]) {
    await restoreDrawing(page, 0, y);
  }
  await expect.poll(async () => (await inkStrokes(page)).length).toBe(3);

  for (const left of [2, 1, 0]) {
    await undo(page);
    await expect.poll(async () => (await inkStrokes(page)).length, `after an undo, ${left} drawings are left`).toBe(left);
  }
});

// 4 ─────────────────────────────────────────────────────────────────────────
test('T60 — the eraser of a page that left the page cache works again when the user comes back to it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/e2e/viewer?src=/assets/pdfs/GraalVM.pdf&show=always-visible');
  await viewer.waitForFirstPageRender();
  // ngx keeps 50 pages; three let page 1 of this 39-page document drop out
  await page.evaluate(() => ((window as any).__ngxApp.pdfViewer.defaultCacheSize = 3));
  const goTo = async (pageNumber: number) => {
    await page.evaluate((n) => ((window as any).__ngxApp.pdfViewer.currentPageNumber = n), pageNumber);
    await expect(page.locator(`.page[data-page-number="${pageNumber}"] canvas`)).toBeVisible();
  };
  const firstPageState = () => page.evaluate(() => (window as any).__ngxApp.pdfViewer.getPageView(0).renderingState);

  await eraserOn(page);
  for (const n of [8, 16, 24, 32, 39]) {
    await goTo(n);
  }
  await expect.poll(firstPageState, 'page 1 left the page cache').toBe(0);
  // the idle cleanup throws away the editor layers of the pages that aren't rendered, page 1's
  // eraser included (it runs after 30 seconds without rendering)
  await page.evaluate(() => (window as any).__ngxApp.pdfViewer.cleanup());
  expect(await page.evaluate(() => !!(window as any).__ngxApp.pdfViewer.getPageView(0).annotationEditorLayer), 'page 1 lost its editor layer').toBe(false);

  for (const n of [24, 8, 1]) {
    await goTo(n);
  }
  await expect(layer(page).locator('.eraserEditor')).toBeAttached();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

// 5 ─────────────────────────────────────────────────────────────────────────
test('T60 — a drawing restored while the eraser is on leaves the pointer to the eraser, and is erased', async ({ page }) => {
  await open(page, 0);
  await eraserOn(page);
  await restoreDrawing(page, 0);
  await expect.poll(() => inkStrokes(page)).toEqual([1]);
  await expect(layer(page).locator('.inkEditor')).toBeAttached();

  // the eraser follows the pointer across the whole layer, so a drag erases
  // either way; what matters is what is under the pointer
  const box = await drawingBox(page);
  const underThePointer = await page.evaluate(
    ([x, y]) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('.eraserEditor, .inkEditor')?.className ?? '',
    [box.x + box.width / 2, box.y + box.height / 2] as const,
  );
  expect(underThePointer, 'the element under the pointer').toContain('eraserEditor');

  await cutThroughTheMiddle(page);
  await expect(layer(page).locator('.selectedEditor')).toHaveCount(0);
  await expect.poll(() => inkStrokes(page), 'the drawing is cut in two').toEqual([2]);
});
