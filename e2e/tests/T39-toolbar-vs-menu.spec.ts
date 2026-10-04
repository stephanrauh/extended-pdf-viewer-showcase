import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T39 — every toolbar action works the same from the toolbar and from the
 * secondary (Tools) menu.
 *
 * Each button of the toolbar is rendered twice: once in the toolbar and once
 * as an entry of the secondary menu, and CSS decides which copy is visible.
 * The two copies don't run the same code: a menu entry calls the button's
 * action with `isSecondaryMenu = true`, falls back to dispatching an event-bus
 * name, sets the `toggled` class itself, may close the menu, and popups opened
 * from it are positioned below the Tools button. Each test here therefore runs
 * twice, once per path, against the same assertion.
 *
 * The bare viewer at /e2e/viewer (src/app/e2e-harness, development builds only)
 * takes its inputs from the URL, so `show=always-visible` puts every button in
 * the toolbar and `show=always-in-secondary-menu` puts every button in the menu
 * - independent of the window width and of any demo's settings.
 */

type Via = 'toolbar' | 'menu';
const VIAS: Via[] = ['toolbar', 'menu'];
const SHOW: Record<Via, string> = { toolbar: 'always-visible', menu: 'always-in-secondary-menu' };

/** The two DOM copies of a button: its toolbar id and its menu-entry id. */
type Button = { toolbar: string; menu: string };
const B = {
  first: { toolbar: 'primaryFirstPage', menu: 'secondaryFirstPage' },
  previous: { toolbar: 'primaryPrevious', menu: 'secondaryPreviousPage' },
  next: { toolbar: 'primaryNext', menu: 'primaryNextPage' },
  last: { toolbar: 'primaryLastPage', menu: 'secondaryLastPage' },
  zoomIn: { toolbar: 'primaryZoomIn', menu: 'secondaryZoomIn' },
  zoomOut: { toolbar: 'primaryZoomOut', menu: 'secondaryZoomOut' },
  rotateCw: { toolbar: 'primaryPageRotateCw', menu: 'secondaryPageRotateCw' },
  rotateCcw: { toolbar: 'primaryPageRotateCcw', menu: 'secondaryPageRotateCcw' },
  handTool: { toolbar: 'primaryCursorHandTool', menu: 'secondaryCursorHandTool' },
  selectTool: { toolbar: 'primaryCursorSelectTool', menu: 'secondaryCursorSelectTool' },
  sidebar: { toolbar: 'viewsManagerToggleButton', menu: 'secondaryViewsManagerToggleButton' },
  find: { toolbar: 'primaryViewFind', menu: 'secondaryViewFind' },
  properties: { toolbar: 'documentProperties', menu: 'secondaryDocumentProperties' },
  scrollPage: { toolbar: 'scrollPage', menu: 'secondaryScrollPage' },
  scrollVertical: { toolbar: 'scrollVertical', menu: 'secondaryScrollVertical' },
  scrollHorizontal: { toolbar: 'scrollHorizontal', menu: 'secondaryScrollHorizontal' },
  scrollWrapped: { toolbar: 'scrollWrapped', menu: 'secondaryScrollWrapped' },
  infiniteScroll: { toolbar: 'infiniteScroll', menu: 'secondaryInfiniteScroll' },
  bookMode: { toolbar: 'book-mode', menu: 'secondaryBook-mode' },
  spreadNone: { toolbar: 'spreadNone', menu: 'secondarySpreadNone' },
  spreadOdd: { toolbar: 'spreadOdd', menu: 'secondarySpreadOdd' },
  spreadEven: { toolbar: 'spreadEven', menu: 'secondarySpreadEven' },
  presentation: { toolbar: 'presentationMode', menu: 'secondaryPresentationMode' },
  openFile: { toolbar: 'openFile', menu: 'secondaryOpenFile' },
  print: { toolbar: 'printButton', menu: 'secondaryPrintButton' },
  download: { toolbar: 'downloadButton', menu: 'secondaryDownload' },
  highlight: { toolbar: 'primaryEditorHighlight', menu: 'secondaryEditorHighlight' },
  freeText: { toolbar: 'primaryEditorFreeText', menu: 'secondaryEditorFreeText' },
  ink: { toolbar: 'primaryEditorInk', menu: 'secondaryEditorInk' },
  stamp: { toolbar: 'primaryEditorStamp', menu: 'secondaryEditorStamp' },
  signature: { toolbar: 'primaryEditorSignatureButton', menu: 'secondaryEditorSignatureButton' },
  eraser: { toolbar: 'primaryEditorEraser', menu: 'secondaryEditorEraser' },
  undo: { toolbar: 'primaryEditorUndo', menu: 'secondaryEditorUndo' },
  redo: { toolbar: 'primaryEditorRedo', menu: 'secondaryEditorRedo' },
} satisfies Record<string, Button>;

/** pdf.js AnnotationEditorType values (src/shared/util.js in mypdf.js). */
const EDITOR = { NONE: 0, FREETEXT: 3, HIGHLIGHT: 9, STAMP: 13, INK: 15, SIGNATURE: 101, ERASER: 103 };

/** A 641-page text book: enough pages for navigation and layout checks. */
const BOOK = '/assets/pdfs/Portugues-para-principiantes.pdf';
/** A small text PDF, for the actions that process the whole document. */
const SMALL = '/assets/pdfs/blind-text-collection.pdf';
const ASSETS_DIR = path.resolve(__dirname, '../../src/assets/pdfs');

// ─── harness access ─────────────────────────────────────────────────────────

async function openViewer(
  page: Page,
  via: Via,
  params: Record<string, string | number | boolean> = {},
): Promise<PdfViewerPage> {
  const query = new URLSearchParams({ show: SHOW[via], 'opt.enableSignatureEditor': 'true' });
  for (const [key, value] of Object.entries(params)) query.set(key, String(value));
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?${query}`);
  await viewer.waitForFirstPageRender();
  await expect
    .poll(async () => await app(page, (a) => a.pdfDocument?.numPages ?? 0), { timeout: 30_000 })
    .toBeGreaterThan(0);
  return viewer;
}

/** Reads a value from the viewer's PDFViewerApplication (see fixtures.ts). */
async function app<T>(page: Page, read: (app: any) => T): Promise<T> {
  return await page.evaluate(`(${read.toString()})(window.__ngxApp)`) as T;
}

/** Changes the viewer's state directly - only for setting up a test. */
async function setUp(page: Page, change: (app: any) => void): Promise<void> {
  await page.evaluate(`(${change.toString()})(window.__ngxApp)`);
}

function copies(page: Page, button: Button): { toolbar: Locator; menu: Locator } {
  return { toolbar: page.locator(`[id="${button.toolbar}"]`), menu: page.locator(`[id="${button.menu}"]`) };
}

async function openMenu(page: Page): Promise<void> {
  const menu = page.locator('#secondaryToolbar');
  if (await menu.evaluate((el) => el.classList.contains('hidden'))) {
    await page.locator('#secondaryToolbarToggle').click();
  }
  await expect(menu).toBeVisible();
}

async function closeMenu(page: Page): Promise<void> {
  const menu = page.locator('#secondaryToolbar');
  if (!(await menu.evaluate((el) => el.classList.contains('hidden')))) {
    await page.locator('#secondaryToolbarToggle').click();
  }
  await expect(menu).toBeHidden();
}

/**
 * Each button must live where the visibility setting put it: visible on this
 * path and hidden on the other one - never in both places, never in neither.
 *
 * Checked once, before the test changes anything: opening the menu ends an
 * active editing mode (#3084), so checking it in between would change the
 * state under test.
 */
async function expectPlacement(page: Page, via: Via, buttons: Button[]): Promise<void> {
  await openMenu(page);
  for (const button of buttons) {
    const { toolbar, menu } = copies(page, button);
    if (via === 'toolbar') {
      await expect(toolbar, `#${button.toolbar} is in the toolbar`).toBeVisible();
      await expect(menu, `#${button.menu} is not also in the menu`).toBeHidden();
    } else {
      await expect(toolbar, `#${button.toolbar} is not also in the toolbar`).toBeHidden();
      await expect(menu, `#${button.menu} is in the menu`).toBeVisible();
    }
  }
  await closeMenu(page);
}

/** Clicks a button the way a user would on the given path. */
async function press(page: Page, via: Via, button: Button): Promise<void> {
  const { toolbar, menu } = copies(page, button);
  if (via === 'toolbar') {
    await toolbar.click();
  } else {
    await openMenu(page);
    await menu.click();
  }
}

/** Both copies of a mode button must agree on whether the mode is on. */
async function expectToggled(page: Page, button: Button, on: boolean): Promise<void> {
  const { toolbar, menu } = copies(page, button);
  const pattern = /\btoggled\b/;
  for (const [where, copy] of [['toolbar', toolbar], ['menu', menu]] as const) {
    if (on) {
      await expect(copy, `${where} copy of ${button.toolbar} shows the mode as on`).toHaveClass(pattern);
    } else {
      await expect(copy, `${where} copy of ${button.toolbar} shows the mode as off`).not.toHaveClass(pattern);
    }
  }
}

async function pageBox(page: Page, n: number) {
  return await page.evaluate((num) => {
    const el = document.querySelector<HTMLElement>(`.page[data-page-number="${num}"]`);
    const container = document.querySelector<HTMLElement>('#viewerContainer');
    if (!el || !container) return null;
    const r = el.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    return {
      x: r.left - c.left + container.scrollLeft,
      y: r.top - c.top + container.scrollTop,
      width: r.width,
      height: r.height,
      displayed: getComputedStyle(el).display !== 'none' && r.width > 0,
    };
  }, n);
}

/**
 * Size of the page's rendered content (its canvas wrapper). Unlike the `.page`
 * box it carries no border, so it scales exactly with the zoom factor.
 */
async function contentSize(page: Page, n: number): Promise<{ width: number; height: number }> {
  const box = await page.locator(`.page[data-page-number="${n}"] .canvasWrapper`).boundingBox();
  return { width: box?.width ?? 0, height: box?.height ?? 0 };
}

/** Pages 1-4 laid out at a scale small enough to see several at once. */
async function smallLayout(page: Page) {
  await expect.poll(async () => (await pageBox(page, 1))?.width ?? 0).toBeGreaterThan(0);
  return await Promise.all([1, 2, 3, 4].map((n) => pageBox(page, n)));
}

// ─── tests ──────────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'parallel' });

for (const via of VIAS) {
  test.describe(`T39 — ${via}`, () => {
    test(`${via}: page navigation (next, previous, first, last)`, async ({ page }) => {
      const viewer = await openViewer(page, via, { src: BOOK, page: 20 });
      await expectPlacement(page, via, [B.next, B.previous, B.last, B.first]);
      await expect.poll(async () => await app(page, (a) => a.page)).toBe(20);
      const total = await app(page, (a) => a.pagesCount);

      const steps: Array<[Button, number]> = [
        [B.next, 21],
        [B.previous, 20],
        [B.last, total],
        [B.first, 1],
      ];
      for (const [button, expected] of steps) {
        await press(page, via, button);
        await expect.poll(async () => await app(page, (a) => a.page), { message: `${button.toolbar} → page ${expected}` }).toBe(expected);
        await viewer.expectViewportOnPage(expected);
        await viewer.waitForPageRender(expected);
        await viewer.assertCanvasHasContent(expected);
      }
    });

    test(`${via}: zoom in and zoom out scale the page`, async ({ page }) => {
      const viewer = await openViewer(page, via, { src: BOOK, zoom: '100%' });
      await expectPlacement(page, via, [B.zoomIn, B.zoomOut]);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.currentScale)).toBeCloseTo(1, 2);
      const current = await viewer.waitForCurrentPage();
      const width = async () => (await contentSize(page, current)).width;
      const base = await width();
      // Within 1%: pdf.js rounds the CSS size to whole pixels.
      const expectWidthFor = async (scale: number) =>
        await expect.poll(async () => Math.abs((await width()) / (base * scale) - 1)).toBeLessThan(0.01);

      await press(page, via, B.zoomIn);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.currentScale)).toBeGreaterThan(1.05);
      // The page grows by exactly the new scale factor - not just "a bit".
      await expectWidthFor(await app(page, (a) => a.pdfViewer.currentScale));
      await viewer.assertCanvasHasContent(current);

      await press(page, via, B.zoomOut);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.currentScale)).toBeCloseTo(1, 2);
      await press(page, via, B.zoomOut);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.currentScale)).toBeLessThan(0.95);
      await expectWidthFor(await app(page, (a) => a.pdfViewer.currentScale));
      await viewer.expectVisiblePageLayersAligned(current);
    });

    test(`${via}: rotate clockwise and counter-clockwise turn the pages`, async ({ page }) => {
      // A fixed zoom: with 'auto', pdf.js refits a rotated page to the width.
      const viewer = await openViewer(page, via, { src: BOOK, page: 9, zoom: '50%' });
      await expectPlacement(page, via, [B.rotateCw, B.rotateCcw]);
      await viewer.waitForPageRender(9);
      const upright = await contentSize(page, 9);
      expect(upright.height).toBeGreaterThan(upright.width);
      const expectTurned = async (turned: boolean) => {
        const [w, h] = turned ? [upright.height, upright.width] : [upright.width, upright.height];
        await expect.poll(async () => Math.abs((await contentSize(page, 9)).width - w)).toBeLessThan(2);
        await expect.poll(async () => Math.abs((await contentSize(page, 9)).height - h)).toBeLessThan(2);
      };

      await press(page, via, B.rotateCw);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.pagesRotation)).toBe(90);
      // A quarter turn swaps the page's width and height.
      await expectTurned(true);
      await viewer.assertCanvasHasContent(9);

      await press(page, via, B.rotateCcw);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.pagesRotation)).toBe(0);
      await expectTurned(false);
      await press(page, via, B.rotateCcw);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.pagesRotation)).toBe(270);
      await expectTurned(true);
    });

    test(`${via}: scroll modes lay the pages out`, async ({ page }) => {
      await openViewer(page, via, { src: BOOK, zoom: '25%' });
      await expectPlacement(page, via, [B.scrollHorizontal, B.scrollWrapped, B.scrollPage, B.scrollVertical]);

      await press(page, via, B.scrollHorizontal);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.scrollMode)).toBe(1);
      await expectToggled(page, B.scrollHorizontal, true);
      await expectToggled(page, B.scrollVertical, false);
      let [p1, p2] = await smallLayout(page);
      expect(p2!.x, 'horizontal: page 2 right of page 1').toBeGreaterThan(p1!.x + p1!.width / 2);
      expect(Math.abs(p2!.y - p1!.y)).toBeLessThan(5);

      await press(page, via, B.scrollWrapped);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.scrollMode)).toBe(2);
      await expectToggled(page, B.scrollWrapped, true);
      await expectToggled(page, B.scrollHorizontal, false);
      const [w1, w2, w3] = await smallLayout(page);
      expect(Math.abs(w2!.y - w1!.y), 'wrapped: pages 1-3 share a row').toBeLessThan(5);
      expect(Math.abs(w3!.y - w1!.y)).toBeLessThan(5);
      expect(w3!.x).toBeGreaterThan(w2!.x);

      await press(page, via, B.scrollPage);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.scrollMode)).toBe(3);
      await expectToggled(page, B.scrollPage, true);
      // Page mode shows only the current page.
      await expect
        .poll(async () => (await smallLayout(page)).filter((b) => b?.displayed).length)
        .toBe(1);

      await press(page, via, B.scrollVertical);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.scrollMode)).toBe(0);
      await expectToggled(page, B.scrollVertical, true);
      await expectToggled(page, B.scrollPage, false);
      [p1, p2] = await smallLayout(page);
      expect(p2!.y, 'vertical: page 2 below page 1').toBeGreaterThan(p1!.y + p1!.height / 2);
      expect(Math.abs(p2!.x - p1!.x)).toBeLessThan(5);
    });

    test(`${via}: spread modes pair the right pages`, async ({ page }) => {
      await openViewer(page, via, { src: BOOK, zoom: '25%' });
      await expectPlacement(page, via, [B.spreadOdd, B.spreadEven, B.spreadNone]);

      await press(page, via, B.spreadOdd);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.spreadMode)).toBe(1);
      await expectToggled(page, B.spreadOdd, true);
      await expectToggled(page, B.spreadNone, false);
      let [p1, p2, p3] = await smallLayout(page);
      expect(Math.abs(p2!.y - p1!.y), 'odd: 1 and 2 side by side').toBeLessThan(5);
      expect(p3!.y, 'odd: 3 starts the next row').toBeGreaterThan(p1!.y + p1!.height / 2);

      await press(page, via, B.spreadEven);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.spreadMode)).toBe(2);
      await expectToggled(page, B.spreadEven, true);
      await expectToggled(page, B.spreadOdd, false);
      [p1, p2, p3] = await smallLayout(page);
      expect(p2!.y, 'even: page 1 alone').toBeGreaterThan(p1!.y + p1!.height / 2);
      expect(Math.abs(p3!.y - p2!.y), 'even: 2 and 3 side by side').toBeLessThan(5);

      await press(page, via, B.spreadNone);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.spreadMode)).toBe(0);
      await expectToggled(page, B.spreadNone, true);
      [p1, p2] = await smallLayout(page);
      expect(p2!.y, 'none: one page per row').toBeGreaterThan(p1!.y + p1!.height / 2);
    });

    test(`${via}: infinite scroll and book mode switch the page view mode`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.infiniteScroll, B.bookMode]);

      await press(page, via, B.infiniteScroll);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.pageViewMode)).toBe('infinite-scroll');
      await expectToggled(page, B.infiniteScroll, true);
      // Infinite scroll hands scrolling to the page: the viewer container grows
      // to the height of the whole document instead of scrolling itself.
      await expect
        .poll(async () =>
          await page.locator('#viewerContainer').evaluate((el) => el.scrollHeight - el.clientHeight),
        )
        .toBeLessThanOrEqual(1);

      await press(page, via, B.bookMode);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.pageViewMode)).toBe('book');
      await expectToggled(page, B.bookMode, true);
      await expectToggled(page, B.infiniteScroll, false);
    });

    test(`${via}: hand tool drags the document, select tool doesn't`, async ({ page }) => {
      const viewer = await openViewer(page, via, { src: BOOK, handTool: false });
      await expectPlacement(page, via, [B.handTool, B.selectTool]);
      await expect.poll(async () => await app(page, (a) => a.pdfCursorTools.activeTool)).toBe(0);

      await press(page, via, B.handTool);
      await expect.poll(async () => await app(page, (a) => a.pdfCursorTools.activeTool)).toBe(1);
      await expectToggled(page, B.handTool, true);
      await expectToggled(page, B.selectTool, false);

      const container = viewer.viewerContainer;
      const scrollTop = () => container.evaluate((el) => el.scrollTop);
      const drag = async () => {
        const box = (await container.boundingBox())!;
        const x = box.x + box.width / 2;
        await page.mouse.move(x, box.y + box.height * 0.7);
        await page.mouse.down();
        await page.mouse.move(x, box.y + box.height * 0.3, { steps: 10 });
        await page.mouse.up();
      };
      const before = await scrollTop();
      await drag();
      await expect.poll(scrollTop, 'hand tool: dragging up scrolls down').toBeGreaterThan(before + 50);

      await press(page, via, B.selectTool);
      await expect.poll(async () => await app(page, (a) => a.pdfCursorTools.activeTool)).toBe(0);
      await expectToggled(page, B.selectTool, true);
      const settled = await scrollTop();
      await drag();
      expect(await scrollTop(), 'select tool: dragging selects instead of scrolling').toBe(settled);
    });

    test(`${via}: sidebar button opens the sidebar with thumbnails`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.sidebar]);
      const sidebar = page.locator('#viewsManager');
      await expect(sidebar).toBeHidden();
      await press(page, via, B.sidebar);
      await expect(sidebar).toBeVisible();
      await expect(page.locator('#thumbnailsView .thumbnail').first()).toBeVisible();
    });

    test(`${via}: find opens the find bar below its button and finds text`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.find]);
      await press(page, via, B.find);
      const findbar = page.locator('#findbar');
      await expect(findbar).toBeVisible();
      await expectBelowAnchor(page, findbar, via === 'toolbar' ? B.find.toolbar : 'secondaryToolbarToggle');

      const input = page.locator('#findInput');
      await input.fill('Vokalia');
      await input.press('Enter');
      await expect(page.locator('#findResultsCount')).toHaveText(/\b1\b.*\b\d+\b/, { timeout: 15_000 });
      await expect(page.locator('.textLayer .highlight.selected').first()).toBeVisible();
      await expect(page.locator('.textLayer .highlight.selected').first()).toHaveText(/Vokalia/);
    });

    test(`${via}: document properties show this document's data`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.properties]);
      const pages = await app(page, (a) => a.pagesCount);
      await press(page, via, B.properties);
      const dialog = page.locator('#documentPropertiesDialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('#fileNameField')).toHaveText('blind-text-collection.pdf');
      await expect(dialog.locator('#pageCountField')).toHaveText(String(pages));
      await expect(dialog.locator('#fileSizeField')).toContainText(/\d/);
    });

    test(`${via}: print hands every page to the browser's print dialog`, async ({ page }) => {
      await stubPrint(page);
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.print]);
      const pages = await app(page, (a) => a.pagesCount);
      await press(page, via, B.print);
      await expect.poll(async () => await page.evaluate(() => (window as any).__printCalls), { timeout: 30_000 }).toBe(1);
      // What was in the print container when window.print() was called.
      expect(await page.evaluate(() => (window as any).__printedPages)).toBe(pages);
    });

    test(`${via}: download saves the open PDF byte for byte`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.download]);
      const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
      await press(page, via, B.download);
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('blind-text-collection.pdf');
      const saved = readFileSync((await download.path())!);
      expect(saved.equals(readFileSync(path.join(ASSETS_DIR, 'blind-text-collection.pdf')))).toBe(true);
    });

    test(`${via}: open file loads the chosen PDF`, async ({ page }) => {
      await openViewer(page, via, { src: BOOK });
      await expectPlacement(page, via, [B.openFile]);
      const chooserPromise = page.waitForEvent('filechooser', { timeout: 15_000 });
      await press(page, via, B.openFile);
      const chooser = await chooserPromise;
      await chooser.setFiles(path.join(ASSETS_DIR, 'blind-text-collection.pdf'));
      await expect.poll(async () => await app(page, (a) => a.pdfDocument?.numPages), { timeout: 30_000 }).toBe(
        await expectedPageCount(page, SMALL),
      );
      const viewer = new PdfViewerPage(page);
      await viewer.expectPageText(1, 'Blind text');
    });

    test(`${via}: presentation mode enters fullscreen`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'fullscreen from a synthetic click is only reliable in Chromium');
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.presentation]);
      await press(page, via, B.presentation);
      await expect(page.locator('#viewerContainer')).toHaveClass(/pdfPresentationMode/, { timeout: 15_000 });
      expect(await page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('viewerContainer');
      await page.evaluate(() => document.exitFullscreen());
      await expect(page.locator('#viewerContainer')).not.toHaveClass(/pdfPresentationMode/, { timeout: 15_000 });
    });

    test(`${via}: editor buttons switch the editor mode and open their settings below the button`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      const editors: Array<[Button, number, string]> = [
        [B.highlight, EDITOR.HIGHLIGHT, 'editorHighlightParamsToolbar'],
        [B.freeText, EDITOR.FREETEXT, 'editorFreeTextParamsToolbar'],
        [B.ink, EDITOR.INK, 'editorInkParamsToolbar'],
        [B.stamp, EDITOR.STAMP, 'editorStampParamsToolbar'],
        [B.eraser, EDITOR.ERASER, 'editorEraserParamsToolbar'],
        [B.signature, EDITOR.SIGNATURE, 'editorSignatureParamsToolbar'],
      ];
      await expectPlacement(page, via, editors.map(([button]) => button));
      for (const [button, mode, popupId] of editors) {
        await test.step(button.toolbar, async () => {
          await press(page, via, button);
          await expect.poll(async () => await app(page, (a) => a.pdfViewer.annotationEditorMode)).toBe(mode);
          await expectToggled(page, button, true);
          const popup = page.locator(`#${popupId}`);
          await expect(popup, `${popupId} opens`).toBeVisible();
          await expectBelowAnchor(page, popup, via === 'toolbar' ? button.toolbar : 'secondaryToolbarToggle');

          if (via === 'toolbar') {
            // Clicking the button again turns the editor off.
            await press(page, via, button);
          } else {
            // Opening the menu closes every other popover and ends the editing
            // mode (#3084), so on this path that is how the editor is left.
            await openMenu(page);
          }
          await expect.poll(async () => await app(page, (a) => a.pdfViewer.annotationEditorMode)).toBe(EDITOR.NONE);
          await expect(popup, `${popupId} closes`).toBeHidden();
          await expectToggled(page, button, false);
          await closeMenu(page);
        });
      }
    });

    test(`${via}: a drawn stroke can be undone and redone`, async ({ page }) => {
      await openViewer(page, via, { src: SMALL });
      await expectPlacement(page, via, [B.ink, B.undo, B.redo]);
      const count = async () => await app(page, (a) => (a.pdfViewer.getSerializedAnnotations() ?? []).length);

      await press(page, via, B.ink);
      await expect.poll(async () => await app(page, (a) => a.pdfViewer.annotationEditorMode)).toBe(EDITOR.INK);
      const layer = page.locator('.page[data-page-number="1"] .annotationEditorLayer');
      await layer.scrollIntoViewIfNeeded();
      const box = (await layer.boundingBox())!;
      // Re-draw until the stroke lands: pdf.js loads the editor code lazily, and
      // the first gesture of a cold session can be dropped (see T27).
      await expect
        .poll(
          async () => {
            await page.mouse.move(box.x + 120, box.y + 80);
            await page.mouse.down();
            await page.mouse.move(box.x + 180, box.y + 120, { steps: 12 });
            await page.mouse.move(box.x + 240, box.y + 100, { steps: 12 });
            await page.mouse.up();
            await page.keyboard.press('Escape');
            return await count();
          },
          { timeout: 25_000, intervals: [500, 1000, 1500] },
        )
        .toBeGreaterThan(0);
      const drawn = await count();

      await press(page, via, B.undo);
      await expect.poll(count, 'undo removes the stroke').toBe(drawn - 1);
      await press(page, via, B.redo);
      await expect.poll(count, 'redo brings it back').toBe(drawn);
    });
  });
}

// ─── helpers used by single tests ───────────────────────────────────────────

/**
 * The popup must open below the button the user clicked - or, when that
 * button lives in the menu, below the Tools button that opened the menu.
 */
async function expectBelowAnchor(page: Page, popup: Locator, anchorId: string): Promise<void> {
  await expect
    .poll(async () => {
      const anchor = await page.locator(`[id="${anchorId}"]`).boundingBox();
      const box = await popup.boundingBox();
      if (!anchor || !box) return `missing box (anchor ${!!anchor}, popup ${!!box})`;
      const below = box.y >= anchor.y + anchor.height - 2 && box.y <= anchor.y + anchor.height + 40;
      const overlaps = box.x <= anchor.x + anchor.width && box.x + box.width >= anchor.x;
      return below && overlaps ? 'ok' : `popup at ${JSON.stringify(box)}, anchor #${anchorId} at ${JSON.stringify(anchor)}`;
    })
    .toBe('ok');
}

async function expectedPageCount(page: Page, src: string): Promise<number> {
  // The harness's file is opened by the same pdf.js, so ask it how many pages
  // the reference file has rather than hard-coding the number.
  return await page.evaluate(async (url) => {
    const lib = (window as any).pdfjsLib;
    const task = lib.getDocument({ url });
    const n = (await task.promise).numPages;
    await task.destroy();
    return n;
  }, src);
}

/**
 * Replaces window.print so no OS dialog opens, and records how many pages
 * pdf.js had put into its print container at the moment it called print().
 */
async function stubPrint(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as any;
    w.__printCalls = 0;
    w.__printedPages = -1;
    const stub = () => {
      w.__printCalls += 1;
      w.__printedPages = document.querySelectorAll('#printContainer > *').length;
    };
    window.print = stub;
    const patchIframes = () => {
      document.querySelectorAll('iframe').forEach((f) => {
        try {
          if (f.contentWindow) f.contentWindow.print = stub;
        } catch {
          // cross-origin iframe - not ours
        }
      });
    };
    new MutationObserver(patchIframes).observe(document, { childList: true, subtree: true });
    patchIframes();
  });
}
