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
  // The editor buttons are a radio group: exactly one of them (or none) is checked.
  const ink = page.locator(`#${BUTTONS.ink.toolbar}`);
  const freeText = page.locator(`#${BUTTONS.freeText.toolbar}`);
  await expect(ink).toHaveAttribute('role', 'radio');
  await expect(ink).toHaveAttribute('aria-checked', 'false');
  await ink.click();
  await expect(ink).toHaveAttribute('aria-checked', 'true');
  await expect(freeText).toHaveAttribute('aria-checked', 'false');
  await freeText.click();
  await expect(freeText).toHaveAttribute('aria-checked', 'true');
  await expect(ink).toHaveAttribute('aria-checked', 'false');
});

test('the active entries of the Tools menu are announced as pressed', async ({ page }) => {
  await open(page, '', 'always-in-secondary-menu');
  await page.locator('#secondaryToolbarToggle').click();
  await expect(page.locator(`#${BUTTONS.scrollVertical.menu}`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`#${BUTTONS.scrollHorizontal.menu}`)).not.toHaveAttribute('aria-pressed', /./);
  await page.locator(`#${BUTTONS.scrollHorizontal.menu}`).click();
  if (!(await page.locator('#secondaryToolbar').isVisible())) await page.locator('#secondaryToolbarToggle').click();
  await expect(page.locator(`#${BUTTONS.scrollHorizontal.menu}`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`#${BUTTONS.scrollVertical.menu}`)).not.toHaveAttribute('aria-pressed', /./);
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
