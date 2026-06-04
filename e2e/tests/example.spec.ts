import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe('example — /extended-pdf-viewer/simple', () => {
  test('mounts the viewer and renders its landing page', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/simple');
    await viewer.waitForFirstPageRender();

    // /simple sets `public page = 5` in simple.component.ts and binds it
    // via `[(page)]="page"`, so page 5 is the landing page. Assert that
    // exact page rather than reading #pageNumber — on this large (421-page)
    // PDF the toolbar input can take longer than 15s to settle, while the
    // canvas paints in ~2s.
    await viewer.waitForPageRender(5);
    await viewer.assertCanvasHasContent(5);

    const pageCount = await viewer.getPageCount();
    expect(pageCount).toBeGreaterThan(0);
  });
});
