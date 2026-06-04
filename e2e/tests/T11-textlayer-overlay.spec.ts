import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * Phase 7 — approximate text-layer / canvas overlay verification.
 *
 * The text layer uses a different font than the rasterised canvas, and
 * individual glyphs may sit several pixels — occasionally a half-character —
 * away from their canvas counterparts. We expand each text-div's sample
 * region by `paddingRatio` × its size, then count divs that land on ink.
 *
 * Thresholds were picked after observing real measurements on these routes
 * in dev mode; if pdf.js's text-layer positioning regresses noticeably,
 * the coverage number will drop and the test will fail.
 */
test.describe.configure({ mode: 'parallel' });

test.describe('T11 — text layer overlays the rendered ink', () => {
  // Each scenario picks a route + a known-rich page so the measurement has
  // enough divs to assert against. Landing pages that are titles or blank
  // would yield divCount ≈ 1 even when the text layer is perfect.
  const scenarios: Array<{ route: string; page: number }> = [
    { route: '/extended-pdf-viewer/textlayer', page: 9 },
    { route: '/extended-pdf-viewer/two-way-binding', page: 5 },
    { route: '/extended-pdf-viewer/find', page: 10 },
  ];

  for (const { route, page: targetPage } of scenarios) {
    test(`${route} page ${targetPage}: most text-layer divs land on canvas ink`, async ({
      page,
    }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(route);
      await viewer.waitForFirstPageRender();
      await viewer.gotoPage(targetPage);
      await viewer.waitForPageRender(targetPage);
      await viewer.assertCanvasHasContent(targetPage);

      const m = await viewer.measureTextLayerCoverage(targetPage);
      // eslint-disable-next-line no-console
      console.log(`[T11] ${route} page ${targetPage} ->`, m);

      expect(m.divCount, 'too few text-layer spans to measure').toBeGreaterThan(
        10,
      );
      // Most divs should overlap ink. 0.6 absorbs blank-margin spans, end-of
      // -line whitespace, and pdf.js's natural sub-pixel drift.
      expect(m.coverage).toBeGreaterThan(0.6);
      // Average density floor catches "all divs overlap ink technically but
      // they're really mostly whitespace" — i.e., scaled-wrong layouts.
      expect(m.meanInkDensity).toBeGreaterThan(0.02);
    });
  }
});
