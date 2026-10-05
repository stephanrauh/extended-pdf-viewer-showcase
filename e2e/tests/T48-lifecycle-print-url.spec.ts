import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { stubPrint } from '../poms/print-stub';

/**
 * T48 — the viewer's life cycle (a modal opened and closed again and again),
 * printing a page range, the URL hash ([listenToURL]), [acceptKeys] and
 * [readingDirection].
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';

const app = (page: Page, expr: string) => page.evaluate((e) => new Function('app', `return (${e});`)((window as any).__ngxApp), expr);

test('a viewer in a modal: open and close it three times, it works every time', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/modal');
  for (let round = 1; round <= 3; round++) {
    await test.step(`round ${round}`, async () => {
      await page.getByRole('button', { name: 'open modal' }).click();
      await viewer.waitForFirstPageRender();
      await viewer.assertCanvasHasContent();
      await expect(page.locator('ngx-extended-pdf-viewer')).toHaveCount(1);
      // The viewer reacts to its buttons - its event wiring survived the previous rounds.
      const start = await app(page, 'app.page');
      await page.locator('#primaryNext').click();
      await expect.poll(() => app(page, 'app.page')).toBe(start + 1);

      await page.locator('.fixed.inset-0 button').first().click();
      await expect(page.locator('ngx-extended-pdf-viewer')).toHaveCount(0);
    });
  }
  expect(errors, 'no uncaught errors').toEqual([]);
});

test.describe('T48 — printing a page range', () => {
  async function printed(page: Page, range: object | undefined): Promise<number> {
    const afterPrints = () => page.evaluate(() => (window as any).__ngxEvents.filter((e: any) => e.name === 'afterPrint').length);
    const finished = await afterPrints();
    await page.evaluate(() => ((window as any).__printCalls = 0));
    await page.evaluate((r) => (window as any).__ngxService.print(r), range);
    await expect.poll(async () => await page.evaluate(() => (window as any).__printCalls), { timeout: 30_000 }).toBe(1);
    // print() ignores calls while a print job is still running, so wait for its end.
    await expect.poll(afterPrints, { timeout: 30_000 }).toBe(finished + 1);
    return await page.evaluate(() => (window as any).__printedPages);
  }

  test('from/to/excluded/included select the pages that are printed', async ({ page }) => {
    await stubPrint(page);
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/e2e/viewer?src=/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf');
    await viewer.waitForFirstPageRender();
    await expect
      .poll(() => page.evaluate(() => (window as any).__ngxEvents.filter((e: any) => e.name === 'pagesLoaded').length), { timeout: 30_000 })
      .toBe(1);
    const pages = (await app(page, 'app.pagesCount')) as number;
    expect(pages).toBe(10);

    expect(await printed(page, { from: 2, to: 4 })).toBe(3);
    expect(await printed(page, { from: 2, to: 4, excluded: [3] })).toBe(2);
    expect(await printed(page, { included: [1, 5, 7] })).toBe(3);
    // A range applies to one print job only: the next one prints everything.
    expect(await printed(page, undefined)).toBe(pages);
  });

  test('[enablePrint]="false": no printing, not even with Ctrl+P', async ({ page }) => {
    await stubPrint(page);
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${DOC}&enablePrint=false&showPrintButton=always-visible`);
    await viewer.waitForFirstPageRender();
    await expect(page.locator('#printButton')).toBeHidden();
    await page.locator('#viewerContainer').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('ControlOrMeta+p');
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as any).__printCalls)).toBe(0);
  });
});

test.describe('T48 — the URL', () => {
  test('[listenToURL]: #page= in the URL opens that page', async ({ page }) => {
    await page.goto(`/e2e/viewer?src=${DOC}&listenToURL=true#page=4`);
    await expect.poll(() => app(page, 'app?.page'), { timeout: 30_000 }).toBe(4);
  });

  test('without [listenToURL], the URL hash is left alone', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await page.goto(`/e2e/viewer?src=${DOC}#page=4`);
    await viewer.waitForFirstPageRender();
    await page.waitForTimeout(1000);
    expect(await app(page, 'app.page')).toBe(1);
    await viewer.nextPage();
    await page.waitForTimeout(500);
    expect(new URL(page.url()).hash).toBe('#page=4');
  });

  // No back/forward test: the component marks the viewer as embedded
  // (isViewerEmbedded), so pdf.js doesn't write to the browser history - the
  // Angular router owns it. [listenToURL] only reads the hash.
});

test('[acceptKeys]: only the listed keys work', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${DOC}&acceptKeys=["n"]`);
  await viewer.waitForFirstPageRender();
  await viewer.viewerContainer.click({ position: { x: 5, y: 5 } });
  // 'j' is "next page" in pdf.js, too, but not in the list. (A key with a browser
  // default, like End, would still scroll the page natively once pdf.js ignores it.)
  await page.keyboard.press('j');
  await page.waitForTimeout(500);
  expect(await app(page, 'app.page'), '"j" is not accepted').toBe(1);
  await page.keyboard.press('n');
  await expect.poll(() => app(page, 'app.page')).toBe(2);
});

test.describe('T48 — [readingDirection]', () => {
  /** Pages 1 and 2 - one spread with [spread]="odd" - from left to right as the reader sees them. */
  const leftToRight = (page: Page) =>
    page.evaluate(() =>
      ['1', '2']
        .map((n) => ({ n, left: document.querySelector(`.page[data-page-number="${n}"]`)!.getBoundingClientRect().left }))
        .sort((a, b) => a.left - b.left)
        .map((p) => p.n),
    );

  for (const direction of ['ltr', 'rtl'] as const) {
    test(`"${direction}": the two pages of a spread are in reading order`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(`/e2e/viewer?src=${DOC}&spread=odd&zoom=page-fit&readingDirection=${direction}`);
      await viewer.waitForPageRender(2);
      // "odd" spreads start with an odd page: 1|2, 3|4, ...
      const expected = direction === 'ltr' ? ['1', '2'] : ['2', '1'];
      await expect.poll(() => leftToRight(page), { timeout: 15_000 }).toEqual(expected);
    });

    test(`"${direction}": the arrow keys turn the pages ${direction === 'ltr' ? 'forward to the right' : 'forward to the left'}`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(`/e2e/viewer?src=${DOC}&zoom=page-fit&readingDirection=${direction}&page=3`);
      await viewer.waitForPageRender(3);
      await expect.poll(() => app(page, 'app.page')).toBe(3);
      await viewer.viewerContainer.click({ position: { x: 5, y: 5 } });
      await page.keyboard.press('ArrowLeft');
      await expect.poll(() => app(page, 'app.page')).toBe(direction === 'ltr' ? 2 : 4);
    });
  }
});
