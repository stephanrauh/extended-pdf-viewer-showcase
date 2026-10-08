import type { Page } from '@playwright/test';
import { PDFDocument, rgb } from 'pdf-lib';
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
  /**
   * Ten pages that can't be mistaken for each other: each has a big black square
   * at its own position. Real documents are mostly white with small text - too
   * similar for a fingerprint to tell which page was printed.
   */
  async function distinctPages(): Promise<Buffer> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 10; i++) {
      const page = doc.addPage([595, 842]);
      page.drawRectangle({ x: 40 + (i % 3) * 180, y: 620 - Math.floor(i / 3) * 190, width: 150, height: 150, color: rgb(0, 0, 0) });
      page.drawText(`Page ${i + 1}`, { x: 40, y: 30, size: 24 });
    }
    return Buffer.from(await doc.save());
  }

  /** Fingerprints of every page of the document (see print-stub.ts), rendered by pdf.js directly. */
  async function pageFingerprints(page: Page): Promise<number[][]> {
    return await page.evaluate(async () => {
      const w = window as any;
      const doc = w.__ngxApp.pdfDocument;
      const result: number[][] = [];
      for (let n = 1; n <= doc.numPages; n++) {
        const pdfPage = await doc.getPage(n);
        // the size pdf.js prints at (150 DPI), so both images are shrunk alike
        const viewport = pdfPage.getViewport({ scale: 150 / 72 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        await pdfPage.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
        result.push(w.__fingerprint(canvas));
      }
      return result;
    });
  }

  /** Prints with the given range and tells which pages were printed, in order. */
  async function printed(page: Page, range: object | undefined, pages: number[][]): Promise<number[]> {
    const afterPrints = () => page.evaluate(() => (window as any).__ngxEvents.filter((e: any) => e.name === 'afterPrint').length);
    const finished = await afterPrints();
    await page.evaluate(() => ((window as any).__printCalls = 0));
    await page.evaluate((r) => (window as any).__ngxService.print(r), range);
    await expect.poll(async () => await page.evaluate(() => (window as any).__printCalls), { timeout: 30_000 }).toBe(1);
    // print() ignores calls while a print job is still running, so wait for its end.
    await expect.poll(afterPrints, { timeout: 30_000 }).toBe(finished + 1);
    const printedFingerprints: number[][] = await page.evaluate(() => (window as any).__printedFingerprints);
    expect(printedFingerprints.length, 'every printed page has an image').toBe(await page.evaluate(() => (window as any).__printedPages));
    // Compare the layout, not the brightness: the correlation of the gray values around their mean.
    const centered = (v: number[]) => {
      const mean = v.reduce((sum, x) => sum + x, 0) / v.length;
      return v.map((x) => x - mean);
    };
    const correlation = (a: number[], b: number[]) => {
      const [ca, cb] = [centered(a), centered(b)];
      const dot = ca.reduce((sum, x, i) => sum + x * cb[i], 0);
      return dot / Math.sqrt(ca.reduce((sum, x) => sum + x * x, 0) * cb.reduce((sum, x) => sum + x * x, 0));
    };
    return printedFingerprints.map((fingerprint) => {
      const ranked = pages.map((p, i) => ({ n: i + 1, c: correlation(fingerprint, p) })).sort((a, b) => b.c - a.c);
      // The match has to be clear, or the fingerprints can't tell the pages apart.
      expect(ranked[0].c, `printed page looks like page ${ranked[0].n}`).toBeGreaterThan(0.8);
      expect(ranked[0].c - ranked[1].c, `page ${ranked[0].n} vs. page ${ranked[1].n}`).toBeGreaterThan(0.3);
      return ranked[0].n;
    });
  }

  test('from/to/excluded/included select the pages that are printed', async ({ page }) => {
    await stubPrint(page);
    const bytes = await distinctPages();
    await page.route(
      (u) => u.pathname === '/ten-distinct-pages.pdf',
      (route) => route.fulfill({ body: bytes, contentType: 'application/pdf' }),
    );
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/e2e/viewer?src=/ten-distinct-pages.pdf');
    await viewer.waitForFirstPageRender();
    await expect
      .poll(() => page.evaluate(() => (window as any).__ngxEvents.filter((e: any) => e.name === 'pagesLoaded').length), { timeout: 30_000 })
      .toBe(1);
    expect(await app(page, 'app.pagesCount')).toBe(10);
    const pages = await pageFingerprints(page);

    // Which pages, in which order - not just how many.
    expect(await printed(page, { from: 2, to: 4 }, pages)).toEqual([2, 3, 4]);
    expect(await printed(page, { from: 2, to: 4, excluded: [3] }, pages)).toEqual([2, 4]);
    expect(await printed(page, { included: [1, 5, 7] }, pages)).toEqual([1, 5, 7]);
    // A range applies to one print job only: the next one prints everything.
    expect(await printed(page, undefined, pages)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
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

test.describe('T48 — book mode and [readingDirection]', () => {
  /** The visible pages of the book from left to right, as the reader sees them ('' = an empty side). */
  const spread = (page: Page) =>
    page.evaluate(() => {
      const block = document.querySelector('.stf__block')!.getBoundingClientRect();
      const middle = block.left + block.width / 2;
      const shown = Array.from(document.querySelectorAll<HTMLElement>('.page.stf__item[data-page-number]')).filter(
        (p) => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0,
      );
      const side = (left: boolean) =>
        shown.find((p) => {
          const r = p.getBoundingClientRect();
          return r.left + r.width / 2 < middle === left;
        })?.dataset.pageNumber ?? '';
      return [side(true), side(false)];
    });
  const turned = async (page: Page, expected: string[]) => {
    await expect.poll(() => spread(page), { timeout: 15_000 }).toEqual(expected);
    await expect.poll(() => app(page, 'app.pdfViewer.pageFlip.getState()')).toBe('read');
  };

  test('"ltr": the cover is on the right, the book opens to the left', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${DOC}&pageViewMode=book&readingDirection=ltr`);
    await viewer.waitForFirstPageRender();
    await turned(page, ['', '1']);
    await viewer.nextPage();
    await turned(page, ['2', '3']);
  });

  test('"rtl": the cover is on the left, the pages follow from right to left, and they read normally', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${DOC}&pageViewMode=book&readingDirection=rtl`);
    await viewer.waitForFirstPageRender();
    await turned(page, ['1', '']);
    await viewer.nextPage();
    await turned(page, ['3', '2']);
    await viewer.assertCanvasHasContent(2);
    // The book is mirrored, the page content isn't: the text layer runs left to right.
    const words = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll<HTMLElement>('.page[data-page-number="2"] .textLayer span:not(:has(span))')).filter(
        (s) => s.textContent!.trim().length > 3 && s.getBoundingClientRect().width > 0,
      );
      const first = spans[0].getBoundingClientRect();
      // in a mirrored page, the second word of a line would be left of the first one
      const next = spans.find((s) => Math.abs(s.getBoundingClientRect().top - first.top) < 2 && s !== spans[0]);
      return next ? next.getBoundingClientRect().left > first.left : null;
    });
    expect(words, 'text reads left to right').not.toBe(false);
  });

  for (const direction of ['ltr', 'rtl'] as const) {
    test(`"${direction}": clicking the outer corner of a page turns the pages`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      // With the hand tool, the mouse pans the book instead of turning its pages (#3140).
      await viewer.goto(`/e2e/viewer?src=${DOC}&pageViewMode=book&readingDirection=${direction}&page=2&zoom=page-fit&handTool=false`);
      // Not waitForFirstPageRender(): the book opened at page 2 rightly hides page 1's canvas.
      await viewer.waitForPageRender(2);
      const forward = direction === 'ltr' ? ['4', '5'] : ['5', '4'];
      const back = direction === 'ltr' ? ['2', '3'] : ['3', '2'];
      await turned(page, back);
      // The library turns a page when the user clicks one of its outer corners.
      const corner = async (side: 'left' | 'right') => {
        const book = await page.evaluate(() => {
          const rects = Array.from(document.querySelectorAll<HTMLElement>('.page.stf__item[data-page-number]'))
            .filter((p) => getComputedStyle(p).display !== 'none')
            .map((p) => p.getBoundingClientRect())
            .filter((r) => r.width > 0);
          return { left: Math.min(...rects.map((r) => r.left)), right: Math.max(...rects.map((r) => r.right)), bottom: Math.min(...rects.map((r) => r.bottom)) };
        });
        expect(book.bottom, 'the whole book is visible').toBeLessThanOrEqual(page.viewportSize()!.height);
        await page.mouse.click(side === 'left' ? book.left + 15 : book.right - 15, book.bottom - 15);
      };
      const forwardSide = direction === 'ltr' ? 'right' : 'left';
      const backSide = direction === 'ltr' ? 'left' : 'right';
      await corner(forwardSide);
      await turned(page, forward);
      await corner(backSide);
      await turned(page, back);
    });
  }

  test('switching the reading direction while the book is open', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${DOC}&pageViewMode=book&readingDirection=ltr`);
    await viewer.waitForFirstPageRender();
    await viewer.nextPage();
    await turned(page, ['2', '3']);
    await page.evaluate(() => (window as any).__setInput('readingDirection', 'rtl'));
    await turned(page, ['3', '2']);
    await viewer.nextPage();
    await turned(page, ['5', '4']);
  });
});
