import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /touch-gestures advertises a double-tap / double-click gesture that
// zooms to `pdfDefaultOptions.doubleTapZoomFactor` (the demo sets it
// to '125%'). On a second double-tap, the demo also enables
// `doubleTapResetsZoomOnSecondDoubleTap = true`, so zoom returns to
// the previously stored value.
//
// The handler `zoomToPageWidth` is bound to `(dblclick)` on the
// `#viewer` div. In practice on this demo the gesture fires even
// without explicitly enabling hand tool, so the test exercises the
// behaviour end-to-end without toggling cursor modes.

const TOUCH = '/extended-pdf-viewer/touch-gestures';

test.describe('T22 — /touch-gestures double-click zoom cycle', () => {
  test('double-click zooms to 125% and a second double-click restores the previous zoom', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(TOUCH);
    await viewer.waitForFirstPageRender();

    const initialZoom = await viewer.getZoomValue();

    // Double-click a rendered page canvas; the dblclick bubbles to
    // #viewer where `(dblclick)="zoomToPageWidth($event)"` is bound,
    // which sets `zoom` to doubleTapZoomFactor='125%'. The demo's
    // zoomLevels list includes 1.25, so the <select> snaps to "1.25".
    await page.locator('#viewer .page canvas').first().dblclick();

    await expect
      .poll(async () => await viewer.getZoomValue(), { timeout: 10_000 })
      .toBe('1.25');

    // Second double-click: doubleTapResetsZoomOnSecondDoubleTap=true
    // restores the previously stored zoom value.
    await page.locator('#viewer .page canvas').first().dblclick();
    await expect
      .poll(async () => await viewer.getZoomValue(), { timeout: 10_000 })
      .toBe(initialZoom);
  });
});
