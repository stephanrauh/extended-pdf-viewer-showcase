import { existsSync, readdirSync } from 'node:fs';
import * as path from 'node:path';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T37 — every browser gets a bundle it can run (stephanrauh/ngx-extended-pdf-viewer#3273).
 *
 * The library decides at runtime between the modern pdf.js bundle and the
 * legacy `-es5` one. This spec lets that decision happen undisturbed and checks
 * the outcome in the browser it runs in:
 *
 *   - the viewer bundle is the one browser-matrix.ts expects for this browser,
 *   - the worker matches the viewer (#3273: the ES5 viewer loaded the modern
 *     worker, which old browsers can't run),
 *   - the first page has a real height (#3273: without CSS round() the page
 *     collapsed to zero height and stayed blank, without any error),
 *   - and its canvas has content.
 *
 * The old-browser projects in playwright.config.ts set `expectedBundle`; in the
 * regular `chromium` project (current Chromium) the expectation is "modern".
 */

const SIMPLE = '/extended-pdf-viewer/simple';
const ENGINE_FOLDER = usingBleedingEdge ? 'bleeding-edge' : 'assets';
const ENGINE_DIR = path.resolve(__dirname, '../../node_modules/ngx-extended-pdf-viewer', ENGINE_FOLDER);
const hasEs5 = existsSync(ENGINE_DIR) && readdirSync(ENGINE_DIR).some((f) => /^viewer-.*-es5\.mjs$/.test(f));

function fileName(url: string): string {
  return url.split('?')[0].split('/').pop() ?? url;
}

test.describe(`T37 — browser compatibility (${ENGINE_FOLDER})`, () => {
  test('loads the bundle this browser can run, and renders page 1', async ({ page }, testInfo) => {
    const expectedBundle = (testInfo.project.metadata.expectedBundle as 'modern' | 'es5' | undefined) ?? 'modern';
    test.skip(
      expectedBundle === 'es5' && !hasEs5,
      `no viewer-*-es5.mjs in ${ENGINE_DIR} - run a full engine build (build:base without --quick)`,
    );

    // Let the library's browser probe decide: no forced ES5 switch.
    await page.addInitScript(() => {
      localStorage.setItem('ngx-extended-pdf-viewer.simple.ES5', 'false');
    });
    const served: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes(`/${ENGINE_FOLDER}/`) && /\.mjs(\?|$)/.test(url)) {
        served.push(fileName(url));
      }
    });

    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIMPLE);
    await viewer.waitForViewerMounted();

    // The probe's verdict, for the failure message: it is the first thing to
    // look at when the wrong bundle loads.
    const probe = await page.evaluate(() => (window as any).ngxExtendedPdfViewerCanRunModernJSCode);
    const context = `${testInfo.project.name}: probe said canRunModernJSCode=${probe}; served ${served.join(', ')}`;

    // The page box must not collapse. This is checked before the canvas,
    // because a collapsed page never renders, and a canvas timeout would hide why.
    const firstPage = page.locator('ngx-extended-pdf-viewer .page').first();
    await expect
      .poll(async () => (await firstPage.boundingBox())?.height ?? 0, {
        message: `the first page has no height - did the viewer crash, or is CSS round() unsupported? (${context})`,
      })
      .toBeGreaterThan(100);

    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();

    const es5 = /-es5\.mjs$/;
    const viewerBundles = served.filter((n) => n.startsWith('viewer-'));
    const workerBundles = served.filter((n) => n.startsWith('pdf.worker-'));
    expect(viewerBundles, `exactly one viewer bundle (${context})`).toHaveLength(1);
    expect(workerBundles, `exactly one worker bundle (${context})`).toHaveLength(1);
    expect(es5.test(viewerBundles[0]) ? 'es5' : 'modern', `viewer bundle (${context})`).toBe(expectedBundle);
    expect(es5.test(workerBundles[0]) ? 'es5' : 'modern', `worker bundle (${context})`).toBe(expectedBundle);
  });
});
