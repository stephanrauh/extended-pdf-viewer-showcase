import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T49 — colors: forced page colors (the high-contrast mode pdf.js offers for
 * readers with low vision) and the viewer's [backgroundColor].
 */

test.describe.configure({ mode: 'parallel' });

const TEXT = '/assets/pdfs/blind-text-collection.pdf';

/** The share of page-1 canvas pixels close to each of the given colors. */
async function colorShares(page: Page, colors: Record<string, [number, number, number]>): Promise<Record<string, number>> {
  return await page.evaluate((wanted) => {
    const canvas = document.querySelector<HTMLCanvasElement>('.page[data-page-number="1"] canvas')!;
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    const counts: Record<string, number> = Object.fromEntries(Object.keys(wanted).map((k) => [k, 0]));
    for (let i = 0; i < data.length; i += 16) {
      for (const [name, [r, g, b]] of Object.entries(wanted)) {
        if (Math.abs(data[i] - r) + Math.abs(data[i + 1] - g) + Math.abs(data[i + 2] - b) < 60) counts[name]++;
      }
    }
    const total = data.length / 16;
    return Object.fromEntries(Object.entries(counts).map(([k, n]) => [k, n / total]));
  }, colors);
}

test('forced page colors: the page is painted in the given background and text colors', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${TEXT}&opt.forcePageColors=true&opt.pageColorsBackground=%23000080&opt.pageColorsForeground=%23ffff00`);
  await viewer.waitForPageRender(1);
  await viewer.assertCanvasHasContent(1);
  await expect
    .poll(async () => (await colorShares(page, { navy: [0, 0, 128], yellow: [255, 255, 0], white: [255, 255, 255] })).navy, { timeout: 15_000 })
    .toBeGreaterThan(0.5);
  const shares = await colorShares(page, { navy: [0, 0, 128], yellow: [255, 255, 0], white: [255, 255, 255] });
  expect(shares.yellow, 'the text is yellow').toBeGreaterThan(0.005);
  expect(shares.white, 'no white paper left').toBeLessThan(0.01);
});

test('without forced colors, the page keeps its own colors', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${TEXT}&opt.forcePageColors=false&opt.pageColorsBackground=%23000080&opt.pageColorsForeground=%23ffff00`);
  await viewer.waitForPageRender(1);
  await viewer.assertCanvasHasContent(1);
  const shares = await colorShares(page, { navy: [0, 0, 128], white: [255, 255, 255] });
  expect(shares.white).toBeGreaterThan(0.5);
  expect(shares.navy).toBeLessThan(0.01);
});

test('[backgroundColor] colors the area around the pages', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${TEXT}&backgroundColor=rgb(10, 120, 30)`);
  await viewer.waitForFirstPageRender();
  await expect(page.locator('#viewerContainer')).toHaveCSS('background-color', 'rgb(10, 120, 30)');
  await page.evaluate(() => (window as any).__setInput('backgroundColor', 'rgb(200, 10, 10)'));
  await expect(page.locator('#viewerContainer')).toHaveCSS('background-color', 'rgb(200, 10, 10)');
});
