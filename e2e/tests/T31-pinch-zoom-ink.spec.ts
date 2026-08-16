import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import type { CDPSession, Page } from '@playwright/test';

/**
 * T31 — stephanrauh/ngx-extended-pdf-viewer#3260
 *
 * "Ink editor stops accepting new strokes after pinch-zooming the page",
 * reported on iOS. Nothing in the code path is iOS-specific: the gesture is
 * plain touch events handled by pdf.js's `TouchManager`, so Chromium with
 * `hasTouch: true` plus CDP `Input.dispatchTouchEvent` reproduces it on the
 * desktop.
 *
 * Cases 0-5 cover the bug; a failure says *where* the breakage is:
 *   0. mouse strokes, no zoom               — control
 *   1. mouse strokes, toolbar zoom          — the re-render/reset path alone
 *   2. mouse strokes, pinch zoom            — pinch, but no touch drawing
 *   3. touch strokes, no zoom               — control for touch drawing
 *   4. touch strokes, pinch zoom            — the reported scenario
 *   5. touch strokes, staggered pinch zoom  — one finger lands before the other
 *
 * Cases 6-10 pin down the feature the fix must not break: #2512 "writing with
 * pen, scrolling with hand" (shipped in 21.3.6 via #2527). Only the pointer
 * type that turned the editor on may draw; every other pointer keeps its normal
 * job, so a hand can still scroll and pinch while the pen writes.
 *   6. pen strokes, no zoom                 — control for pen drawing
 *   7. pen editor, finger must not draw     — the core of #2512
 *   8. pen editor, finger scrolls           — the other half of #2512
 *   9. pen editor survives a finger pinch   — pen + hand, the real workflow
 *  10. pen highlighter, finger must not highlight
 *
 * Two behaviours the test has to model, both of which the bug report mentions:
 *   - Escape ends the ink session *and* leaves editing mode, and a pinch also
 *     drops out of editing mode, so the tool must be (re-)selected before every
 *     stroke.
 *   - a stroke is only accepted from the pointer type that owns the editor, so
 *     a touch stroke needs a touch-tapped toolbar button and a pen stroke needs
 *     a pen-tapped one.
 *
 * Chromium only: CDP touch/pen injection is not available in WebKit.
 */
test.describe.configure({ mode: 'parallel' });

const ROUTE = '/extended-pdf-viewer/export-annotations';

const inkButton = (page: Page) => page.locator('#primaryEditorInk');

async function openViewer(page: Page): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(ROUTE);
  await viewer.waitForFirstPageRender();
  await viewer.waitForPageRender(1);
  return viewer;
}

async function isDrawActive(page: Page): Promise<boolean> {
  return await inkButton(page).evaluate((el) => el.classList.contains('toggled'));
}

async function expectDrawActive(page: Page): Promise<void> {
  await expect.poll(async () => await isDrawActive(page), { timeout: 5_000 }).toBe(true);
}

/** Activate the Draw tool with the mouse. */
async function activateDrawByMouse(page: Page): Promise<void> {
  if (!(await isDrawActive(page))) {
    await inkButton(page).click();
  }
  await expectDrawActive(page);
}

/** Activate the Draw tool by tapping it with a finger. */
async function activateDrawByTouch(page: Page, cdp: CDPSession): Promise<void> {
  if (!(await isDrawActive(page))) {
    const bb = (await inkButton(page).boundingBox())!;
    await touchTap(cdp, bb.x + bb.width / 2, bb.y + bb.height / 2);
  }
  await expectDrawActive(page);
}

/**
 * A stroke start point that is inside page 1's editor layer, inside the browser
 * viewport, and not covered by an already-committed editor: the whole 120x40
 * stroke path must hit the bare layer, otherwise pdf.js drops the pointerdown
 * (`event.target !== this.div`). After a pinch the layer is several times the
 * viewport size and scrolled far off-origin, so the point has to be searched
 * for rather than computed from the layer's top-left corner.
 *
 * Requires the Draw tool to be active — an idle layer is `pointer-events: none`
 * and would never be returned by `elementFromPoint`.
 */
async function freeSpotInLayer(page: Page): Promise<{ x: number; y: number }> {
  const spot = await page.evaluate(() => {
    const layer = document.querySelector(
      '.page[data-page-number="1"] .annotationEditorLayer',
    ) as HTMLElement | null;
    if (!layer) return null;
    const r = layer.getBoundingClientRect();
    const left = Math.max(r.left, 8);
    const top = Math.max(r.top, 8);
    const right = Math.min(r.right, window.innerWidth - 8);
    const bottom = Math.min(r.bottom, window.innerHeight - 8);
    const onLayer = (x: number, y: number) =>
      document.elementFromPoint(x, y) === layer;
    for (let y = top + 20; y < bottom - 60; y += 40) {
      for (let x = left + 20; x < right - 140; x += 40) {
        if (onLayer(x, y) && onLayer(x + 60, y + 40) && onLayer(x + 120, y + 20)) {
          return { x, y };
        }
      }
    }
    return null;
  });
  expect(spot, 'no free spot found on page 1 editor layer').not.toBeNull();
  return spot!;
}

async function countEditors(page: Page): Promise<number> {
  return await page
    .locator('.page[data-page-number="1"] .annotationEditorLayer > *')
    .count();
}

/** Ink supports multiple drawings, so the session only commits on Escape. */
async function commitStroke(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function mouseStroke(page: Page, x: number, y: number): Promise<void> {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 60, y + 40, { steps: 12 });
  await page.mouse.move(x + 120, y + 20, { steps: 12 });
  await page.mouse.up();
  await commitStroke(page);
}

async function touchTap(cdp: CDPSession, x: number, y: number): Promise<void> {
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function touchStroke(
  page: Page,
  cdp: CDPSession,
  x: number,
  y: number,
): Promise<void> {
  const pt = (px: number, py: number) => [{ x: px, y: py, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: pt(x, y),
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: pt(x + i * 10, y + i * 4),
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await commitStroke(page);
}

/**
 * Pen input. Chromium has no "dispatchPenEvent"; a pen is a mouse event
 * carrying `pointerType: 'pen'`, which is what the page sees on
 * `PointerEvent.pointerType`.
 */
async function penEvent(
  cdp: CDPSession,
  type: 'mousePressed' | 'mouseMoved' | 'mouseReleased',
  x: number,
  y: number,
): Promise<void> {
  await cdp.send('Input.dispatchMouseEvent', {
    type,
    x,
    y,
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
    pointerType: 'pen',
    force: type === 'mouseReleased' ? 0 : 0.5,
  });
}

async function penTap(cdp: CDPSession, x: number, y: number): Promise<void> {
  await penEvent(cdp, 'mousePressed', x, y);
  await penEvent(cdp, 'mouseReleased', x, y);
}

/** Activate the Draw tool by tapping it with the pen. */
async function activateDrawByPen(page: Page, cdp: CDPSession): Promise<void> {
  if (!(await isDrawActive(page))) {
    const bb = (await inkButton(page).boundingBox())!;
    await penTap(cdp, bb.x + bb.width / 2, bb.y + bb.height / 2);
  }
  await expectDrawActive(page);
}

async function penStroke(
  page: Page,
  cdp: CDPSession,
  x: number,
  y: number,
): Promise<void> {
  await penEvent(cdp, 'mousePressed', x, y);
  for (let i = 1; i <= 12; i++) {
    await penEvent(cdp, 'mouseMoved', x + i * 10, y + i * 4);
  }
  await penEvent(cdp, 'mouseReleased', x + 120, y + 48);
  await commitStroke(page);
}

/** A finger drag that does not commit anything — used to prove it is ignored. */
async function touchDrag(
  cdp: CDPSession,
  x: number,
  y: number,
  dx: number,
  dy: number,
): Promise<void> {
  const pt = (px: number, py: number) => [{ x: px, y: py, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: pt(x, y),
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: pt(x + (dx * i) / 12, y + (dy * i) / 12),
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/**
 * A one-finger flick that actually scrolls: `Input.dispatchTouchEvent` only
 * reaches the renderer, so it can never move the compositor-driven scroll
 * position, while `Input.synthesizeScrollGesture` goes through the browser's
 * input pipeline the way a real finger does — and is therefore also blocked if
 * the page prevents the touchmove.
 */
async function touchFlick(cdp: CDPSession, x: number, y: number): Promise<void> {
  await cdp.send('Input.synthesizeScrollGesture', {
    x,
    y,
    xDistance: 0,
    yDistance: -260,
    gestureSourceType: 'touch',
    speed: 800,
  });
}

async function scrollTop(page: Page): Promise<number> {
  return await page.evaluate(
    () => document.getElementById('viewerContainer')?.scrollTop ?? -1,
  );
}

/** Two fingers spreading apart — what pdf.js's TouchManager turns into a zoom. */
async function pinchZoom(cdp: CDPSession, cx: number, cy: number): Promise<void> {
  const points = (gap: number) => [
    { x: cx - gap, y: cy, id: 1 },
    { x: cx + gap, y: cy, id: 2 },
  ];
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: points(40),
  });
  for (let gap = 60; gap <= 220; gap += 20) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: points(gap),
    });
  }
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [{ x: cx + 220, y: cy, id: 2 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}


/**
 * A more faithful pinch: on a real device the first finger lands *alone* — long
 * enough for pdf.js to open an ink drawing session under it — and only then does
 * the second finger arrive and turn the gesture into a zoom.
 */
async function staggeredPinchZoom(
  cdp: CDPSession,
  cx: number,
  cy: number,
): Promise<void> {
  const f1 = (gap: number) => ({ x: cx - gap, y: cy, id: 1 });
  const f2 = (gap: number) => ({ x: cx + gap, y: cy, id: 2 });

  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [f1(40)],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: cx - 44, y: cy + 3, id: 1 }],
  });
  // Second finger down: from here it is a pinch.
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [f1(40), f2(40)],
  });
  for (let gap = 60; gap <= 220; gap += 20) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [f1(gap), f2(gap)],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [f1(220)],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/**
 * The very first editor gesture of a fresh session can be dropped while pdf.js
 * lazy-loads its editor code (see the note in T27), so the opening stroke is
 * re-issued until it lands. Later strokes are asserted once — that is the
 * behaviour under test.
 */
async function landFirstStroke(
  page: Page,
  gesture: () => Promise<void>,
): Promise<void> {
  await expect
    .poll(
      async () => {
        await gesture();
        return await countEditors(page);
      },
      { timeout: 25_000, intervals: [500, 1000, 1500] },
    )
    .toBeGreaterThan(0);
}

test.describe('T31 — #3260 ink editor keeps accepting strokes after a zoom', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'CDP touch injection is Chromium-only',
  );
  test.use({ hasTouch: true });

  test('0) mouse strokes, no zoom (control)', async ({ page }) => {
    await openViewer(page);

    await landFirstStroke(page, async () => {
      await activateDrawByMouse(page);
      const a = await freeSpotInLayer(page);
      await mouseStroke(page, a.x, a.y);
    });

    await activateDrawByMouse(page);
    const b = await freeSpotInLayer(page);
    await mouseStroke(page, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('1) mouse strokes, toolbar zoom', async ({ page }) => {
    const viewer = await openViewer(page);

    await landFirstStroke(page, async () => {
      await activateDrawByMouse(page);
      const a = await freeSpotInLayer(page);
      await mouseStroke(page, a.x, a.y);
    });

    await viewer.setZoom('1.5');
    await page.waitForTimeout(3_000);

    await activateDrawByMouse(page);
    const b = await freeSpotInLayer(page);
    await mouseStroke(page, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('2) mouse strokes, pinch zoom', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByMouse(page);
      const a = await freeSpotInLayer(page);
      await mouseStroke(page, a.x, a.y);
    });

    await activateDrawByMouse(page);
    const origin = await freeSpotInLayer(page);
    await pinchZoom(cdp, origin.x + 200, origin.y + 200);
    // The library's iOS canvas-optimization service resets visible pages 2s
    // after the gesture; wait past that cooldown so the re-render is included.
    await page.waitForTimeout(3_000);

    await activateDrawByMouse(page);
    const b = await freeSpotInLayer(page);
    await mouseStroke(page, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('3) touch strokes, no zoom (control)', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByTouch(page, cdp);
      const a = await freeSpotInLayer(page);
      await touchStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByTouch(page, cdp);
    const b = await freeSpotInLayer(page);
    await touchStroke(page, cdp, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('4) touch strokes, pinch zoom (reported scenario)', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByTouch(page, cdp);
      const a = await freeSpotInLayer(page);
      await touchStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByTouch(page, cdp);
    const origin = await freeSpotInLayer(page);
    await pinchZoom(cdp, origin.x + 200, origin.y + 200);
    await page.waitForTimeout(3_000);

    // The pinch drops out of editing mode, exactly as the bug report describes;
    // re-selecting the tool marks the button active again...
    await activateDrawByTouch(page, cdp);
    const b = await freeSpotInLayer(page);
    await touchStroke(page, cdp, b.x, b.y);
    // ...but is the stroke accepted? That is #3260.
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('5) touch strokes, staggered pinch zoom (one finger first)', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByTouch(page, cdp);
      const a = await freeSpotInLayer(page);
      await touchStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByTouch(page, cdp);
    const origin = await freeSpotInLayer(page);
    await staggeredPinchZoom(cdp, origin.x + 200, origin.y + 200);
    await page.waitForTimeout(3_000);

    await activateDrawByTouch(page, cdp);
    const b = await freeSpotInLayer(page);
    await touchStroke(page, cdp, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  // ── #2512 / #2527: write with the pen, scroll and zoom with the hand ──────

  test('6) pen strokes, no zoom (control)', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByPen(page, cdp);
      const a = await freeSpotInLayer(page);
      await penStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByPen(page, cdp);
    const b = await freeSpotInLayer(page);
    await penStroke(page, cdp, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('7) pen owns the ink editor: a finger must not draw', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByPen(page, cdp);
      const a = await freeSpotInLayer(page);
      await penStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByPen(page, cdp);
    const b = await freeSpotInLayer(page);
    await touchStroke(page, cdp, b.x, b.y);
    // Still exactly the one stroke the pen drew.
    await expect.poll(async () => await countEditors(page), { timeout: 5_000 }).toBe(1);

    // ...and the pen still draws afterwards.
    await activateDrawByPen(page, cdp);
    const c = await freeSpotInLayer(page);
    await penStroke(page, cdp, c.x, c.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('8) pen owns the ink editor: a finger still scrolls the document', async ({
    page,
  }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByPen(page, cdp);
      const a = await freeSpotInLayer(page);
      await penStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByPen(page, cdp);
    const spot = await freeSpotInLayer(page);
    const before = await scrollTop(page);
    // Flick a finger upwards over the editor layer. With `touch-action: none`
    // gone (#2527) this has to reach the scroll container instead of being
    // eaten by the editor. `synthesizeScrollGesture` is used rather than
    // hand-rolled touch events because only a gesture that goes through the
    // real input pipeline can actually scroll the compositor.
    await touchFlick(cdp, spot.x, spot.y);
    await expect
      .poll(async () => await scrollTop(page), { timeout: 5_000 })
      .toBeGreaterThan(before);
    // The flick must not have left a stroke behind either.
    expect(await countEditors(page)).toBe(1);
  });

  test('8b) control: the same finger flick scrolls with no editor active', async ({
    page,
  }) => {
    // Guards 8) against a false pass: proves the synthesized flick really is a
    // scroll, so 8) failing would mean the editor swallowed it.
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    const layer = page.locator('.page[data-page-number="1"]');
    const box = (await layer.boundingBox())!;
    const before = await scrollTop(page);
    await touchFlick(cdp, box.x + box.width / 2, box.y + 200);
    await expect
      .poll(async () => await scrollTop(page), { timeout: 5_000 })
      .toBeGreaterThan(before);
  });

  test('9) pen owns the ink editor: it survives a finger pinch', async ({ page }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByPen(page, cdp);
      const a = await freeSpotInLayer(page);
      await penStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByPen(page, cdp);
    const origin = await freeSpotInLayer(page);
    await pinchZoom(cdp, origin.x + 200, origin.y + 200);
    await page.waitForTimeout(3_000);

    await activateDrawByPen(page, cdp);
    const b = await freeSpotInLayer(page);
    await penStroke(page, cdp, b.x, b.y);
    await expect.poll(async () => await countEditors(page), { timeout: 10_000 }).toBe(2);
  });

  test('10) pen owns the highlighter: a finger must not highlight', async ({
    page,
  }) => {
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    const highlightButton = page.locator('#primaryEditorHighlight');
    const hb = (await highlightButton.boundingBox())!;
    await penTap(cdp, hb.x + hb.width / 2, hb.y + hb.height / 2);
    await expect
      .poll(
        async () =>
          await highlightButton.evaluate((el) => el.classList.contains('toggled')),
        { timeout: 5_000 },
      )
      .toBe(true);

    // Drag a finger across a text span: it must not select text and must not
    // leave a highlight behind, because the pen owns the editor.
    const textLayer = page.locator('.page[data-page-number="1"] .textLayer');
    await textLayer.waitFor({ state: 'attached', timeout: 10_000 });
    const span = textLayer.locator('span').filter({ hasText: /\S{5,}/ }).first();
    await expect(span).toBeVisible({ timeout: 10_000 });
    const sb = (await span.boundingBox())!;
    await touchDrag(cdp, sb.x + 2, sb.y + sb.height / 2, sb.width - 4, 0);

    await page.waitForTimeout(1_000);
    expect(await countEditors(page)).toBe(0);
  });

  test('11) a finger-owned ink editor draws without scrolling the page', async ({
    page,
  }) => {
    // Guards the other direction of 8): dropping `touch-action: none` from the
    // ink layer must not turn a finger stroke into a page scroll. pdf.js
    // cancels exactly the touchmove events it consumes for drawing.
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await landFirstStroke(page, async () => {
      await activateDrawByTouch(page, cdp);
      const a = await freeSpotInLayer(page);
      await touchStroke(page, cdp, a.x, a.y);
    });

    await activateDrawByTouch(page, cdp);
    const b = await freeSpotInLayer(page);
    const before = await scrollTop(page);
    await touchStroke(page, cdp, b.x, b.y);
    expect(await countEditors(page)).toBe(2);
    expect(await scrollTop(page)).toBe(before);
  });
});
