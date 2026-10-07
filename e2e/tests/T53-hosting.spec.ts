import type { Page, Request } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T53 — hosting: the viewer's files (viewer, worker, CMaps, standard fonts,
 * translations, WASM decoders) in another folder, on another origin, and an
 * application that doesn't live at the root of its server (<base href>).
 *
 * No second server is needed: Playwright routes serve the same files under
 * other paths. Each test records every request for the viewer's files and
 * checks that they all went to the expected place and succeeded.
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';
/** pdf.js's own files: the bundles, the worker, CMaps, fonts, translations, WASM. */
const VIEWER_FILE = /\/(viewer|pdf\.worker|pdf\.sandbox)-[\d.]+.*\.mjs|\/(cmaps|standard_fonts|locale|wasm|iccs)\//;

type Seen = { url: string; status: number };

/** Records the requests for the viewer's files, and the ones that failed. */
function recordViewerFiles(page: Page): { seen: Seen[]; failed: string[] } {
  const seen: Seen[] = [];
  const failed: string[] = [];
  page.on('response', (r) => {
    if (VIEWER_FILE.test(new URL(r.url()).pathname)) seen.push({ url: r.url(), status: r.status() });
  });
  page.on('requestfailed', (r: Request) => failed.push(`${r.url()}: ${r.failure()?.errorText}`));
  return { seen, failed };
}

/** Serves the files of `from` (a path on the dev server) under `to`. */
async function mirror(page: Page, to: string, from: string): Promise<void> {
  await page.route(
    (u) => u.pathname.startsWith(to),
    async (route) => {
      const original = new URL(route.request().url());
      original.pathname = from + original.pathname.substring(to.length);
      const response = await route.fetch({ url: original.toString() });
      await route.fulfill({ response });
    },
  );
}

async function expectDocumentWorks(page: Page): Promise<void> {
  const viewer = new PdfViewerPage(page);
  await viewer.waitForFirstPageRender();
  await viewer.assertCanvasHasContent(1);
  await expect
    .poll(async () => (await page.locator('.page[data-page-number="1"] .textLayer').textContent())?.length ?? 0, { timeout: 15_000 })
    .toBeGreaterThan(20);
}

test('a custom assets folder: every viewer file comes from there', async ({ page }) => {
  await mirror(page, '/my-viewer/bleeding-edge/', '/bleeding-edge/');
  const { seen, failed } = recordViewerFiles(page);
  await new PdfViewerPage(page).goto(`/e2e/viewer?src=${DOC}&opt.assetsFolder=my-viewer/bleeding-edge&language=de`);
  await expectDocumentWorks(page);

  expect(seen.length).toBeGreaterThan(2);
  const elsewhere = seen.filter((s) => !new URL(s.url).pathname.startsWith('/my-viewer/bleeding-edge/'));
  expect(elsewhere, 'files loaded from somewhere else').toEqual([]);
  expect(seen.filter((s) => s.status >= 400)).toEqual([]);
  expect(failed).toEqual([]);
  // The German translation came from the custom folder, too.
  expect(seen.some((s) => s.url.includes('/locale/'))).toBe(true);
  await expect(page.locator('#primaryNext')).toHaveAttribute('title', /Seite/);
});

test.describe('T53 — a CDN', () => {
  // The showcase's Content Security Policy only allows scripts of its own origin - rightly so.
  // An application that loads the viewer from a CDN allows that origin; here, CSP is simply off.
  test.use({ bypassCSP: true });

  test('assets on another origin (a CDN): the worker starts and the document is shown', async ({ page, baseURL }) => {
    // A pretend CDN: it serves the dev server's files, with the CORS header a real CDN sends.
    const cdn = new URL('https://cdn.example.test');
    await page.route(
      (u) => u.origin === cdn.origin,
      async (route) => {
        const original = new URL(route.request().url());
        const response = await route.fetch({ url: new URL(original.pathname + original.search, baseURL).toString() });
        await route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': '*' } });
      },
    );
    const { seen, failed } = recordViewerFiles(page);
    await new PdfViewerPage(page).goto(`/e2e/viewer?src=${DOC}&opt.assetsFolder=${encodeURIComponent(`${cdn.origin}/bleeding-edge`)}`);
    await expectDocumentWorks(page);

    expect(
      seen.some((s) => s.url.startsWith(cdn.origin) && /pdf\.worker/.test(s.url)),
      'the worker came from the CDN',
    ).toBe(true);
    expect(seen.filter((s) => s.status >= 400)).toEqual([]);
    expect(failed).toEqual([]);
  });
});

test('an application under a sub path (<base href="/sub/">): the viewer finds its files', async ({ page }) => {
  // Serve the whole application under /sub/, the way a server does that hosts it in a sub folder.
  await page.route(
    (u) => u.pathname.startsWith('/sub/') || u.pathname === '/sub',
    async (route) => {
      const original = new URL(route.request().url());
      original.pathname = original.pathname.substring('/sub'.length) || '/';
      const isPage = route.request().resourceType() === 'document';
      if (isPage) original.pathname = '/';
      const response = await route.fetch({ url: original.toString() });
      if (isPage) {
        const html = (await response.text()).replace(/<base href="\/"\s*\/?>/, '<base href="/sub/" />');
        await route.fulfill({ response, body: html });
      } else {
        await route.fulfill({ response });
      }
    },
  );
  const { seen, failed } = recordViewerFiles(page);
  await page.goto(`/sub/e2e/viewer?src=assets/pdfs/Portugues-para-principiantes.pdf`, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => document.baseURI)).toContain('/sub/');
  await expectDocumentWorks(page);

  expect(seen.length).toBeGreaterThan(2);
  const outside = seen.filter((s) => !new URL(s.url).pathname.startsWith('/sub/'));
  expect(outside, 'viewer files requested outside the base href').toEqual([]);
  expect(seen.filter((s) => s.status >= 400)).toEqual([]);
  expect(failed).toEqual([]);
});
