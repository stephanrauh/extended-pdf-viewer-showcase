import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { BUTTONS } from '../poms/toolbar-buttons';

/**
 * T54 — accessibility, as far as a test can judge it: accessible names,
 * states that screen readers announce (expanded, pressed, checked), keyboard
 * operation, focus handling of dialogs and menus, [startTabindex] and the
 * page landmarks.
 *
 * What a test can't judge - whether the announcements make sense to a
 * screen-reader user - still needs a human with NVDA, JAWS or VoiceOver.
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';

async function open(page: Page, query = '', show = 'always-visible'): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${DOC}&show=${show}${query}`);
  await viewer.waitForFirstPageRender();
  await page.waitForTimeout(500);
  return viewer;
}

const app = (page: Page, expr: string) => page.evaluate((e) => new Function('app', `return (${e});`)((window as any).__ngxApp), expr);
/** id of the focused element, or its tag name if it has none. */
const focused = (page: Page) => page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName || '');

test('every visible button in the toolbar and the menu has an accessible name', async ({ page }) => {
  await open(page);
  const toolbarButtons = page.locator('#toolbarViewer button:visible');
  expect(await toolbarButtons.count()).toBeGreaterThan(15);
  for (const button of await toolbarButtons.all()) {
    await expect(button, await button.evaluate((b) => b.outerHTML.slice(0, 120))).toHaveAccessibleName(/\S/);
  }
  await page.locator('#secondaryToolbarToggle').click();
  const menuEntries = page.locator('#secondaryToolbar button:visible');
  expect(await menuEntries.count()).toBeGreaterThan(0);
  for (const entry of await menuEntries.all()) {
    await expect(entry, await entry.evaluate((b) => b.outerHTML.slice(0, 120))).toHaveAccessibleName(/\S/);
  }
  // Form controls of the toolbar, too.
  await expect(page.locator('#pageNumber')).toHaveAccessibleName(/\S/);
  await expect(page.locator('#scaleSelect')).toHaveAccessibleName(/\S/);
});

test('buttons that open something say whether it is open', async ({ page }) => {
  await open(page, '&sidebarVisible=false');
  for (const id of [BUTTONS.sidebar.toolbar, 'secondaryToolbarToggle', BUTTONS.find.toolbar]) {
    await test.step(id, async () => {
      const button = page.locator(`#${id}`);
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  }
});

test('tool and editor buttons say which one is active', async ({ page }) => {
  await open(page, '&handTool=false');
  // The editor buttons open their options panel (like upstream pdf.js since 2024), so they
  // aren't radios: they say whether their panel is open. #3295
  const ink = page.locator(`#${BUTTONS.ink.toolbar}`);
  const freeText = page.locator(`#${BUTTONS.freeText.toolbar}`);
  await expect(page.locator('#editorModeButtons [role="radio"], #editorModeButtons[role="radiogroup"]')).toHaveCount(0);
  await expect(ink).not.toHaveAttribute('aria-checked', /./);
  await expect(ink).toHaveAttribute('aria-expanded', 'false');
  await ink.click();
  await expect(ink).toHaveAttribute('aria-expanded', 'true');
  await expect(freeText).toHaveAttribute('aria-expanded', 'false');
  await freeText.click();
  await expect(freeText).toHaveAttribute('aria-expanded', 'true');
  await expect(ink).toHaveAttribute('aria-expanded', 'false');
  // Unlike a radio, an editor can be switched off again.
  await freeText.click();
  await expect(freeText).toHaveAttribute('aria-expanded', 'false');

  // The cursor tools open nothing: they are toggle buttons, announced as pressed. #3295
  const handTool = page.locator(`#${BUTTONS.handTool.toolbar}`);
  const selectTool = page.locator(`#${BUTTONS.selectTool.toolbar}`);
  await expect(selectTool).toHaveAttribute('aria-pressed', 'true');
  await expect(handTool).toHaveAttribute('aria-pressed', 'false');
  await handTool.click();
  await expect(handTool).toHaveAttribute('aria-pressed', 'true');
  await expect(selectTool).toHaveAttribute('aria-pressed', 'false');
  for (const tool of [handTool, selectTool]) {
    await expect(tool).not.toHaveAttribute('aria-expanded', /./);
    await expect(tool).not.toHaveAttribute('aria-haspopup', /./);
  }

  // pdf.js updates the scroll and spread buttons, too. They must stay toggle buttons: no aria-checked.
  const scrollVertical = page.locator(`#${BUTTONS.scrollVertical.toolbar}`);
  const spreadNone = page.locator(`#${BUTTONS.spreadNone.toolbar}`);
  await expect(scrollVertical).toHaveAttribute('aria-pressed', 'true');
  await expect(spreadNone).toHaveAttribute('aria-pressed', 'true');
  for (const id of ['scrollPage', 'scrollVertical', 'scrollHorizontal', 'scrollWrapped', 'spreadNone', 'spreadOdd', 'spreadEven']) {
    await expect(page.locator(`#${id}`), id).not.toHaveAttribute('aria-checked', /./);
  }
});

test('the active entries of the Tools menu are announced as pressed', async ({ page }) => {
  await open(page, '', 'always-in-secondary-menu');
  await page.locator('#secondaryToolbarToggle').click();
  await expect(page.locator(`#${BUTTONS.scrollVertical.menu}`)).toHaveAttribute('aria-pressed', 'true');
  // #3295 an inactive toggle button says "not pressed"; a plain action button says nothing
  await expect(page.locator(`#${BUTTONS.scrollHorizontal.menu}`)).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator(`#${BUTTONS.print.menu}`)).not.toHaveAttribute('aria-pressed', /./);
  await page.locator(`#${BUTTONS.scrollHorizontal.menu}`).click();
  if (!(await page.locator('#secondaryToolbar').isVisible())) await page.locator('#secondaryToolbarToggle').click();
  await expect(page.locator(`#${BUTTONS.scrollHorizontal.menu}`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`#${BUTTONS.scrollVertical.menu}`)).toHaveAttribute('aria-pressed', 'false');
});

test('an entry of the Tools menu that opens a panel says whether the panel is open (#3295)', async ({ page }) => {
  await open(page, '', 'always-in-secondary-menu');
  const ink = page.locator(`#${BUTTONS.ink.menu}`);
  await page.locator('#secondaryToolbarToggle').click();
  await expect(ink).toHaveAttribute('aria-expanded', 'false');
  await expect(ink).toHaveAttribute('aria-controls', 'editorInkParamsToolbar');
  await expect(ink).toHaveAttribute('aria-haspopup', 'true');
  await expect(ink).not.toHaveAttribute('aria-pressed', /./);
  await page.waitForTimeout(150);
  await ink.click();
  await expect(page.locator('#editorInkParamsToolbar')).toBeVisible();
  await expect(ink).toHaveAttribute('aria-expanded', 'true');
  // Opening the menu closes the open panels, so the entry is collapsed again.
  await page.locator('#secondaryToolbarToggle').click();
  await expect(page.locator('#editorInkParamsToolbar')).toBeHidden();
  await expect(ink).toHaveAttribute('aria-expanded', 'false');
});

test('the toolbar can be operated with Tab, Enter and Space', async ({ page }) => {
  await open(page);
  const next = page.locator(`#${BUTTONS.next.toolbar}`);
  await next.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => app(page, 'app.page')).toBe(2);
  await page.keyboard.press('Space');
  await expect.poll(() => app(page, 'app.page')).toBe(3);

  // Tab walks through the toolbar from left to right.
  await page.locator('#toolbarViewer button:visible').first().focus();
  const visited: Array<{ id: string; x: number; y: number }> = [];
  for (let i = 0; i < 40; i++) {
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const r = el.getBoundingClientRect();
      return { id: el.id, x: r.left, y: r.top, inToolbar: !!el.closest('#toolbarViewer') };
    });
    if (!info.inToolbar) break;
    visited.push(info);
    await page.keyboard.press('Tab');
  }
  expect(visited.length, `visited: ${visited.map((v) => v.id)}`).toBeGreaterThan(10);
  const backwards = visited.filter((v, i) => i > 0 && Math.abs(v.y - visited[i - 1].y) < 15 && v.x < visited[i - 1].x - 5);
  expect(backwards.map((v) => v.id), 'Tab jumps back to the left within a row').toEqual([]);
});

test('dialogs: focus moves in, Escape closes, focus returns to the button', async ({ page }) => {
  await open(page);
  const button = page.locator(`#${BUTTONS.properties.toolbar}`);
  await button.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('#documentPropertiesDialog');
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('#documentPropertiesDialog'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect.poll(() => focused(page)).toBe(BUTTONS.properties.toolbar);
});

test('the Tools menu: Escape closes it and focus returns to its button', async ({ page }) => {
  await open(page);
  const toggle = page.locator('#secondaryToolbarToggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#secondaryToolbar')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#secondaryToolbar')).toBeHidden();
  await expect.poll(() => focused(page)).toBe('secondaryToolbarToggle');
});

test('the find bar: Ctrl+F puts the cursor into the search field, Escape gives the focus back to the document', async ({ page }) => {
  await open(page);
  await page.locator('#viewerContainer').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('ControlOrMeta+f');
  await expect.poll(() => focused(page)).toBe('findInput');
  await page.keyboard.press('Escape');
  await expect(page.locator('#findbar')).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.activeElement !== document.body && !!document.activeElement?.closest('ngx-extended-pdf-viewer'))).toBe(true);
});

test('[startTabindex]: the controls get consecutive tab indexes in reading order', async ({ page }) => {
  await open(page, '&startTabindex=100');
  const controls = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('#toolbarViewer button, #toolbarViewer input, #toolbarViewer select'))
      .filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => ({ id: e.id, tabIndex: e.tabIndex, x: e.getBoundingClientRect().left, y: e.getBoundingClientRect().top })),
  );
  expect(controls.length).toBeGreaterThan(10);
  expect(Math.min(...controls.map((c) => c.tabIndex))).toBeGreaterThanOrEqual(100);
  const byIndex = [...controls].sort((a, b) => a.tabIndex - b.tabIndex);
  const backwards = byIndex.filter((c, i) => i > 0 && Math.abs(c.y - byIndex[i - 1].y) < 15 && c.x < byIndex[i - 1].x - 5);
  expect(
    backwards.map((c) => c.id),
    `tab order jumps back to the left within a row:\n${byIndex.map((c) => `${c.tabIndex} ${c.id} @${Math.round(c.x)},${Math.round(c.y)}`).join('\n')}`,
  ).toEqual([]);

  // Without the input, the browser's natural order applies: no tab indexes are set.
  await open(page);
  const assigned = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('#toolbarViewer button')).filter((e) => e.tabIndex > 0).length,
  );
  expect(assigned).toBe(0);
});

test('pages are landmarks a screen reader can jump to, with their page number', async ({ page }) => {
  await open(page);
  const first = page.locator('.page[data-page-number="1"]');
  await expect(first).toHaveAttribute('role', 'region');
  await expect(first).toHaveAccessibleName(/1/);
  await expect(page.locator('.page[data-page-number="2"]')).toHaveAccessibleName(/2/);
});
