import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T7 — /navigation', () => {
  test('[page]="5" button jumps to page 5', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/navigation');
    await viewer.waitForFirstPageRender();

    await page.getByRole('button', { name: '[page]="5"' }).click();
    await expect
      .poll(async () => await viewer.getCurrentPage(), { timeout: 10_000 })
      .toBe(5);
    await viewer.waitForPageRender(5);
    await viewer.assertCanvasHasContent(5);
  });

  test('[namedDest]="section.10" navigates to the exact destination page', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/navigation');
    await viewer.waitForFirstPageRender();

    await page
      .getByRole('button', { name: '[namedDest]="section.10"' })
      .click();

    // latex.pdf's named destination `section.10` lands on page 80 in
    // pdf.js (pypdf's get_destination_page_number reports 78 which would
    // map to 79 — pdf.js sees an off-by-one due to how the catalog
    // numbering vs page-tree iteration differ). Asserting the exact
    // observed page catches regressions where pdf.js resolves the
    // destination correctly by name but scrolls to the wrong location.
    await viewer.waitForPageRender(80);
    await viewer.expectViewportOnPage(80);
  });
});

test.describe('T7 — /scrolling', () => {
  test('scroll(page=10, top="50%") lands with page 10 mid-viewport', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/scrolling');
    await viewer.waitForFirstPageRender();

    await page
      .getByRole('button', { name: 'scroll(page=10, top="50%")' })
      .click();

    // Render alone doesn't prove navigation worked — pdf.js paints
    // nearby pages eagerly. Assert page 10 is the page closest to the
    // viewer container's scroll position (it's the page in viewport).
    await viewer.waitForPageRender(10);
    await viewer.assertCanvasHasContent(10);
    await viewer.expectViewportOnPage(10);

    // top="50%" asks for the page to be scrolled so that 50% from its top
    // is at the viewer-container's scroll position. Verify the scroll
    // offset lands within ±20% of the page's mid-point — pdf.js rounds
    // and adjusts for fit-mode, so an exact match is too strict.
    const layout = await viewer.getPageLayout(10);
    expect(layout).not.toBeNull();
    const scrollTop = await page.evaluate(
      () => document.querySelector<HTMLElement>('#viewerContainer')?.scrollTop ?? 0,
    );
    const targetMidY = layout!.y + layout!.height * 0.5;
    const tolerance = layout!.height * 0.2;
    expect(Math.abs(scrollTop - targetMidY)).toBeLessThanOrEqual(tolerance);
  });
});

test.describe('T7 — /book-mode', () => {
  test('renders the viewer in book mode with a canvas painted', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/book-mode');
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();

    // Book mode collapses the page list into a single visible page at a
    // time, so the viewer should expose a Page Flip button.
    await expect(
      page.locator('#primaryCursorPageFlipTool'),
    ).toBeAttached();
  });
});

test.describe('T7 — /infinite-scroll', () => {
  test('pageViewMode="infinite-scroll" stacks all pages and renders later pages on scroll', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/infinite-scroll');
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);

    // The demo defaults to user-experience.pdf with showWidgets=false,
    // which sets showToolbar=false. A regression that re-defaults
    // showToolbar to true would still pass the old smoke test, so prove
    // the binding took effect.
    await expect(page.locator('#toolbarContainer')).toBeHidden();

    // infinite-scroll mode stacks every page placeholder in document
    // order — even pdf.js's lazy painter attaches the .page wrapper
    // eagerly. user-experience.pdf has 4 pages.
    const placeholders = page.locator('.page[data-page-number]');
    await expect.poll(async () => await placeholders.count(), {
      timeout: 15_000,
    }).toBeGreaterThanOrEqual(4);

    // Pages must flow top-to-bottom, not stack at the same y. Read
    // offsetTop directly so we don't depend on whether infinite-scroll
    // scrolls the document or #viewerContainer.
    const tops = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>('.page[data-page-number]'),
      ).map((el) => ({
        n: Number(el.dataset.pageNumber),
        top: el.offsetTop,
        height: el.offsetHeight,
      })),
    );
    const p1 = tops.find((t) => t.n === 1)!;
    const p2 = tops.find((t) => t.n === 2)!;
    expect(p2.top).toBeGreaterThan(p1.top + p1.height / 2);

    // Scrolling the last page into view should trigger lazy canvas
    // painting for it — infinite-scroll keeps virtualisation, it just
    // hands scrolling to the outer document.
    await page
      .locator('.page[data-page-number="4"]')
      .scrollIntoViewIfNeeded();
    await viewer.waitForPageRender(4);
    await viewer.assertCanvasHasContent(4);
  });
});

test.describe('T7 — keyboard shortcuts', () => {
  // We use /textlayer because pdf.js's keyboard handlers require the
  // viewer to have focus AND the document to have a text layer.
  const KEYBOARD_ROUTE = '/extended-pdf-viewer/textlayer';

  test('End jumps to the last page; Home returns to page 1', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(KEYBOARD_ROUTE);
    await viewer.waitForFirstPageRender();
    await viewer.waitForCurrentPage();
    const total = await viewer.getPageCount();
    test.skip(total < 2, 'demo PDF must have multiple pages');

    // End/Home have unambiguous semantics in pdf.js — they always go to
    // last/first page regardless of scroll mode or zoom. PageDown is
    // tempting but its behavior depends on whether the current page fits
    // in the viewport (it scrolls by viewport height in vertical mode).
    await viewer.viewerContainer.click();
    await page.keyboard.press('End');
    await viewer.expectViewportOnPage(total);

    await page.keyboard.press('Home');
    await viewer.expectViewportOnPage(1);
  });

  test('Ctrl+F opens the find bar; Escape closes it', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(KEYBOARD_ROUTE);
    await viewer.waitForFirstPageRender();
    await viewer.viewerContainer.click();

    const findInput = page.locator('#findInput').first();
    await page.keyboard.press('Control+f');
    await expect(findInput).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press('Escape');
    await expect(findInput).toBeHidden({ timeout: 5_000 });
  });
});
