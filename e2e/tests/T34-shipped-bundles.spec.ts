import { existsSync, readdirSync } from 'node:fs';
import * as path from 'node:path';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T34 — the bundles that actually ship.
 *
 * Every other spec runs the unminified `viewer-<v>.mjs` (the fixture forces
 * `minifiedJSLibraries=false`, and a quick engine build produces nothing
 * else). Consumers, however, load `viewer-<v>.min.mjs` by default and
 * `viewer-<v>-es5.mjs` on old browsers. A minifier that mangles a name pdf.js
 * relies on, or a legacy transpile that drops a syntax feature, is invisible
 * to the rest of the suite. These tests load each shipped variant on /simple
 * and check that it renders and that the network actually served that file.
 *
 * The minified / ES5 files only exist after a FULL engine build
 * (`build:base` without `--quick`, i.e. what the release runs). On a quick
 * local build the whole file skips with a message rather than failing.
 */

const SIMPLE = '/extended-pdf-viewer/simple';
const ENGINE_FOLDER = usingBleedingEdge ? 'bleeding-edge' : 'assets';

// e2e/ → showcase root → the library copy that `prebuild`/`build:lib`
// installed into node_modules (this is what `ng serve` actually serves).
const ENGINE_DIR = path.resolve(
  __dirname,
  '../../node_modules/ngx-extended-pdf-viewer',
  ENGINE_FOLDER,
);

function shippedFiles(): string[] {
  return existsSync(ENGINE_DIR) ? readdirSync(ENGINE_DIR) : [];
}

const hasMinified = shippedFiles().some((f) => /^viewer-.*\.min\.mjs$/.test(f));
const hasEs5 = shippedFiles().some((f) => /^viewer-.*-es5\.mjs$/.test(f));

// Tests share the same 4200 dev server; parallel is fine, each test is its
// own browser context with its own localStorage.
test.describe.configure({ mode: 'parallel' });

/**
 * Records every response for the engine folder, so the test can assert which
 * bundle variant the viewer actually pulled - not merely that "something"
 * rendered.
 */
function recordEngineRequests(page: import('@playwright/test').Page) {
  const served: Array<{ url: string; status: number }> = [];
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes(`/${ENGINE_FOLDER}/`) && /\.mjs(\?|$)/.test(url)) {
      served.push({ url, status: res.status() });
    }
  });
  return served;
}

function fileName(url: string): string {
  return url.split('?')[0].split('/').pop() ?? url;
}

test.describe(`T34 — shipped bundles (${ENGINE_FOLDER})`, () => {
  test('the minified viewer + worker load and render page 1', async ({ page }) => {
    test.skip(
      !hasMinified,
      `no viewer-*.min.mjs in ${ENGINE_DIR} - run a full engine build (build:base without --quick)`,
    );

    // Runs after the fixture's init script, so this value wins.
    await page.addInitScript(() => {
      localStorage.setItem('ngx-extended-pdf-viewer.simple.minifiedJSLibraries', 'true');
      localStorage.setItem('ngx-extended-pdf-viewer.simple.ES5', 'false');
    });
    const served = recordEngineRequests(page);

    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIMPLE);
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);

    const names = served.map((s) => fileName(s.url));
    expect(names, 'minified viewer bundle was requested').toContainEqual(
      expect.stringMatching(/^viewer-.*\.min\.mjs$/),
    );
    expect(names, 'minified worker bundle was requested').toContainEqual(
      expect.stringMatching(/^pdf\.worker-.*\.min\.mjs$/),
    );
    // The point of the test: the unminified viewer must NOT have been the one
    // doing the work.
    expect(names.filter((n) => /^viewer-[\d.]+\.mjs$/.test(n))).toEqual([]);
    for (const s of served) {
      expect(s.status, `${fileName(s.url)} served with HTTP ${s.status}`).toBeLessThan(400);
    }
  });

  test('the legacy ES5 viewer + worker load and render page 1', async ({ page }) => {
    test.skip(
      !hasEs5,
      `no viewer-*-es5.mjs in ${ENGINE_DIR} - run a full engine build (build:base without --quick)`,
    );

    // /simple only honours the ES5 switch when minified is off (there is no
    // minified ES5 build).
    await page.addInitScript(() => {
      localStorage.setItem('ngx-extended-pdf-viewer.simple.minifiedJSLibraries', 'false');
      localStorage.setItem('ngx-extended-pdf-viewer.simple.ES5', 'true');
    });
    const served = recordEngineRequests(page);

    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIMPLE);
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);

    const names = served.map((s) => fileName(s.url));
    expect(names, 'ES5 viewer bundle was requested').toContainEqual(
      expect.stringMatching(/^viewer-.*-es5\.mjs$/),
    );
    expect(names, 'ES5 worker bundle was requested').toContainEqual(
      expect.stringMatching(/^pdf\.worker-.*-es5\.mjs$/),
    );
    expect(names.filter((n) => /^viewer-[\d.]+\.mjs$/.test(n))).toEqual([]);
    for (const s of served) {
      expect(s.status, `${fileName(s.url)} served with HTTP ${s.status}`).toBeLessThan(400);
    }
  });
});
