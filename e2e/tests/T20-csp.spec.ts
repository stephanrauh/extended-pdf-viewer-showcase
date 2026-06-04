import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// The showcase's `src/index.html` ships a strict
// `<meta http-equiv="Content-Security-Policy">` and `main.ts` registers
// a Trusted Types default policy. Every route in the app runs under
// that CSP; the /csp/* demos are documentation showing how to enable
// it in your own app. These tests assert that:
//
//   1. The CSP meta tag is present with the expected directive shape.
//   2. No `securitypolicyviolation` events fire while the viewer
//      loads and paints its first page on any of the three /csp tabs.
//   3. The /csp/webassembly tab actually fetches a `.wasm` module
//      (default `useWasm=true`).

const CSP_ROUTES = [
  '/extended-pdf-viewer/csp/activating-csp',
  '/extended-pdf-viewer/csp/inline-scripts',
  '/extended-pdf-viewer/csp/webassembly',
];

// Attach a CSP-violation collector before any app code runs. The
// browser only fires `securitypolicyviolation` for actual blocks, so
// reading this array after the page settles tells us whether anything
// the viewer/demo tried got blocked.
async function attachCspViolationListener(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __cspViolations: unknown[] }).__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e: Event) => {
      const ev = e as SecurityPolicyViolationEvent;
      (window as unknown as { __cspViolations: unknown[] }).__cspViolations.push({
        directive: ev.violatedDirective,
        blocked: ev.blockedURI,
        source: ev.sourceFile,
        sample: ev.sample,
        line: ev.lineNumber,
      });
    });
  });
}

async function readCspViolations(
  page: import('@playwright/test').Page,
): Promise<unknown[]> {
  return await page.evaluate(
    () =>
      (window as unknown as { __cspViolations: unknown[] }).__cspViolations,
  );
}

test.describe('T20 — /csp routes load under strict CSP without violations', () => {
  for (const path of CSP_ROUTES) {
    test(`${path} renders without triggering securitypolicyviolation`, async ({
      page,
    }) => {
      await attachCspViolationListener(page);

      const viewer = new PdfViewerPage(page);
      await viewer.goto(path);
      await viewer.waitForFirstPageRender();

      // Sanity check: the CSP meta tag is actually present and has
      // the strict directives we expect to be testing against.
      const cspMeta = await page
        .locator('meta[http-equiv="Content-Security-Policy"]')
        .getAttribute('content');
      expect(cspMeta, 'CSP meta tag missing').toBeTruthy();
      expect(cspMeta).toContain("script-src 'self'");
      expect(cspMeta).toContain("default-src 'self'");
      expect(cspMeta).toContain("require-trusted-types-for 'script'");

      // The demo loads a warmup PDF then switches to the real one;
      // give that chain a beat to finish before snapshotting
      // violations.
      await page.waitForTimeout(500);

      const violations = await readCspViolations(page);
      expect(
        violations,
        `CSP violations fired on ${path}: ${JSON.stringify(violations, null, 2)}`,
      ).toEqual([]);
    });
  }
});

test.describe('T20 — /csp/webassembly loads a real .wasm module', () => {
  const WEBASSEMBLY = '/extended-pdf-viewer/csp/webassembly';

  test('default useWasm=true triggers a .wasm network request', async ({
    page,
  }) => {
    const wasmRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.endsWith('.wasm')) {
        wasmRequests.push(url);
      }
    });

    const viewer = new PdfViewerPage(page);
    await viewer.goto(WEBASSEMBLY);
    await viewer.waitForFirstPageRender();

    // jbig2-demo.pdf is JBIG2-encoded; pdf.js fetches openjpeg.wasm
    // / jbig2.wasm to decode it. Give the worker time to issue the
    // request after first-page render.
    await expect
      .poll(async () => wasmRequests.length, { timeout: 15_000 })
      .toBeGreaterThan(0);
  });
});
