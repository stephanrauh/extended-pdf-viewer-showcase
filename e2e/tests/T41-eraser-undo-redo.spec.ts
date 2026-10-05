import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { drawInk, highlightWord, typeFreeText } from '../poms/editor-gestures';
import { downloadPdf, readPdf } from '../poms/pdf-file';

/**
 * T41 — the eraser and the undo/redo buttons (stephanrauh/pdf.js#14).
 *
 * The eraser cuts drawn strokes apart where it passes; text, free text and
 * text highlights are out of its reach. Erasing is an editor action like any
 * other, so undo/redo - via the toolbar buttons and the keyboard - takes it
 * back and forth. The checks read the editors' serialized data (how many
 * strokes, how many points), and the last test reopens the saved file.
 *
 * Runs on the bare viewer (src/app/e2e-harness) with every button in the
 * toolbar; T39 covers the same buttons from the secondary menu.
 */

test.describe.configure({ mode: 'parallel' });

const TEXT = '/assets/pdfs/blind-text-collection.pdf';
const TYPE = { FREETEXT: 3, HIGHLIGHT: 9, INK: 15 };

async function open(page: Page): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${TEXT}&show=always-visible`);
  await viewer.waitForFirstPageRender();
  return viewer;
}

/** A stroke as its horizontal extent in PDF units: [leftmost x, rightmost x]. */
type Span = [number, number];
type Serialized = { type: number; strokes: Span[] };

/** The annotations the editors would save, with each stroke's x extent. */
async function serialized(page: Page): Promise<Serialized[]> {
  return await page.evaluate(() =>
    ((window as any).__ngxApp.pdfViewer.getSerializedAnnotations() ?? []).map((a: any) => ({
      type: a.annotationType,
      // `paths.points` holds each stroke as a flat [x0, y0, x1, y1, ...] list.
      strokes: (a.paths?.points ?? []).map((p: number[]) => {
        const xs = p.filter((_: number, i: number) => i % 2 === 0);
        return [Math.round(Math.min(...xs)), Math.round(Math.max(...xs))];
      }),
    })),
  );
}

const inks = async (page: Page) => (await serialized(page)).filter((a) => a.type === TYPE.INK);

/** The gap between the two halves of a cut stroke, in PDF units. */
function gap(strokes: Span[]): number {
  const [a, b] = [...strokes].sort((s, t) => s[0] - t[0]);
  return b[0] - a[1];
}

/**
 * A straight horizontal stroke, 300 px long, `y` px below the page's top.
 * Escape ends a drawing session and leaves the Draw tool, so it is switched
 * on again first if needed.
 */
async function drawLine(page: Page, y: number): Promise<void> {
  if ((await page.evaluate(() => (window as any).__ngxApp.pdfViewer.annotationEditorMode)) !== TYPE.INK) {
    await page.locator('#primaryEditorInk').click();
  }
  await drawInk(page, 1, { x: 150, y }, [
    { x: 0, y: 0 },
    { x: 300, y: 0 },
  ]);
}

/** Drags the eraser vertically across the page at `x`, from `y1` to `y2`. */
async function erase(page: Page, x: number, y1: number, y2: number): Promise<void> {
  const box = (await page.locator('.page[data-page-number="1"] .annotationEditorLayer').boundingBox())!;
  await page.mouse.move(box.x + x, box.y + y1);
  await page.mouse.down();
  await page.mouse.move(box.x + x, box.y + y2, { steps: 20 });
  await page.mouse.up();
}

const undoButton = (page: Page) => page.locator('#primaryEditorUndo');
const redoButton = (page: Page) => page.locator('#primaryEditorRedo');
const eraserButton = (page: Page) => page.locator('#primaryEditorEraser');

test('T41 — the eraser cuts a stroke in two; undo restores it, redo cuts it again', async ({ page }) => {
  await open(page);
  await drawLine(page, 150);
  const [drawn] = await inks(page);
  expect(drawn.strokes).toHaveLength(1);
  const [x0, x1] = drawn.strokes[0];

  await eraserButton(page).click();
  await erase(page, 300, 110, 190);

  await expect.poll(async () => (await inks(page))[0].strokes.length, 'two strokes left').toBe(2);
  const cut = (await inks(page))[0].strokes;
  // A visible gap where the eraser passed, and both halves still reach the
  // original ends: the eraser took the middle, not one end.
  expect(gap(cut), `gap in ${JSON.stringify(cut)}`).toBeGreaterThan(5);
  const ends = cut.flat();
  expect(Math.min(...ends)).toBeLessThanOrEqual(x0 + 1);
  expect(Math.max(...ends)).toBeGreaterThanOrEqual(x1 - 1);

  await undoButton(page).click();
  await expect.poll(async () => (await inks(page))[0].strokes).toEqual([[x0, x1]]);
  await redoButton(page).click();
  await expect.poll(async () => (await inks(page))[0].strokes).toEqual(cut);
});

test('T41 — a bigger eraser cuts a wider gap', async ({ page }) => {
  await open(page);
  await drawLine(page, 120);
  await drawLine(page, 260);
  expect(await inks(page)).toHaveLength(2);

  await eraserButton(page).click();
  const size = page.locator('#editorEraserThickness');
  await expect(size).toBeVisible();
  await expect(size).toHaveValue('20');
  await erase(page, 300, 90, 150); // across the first line only
  await size.fill('100');
  await erase(page, 300, 230, 290); // across the second line only

  await expect.poll(async () => (await inks(page)).map((s) => s.strokes.length)).toEqual([2, 2]);
  const [small, big] = (await inks(page)).map((s) => gap(s.strokes));
  expect(big, `gap: size 20 → ${small}, size 100 → ${big}`).toBeGreaterThan(small * 2);
});

test('T41 — the eraser leaves free text and text highlights alone', async ({ page }) => {
  const viewer = await open(page);
  await viewer.activateEditor('highlight');
  await highlightWord(page, 'Vokalia');
  await viewer.activateEditor('highlight');
  await viewer.activateEditor('text');
  await typeFreeText(page, 'Do not erase me', 1, { x: 0.6, y: 0.2 });
  await viewer.activateEditor('text');
  const before = await serialized(page);
  expect(before.map((a) => a.type).sort()).toEqual([TYPE.FREETEXT, TYPE.HIGHLIGHT]);

  // Scrub the eraser over both of them.
  await eraserButton(page).click();
  for (const target of ['.freeTextEditor', '.highlightEditor']) {
    const box = (await page.locator(`.page[data-page-number="1"] ${target}`).first().boundingBox())!;
    const layer = (await page.locator('.page[data-page-number="1"] .annotationEditorLayer').boundingBox())!;
    for (const dx of [0.25, 0.5, 0.75]) {
      await erase(page, box.x - layer.x + box.width * dx, box.y - layer.y - 5, box.y - layer.y + box.height + 5);
    }
  }

  await page.waitForTimeout(500);
  expect(await serialized(page)).toEqual(before);
  await expect(page.locator('.page[data-page-number="1"] .freeTextEditor')).toContainText('Do not erase me');
});

test('T41 — undo and redo are only enabled when there is something to undo or redo', async ({ page }) => {
  const viewer = await open(page);
  // Nothing done yet.
  await expect(undoButton(page)).toBeDisabled();
  await expect(redoButton(page)).toBeDisabled();

  await viewer.activateEditor('draw');
  await expect(undoButton(page), 'still nothing to undo').toBeDisabled();
  await drawLine(page, 150);
  // drawLine leaves the Draw tool (Escape). The buttons stay usable anyway.
  await expect(undoButton(page)).toBeEnabled();
  await expect(redoButton(page)).toBeDisabled();

  await undoButton(page).click();
  await expect.poll(async () => (await inks(page)).length).toBe(0);
  await expect(undoButton(page), 'the only change is undone').toBeDisabled();
  await expect(redoButton(page)).toBeEnabled();

  await redoButton(page).click();
  await expect.poll(async () => (await inks(page)).length).toBe(1);
  await expect(redoButton(page)).toBeDisabled();
});

test('T41 — the keyboard shortcuts undo and redo while an editor is active', async ({ page }) => {
  const viewer = await open(page);
  await drawLine(page, 150);
  const mac = await page.evaluate(() => /Mac/.test(navigator.platform));

  // No editor active (drawLine ended with Escape): the shortcut does nothing.
  await viewer.viewerContainer.click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('ControlOrMeta+z');
  await page.waitForTimeout(500);
  expect(await inks(page), 'no undo without an active editor').toHaveLength(1);

  await viewer.activateEditor('draw');
  await page.keyboard.press('ControlOrMeta+z');
  await expect.poll(async () => (await inks(page)).length, 'Ctrl/Cmd+Z undoes the stroke').toBe(0);
  await page.keyboard.press(mac ? 'Meta+Shift+z' : 'Control+y');
  await expect.poll(async () => (await inks(page)).length, 'redo brings it back').toBe(1);
});

test('T41 — the cut stroke is what ends up in the saved file', async ({ page }) => {
  await open(page);
  await drawLine(page, 150);
  await eraserButton(page).click();
  await erase(page, 300, 110, 190);
  await expect.poll(async () => (await inks(page))[0].strokes.length).toBe(2);
  await eraserButton(page).click();

  const saved = await readPdf(page, await downloadPdf(page));
  const ink = saved.annotations.filter((a) => a.annotationType === TYPE.INK);
  expect(ink).toHaveLength(1);
  expect(ink[0].inkLines, 'the saved ink annotation has the two halves').toBe(2);
});
