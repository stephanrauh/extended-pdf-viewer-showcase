import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { T1_ROUTES } from '../routes';

test.describe.configure({ mode: 'parallel' });

test.describe('T1 smoke — every route mounts', () => {
  for (const route of T1_ROUTES) {
    test(`${route.label} — ${route.path}`, async ({ page, pageErrors }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      // App shell rendered (not a blank/redirect-only response).
      await expect(page.locator('app-root')).toBeAttached();

      // Some child content rendered inside <app-root> — guards against an
      // empty error component.
      await expect(page.locator('app-root *').first()).toBeAttached({
        timeout: 15_000,
      });

      if (route.hasViewer) {
        const viewer = new PdfViewerPage(page);
        await viewer.waitForViewerMounted();
      }

      // Fail loudly on real JS exceptions; console errors are still captured
      // via the fixture and surfaced in the report regardless.
      expect(pageErrors, 'unhandled page errors during route load').toEqual([]);
    });
  }
});
