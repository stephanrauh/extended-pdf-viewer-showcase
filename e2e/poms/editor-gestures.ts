import { expect, type Page } from '@playwright/test';

/**
 * Real user gestures that create annotations with pdf.js's editors.
 *
 * pdf.js drops an editor gesture that starts in the same instant as the click
 * on the tool (measured: 5 of 15 dropped at 0 ms, none of 45 at 100 ms or
 * more, cold browser sessions included). No human is that fast, so the tests
 * pause like a user after picking a tool and then perform every gesture
 * exactly once - a dropped gesture fails the test instead of being retried.
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

/** Runs `gesture` once and expects the editor layer of the page to gain an editor. */
export async function landAnnotation(page: Page, pageNumber: number, gesture: () => Promise<void>): Promise<void> {
  const before = await countEditors(page, pageNumber);
  await gesture();
  await expect
    .poll(async () => await countEditors(page, pageNumber), { message: 'the gesture created an editor', timeout: 10_000 })
    .toBeGreaterThan(before);
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
  const content = page.locator(`.page[data-page-number="${pageNumber}"] .freeTextEditor .internal`).last();
  const editorsBefore = await page.locator(`.page[data-page-number="${pageNumber}"] .freeTextEditor`).count();
  await page.mouse.click(x, y);
  await expect(page.locator(`.page[data-page-number="${pageNumber}"] .freeTextEditor`), 'the click placed an editor').toHaveCount(editorsBefore + 1);
  await content.pressSequentially(text);
  await expect.poll(async () => await content.evaluate((el) => (el as HTMLElement).innerText)).toContain(text);
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
