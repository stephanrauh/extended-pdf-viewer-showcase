import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T12 — /custom-toolbar', () => {
  test('default "additional" variant mounts the demo\'s custom toolbar elements', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-toolbar');
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();

    // The 'additional' template injects the demo's own
    // <app-open-in-new-tab> Angular component into the toolbar. It
    // appears nowhere else, so its presence proves [customToolbar] was
    // honoured and the standard toolbar was replaced.
    await expect(page.locator('app-open-in-new-tab')).toBeVisible();
  });

  test('"checkbox" variant\'s zoom radios actually drive the viewer\'s zoom', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-toolbar');
    await viewer.waitForFirstPageRender();

    // The variant radios have aria-label="Demo", so getByLabel by visible
    // text doesn't match. Target by value attribute instead — unique
    // within the variant radio group.
    await page.locator('input[type="radio"][value="checkbox"]').check();

    // The setter unmounts and remounts the viewer behind a 100ms
    // setTimeout. The new "checkbox" template injects #zoom200 (absent
    // from every other variant), so its appearance is a reliable
    // signal that the remount is done and the new toolbar is live.
    await page
      .locator('#zoom200')
      .waitFor({ state: 'visible', timeout: 10_000 });
    await viewer.waitForFirstPageRender();

    const baselineWidth = (await viewer.getCanvasSize(1)).width;
    expect(baselineWidth).toBeGreaterThan(0);

    // Each radio's (click) handler sets `zoom` directly, which
    // propagates via [zoom]. Wait for 50% to actually shrink the
    // canvas before recording smallWidth — otherwise we may capture
    // the pre-change pixel size and the 200% assertion below becomes
    // trivially true.
    await page.locator('#zoom50').click();
    await expect
      .poll(async () => (await viewer.getCanvasSize(1)).width, {
        timeout: 15_000,
      })
      .toBeLessThan(baselineWidth * 0.7);
    const smallWidth = (await viewer.getCanvasSize(1)).width;

    await page.locator('#zoom200').click();
    await expect
      .poll(async () => (await viewer.getCanvasSize(1)).width, {
        timeout: 15_000,
      })
      .toBeGreaterThan(smallWidth * 3);
  });
});

test.describe('T12 — /custom-sidebar', () => {
  test('"review" sidebar shows Comments header and filter buttons update the count', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-sidebar');
    await viewer.waitForFirstPageRender();

    // sidebarType defaults to 'review' and sidebarOpen=true, so the
    // demo's <ng-template #reviewSidebar> renders into the sidebar
    // slot. It builds a <div id="viewsManager" class="review-sidebar">
    // with 5 seeded comments (3 open, 2 resolved).
    const sidebar = page.locator('#viewsManager.review-sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('.review-title')).toHaveText(/Comments \(5\)/);

    // The filter buttons set reviewFilter which drives the
    // filteredComments getter — the count in the title is the most
    // robust signal the filter actually ran.
    await sidebar
      .getByRole('button', { name: 'Open', exact: true })
      .click();
    await expect(sidebar.locator('.review-title')).toHaveText(/Comments \(3\)/);

    await sidebar
      .getByRole('button', { name: 'Resolved', exact: true })
      .click();
    await expect(sidebar.locator('.review-title')).toHaveText(/Comments \(2\)/);
  });

  test('"toc" sidebar variant\'s search input filters entries down to one match', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-sidebar');
    await viewer.waitForFirstPageRender();

    // Switch sidebarType from 'review' to 'toc'. Each radio has
    // aria-label="Demo", so target by value attribute. The setter
    // unmounts then remounts the viewer with a 500ms setTimeout, so
    // wait for the .toc-sidebar wrapper to appear — it's unique to the
    // TOC template.
    await page.locator('input[type="radio"][value="toc"]').check();
    const sidebar = page.locator('#viewsManager.toc-sidebar');
    await sidebar.waitFor({ state: 'visible', timeout: 10_000 });

    // The demo seeds 11 TOC entries — the actual feature under test
    // is the filter, so anchor against that fixed count.
    await expect(sidebar.locator('.toc-entry')).toHaveCount(11);

    await sidebar.locator('.toc-search-input').fill('install');
    await expect(sidebar.locator('.toc-entry')).toHaveCount(1);
    await expect(sidebar.locator('.toc-entry').first()).toContainText(
      'Installation',
    );

    // The clear button (×) appears only while tocFilter has a value.
    await sidebar.locator('.toc-clear').click();
    await expect(sidebar.locator('.toc-entry')).toHaveCount(11);
  });
});

test.describe('T12 — /custom-thumbnails', () => {
  test('(thumbnailDrawn) populates each thumbnail\'s text label per page-range rules', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-thumbnails');
    await viewer.waitForFirstPageRender();

    // The demo opens with sidebarVisible=true, activeSidebarView=1
    // (thumbnails). Each <ng-template #radiobuttonThumbnail> renders
    // a .thumbnail with data-page-number, and onThumbnailDrawn writes
    // a label into .thumbnail-text based on page number:
    //   pages 1-2  → "title page"
    //   pages 3-4  → "table of contents"
    //   pages 5+   → "ready for review"
    // Asserting the label proves the callback ran AND its DOM
    // mutation reached the live element (a regression where pdf.js
    // re-renders the thumbnail after the callback would erase it).
    const thumb1 = page.locator('.thumbnail[data-page-number="1"]').first();
    await expect(thumb1.locator('.thumbnail-text')).toHaveText('title page', {
      timeout: 15_000,
    });

    const thumb3 = page.locator('.thumbnail[data-page-number="3"]').first();
    await expect(thumb3.locator('.thumbnail-text')).toHaveText(
      'table of contents',
      { timeout: 15_000 },
    );
  });

  test('(pageChange) updates the custom thumbnail radio selection on navigation', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-thumbnails');
    await viewer.waitForFirstPageRender();

    // Wait for at least one thumbnail to have drawn its label —
    // proxy for onThumbnailDrawn having run for the visible pages.
    await expect(
      page
        .locator('.thumbnail[data-page-number="1"] .thumbnail-text')
        .first(),
    ).toHaveText('title page', { timeout: 15_000 });

    const cbx1 = page.locator('#thumbnail-cbx-1');
    const cbx2 = page.locator('#thumbnail-cbx-2');

    // Page 1 starts as the current page. onThumbnailDrawn checks the
    // radio for the current page when it draws, so cbx1 should be set.
    await expect(cbx1).toBeChecked();

    // Navigating fires (pageChange), and onPageChange iterates all
    // .thumbnail-radiobutton inputs setting checked = (data-page-number
    // === String(page)). The test proves the demo wires viewer events
    // into custom DOM owned by an external template.
    await viewer.gotoPage(2);
    await expect(cbx2).toBeChecked({ timeout: 10_000 });
    await expect(cbx1).not.toBeChecked();
  });
});

test.describe('T12 — /custom-pdf-viewer', () => {
  test('custom template replaces the default toolbar and the page-select drives navigation', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/custom-pdf-viewer');
    await viewer.waitForFirstPageRender();

    // The custom template renders <select id="custom-page-select">
    // and never references pdf.js's #toolbarViewer. pdf-dummy-components
    // provides invisible placeholders for ids the engine expects, but
    // the visible toolbar is absent — assert custom UI is the visible
    // one.
    const pageSelect = page.locator('#custom-page-select');
    await expect(pageSelect).toBeVisible();

    // pagesLoaded populates the demo's pages[] array which drives
    // the dropdown options. Wait until at least 2 options exist
    // before we can drive navigation.
    await expect
      .poll(async () => await pageSelect.locator('option').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(2);

    const pageCount = await pageSelect.locator('option').count();
    // Pick the last available page so navigation is unambiguous.
    const target = pageCount;
    await pageSelect.selectOption(String(target));

    // goToPage sets PDFViewerApplication.page directly. pdf.js
    // scrolls #viewerContainer to the target page. Confirm by
    // viewport position rather than #pageNumber input, since the
    // custom template doesn't render that input.
    await viewer.waitForPageRender(target);
    await viewer.expectViewportOnPage(target);
  });
});
