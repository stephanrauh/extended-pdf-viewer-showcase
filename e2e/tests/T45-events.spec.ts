import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { downloadPdf } from '../poms/pdf-file';

/**
 * T45 — the event contract: which outputs fire, in which order, how often,
 * and with which payload.
 *
 * The bare viewer (src/app/e2e-harness) records every output in
 * `window.__ngxEvents`, so these tests see exactly what an application
 * listening with `(event)="..."` would see.
 */

test.describe.configure({ mode: 'parallel' });

const BOOK = '/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';

type Recorded = { name: string; t: number; payload: any };

/** pdf.js FindState values. */
const FIND = { FOUND: 0, NOT_FOUND: 1, WRAPPED: 2, PENDING: 3 };

async function open(page: Page, query: string): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?${query}`);
  await viewer.waitForFirstPageRender();
  return viewer;
}

const events = async (page: Page): Promise<Recorded[]> => await page.evaluate(() => (window as any).__ngxEvents);
const named = (all: Recorded[], name: string) => all.filter((e) => e.name === name);
/** Events recorded from now on. */
async function since(page: Page): Promise<() => Promise<Recorded[]>> {
  const start = (await events(page)).length;
  return async () => (await events(page)).slice(start);
}

test('loading a document: each load event once, in order, with the right counts', async ({ page }) => {
  await open(page, `src=${BOOK}`);
  await expect.poll(async () => named(await events(page), 'pagesLoaded').length, { timeout: 30_000 }).toBe(1);
  await expect.poll(async () => named(await events(page), 'outlineLoaded').length).toBe(1);
  const all = await events(page);

  const once = (name: string) => {
    const list = named(all, name);
    expect(list, `${name} fires once`).toHaveLength(1);
    return list[0];
  };
  const starts = once('pdfLoadingStarts');
  const loaded = once('pdfLoaded');
  const pagesLoaded = once('pagesLoaded');
  expect(loaded.payload).toEqual({ pagesCount: 333 });
  expect(pagesLoaded.payload).toEqual({ pagesCount: 333 });
  expect(starts.t).toBeLessThanOrEqual(loaded.t);
  expect(loaded.t).toBeLessThanOrEqual(pagesLoaded.t);

  expect(once('outlineLoaded').payload.outlineCount).toBe(75);
  expect(once('attachmentsloaded').payload).toEqual({ attachmentsCount: 0 });
  expect(once('layersloaded').payload).toEqual({ layersCount: 0 });
  expect(named(all, 'pdfLoadingFailed')).toHaveLength(0);
});

test('rendering: every page that is painted reports pageRender, then pageRendered and its layers', async ({ page }) => {
  await open(page, `src=${BOOK}`);
  await expect.poll(async () => named(await events(page), 'annotationLayerRendered').length, { timeout: 30_000 }).toBeGreaterThan(0);
  await page.waitForTimeout(1000);
  const all = await events(page);

  const rendered = named(all, 'pageRendered');
  expect(rendered.length).toBeGreaterThan(0);
  const pageNumbers = rendered.map((e) => e.payload.pageNumber);
  expect(new Set(pageNumbers).size, 'no page is reported twice without a reason').toBe(pageNumbers.length);
  for (const r of rendered) {
    expect(r.payload.error).toBeNull();
    const start = all.find((e) => e.name === 'pageRender' && e.payload.pageNumber === r.payload.pageNumber);
    expect(start, `pageRender before pageRendered for page ${r.payload.pageNumber}`).toBeDefined();
    expect(start!.t).toBeLessThanOrEqual(r.t);
    for (const layer of ['textLayerRendered', 'annotationLayerRendered']) {
      const done = all.filter((e) => e.name === layer && e.payload.pageNumber === r.payload.pageNumber);
      expect(done, `${layer} once for page ${r.payload.pageNumber}`).toHaveLength(1);
      expect(done[0].payload.error).toBeNull();
    }
  }
  // Pages far away aren't painted at all.
  expect(Math.max(...pageNumbers)).toBeLessThan(10);
});

test('navigation: one click, one pageChange, with the new page and its label', async ({ page }) => {
  const viewer = await open(page, `src=${BOOK}`);
  await expect.poll(async () => named(await events(page), 'pagesLoaded').length, { timeout: 30_000 }).toBe(1);
  // Page 20 is labeled "3" in this book; page 21 is "4".
  await viewer.gotoPage(3);
  await expect.poll(async () => named(await events(page), 'pageChange').at(-1)?.payload).toBe(20);

  const recorded = await since(page);
  await viewer.nextPage();
  await expect.poll(async () => named(await recorded(), 'pageChange').map((e) => e.payload)).toEqual([21]);
  await expect.poll(async () => named(await recorded(), 'pageLabelChange').map((e) => e.payload)).toEqual(['4']);
});

test('[pageLabel]: opening a book at a page label', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${BOOK}&pageLabel="4"`);
  await viewer.waitForViewerMounted();
  await expect.poll(async () => await page.evaluate(() => (window as any).__ngxApp?.page), { timeout: 30_000 }).toBe(21);
  await viewer.waitForPageRender(21);
  // The page field shows the label, not the page number.
  await expect(page.locator('#pageNumber')).toHaveValue('4');
});

test('[pageLabel]: changing it navigates; a new document starts at its first page', async ({ page }) => {
  const viewer = await open(page, `src=${BOOK}`);
  const current = () => page.evaluate(() => (window as any).__ngxApp?.page);
  await expect.poll(async () => named(await events(page), 'pagesLoaded').length, { timeout: 30_000 }).toBe(1);
  await page.evaluate(() => (window as any).__setInput('pageLabel', '4'));
  await expect.poll(current).toBe(21);

  // Scrolling reports labels back without fighting the user.
  await viewer.nextPage();
  await expect.poll(current).toBe(22);
  await expect.poll(async () => named(await events(page), 'pageLabelChange').at(-1)?.payload).toBe('5');

  await page.evaluate(() => (window as any).__setInput('src', '/assets/pdfs/blind-text-collection.pdf'));
  await expect.poll(async () => named(await events(page), 'pagesLoaded').length, { timeout: 30_000 }).toBe(2);
  await page.waitForTimeout(500);
  expect(await current()).toBe(1);
});

test('zoom: one click, one zoomChange, and the new zoom factor', async ({ page }) => {
  const viewer = await open(page, `src=${BOOK}&zoom=100`);
  await expect.poll(async () => named(await events(page), 'pagesLoaded').length, { timeout: 30_000 }).toBe(1);
  await page.waitForTimeout(500);
  const recorded = await since(page);
  await viewer.zoomIn();
  await expect.poll(async () => named(await recorded(), 'currentZoomFactor').at(-1)?.payload).toBeGreaterThan(1);
  const zoomChanges = named(await recorded(), 'zoomChange').map((e) => e.payload);
  expect(zoomChanges, 'one zoomChange per click').toHaveLength(1);
  const factor = named(await recorded(), 'currentZoomFactor').at(-1)!.payload;
  expect(Math.round(factor * 100)).toBe(Number(zoomChanges[0]));
});

test('find: state goes pending -> found, the count settles, and a miss reports not found', async ({ page }) => {
  const viewer = await open(page, `src=${BOOK}`);
  await expect.poll(async () => named(await events(page), 'pagesLoaded').length, { timeout: 30_000 }).toBe(1);
  await viewer.openFindBar();

  let recorded = await since(page);
  await page.locator('#findInput').fill('commons');
  await page.locator('#findInput').press('Enter');
  await expect
    .poll(async () => named(await recorded(), 'updateFindState').map((e) => e.payload), { timeout: 30_000 })
    .toContain(FIND.FOUND);
  const states = named(await recorded(), 'updateFindState').map((e) => e.payload);
  expect(states.indexOf(FIND.PENDING), 'pending first').toBeLessThan(states.indexOf(FIND.FOUND));
  // The count grows while pdf.js searches the 333 pages, then settles.
  let last = 0;
  await expect
    .poll(
      async () => {
        const total = named(await recorded(), 'updateFindMatchesCount').at(-1)!.payload.total;
        const settled = total === last;
        last = total;
        return settled && total > 0;
      },
      { timeout: 30_000, intervals: [1000] },
    )
    .toBe(true);
  const final = named(await recorded(), 'updateFindMatchesCount').at(-1)!.payload;
  expect(final.query).toBe('commons');
  expect(final.current).toBeGreaterThanOrEqual(1);
  expect(final.current).toBeLessThanOrEqual(final.total);
  const totals = named(await recorded(), 'updateFindMatchesCount').map((e) => e.payload.total);
  expect(totals, 'the count never goes down while searching').toEqual([...totals].sort((a, b) => a - b));

  recorded = await since(page);
  await page.locator('#findInput').fill('xyzzyqq');
  await page.locator('#findInput').press('Enter');
  await expect.poll(async () => named(await recorded(), 'updateFindState').at(-1)?.payload, { timeout: 15_000 }).toBe(FIND.NOT_FOUND);
  const miss = named(await recorded(), 'updateFindMatchesCount').at(-1)!.payload;
  expect(miss.query).toBe('xyzzyqq');
  expect([miss.current, miss.total]).toEqual([0, 0]);
});

test('download: one pdfDownloaded per download', async ({ page }) => {
  await open(page, `src=${BOOK}`);
  const recorded = await since(page);
  await downloadPdf(page);
  await expect.poll(async () => named(await recorded(), 'pdfDownloaded').length).toBe(1);
  expect(named(await recorded(), 'pdfDownloaded')[0].payload).toEqual({ isFromKeyboard: false });
  await downloadPdf(page);
  await expect.poll(async () => named(await recorded(), 'pdfDownloaded').length).toBe(2);
});

test('attachments and layers are counted', async ({ page }) => {
  await open(page, 'src=/assets/pdfs/annotation-fileattachment.pdf');
  await expect.poll(async () => named(await events(page), 'attachmentsloaded').map((e) => e.payload.attachmentsCount), { timeout: 30_000 }).toEqual([1]);

  await open(page, 'src=/assets/pdfs/themes_de_la_Science-fiction.pdf');
  await expect
    .poll(async () => named(await events(page), 'layersloaded').map((e) => e.payload.layersCount), { timeout: 30_000 })
    .toEqual([expect.any(Number)]);
  expect(named(await events(page), 'layersloaded')[0].payload.layersCount).toBeGreaterThan(0);
});

test('a missing file: pdfLoadingFailed once, and no pdfLoaded', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/e2e/viewer?src=/assets/pdfs/does-not-exist.pdf');
  await expect.poll(async () => named((await events(page)) ?? [], 'pdfLoadingFailed').length, { timeout: 30_000 }).toBe(1);
  await page.waitForTimeout(1000);
  const all = await events(page);
  expect(named(all, 'pdfLoadingFailed')).toHaveLength(1);
  expect(named(all, 'pdfLoaded')).toHaveLength(0);
});
