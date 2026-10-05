import { expect, type Page } from '@playwright/test';

/**
 * Real user gestures that create annotations with pdf.js's editors.
 *
 * Every gesture is re-issued until it lands: pdf.js loads the editor code
 * lazily, and the first editor gesture of a fresh browser session can be
 * dropped outright - waiting longer doesn't bring it back, drawing again does
 * (see the note in T27 and the showcase-e2e-flakiness notes).
 *
 * The caller switches the editor on first (e.g. `viewer.activateEditor('draw')`).
 */

function editorLayer(page: Page, pageNumber: number) {
  return page.locator(`.page[data-page-number="${pageNumber}"] .annotationEditorLayer`).first();
}

/**
 * Waits until the editor layer is up, plus a moment. A stroke that starts
 * within a few milliseconds of switching the editor on is cut short: pdf.js
 * records only its first points (a 180-point line became a 10-point dot).
 * 100 ms is already enough, and no human draws that fast after clicking a
 * tool - so this models the user rather than hiding a bug.
 */
async function editorReady(page: Page, pageNumber: number): Promise<void> {
  await editorLayer(page, pageNumber).waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForTimeout(150);
}

async function countEditors(page: Page, pageNumber: number): Promise<number> {
  return await editorLayer(page, pageNumber).locator(':scope > *').count();
}

/** Re-runs `gesture` until the editor layer of the page has gained an editor. */
export async function landAnnotation(page: Page, pageNumber: number, gesture: () => Promise<void>): Promise<void> {
  const before = await countEditors(page, pageNumber);
  await expect
    .poll(
      async () => {
        if ((await countEditors(page, pageNumber)) > before) return true;
        await gesture();
        return (await countEditors(page, pageNumber)) > before;
      },
      { timeout: 25_000, intervals: [500, 1000, 1500] },
    )
    .toBe(true);
}

/**
 * Draws an ink stroke and commits it (Escape ends the drawing session and
 * turns the stroke into an editor). By default a zig-zag near the top-left of
 * the page; `points` (relative to the editor layer) draws any polyline.
 * Checks that the whole stroke was recorded, not just its start.
 */
export async function drawInk(
  page: Page,
  pageNumber = 1,
  offset = { x: 120, y: 80 },
  points: Array<{ x: number; y: number }> = [
    { x: 0, y: 0 },
    { x: 60, y: 40 },
    { x: 120, y: 20 },
  ],
): Promise<void> {
  await editorReady(page, pageNumber);
  const layer = editorLayer(page, pageNumber);
  await layer.scrollIntoViewIfNeeded();
  const box = (await layer.boundingBox())!;
  const at = (p: { x: number; y: number }) => ({ x: box.x + offset.x + p.x, y: box.y + offset.y + p.y });
  await landAnnotation(page, pageNumber, async () => {
    const start = at(points[0]);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (const p of points.slice(1)) {
      const next = at(p);
      await page.mouse.move(next.x, next.y, { steps: 12 });
    }
    await page.mouse.up();
    await page.keyboard.press('Escape');
  });
  const width = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
  const drawn = (await layer.locator('.inkEditor').last().boundingBox())!;
  expect(drawn.width, 'the whole stroke was recorded, not just its start').toBeGreaterThan(width * 0.8);
}

/**
 * Places a free-text editor with a click and types `text` into it, then
 * commits it with Escape. Types into the contenteditable element itself:
 * ambient keyboard focus gets lost after the click in WebKit.
 */
export async function typeFreeText(page: Page, text: string, pageNumber = 1, at = { x: 0.25, y: 0.25 }): Promise<void> {
  await editorReady(page, pageNumber);
  const layer = editorLayer(page, pageNumber);
  await layer.scrollIntoViewIfNeeded();
  const box = (await layer.boundingBox())!;
  const x = box.x + box.width * at.x;
  const y = box.y + box.height * at.y;
  const content = page.locator(`.page[data-page-number="${pageNumber}"] .freeTextEditor .internal`).first();
  const readText = async (): Promise<string> =>
    (await content.evaluate((el) => (el as HTMLElement).innerText).catch(() => '')) ?? '';
  await expect
    .poll(
      async () => {
        try {
          if (!(await content.count())) {
            await page.mouse.click(x, y);
            return '';
          }
          if (!(await readText()).includes(text)) {
            await content.pressSequentially(text, { timeout: 5_000 });
          }
          return await readText();
        } catch {
          return '';
        }
      },
      { timeout: 25_000, intervals: [500, 1000, 1500] },
    )
    .toContain(text);
  await page.keyboard.press('Escape');
}

/**
 * Highlights a text-layer span that contains `word` by drag-selecting across
 * it. Returns the span's text, so the caller knows what was highlighted.
 */
export async function highlightWord(page: Page, word: string, pageNumber = 1): Promise<string> {
  await editorReady(page, pageNumber);
  // Leaf spans only: pdf.js wraps runs in boxless `markedContent` spans.
  const span = page
    .locator(`.page[data-page-number="${pageNumber}"] .textLayer span:not(:has(span))`)
    .filter({ hasText: word })
    .first();
  await expect(span).toBeVisible({ timeout: 10_000 });
  await span.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await span.boundingBox())?.width ?? 0).toBeGreaterThan(0);
  const spanBox = (await span.boundingBox())!;
  const midY = spanBox.y + spanBox.height / 2;
  await landAnnotation(page, pageNumber, async () => {
    await page.mouse.move(spanBox.x + 2, midY);
    await page.mouse.down();
    await page.mouse.move(spanBox.x + spanBox.width - 2, midY, { steps: 10 });
    await page.mouse.up();
  });
  return (await span.textContent()) ?? '';
}
