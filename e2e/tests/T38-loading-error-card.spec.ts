import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T38 — stephanrauh/ngx-extended-pdf-viewer#3241 the error card shown when a
 * PDF fails to load. It is opt-in ([showLoadingErrorMessage]); the
 * /loading-errors demo switches it on and opens a missing file by default.
 */

const ROUTE = '/extended-pdf-viewer/loading-errors';

test.describe.configure({ mode: 'parallel' });

async function openRoute(page: import('@playwright/test').Page): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(ROUTE);
  await viewer.waitForViewerMounted();
  return viewer;
}

test.describe('T38 — loading error card', () => {
  test('a missing file shows the card, and (pdfLoadingFailed) fires', async ({ page }) => {
    await openRoute(page);

    const card = page.locator('ngx-extended-pdf-viewer #errorWrapper');
    await expect(card).toBeVisible({ timeout: 15_000 });
    await expect(card.locator('#errorMessage')).not.toBeEmpty();
    await expect(page.locator('.loading-error-event')).toBeVisible();
  });

  test('"More information" reveals the details, and "Close" dismisses the card', async ({ page }) => {
    await openRoute(page);

    const card = page.locator('ngx-extended-pdf-viewer #errorWrapper');
    await expect(card).toBeVisible({ timeout: 15_000 });

    const details = card.locator('#errorMoreInfo');
    await expect(details).toBeHidden();
    await card.locator('#errorShowMore').click();
    await expect(details).toBeVisible();
    await expect(details).not.toHaveValue('');

    await card.locator('#errorClose').click();
    await expect(card).toBeHidden();
  });

  test('[loadingErrorMessage] replaces the headline', async ({ page }) => {
    await openRoute(page);

    const card = page.locator('ngx-extended-pdf-viewer #errorWrapper');
    await expect(card).toBeVisible({ timeout: 15_000 });

    await page.getByPlaceholder("e.g. Sorry, we couldn't open this document.").fill('Custom headline');
    await expect(card.locator('#errorMessage')).toHaveText('Custom headline');
  });

  test('the card stays hidden without [showLoadingErrorMessage]', async ({ page }) => {
    await openRoute(page);

    // The demo opts in by default; the event line proves the load has failed
    // before we check that unchecking the box hides the card.
    await expect(page.locator('.loading-error-event')).toBeVisible({ timeout: 15_000 });
    await page.getByLabel('showLoadingErrorMessage').uncheck();
    await expect(page.locator('ngx-extended-pdf-viewer #errorWrapper')).toBeHidden();
  });

  test('opening a working file hides the card again', async ({ page }) => {
    const viewer = await openRoute(page);

    const card = page.locator('ngx-extended-pdf-viewer #errorWrapper');
    await expect(card).toBeVisible({ timeout: 15_000 });

    await page.locator('select').filter({ hasText: 'a working PDF file' }).selectOption({ label: 'a working PDF file' });
    await viewer.waitForFirstPageRender();
    await expect(card).toBeHidden();
  });
});
