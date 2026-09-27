import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T35 — the four pdf.js sidebar views, driven through the sidebar itself.
 *
 * T4 only toggles the sidebar open; T12 covers the *custom* thumbnails demo.
 * Nothing exercised the stock views: thumbnails that navigate, outline links
 * that navigate, the attachments list, the layers tree. All four are pdf.js
 * code that the Angular wrapper re-hosts in its own sidebar component, so a
 * wiring regression there (wrong container id, missing eventBus hookup) is
 * exactly the kind of thing only a browser test sees.
 *
 * /two-way-binding is the route: its sidebar is open by default, its PDF has
 * an outline, and it has "Load PDF with attachments/layers" buttons that
 * appear once the "Active Sidebar View" input is 3 or 4.
 */

const ROUTE = '/extended-pdf-viewer/two-way-binding';

test.describe.configure({ mode: 'parallel' });

async function openRoute(page: import('@playwright/test').Page): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(ROUTE);
  await viewer.waitForFirstPageRender();
  await expect.poll(async () => await viewer.isSidebarOpen()).toBe(true);
  return viewer;
}

/** Sets the demo's "Active Sidebar View" number input (1..4, two-way bound). */
async function selectSidebarView(page: import('@playwright/test').Page, view: 1 | 2 | 3 | 4) {
  const input = page.locator('#sidebar-input');
  await input.fill(String(view));
  await input.blur();
}

test.describe('T35 — sidebar views', () => {
  test('clicking a thumbnail scrolls the viewer to that page', async ({ page }) => {
    const viewer = await openRoute(page);

    const thumbnails = page.locator('#thumbnailsView .thumbnail');
    await expect.poll(async () => await thumbnails.count(), { timeout: 15_000 }).toBeGreaterThan(3);

    // The demo opens on page 5 (its [(page)] binding), so aim at a page that
    // is not the current one - otherwise a dead click would look like success.
    const before = await viewer.getCurrentPageFromViewport();
    const target = before === 2 ? 3 : 2;
    await thumbnails.nth(target - 1).click();

    await viewer.expectViewportOnPage(target);
    await viewer.waitForPageRender(target);
    await viewer.assertCanvasHasContent(target);
  });

  test('the outline view lists entries and clicking one navigates', async ({ page }) => {
    const viewer = await openRoute(page);

    await page.locator('#viewOutline').click();
    await expect(page.locator('#outlinesView')).toBeVisible();

    const links = page.locator('#outlinesView .treeItem > a');
    await expect.poll(async () => await links.count(), { timeout: 15_000 }).toBeGreaterThan(1);

    const before = await viewer.getCurrentPageFromViewport();
    // Prefer a link that clearly targets a later page: the last top-level
    // entry. If the outline were mis-wired to no-op, the viewport would stay.
    await links.last().click();

    await expect
      .poll(async () => await viewer.getCurrentPageFromViewport(), { timeout: 15_000 })
      .toBeGreaterThan(before);
  });

  test('the attachments view lists the embedded files of a PDF with attachments', async ({ page }) => {
    const viewer = await openRoute(page);

    await selectSidebarView(page, 3);
    await page.getByRole('button', { name: 'Load PDF with attachments' }).click();
    await viewer.waitForFirstPageRender();
    await page.locator('#viewAttachments').click();
    await expect(page.locator('#attachmentsView')).toBeVisible();

    const entries = page.locator('#attachmentsView a');
    await expect.poll(async () => await entries.count(), { timeout: 15_000 }).toBeGreaterThan(0);
    // Entries carry the embedded file's name; an empty label means the
    // attachment viewer rendered before the data arrived.
    expect((await entries.first().textContent())?.trim().length).toBeGreaterThan(0);
  });

  test('the layers view lists optional content and toggling one re-renders the page', async ({ page }) => {
    const viewer = await openRoute(page);

    await selectSidebarView(page, 4);
    await page.getByRole('button', { name: 'Load PDF with layers' }).click();
    await viewer.waitForFirstPageRender();
    await page.locator('#viewLayers').click();
    await expect(page.locator('#layersView')).toBeVisible();

    const toggles = page.locator('#layersView input[type="checkbox"]');
    await expect.poll(async () => await toggles.count(), { timeout: 15_000 }).toBeGreaterThan(0);

    const visiblePage = await viewer.waitForCurrentPage();
    await viewer.assertCanvasHasContent(visiblePage);
    const beforeHash = await viewer.hashCanvas(visiblePage);

    await toggles.first().click();

    // A checkbox that doesn't reach pdf.js's optional-content config would
    // leave the pixels untouched.
    await expect
      .poll(async () => await viewer.hashCanvas(visiblePage), { timeout: 15_000 })
      .not.toBe(beforeHash);
  });
});
