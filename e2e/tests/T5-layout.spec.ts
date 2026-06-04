import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * Scroll-mode and spread-mode layout tests. We zoom out so several pages
 * fit on screen at once, then verify the page DOM elements end up at the
 * coordinates the chosen layout implies. We read `offsetLeft`/`offsetTop`
 * directly (via `getPageLayout`) so the assertions work even when a page
 * is currently outside the viewport.
 */
const CANONICAL_ROUTE = '/extended-pdf-viewer/textlayer';

/** Wait until each requested page has a non-null offsetLeft/offsetTop. */
async function waitForPagesLaidOut(
  viewer: PdfViewerPage,
  pages: number[],
  timeoutMs = 15_000,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const boxes = await Promise.all(
          pages.map((n) => viewer.getPageLayout(n)),
        );
        return boxes.every((b) => b !== null && b.width > 0 && b.height > 0);
      },
      { timeout: timeoutMs },
    )
    .toBe(true);
}

test.describe.configure({ mode: 'parallel' });

test.describe('T5 layout — scroll modes', () => {
  test('vertical scroll: page 2 sits below page 1', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.setScrollMode('vertical');
    await viewer.setSpreadMode('none');
    await viewer.setZoom('0.5');
    await waitForPagesLaidOut(viewer, [1, 2]);

    const p1 = (await viewer.getPageLayout(1))!;
    const p2 = (await viewer.getPageLayout(2))!;
    // Vertical: page 2 is clearly below page 1, horizontally aligned.
    expect(p2.y).toBeGreaterThan(p1.y + p1.height / 2);
    expect(p2.x).toBeCloseTo(p1.x, -1);
  });

  test('horizontal scroll: page 2 sits to the right of page 1', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.setSpreadMode('none');
    await viewer.setScrollMode('horizontal');
    await viewer.setZoom('0.5');
    await waitForPagesLaidOut(viewer, [1, 2]);

    const p1 = (await viewer.getPageLayout(1))!;
    const p2 = (await viewer.getPageLayout(2))!;
    // Horizontal: page 2 is clearly to the right of page 1, vertically aligned.
    expect(p2.x).toBeGreaterThan(p1.x + p1.width / 2);
    expect(p2.y).toBeCloseTo(p1.y, -1);
  });

  test('wrapped scroll at low zoom: three pages share a row', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.setSpreadMode('none');
    await viewer.setScrollMode('wrapped');
    await viewer.setZoom('0.5');
    await waitForPagesLaidOut(viewer, [1, 2, 3]);

    const p1 = (await viewer.getPageLayout(1))!;
    const p2 = (await viewer.getPageLayout(2))!;
    const p3 = (await viewer.getPageLayout(3))!;

    // Pages 1-3 on the same row.
    expect(p2.y).toBeCloseTo(p1.y, -1);
    expect(p3.y).toBeCloseTo(p1.y, -1);
    // Ordered left-to-right.
    expect(p2.x).toBeGreaterThan(p1.x);
    expect(p3.x).toBeGreaterThan(p2.x);
  });
});

test.describe('T5 layout — spread modes', () => {
  // pdf.js "odd spread" means pairs starting with odd pages — i.e. pages
  // (1-2), (3-4), (5-6) — so the *left* page of each pair has an odd number.
  // "even spread" leaves page 1 alone, then pairs (2-3), (4-5), (6-7).
  test('odd spread: pages 1 and 2 sit side by side', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.setScrollMode('vertical');
    await viewer.setSpreadMode('odd');
    await viewer.setZoom('0.5');
    await waitForPagesLaidOut(viewer, [1, 2]);

    const p1 = (await viewer.getPageLayout(1))!;
    const p2 = (await viewer.getPageLayout(2))!;
    expect(p2.y).toBeCloseTo(p1.y, -1);
    expect(p2.x).toBeGreaterThan(p1.x);
  });

  test('even spread: pages 2 and 3 sit side by side', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.setScrollMode('vertical');
    await viewer.setSpreadMode('even');
    await viewer.setZoom('0.5');
    await waitForPagesLaidOut(viewer, [2, 3]);

    const p2 = (await viewer.getPageLayout(2))!;
    const p3 = (await viewer.getPageLayout(3))!;
    expect(p3.y).toBeCloseTo(p2.y, -1);
    expect(p3.x).toBeGreaterThan(p2.x);
  });
});
