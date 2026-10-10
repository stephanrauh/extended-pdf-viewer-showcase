import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T52 — book mode gestures: turning a page by dragging it, [enableFlipByDrag]
 * and [showPageCorners] (the folded corner a page shows when the mouse comes
 * near it).
 *
 * The page-flip library reports what it's doing as a state - 'read',
 * 'fold_corner', 'user_fold' or 'flipping' - so the tests don't need
 * screenshots. The hand tool is off: with the hand tool, the mouse pans the
 * book instead of turning its pages (#3140).
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';

async function openBook(page: Page, query = ''): Promise<void> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${DOC}&pageViewMode=book&page=2&zoom=page-fit&handTool=false${query}`);
  await viewer.waitForPageRender(2);
  await expect.poll(() => flipState(page), { timeout: 15_000 }).toBe('read');
  await expect.poll(() => currentPage(page), { timeout: 10_000 }).toBe(2);
}

const flipState = (page: Page) => page.evaluate(() => (window as any).__ngxApp?.pdfViewer?.pageFlip?.getState());
const currentPage = (page: Page) => page.evaluate(() => (window as any).__ngxApp.page);

/** The outer edges of the open book (the two visible pages). */
async function book(page: Page): Promise<{ left: number; right: number; top: number; bottom: number }> {
  return await page.evaluate(() => {
    const rects = Array.from(document.querySelectorAll<HTMLElement>('.page.stf__item[data-page-number]'))
      .filter((p) => getComputedStyle(p).display !== 'none')
      .map((p) => p.getBoundingClientRect())
      .filter((r) => r.width > 0);
    return {
      left: Math.min(...rects.map((r) => r.left)),
      right: Math.max(...rects.map((r) => r.right)),
      top: Math.max(...rects.map((r) => r.top)),
      bottom: Math.min(...rects.map((r) => r.bottom)),
    };
  });
}

/** Grabs the bottom-right corner of the right page and drags it to the left side of the book. */
async function dragPage(page: Page): Promise<void> {
  const b = await book(page);
  expect(b.bottom, 'the whole book is visible').toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.mouse.move(b.right - 15, b.bottom - 15);
  await page.mouse.down();
  await page.mouse.move(b.left + (b.right - b.left) * 0.15, b.bottom - 40, { steps: 25 });
  await page.mouse.up();
}

test('dragging the corner of the right page across the book turns the page', async ({ page }) => {
  await openBook(page);
  expect(await currentPage(page)).toBe(2);
  await dragPage(page);
  await expect.poll(() => currentPage(page), { timeout: 10_000 }).toBe(4);
  await expect.poll(() => flipState(page)).toBe('read');
});

// #3294: zooming into a book activates the hand tool. Its mousedown handler
// used to swallow the clicks that turn the page.
test('with the hand tool, clicking a page turns it, and panning doesn\'t', async ({ page }) => {
  await openBook(page);
  await page.evaluate(() => (window as any).__ngxApp.eventBus.dispatch('switchcursortool', { tool: 1 }));
  await expect.poll(() => page.evaluate(() => (window as any).__ngxApp.pdfCursorTools.activeTool)).toBe(1);
  const b = await book(page);
  const middle = (b.top + b.bottom) / 2;

  // a click on the right page turns it
  await page.mouse.click(b.right - 100, middle);
  await expect.poll(() => currentPage(page), { timeout: 10_000 }).toBe(4);
  await expect.poll(() => flipState(page)).toBe('read');

  // a drag pans; the click the browser fires afterwards mustn't turn the page
  await page.mouse.move(b.right - 100, middle);
  await page.mouse.down();
  await page.mouse.move(b.right - 300, middle - 20, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1500);
  expect(await currentPage(page)).toBe(4);

  // a click on the left page turns it back
  await page.mouse.click(b.left + 100, middle);
  await expect.poll(() => currentPage(page), { timeout: 10_000 }).toBe(2);
});

test('[enableFlipByDrag]="false": dragging doesn\'t turn the page', async ({ page }) => {
  await openBook(page, '&enableFlipByDrag=false');
  await dragPage(page);
  await page.waitForTimeout(1500);
  expect(await currentPage(page)).toBe(2);
  expect(await flipState(page)).toBe('read');
});

test('[showPageCorners]: the corner folds when the mouse comes near it - and doesn\'t when switched off', async ({ page }) => {
  await openBook(page, '&showPageCorners=true');
  const b = await book(page);
  // The corner zone starts a few pixels inside the page.
  await page.mouse.move(b.right - 300, b.bottom - 300);
  await page.mouse.move(b.right - 40, b.bottom - 30, { steps: 10 });
  await expect.poll(() => flipState(page), { timeout: 5_000 }).toBe('fold_corner');
  // Moving away unfolds it again.
  await page.mouse.move(b.right - 400, b.top + 200, { steps: 10 });
  await expect.poll(() => flipState(page), { timeout: 5_000 }).toBe('read');

  await page.evaluate(() => (window as any).__setInput('showPageCorners', false));
  await page.waitForTimeout(300);
  await page.mouse.move(b.right - 40, b.bottom - 30, { steps: 10 });
  await page.waitForTimeout(800);
  expect(await flipState(page)).toBe('read');
});
