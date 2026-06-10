import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * Shared pdf.js toolbar interactions. The toolbar is the same component on
 * every viewer route, so we exercise it once on a canonical route. We use
 * /textlayer because it sets `textLayer=true`, which is required to render
 * the Find button.
 */
const CANONICAL_ROUTE = '/extended-pdf-viewer/textlayer';

test.describe.configure({ mode: 'parallel' });

test.describe('T4 toolbar — page navigation', () => {
  // Each navigation test verifies three things:
  //   1. pdf.js's page indicator updates  — the viewer agrees we moved
  //   2. the destination page's canvas paints real ink  — pixels are there
  //   3. the destination page's text layer text differs from the origin —
  //      we're actually looking at different content, not the same page

  test('Next Page advances to the next page in the viewport', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    const before = await viewer.getCurrentPage();
    const beforeText = await viewer.getTextLayerContent(before);

    await viewer.nextPage();
    await expect
      .poll(async () => await viewer.getCurrentPage(), { timeout: 10_000 })
      .toBe(before + 1);

    await viewer.waitForPageRender(before + 1);
    await viewer.assertCanvasHasContent(before + 1);
    expect(await viewer.getTextLayerContent(before + 1)).not.toBe(beforeText);
  });

  test('Previous Page reverses to the prior page in the viewport', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.nextPage();
    await viewer.nextPage();
    const before = await viewer.getCurrentPage();
    const beforeText = await viewer.getTextLayerContent(before);

    await viewer.previousPage();
    await expect
      .poll(async () => await viewer.getCurrentPage(), { timeout: 10_000 })
      .toBe(before - 1);

    await viewer.waitForPageRender(before - 1);
    await viewer.assertCanvasHasContent(before - 1);
    expect(await viewer.getTextLayerContent(before - 1)).not.toBe(beforeText);
  });

  test('Last page button jumps to the document end', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    const total = await viewer.getPageCount();

    await viewer.lastPage();
    await expect
      .poll(async () => await viewer.getCurrentPage(), { timeout: 15_000 })
      .toBe(total);

    await viewer.waitForPageRender(total);
    await viewer.assertCanvasHasContent(total);
  });

  test('First page button jumps back to page 1', async ({ page }) => {
    // After jumping to the last page, pdf.js may have evicted page 1's
    // canvas. firstPage() then re-renders from scratch, which is slow in
    // dev mode — give the test a roomier budget.
    test.setTimeout(120_000);
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.lastPage();
    await viewer.firstPage();
    await expect
      .poll(async () => await viewer.getCurrentPage(), { timeout: 15_000 })
      .toBe(1);

    await viewer.waitForPageRender(1);
    await viewer.assertCanvasHasContent(1);
  });

  test('typing a page number jumps to that page', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    const startText = await viewer.getTextLayerContent(
      await viewer.getCurrentPage(),
    );

    // Page 7 is a content page in the demo PDF — low-numbered pages may be
    // title/TOC/blank pages, which would fail the "canvas has ink" check.
    await viewer.gotoPage(7);
    await viewer.waitForPageRender(7);
    expect(await viewer.getCurrentPage()).toBe(7);
    await viewer.assertCanvasHasContent(7);
    expect(await viewer.getTextLayerContent(7)).not.toBe(startText);
  });
});

test.describe('T4 toolbar — zoom', () => {
  test('Zoom In grows the canvas in both dimensions', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    await viewer.setZoom('1');
    await expect
      .poll(async () => await viewer.getZoomValue(), { timeout: 5_000 })
      .toBe('1');
    const visiblePage = await viewer.waitForCurrentPage();
    await viewer.waitForPageRender(visiblePage);
    const before = await viewer.getCanvasSize(visiblePage);

    await viewer.zoomIn();

    // The zoom select moves off "1" and BOTH canvas dimensions grow —
    // width-only checks miss a regression where the scale factor only
    // applies on one axis.
    await expect
      .poll(async () => await viewer.getZoomValue(), { timeout: 5_000 })
      .not.toBe('1');
    await expect
      .poll(async () => (await viewer.getCanvasSize(visiblePage)).width, {
        timeout: 15_000,
      })
      .toBeGreaterThan(before.width);
    const after = await viewer.getCanvasSize(visiblePage);
    expect(after.height).toBeGreaterThan(before.height);
    await viewer.assertCanvasHasContent(visiblePage);
    // Overlay layers must follow the canvas's new size.
    await viewer.expectVisiblePageLayersAligned(visiblePage);
  });

  test('Zoom Out shrinks the canvas back down', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    await viewer.setZoom('1');
    const visiblePage = await viewer.waitForCurrentPage();
    await viewer.waitForPageRender(visiblePage);
    const baseline = await viewer.getCanvasSize(visiblePage);

    // Establish an enlarged baseline — wait for the canvas itself to
    // actually grow, not just for the dropdown to tick (the re-render
    // lags the dropdown change, so reading too early captures a
    // pre-settle size and zoom-out then appears to grow).
    await viewer.zoomIn();
    await viewer.zoomIn();
    await expect
      .poll(async () => (await viewer.getCanvasSize(visiblePage)).width, {
        timeout: 15_000,
      })
      .toBeGreaterThan(baseline.width);
    const enlarged = await viewer.getCanvasSize(visiblePage);

    // Zoom out the same number of steps we zoomed in, returning to the
    // baseline scale. getCanvasSize reports the *backing-store* pixel size,
    // which pdf.js caps at maxCanvasPixels (5 MP on platforms it detects as
    // iOS — including Playwright's webkit on macOS, which reports platform
    // "MacIntel" plus touch points). Once that cap is reached the backing
    // store saturates, so adjacent zoomed-in levels report the *same* width
    // and a single zoom-out can't be observed. Returning all the way to the
    // baseline scale drops below the cap, where the shrink is measurable
    // again — and the poll, by waiting for the backing store to actually
    // change, also waits for the re-render to settle before we check layer
    // alignment.
    await viewer.zoomOut();
    await viewer.zoomOut();
    await expect
      .poll(async () => (await viewer.getCanvasSize(visiblePage)).width, {
        timeout: 15_000,
      })
      .toBeLessThan(enlarged.width);
    const shrunk = await viewer.getCanvasSize(visiblePage);
    expect(shrunk.height).toBeLessThan(enlarged.height);
    await viewer.expectVisiblePageLayersAligned(visiblePage);
  });

  test('selecting "page-fit" switches preset, re-renders, and keeps layers aligned', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    await viewer.setZoom('1');
    const visiblePage = await viewer.waitForCurrentPage();
    await viewer.waitForPageRender(visiblePage);
    const before = await viewer.getCanvasSize(visiblePage);

    await viewer.setZoom('page-fit');

    // Three signals: the preset selected, the canvas actually re-sized,
    // and the overlay layers still line up with the canvas.
    await expect
      .poll(async () => await viewer.getZoomValue(), { timeout: 5_000 })
      .toBe('page-fit');
    await expect
      .poll(
        async () => {
          const size = await viewer.getCanvasSize(visiblePage);
          return size.width !== before.width || size.height !== before.height;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
    await viewer.expectVisiblePageLayersAligned(visiblePage);
  });
});

test.describe('T4 toolbar — sidebar', () => {
  test('Toggle Sidebar opens the sidebar', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    expect(await viewer.isSidebarOpen()).toBe(false);
    await viewer.toggleSidebar();
    await expect
      .poll(async () => await viewer.isSidebarOpen(), { timeout: 5_000 })
      .toBe(true);
  });
});

test.describe('T4 toolbar — find bar', () => {
  test('opening the find bar reveals the search input', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.openFindBar();
    await expect(page.locator('#findInput').first()).toBeVisible();
  });

  test('searching reports a non-zero result count', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    await viewer.findInDocument('the');
    // pdf.js updates #findResultsCount as it iterates pages. We assert the
    // span both renders AND reports an actual numeric match — "visible but
    // empty" used to pass when find was completely broken.
    const resultsCount = page.locator('#findResultsCount').first();
    await expect(resultsCount).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(async () => (await resultsCount.textContent())?.trim() ?? '', {
        timeout: 15_000,
      })
      .toMatch(/[1-9]\d*/);
  });
});

test.describe('T4 toolbar — secondary menu', () => {
  test('Tools button opens the secondary toolbar', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();

    // Closed state: #secondaryToolbar has the `hidden` class.
    await expect(page.locator('#secondaryToolbar')).toHaveClass(/hidden/);
    await viewer.openSecondaryToolbar();
    await expect(page.locator('#secondaryToolbar')).not.toHaveClass(/hidden/);
  });

  test('Rotate Clockwise advances data-main-rotation by 90°', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    const visiblePage = await viewer.waitForCurrentPage();
    const beforeRotation = await viewer.getMainRotation(visiblePage);

    await viewer.rotateClockwise();

    // pdf.js's CSS keys off data-main-rotation; asserting the attribute
    // catches regressions a canvas-hash check would miss (e.g. the page
    // re-rendered but the rotation attribute didn't update).
    const expected = (beforeRotation + 90) % 360;
    await expect
      .poll(async () => await viewer.getMainRotation(visiblePage), {
        timeout: 15_000,
      })
      .toBe(expected);
    await viewer.assertCanvasHasContent(visiblePage);
  });

  test('Rotate Clockwise cycles 0 → 90 → 180 → 270 → 0', async ({ page }) => {
    // The full cycle protects the data-main-rotation contract end-to-end:
    // pdf.js mods by 360, so a bug that returned absolute angles (90, 180,
    // 270, 360) would only fail here, not in the single-step test.
    test.setTimeout(120_000);
    const viewer = new PdfViewerPage(page);
    await viewer.goto(CANONICAL_ROUTE);
    await viewer.waitForFirstPageRender();
    const visiblePage = await viewer.waitForCurrentPage();
    const start = await viewer.getMainRotation(visiblePage);

    for (const expected of [
      (start + 90) % 360,
      (start + 180) % 360,
      (start + 270) % 360,
      start % 360,
    ]) {
      await viewer.rotateClockwise();
      await expect
        .poll(async () => await viewer.getMainRotation(visiblePage), {
          timeout: 15_000,
        })
        .toBe(expected);
    }
  });
});
