import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { T2_ROUTES } from '../routes';

test.describe.configure({ mode: 'parallel' });

test.describe('T2 render — viewer routes actually render a page', () => {
  for (const route of T2_ROUTES) {
    test(`${route.label} — ${route.path}`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(route.path);

      // The viewer paints lazily near the viewport. We don't require page 1
      // specifically because some demos open at a non-first page.
      await viewer.waitForFirstPageRender();
      await viewer.assertCanvasHasContent();
    });
  }
});
