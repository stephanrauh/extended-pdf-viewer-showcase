import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T26 — canvas/text-layer pixel comparison.
 *
 * Companion to T11. T11 samples per-span: for each text-layer <span>, does
 * the canvas underneath contain ink? This spec asks the inverse, screenshot-
 * level question: if we force the text layer to render opaque red, does it
 * actually cover the dark glyphs the canvas painted?
 *
 * Procedure per scenario:
 *   1. Render the target page; screenshot it; count dark pixels (canvas ink).
 *   2. Inject CSS that paints every text-layer span red, opaque.
 *   3. Screenshot the same region; count dark pixels again, and red pixels.
 *   4. Assert dark dropped substantially and red rose to a comparable amount.
 *
 * What we get:
 *   - Coarse alignment check across zoom and rotation in one assertion.
 *   - Catches "text layer is there but mis-scaled / mis-positioned" — the
 *     red would land on whitespace instead of covering the dark glyphs.
 *   - Catches font-substitution regressions: if pdf.js falls back to a
 *     visibly different font, red glyphs no longer overlap canvas glyphs.
 *
 * Thresholds are loose because alignment is intentionally approximate.
 * Tune downward as the suite ages and we trust the signal more.
 */
test.describe.configure({ mode: 'parallel' });

type Variation = {
  label: string;
  // Applied between baseline render and the "before" measurement, so both
  // the before and after screenshots see the same transform.
  apply: (viewer: PdfViewerPage) => Promise<void>;
};

const VARIATIONS: Variation[] = [
  { label: 'zoom 100% / rotation 0', apply: async (v) => v.setZoom('1') },
  { label: 'zoom 50%',               apply: async (v) => v.setZoom('0.5') },
  { label: 'zoom 200%',              apply: async (v) => v.setZoom('2') },
  {
    label: 'rotation 90°',
    apply: async (v) => {
      await v.setZoom('1');
      await v.rotateClockwise();
    },
  },
];

// Only routes whose PDF has a tightly-aligned text layer belong here — the
// pixel comparison is a coarse alignment check, and a PDF with naturally
// drifty positioning (e.g. the James Boyle book on /two-way-binding and
// /find) makes the test flake without flagging a real regression. T11's
// per-span coverage check covers those routes with span-sized padding.
const SCENARIOS: Array<{ route: string; page: number }> = [
  { route: '/extended-pdf-viewer/textlayer', page: 9 },
];

test.describe('T26 — opaque-red text layer covers canvas ink', () => {
  for (const { route, page: targetPage } of SCENARIOS) {
    for (const variation of VARIATIONS) {
      test(`${route} page ${targetPage} — ${variation.label}`, async ({
        page,
      }) => {
        const viewer = new PdfViewerPage(page);
        await viewer.goto(route);
        await viewer.waitForFirstPageRender();
        await viewer.gotoPage(targetPage);
        await viewer.waitForPageRender(targetPage);

        await variation.apply(viewer);
        // Zoom and rotation re-render the canvas; wait for fresh ink before
        // measuring. Re-fetch the target page since rotation can also shift
        // which page sits at the scroll position.
        await viewer.waitForPageRender(targetPage);
        await viewer.assertCanvasHasContent(targetPage);

        const before = await viewer.countPagePixels(targetPage);

        await viewer.setTextLayerOpaqueRed(true);
        try {
          const after = await viewer.countPagePixels(targetPage);

          // eslint-disable-next-line no-console
          console.log(
            `[T26] ${route} p${targetPage} ${variation.label} ->`,
            { before, after },
          );

          expect(
            before.dark,
            'baseline has too little dark ink to be measurable',
          ).toBeGreaterThan(1000);

          // Red overlay should cover most of the canvas glyphs. 0.7 leaves
          // headroom for text-layer fonts that don't perfectly match the
          // rasterised glyphs.
          const darkRatio = after.dark / before.dark;
          expect(
            darkRatio,
            `dark pixels barely dropped (${after.dark}/${before.dark} = ${darkRatio.toFixed(2)})`,
          ).toBeLessThan(0.7);

          // Red pixels should appear in roughly the same volume as the dark
          // ink they replaced. 0.3 absorbs spans that don't perfectly cover
          // their glyph (different font width, kerning, sub-pixel drift).
          expect(
            after.red,
            'too few red pixels — text layer may be missing, hidden, or wildly mis-positioned',
          ).toBeGreaterThan(before.dark * 0.3);
        } finally {
          await viewer.setTextLayerOpaqueRed(false);
        }
      });
    }
  }
});
