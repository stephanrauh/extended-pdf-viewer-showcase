import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// All controls in /display-options' "Displaying Forms" panel are
// exercised below. The pageViewMode setter has a side effect (sets
// scrollMode=3 when 'single'), so its tests run independently.

const DISPLAY = '/extended-pdf-viewer/display-options';

const radioByLabel = (page: import('@playwright/test').Page, label: string) =>
  page
    .locator('label')
    .filter({ hasText: label })
    .locator('input[type="radio"]');

test.describe('T15 — /display-options scrollMode (all 4 radios)', () => {
  // Each scrollMode toggles a distinct .pdfViewer CSS class — or, for
  // VERTICAL (0) and PAGE (3), the absence of horizontal/wrapped. PAGE
  // is further distinguished by painting only one canvas at a time.
  type Mode = {
    value: number;
    label: string;
    assert: (page: import('@playwright/test').Page) => Promise<void>;
  };
  const MODES: Mode[] = [
    {
      value: 0,
      label: '0 (vertical) (default)',
      assert: async (p) => {
        await expect(p.locator('.pdfViewer.scrollHorizontal')).toHaveCount(0);
        await expect(p.locator('.pdfViewer.scrollWrapped')).toHaveCount(0);
      },
    },
    {
      value: 1,
      label: '1 (horizontal)',
      assert: async (p) => {
        await expect(p.locator('.pdfViewer.scrollHorizontal')).toHaveCount(1);
      },
    },
    {
      value: 2,
      label: '2 (wrapped)',
      assert: async (p) => {
        await expect(p.locator('.pdfViewer.scrollWrapped')).toHaveCount(1);
      },
    },
    {
      value: 3,
      label: '3 (single-page view)',
      assert: async (p) => {
        // SINGLE_PAGE mode hides every page except the current one.
        await expect
          .poll(
            async () =>
              await p.evaluate(
                () =>
                  Array.from(
                    document.querySelectorAll<HTMLCanvasElement>(
                      '.page[data-page-number] canvas',
                    ),
                  ).filter((c) => c.width > 0 && c.height > 0).length,
              ),
            { timeout: 10_000 },
          )
          .toBe(1);
      },
    },
  ];

  for (const mode of MODES) {
    test(`scrollMode ${mode.value} (${mode.label})`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(DISPLAY);
      await viewer.waitForFirstPageRender();

      // Vertical (0) is the default; toggle away first so re-selecting
      // it actually fires the change.
      if (mode.value === 0) {
        await radioByLabel(page, '1 (horizontal)').check();
      }
      await radioByLabel(page, mode.label).check();
      await mode.assert(page);
    });
  }
});

test.describe('T15 — /display-options spread (all 3 radios)', () => {
  // 'off' = no .spread wrappers; 'odd'/'even' wrap page pairs in
  // <div class="spread">.
  test('spread "off" leaves pages without .spread wrappers', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    // Default; first toggle to odd so the toggle back to off is observable.
    await page.locator('input[name="spread"][value="odd"]').check();
    await expect
      .poll(async () => await page.locator('.pdfViewer .spread').count(), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0);

    await page.locator('input[name="spread"][value="off"]').check();
    await expect
      .poll(async () => await page.locator('.pdfViewer .spread').count(), {
        timeout: 10_000,
      })
      .toBe(0);
  });

  test('spread "odd" wraps page pairs in .spread containers', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    await page.locator('input[name="spread"][value="odd"]').check();
    await expect
      .poll(async () => await page.locator('.pdfViewer .spread').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
  });

  test('spread "even" wraps page pairs in .spread containers', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    await page.locator('input[name="spread"][value="even"]').check();
    await expect
      .poll(async () => await page.locator('.pdfViewer .spread').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
  });
});

test.describe('T15 — /display-options pageViewMode (all 4 radios)', () => {
  // pageViewMode is an ngx-extended-pdf-viewer concept. Each value is
  // verified by a value-specific signal where one exists.
  test('pageViewMode "single" paints exactly one canvas', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    await page.locator('input[name="pageViewMode"][value="single"]').check();

    await expect
      .poll(
        async () =>
          await page.evaluate(
            () =>
              Array.from(
                document.querySelectorAll<HTMLCanvasElement>(
                  '.page[data-page-number] canvas',
                ),
              ).filter((c) => c.width > 0 && c.height > 0).length,
          ),
        { timeout: 15_000 },
      )
      .toBe(1);
  });

  test('pageViewMode "book" attaches the page-flip cursor button', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    await page.locator('input[name="pageViewMode"][value="book"]').check();

    // Book mode exposes #primaryCursorPageFlipTool (per T7-navigation).
    await expect(page.locator('#primaryCursorPageFlipTool')).toBeAttached({
      timeout: 10_000,
    });
  });

  test('pageViewMode "multiple" (default) renders more than one painted canvas', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    // Default. Toggle through single then back to multiple to make
    // re-selecting observable.
    await page.locator('input[name="pageViewMode"][value="single"]').check();
    await page.locator('input[name="pageViewMode"][value="multiple"]').check();

    await expect
      .poll(
        async () =>
          await page.evaluate(
            () =>
              Array.from(
                document.querySelectorAll<HTMLCanvasElement>(
                  '.page[data-page-number] canvas',
                ),
              ).filter((c) => c.width > 0 && c.height > 0).length,
          ),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(1);
  });

  test('pageViewMode "infinite-scroll" keeps the radio selected and the viewer responsive', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    const radio = page.locator('input[name="pageViewMode"][value="infinite-scroll"]');
    await radio.check();
    await expect(radio).toBeChecked();
    // Strong infinite-scroll behaviour is asserted by T7-navigation;
    // here we just prove the radio click survives the mode swap.
    await viewer.assertCanvasHasContent();
  });
});

test.describe('T15 — /display-options other controls', () => {
  test('showBorders checkbox toggles .removePageBorders on #viewer', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    // Demo default is showBorders=false → #viewer should have
    // .removePageBorders (ngx-extended-pdf-viewer's _showBordersEffect
    // toggles it).
    const removeClass = page.locator('#viewer.removePageBorders');
    await expect(removeClass).toHaveCount(1);

    const cb = page
      .locator('label')
      .filter({ hasText: '[showBorders]="true"' })
      .locator('input[type="checkbox"]');
    await cb.check();
    await expect(removeClass).toHaveCount(0, { timeout: 5_000 });

    await cb.uncheck();
    await expect(removeClass).toHaveCount(1, { timeout: 5_000 });
  });
});

test.describe('T15 — /display-options two-way binding (PDF → Angular)', () => {
  test('switching spread via pdf.js secondary toolbar updates the demo spread radio', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(DISPLAY);
    await viewer.waitForFirstPageRender();

    const offRadio = page.locator('input[name="spread"][value="off"]');
    const oddRadio = page.locator('input[name="spread"][value="odd"]');
    await expect(offRadio).toBeChecked();
    await expect(oddRadio).not.toBeChecked();

    // Drive the change from the PDF side. pdf-shy-button gives the
    // primary toolbar copy `id="<primaryToolbarId>"` (no prefix; the
    // "secondary" prefix is only on the kebab-menu copy). The demo
    // sets showSpreadButton="always-visible" so the primary button
    // is rendered and clickable.
    await page.locator('#spreadOdd').click();

    await expect(oddRadio).toBeChecked({ timeout: 10_000 });
    await expect(offRadio).not.toBeChecked();
  });
});

test.describe('T15 — /mobile', () => {
  test('mobileFriendlyZoom 200% scales the toolbar to roughly double its 100% height', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/mobile');
    await viewer.waitForFirstPageRender();

    const toolbarHeight = async () => {
      const box = await page.locator('#toolbarContainer').first().boundingBox();
      return box?.height ?? 0;
    };

    const radioFor = (label: string) => radioByLabel(page, label);

    await radioFor(`[mobileFriendlyZoom]="'100%' (default)"`).check();
    await expect.poll(toolbarHeight, { timeout: 5_000 }).toBeGreaterThan(0);
    const baseline = await toolbarHeight();

    await radioFor(`[mobileFriendlyZoom]="'200%'"`).check();
    await expect.poll(toolbarHeight, { timeout: 5_000 }).toBeGreaterThan(baseline * 1.5);
  });
});

test.describe('T15 — /page-view-mode', () => {
  test('the demo opens in single-page mode on page 5', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/page-view-mode');

    await viewer.waitForPageRender(5);
    await viewer.assertCanvasHasContent(5);

    const paintedCount = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll<HTMLCanvasElement>(
          '.page[data-page-number] canvas',
        ),
      ).filter((c) => c.width > 0 && c.height > 0).length;
    });
    expect(paintedCount).toBe(1);
  });
});
