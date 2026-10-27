import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { expectThemeDirection } from '../poms/theme-audit';

/**
 * T57 — theme="auto" follows the operating system's color scheme, and switches
 * live when the user changes it, without reloading the viewer.
 *
 * Three things must agree with the OS: the theme stylesheet (checked through
 * the toolbar background), the `data-viewer-theme` attribute that switches the
 * dark rules of dialogs, message bars and editor toolbars (#3304), and the
 * host's `color-scheme`, which native controls and light-dark() read.
 *
 * The last test guards the host binding of `color-scheme`: it used to be set
 * once at initialization, so a later change of [theme] left it stale.
 */

test.describe.configure({ mode: 'parallel' });

const BOOK = '/assets/pdfs/Portugues-para-principiantes.pdf';
const VIEWER = 'ngx-extended-pdf-viewer';

async function open(page: Page, os: 'light' | 'dark', theme: string): Promise<void> {
  await page.emulateMedia({ colorScheme: os });
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${BOOK}&sidebarVisible=false&theme=${theme}`);
  await viewer.waitForFirstPageRender();
}

/** Polls until the viewer shows `expected` everywhere the theme is visible. */
async function expectViewerTheme(page: Page, expected: 'light' | 'dark', surface: string): Promise<void> {
  const host = page.locator(VIEWER);
  await expect(host, `${surface}: data-viewer-theme`).toHaveAttribute('data-viewer-theme', expected);
  await expect
    .poll(() => host.evaluate((el) => getComputedStyle(el).colorScheme), { message: `${surface}: color-scheme` })
    .toBe(expected);
  await expectThemeDirection(page, '#toolbarContainer', expected, surface);
}

for (const os of ['light', 'dark'] as const) {
  test(`theme="auto" with OS:${os} starts in the ${os} theme`, async ({ page }) => {
    await open(page, os, 'auto');
    await expectViewerTheme(page, os, `OS:${os}`);
  });
}

test('theme="auto" switches live when the OS color scheme changes', async ({ page }) => {
  await open(page, 'light', 'auto');
  await expectViewerTheme(page, 'light', 'before the switch');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expectViewerTheme(page, 'dark', 'after switching the OS to dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await expectViewerTheme(page, 'light', 'after switching the OS back to light');
});

test('a fixed theme ignores the OS, and color-scheme follows a change of [theme]', async ({ page }) => {
  await open(page, 'dark', 'light');
  await expectViewerTheme(page, 'light', 'theme="light" on a dark OS');

  await page.evaluate(() => (window as any).__setInput('theme', 'dark'));
  await expectViewerTheme(page, 'dark', 'after setting theme="dark"');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForTimeout(300);
  await expectViewerTheme(page, 'dark', 'theme="dark" after switching the OS to light');
});
