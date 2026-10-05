import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { downloadPdf, readPdf, readServedPdf } from '../poms/pdf-file';

/**
 * T43 — adding, removing and rearranging pages: the service API
 * (mergeDocument / deletePages), the sidebar's split & merge menu and the
 * "Add file" button.
 *
 * Every test checks two things: what the viewer shows, and what's in the file
 * the user downloads afterwards. Pages are identified by the beginning of
 * their text, so a test fails if a page is missing, duplicated or in the
 * wrong place.
 */

test.describe.configure({ mode: 'parallel' });

const FLYER = '/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf';
const SIMPLE = '/assets/pdfs/simple-demo-document.pdf';
/** An image page has no text. */
const IMAGE = '';

/** The first 25 non-blank characters: enough to tell the pages apart. */
const key = (text: string) => text.replace(/\s+/g, '').slice(0, 25);

/** The flyer's pages (F[0] is page 1) and the one page of simple-demo-document.pdf. */
async function sources(page: Page): Promise<{ F: string[]; S: string }> {
  await page.waitForFunction(() => (window as any).pdfjsLib?.getDocument, null, { timeout: 30_000 });
  const flyer = await readServedPdf(page, FLYER);
  const simple = await readServedPdf(page, SIMPLE);
  expect(flyer.numPages).toBe(10);
  const F = flyer.pageTexts.map(key);
  expect(new Set(F).size, 'the flyer pages are distinguishable').toBe(10);
  return { F, S: key(simple.pageTexts[0]) };
}

/** The page count the toolbar shows ("of N"). */
async function pageCount(page: Page): Promise<number> {
  return await page.evaluate(() => Number(document.getElementById('numPages')?.textContent?.match(/\d+/)?.[0] ?? 0));
}

/**
 * The text of the page the viewer shows as page n - from the page's own
 * pdf.js page object, because not every demo renders a text layer. Returns
 * null until the page has been painted. Meant to be polled: it scrolls the
 * page into view so it gets rendered.
 */
async function shownText(page: Page, n: number): Promise<string | null> {
  await page.locator(`.page[data-page-number="${n}"]`).scrollIntoViewIfNeeded();
  return await page.evaluate(async (num) => {
    const view = (window as any).__ngxApp.pdfViewer.getPageView(num - 1);
    if (!view?.pdfPage || !view.div.querySelector('canvas')) return null;
    const text = await view.pdfPage.getTextContent();
    return text.items
      .map((i: any) => i.str)
      .join('')
      .replace(/\s+/g, '')
      .slice(0, 25);
  }, n);
}

/** Checks the viewer's pages, then the downloaded file's pages, against `expected`. */
async function expectPages(page: Page, expected: string[]): Promise<void> {
  await expect.poll(() => pageCount(page), { timeout: 20_000 }).toBe(expected.length);
  for (const n of [1, 2, expected.length]) {
    await expect.poll(() => shownText(page, n), { message: `viewer page ${n}`, timeout: 20_000 }).toBe(expected[n - 1]);
  }
  const saved = await readPdf(page, await downloadPdf(page));
  expect(saved.pageTexts.map(key), 'the pages of the downloaded file').toEqual(expected);
}

test.describe('T43 — /modify-page-order, the API tab', () => {
  async function openApiTab(page: Page): Promise<PdfViewerPage> {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/modify-page-order');
    await viewer.waitForFirstPageRender();
    await page.getByRole('button', { name: 'Merge & delete API' }).click();
    await viewer.waitForFirstPageRender();
    await expect.poll(() => pageCount(page), { timeout: 20_000 }).toBe(10);
    return viewer;
  }

  async function press(page: Page, button: string, expectedCount: number): Promise<void> {
    await page.getByRole('button', { name: button }).click();
    await expect(page.getByText(`The document now has ${expectedCount} pages.`)).toBeVisible({ timeout: 20_000 });
  }

  test('mergeDocument() in front of page 1', async ({ page }) => {
    await openApiTab(page);
    const { F, S } = await sources(page);
    await press(page, 'Add a PDF before page 1', 11);
    await expectPages(page, [S, ...F]);
  });

  test('append, insert after the current page, delete a page and a range', async ({ page }) => {
    const viewer = await openApiTab(page);
    const { F, S } = await sources(page);

    await press(page, 'Append the same PDF', 11);
    let expected = [...F, S];

    await viewer.gotoPage(3);
    await expect.poll(() => viewer.getCurrentPage()).toBe(3);
    await press(page, 'Insert one page after the current one', 12);
    expected = [...expected.slice(0, 3), S, ...expected.slice(3)];

    await press(page, 'Delete pages 2-3', 10);
    expected = [expected[0], ...expected.slice(3)];

    await press(page, 'Delete page 1', 9);
    expected = expected.slice(1);

    expect(expected).toEqual([S, ...F.slice(3), S]);
    await expectPages(page, expected);
  });

  test('mergeDocument() with an image adds a painted page without text', async ({ page }) => {
    const viewer = await openApiTab(page);
    const { F } = await sources(page);
    await press(page, 'Add an image as page 1', 11);
    await viewer.waitForPageRender(1);
    await viewer.assertCanvasHasContent(1, 0.05);
    await expectPages(page, [IMAGE, ...F]);
  });
});

test.describe('T43 — the sidebar', () => {
  async function open(page: Page, query: string): Promise<PdfViewerPage> {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${FLYER}&sidebarVisible=true&${query}`);
    await viewer.waitForFirstPageRender();
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(10, { timeout: 20_000 });
    return viewer;
  }

  const select = async (page: Page, ...pages: number[]) => {
    for (const n of pages) {
      const box = page.locator(`#thumbnailsView .thumbnail[page-number="${n}"] input[type="checkbox"]`);
      await box.scrollIntoViewIfNeeded();
      await box.check();
    }
  };

  const manage = async (page: Page, action: 'Copy' | 'Cut' | 'Delete' | 'Export') => {
    await page.locator('#viewsManagerStatusActionButton').click();
    const entry = page.locator(`#viewsManagerStatusAction${action}`);
    await expect(entry).toBeEnabled();
    await entry.click();
  };

  const pasteAfter = async (page: Page, n: number) => {
    const button = page.locator(
      `#thumbnailsView .thumbnail[page-number="${n}"] .thumbnailPasteButton[data-l10n-id="pdfjs-views-manager-paste-button-after"]`,
    );
    await button.scrollIntoViewIfNeeded();
    await button.click();
  };

  test('split & merge: delete selected pages, undo, delete again and save', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F } = await sources(page);

    await select(page, 2, 3);
    await manage(page, 'Delete');
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(8);
    await expect.poll(() => pageCount(page)).toBe(8);
    expect(await shownText(page, 2)).toBe(F[3]);

    await page.locator('#viewsManagerStatusUndoButton').click();
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(10);
    await expect.poll(() => pageCount(page)).toBe(10);
    await expect.poll(() => shownText(page, 2)).toBe(F[1]);

    await select(page, 2, 3);
    await manage(page, 'Delete');
    await expectPages(page, [F[0], ...F.slice(3)]);
  });

  test('split & merge: cut a page and paste it elsewhere', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F } = await sources(page);

    await select(page, 1);
    await manage(page, 'Cut');
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(9);
    // After the cut, the old page 4 is the third thumbnail.
    await pasteAfter(page, 3);
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(10);

    await expectPages(page, [F[1], F[2], F[3], F[0], ...F.slice(4)]);
  });

  test('split & merge: copy a page and paste the copy', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F } = await sources(page);

    await select(page, 10);
    await manage(page, 'Copy');
    await pasteAfter(page, 1);
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(11);

    await expectPages(page, [F[0], F[9], ...F.slice(1)]);
  });

  test('split & merge: export saves only the selected pages', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F } = await sources(page);

    await select(page, 2, 5);
    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await manage(page, 'Export');
    const download = await downloadPromise;
    const { readFileSync } = await import('node:fs');
    const exported = await readPdf(page, readFileSync((await download.path())!));
    expect(exported.pageTexts.map(key)).toEqual([F[1], F[4]]);

    // Exporting doesn't change the document on screen.
    expect(await pageCount(page)).toBe(10);
  });

  test('[enableMerge]: "Add file" inserts the chosen PDF after the current page', async ({ page }) => {
    const viewer = await open(page, 'enableMerge=true');
    const { F, S } = await sources(page);
    await viewer.gotoPage(2);
    await expect.poll(() => viewer.getCurrentPage()).toBe(2);

    const chooserPromise = page.waitForEvent('filechooser');
    await page.locator('#viewsManagerAddFileButton').click();
    const chooser = await chooserPromise;
    expect(chooser.isMultiple()).toBe(true);
    const response = await page.request.get(SIMPLE);
    await chooser.setFiles({ name: 'simple-demo-document.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await response.body()) });

    await expectPages(page, [F[0], F[1], S, ...F.slice(2)]);
  });

  test('mergeDocument() keeps the pages the user has copied in the sidebar', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F, S } = await sources(page);

    await select(page, 10);
    await manage(page, 'Copy');
    await pasteAfter(page, 1);
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(11);

    await page.evaluate((src) => (window as any).__ngxService.mergeDocument(src), SIMPLE);
    await expectPages(page, [F[0], F[9], ...F.slice(1), S]);
  });

  test('deletePages() counts the pages as the user sees them after a sidebar cut', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F } = await sources(page);

    // Move page 1 behind page 3: [2, 3, 1, 4, ...]
    await select(page, 1);
    await manage(page, 'Cut');
    await pasteAfter(page, 2);
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(10);

    // Page 3 is the old page 1 now.
    await page.evaluate(() => (window as any).__ngxService.deletePages([3, 10]));
    await expectPages(page, [F[1], F[2], ...F.slice(3, 9)]);
  });

  test('deletePages() and getPageCount() know about pages deleted in the sidebar', async ({ page }) => {
    await open(page, 'enableSplitMerge=true');
    const { F } = await sources(page);

    await select(page, 2, 3);
    await manage(page, 'Delete');
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(8);
    expect(await page.evaluate(() => (window as any).__ngxService.getPageCount())).toBe(8);

    // The last page the user sees is page 8 - the old page 10.
    await page.evaluate(() => (window as any).__ngxService.deletePages(8));
    await expectPages(page, [F[0], ...F.slice(3, 9)]);
  });

  test('without [enableSplitMerge] / [enableMerge], the controls are absent', async ({ page }) => {
    await open(page, 'enableSplitMerge=false&enableMerge=false');
    await expect(page.locator('#viewsManagerAddFileButton')).toBeHidden();
    await expect(page.locator('#viewsManagerStatusActionButton')).toBeHidden();
    await expect(page.locator('#thumbnailsView .thumbnail input[type="checkbox"]').first()).toBeHidden();
  });
});
