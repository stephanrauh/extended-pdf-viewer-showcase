import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { BUTTONS } from '../poms/toolbar-buttons';

/**
 * T42 — responsive toolbar: the breakpoints move buttons between the toolbar
 * and the secondary menu at the documented widths, and no width loses or
 * duplicates a button.
 *
 * The breakpoints refer to the width of <ngx-extended-pdf-viewer>, not of the
 * window, so the tests size the window until the viewer has the width they
 * need. Runs on the bare viewer (src/app/e2e-harness).
 */

test.describe.configure({ mode: 'parallel' });

const SRC = '/assets/pdfs/blind-text-collection.pdf';

/** The documented default breakpoints (viewer width in px). */
const BREAKPOINTS = { xs: 490, sm: 560, md: 610, lg: 660, xl: 790, xxl: 910, xxxl: 1000 } as const;

async function viewerWidth(page: Page): Promise<number> {
  return await page.evaluate(() => Math.round(document.querySelector('ngx-extended-pdf-viewer')!.getBoundingClientRect().width));
}

/**
 * Resizes the window so the viewer is `width` px wide. The showcase's
 * navigation takes part of the window (and collapses on narrow windows), so
 * the offset is re-measured until the viewer has the right width.
 */
async function setViewerWidth(page: Page, width: number): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await viewerWidth(page);
    if (Math.abs(current - width) <= 1) return;
    const viewport = page.viewportSize()!;
    await page.setViewportSize({ width: viewport.width + (width - current), height: viewport.height });
    await expect.poll(async () => await viewerWidth(page)).not.toBe(current);
  }
  expect(await viewerWidth(page), 'viewer width').toBeCloseTo(width, 0);
}

/** Visible in the toolbar: laid out, and not clipped off the toolbar's end. */
async function inToolbar(page: Page, id: string): Promise<boolean> {
  return await page.evaluate((buttonId) => {
    const el = document.getElementById(buttonId);
    const bar = document.getElementById('toolbarViewer');
    if (!el || !bar || el.closest('#secondaryToolbar')) return false;
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden' || r.width === 0) return false;
    const b = bar.getBoundingClientRect();
    return r.left >= b.left - 1 && r.right <= b.right + 1;
  }, id);
}

async function inMenu(page: Page, id: string): Promise<boolean> {
  return await page.locator(`#secondaryToolbar [id="${id}"]`).isVisible();
}

async function openMenu(page: Page): Promise<void> {
  if (await page.locator('#secondaryToolbar').evaluate((el) => el.classList.contains('hidden'))) {
    await page.locator('#secondaryToolbarToggle').click();
  }
  await expect(page.locator('#secondaryToolbar')).toBeVisible();
}

async function closeMenu(page: Page): Promise<void> {
  if (!(await page.locator('#secondaryToolbar').evaluate((el) => el.classList.contains('hidden')))) {
    await page.locator('#secondaryToolbarToggle').click();
  }
}

async function open(page: Page, query = ''): Promise<PdfViewerPage> {
  await page.setViewportSize({ width: 1920, height: 1000 });
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${SRC}${query}`);
  await viewer.waitForFirstPageRender();
  return viewer;
}

for (const [name, threshold] of Object.entries(BREAKPOINTS)) {
  test(`T42 — showFindButton="${name}": in the toolbar from ${threshold} px, in the menu below`, async ({ page }) => {
    await open(page, `&showFindButton=${name}`);

    await setViewerWidth(page, threshold + 10);
    await expect.poll(() => inToolbar(page, BUTTONS.find.toolbar), `${threshold + 10} px: toolbar`).toBe(true);
    await openMenu(page);
    expect(await inMenu(page, BUTTONS.find.menu), `${threshold + 10} px: not in the menu`).toBe(false);
    await closeMenu(page);

    await setViewerWidth(page, threshold - 10);
    await expect.poll(() => inToolbar(page, BUTTONS.find.toolbar), `${threshold - 10} px: not in the toolbar`).toBe(false);
    await openMenu(page);
    expect(await inMenu(page, BUTTONS.find.menu), `${threshold - 10} px: in the menu`).toBe(true);
  });
}

test('T42 — with the default settings, no width loses or duplicates a button', async ({ page }) => {
  await open(page);

  // Everything that is reachable at full width must stay reachable - in the
  // toolbar or in the menu, never in both.
  await setViewerWidth(page, 1400);
  await openMenu(page);
  const reachable: string[] = [];
  for (const [name, b] of Object.entries(BUTTONS)) {
    if ((await inToolbar(page, b.toolbar)) || (await inMenu(page, b.menu))) reachable.push(name);
  }
  await closeMenu(page);
  // An explicit list, so a button that vanishes everywhere fails the test too.
  // Hidden by default: handTool, selectTool, presentation (showXxxButton = false)
  // and signature (showSignatureEditor = 'xxl', wider than 1400 px).
  const DEFAULT_BUTTONS = [
    'first', 'previous', 'next', 'last', 'zoomIn', 'zoomOut', 'rotateCw', 'rotateCcw', 'sidebar', 'find', 'properties',
    'scrollPage', 'scrollVertical', 'scrollHorizontal', 'scrollWrapped', 'infiniteScroll', 'bookMode',
    'spreadNone', 'spreadOdd', 'spreadEven', 'openFile', 'print', 'download',
    'highlight', 'freeText', 'ink', 'stamp', 'eraser', 'undo', 'redo',
  ];
  expect(reachable, 'reachable at 1400 px').toEqual(DEFAULT_BUTTONS);

  for (const width of [1400, 1010, 990, 920, 900, 800, 780, 670, 650, 620, 600, 570, 550, 500, 480]) {
    await test.step(`${width} px`, async () => {
      await setViewerWidth(page, width);
      await page.waitForTimeout(200);
      const toolbar: string[] = [];
      for (const name of reachable) {
        if (await inToolbar(page, BUTTONS[name as keyof typeof BUTTONS].toolbar)) toolbar.push(name);
      }
      await openMenu(page);
      const problems: string[] = [];
      for (const name of reachable) {
        const b = BUTTONS[name as keyof typeof BUTTONS];
        const menu = await inMenu(page, b.menu);
        const bar = toolbar.includes(name);
        if (bar && menu) problems.push(`${name}: in the toolbar AND the menu`);
        if (!bar && !menu) problems.push(`${name}: neither in the toolbar nor in the menu`);
      }
      await closeMenu(page);
      expect(problems, `at ${width} px`).toEqual([]);
    });
  }
});
