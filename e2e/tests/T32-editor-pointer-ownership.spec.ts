import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import type { CDPSession, Page } from '@playwright/test';

/**
 * T32 — stephanrauh/ngx-extended-pdf-viewer#3260, follow-up
 *
 * T31 covers *who* may draw: only the pointer type that switched the editor on,
 * so a pen writes while a finger scrolls and pinches (#2512). This file covers
 * *how long* that ownership lasts.
 *
 * The pointer state used to live in a `static` class, i.e. one per loaded
 * script rather than one per viewer, and it was only ever re-assigned on a mode
 * change the user had triggered. A pen that had owned the ink editor therefore
 * kept owning it after the editor had been switched off, and even after the
 * document had been closed and another one opened - which is what the reporter
 * described as "it randomly stops accepting strokes, and it survives reopening
 * a document". It is now an instance owned by the `AnnotationEditorUIManager`,
 * which is built and destroyed per document, and every mode change re-assigns
 * it - to nobody, when nobody asked for the change.
 *
 * Case 1 reads the ownership straight out of the viewer rather than through the
 * toolbar: tapping a tool re-claims the editor for whoever tapped, so a stale
 * owner is invisible from the outside until the moment it locks someone out.
 * Case 2 is the same thing as the user experiences it.
 *
 * Chromium only: CDP touch/pen injection is not available in WebKit.
 */
test.describe.configure({ mode: 'parallel' });

const ROUTE = '/extended-pdf-viewer/export-annotations';
/**
 * A second viewer route to navigate to *inside* the app, without a reload.
 * It needs a viewer tall enough to draw on: `/simple` renders at its default
 * height, and page 1's editor layer barely reaches into the viewport there.
 */
const OTHER_ROUTE = '/extended-pdf-viewer/two-way-binding';

const inkButton = (page: Page) => page.locator('#primaryEditorInk');

/**
 * Capture the viewer's `PDFViewerApplication`. The library gets it from this
 * one-shot event too (see pdf-script-loader.service.ts), and it is a module
 * singleton, so it stays valid when the app routes to another viewer.
 */
async function captureViewerApplication(page: Page): Promise<void> {
  await page.addInitScript(() => {
    document.addEventListener('ngxViewerFileHasBeenLoaded', (e: Event) => {
      (window as unknown as Record<string, unknown>).__ngxApp = (
        e as CustomEvent
      ).detail.PDFViewerApplication;
    });
  });
}

/**
 * True when `pointerType` is currently locked out of the editor, i.e. some
 * other pointer type owns it. Null when there is no editor ui manager yet.
 */
async function isLockedOut(
  page: Page,
  pointerType: 'touch' | 'pen' | 'mouse',
): Promise<boolean | null> {
  return await page.evaluate((type) => {
    const app = (window as unknown as Record<string, any>).__ngxApp;
    const uiManager = app?.pdfViewer?._layerProperties?.annotationEditorUIManager;
    if (!uiManager?.currentPointers) {
      return null;
    }
    return uiManager.currentPointers.isInitializedAndDifferentPointerType(type);
  }, pointerType);
}

/** Identity of the pointer state, to prove a new document gets a new one. */
async function pointerStateId(page: Page): Promise<number | null> {
  return await page.evaluate(() => {
    const w = window as unknown as Record<string, any>;
    const uiManager =
      w.__ngxApp?.pdfViewer?._layerProperties?.annotationEditorUIManager;
    const pointers = uiManager?.currentPointers;
    if (!pointers) {
      return null;
    }
    const seen: unknown[] = (w.__ngxSeenPointers ??= []);
    let id = seen.indexOf(pointers);
    if (id === -1) {
      id = seen.push(pointers) - 1;
    }
    return id;
  });
}

async function openViewer(page: Page, route = ROUTE): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(route);
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

/** See T31: the stroke path must hit the bare editor layer over its whole length. */
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

async function activateDrawByPen(page: Page, cdp: CDPSession): Promise<void> {
  if (!(await isDrawActive(page))) {
    const bb = (await inkButton(page).boundingBox())!;
    await penTap(cdp, bb.x + bb.width / 2, bb.y + bb.height / 2);
  }
  await expectDrawActive(page);
}

async function activateDrawByTouch(page: Page, cdp: CDPSession): Promise<void> {
  if (!(await isDrawActive(page))) {
    const bb = (await inkButton(page).boundingBox())!;
    await touchTap(cdp, bb.x + bb.width / 2, bb.y + bb.height / 2);
  }
  await expectDrawActive(page);
}

/**
 * Route inside the app, so the viewer is torn down and rebuilt without the page
 * being reloaded - the "closed and reopened a document in the same session" of
 * the bug report. A full `page.goto` would drop the whole JavaScript context and
 * prove nothing. The new route starts scrolled to the top of a long demo page,
 * so the viewer has to be brought into view before anything can be drawn on it.
 */
async function routeToOtherViewer(page: Page): Promise<void> {
  const link = page.locator(`a[href="${OTHER_ROUTE}"]`).first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  const viewer = new PdfViewerPage(page);
  await viewer.waitForFirstPageRender();
  await viewer.waitForPageRender(1);
  await page.locator('.page[data-page-number="1"]').scrollIntoViewIfNeeded();
}

/** See T31: the first editor gesture of a fresh session can be dropped. */
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

/** Give the pen the ink editor and leave one committed stroke behind. */
async function penOwnsTheEditor(page: Page, cdp: CDPSession): Promise<void> {
  await landFirstStroke(page, async () => {
    await activateDrawByPen(page, cdp);
    const a = await freeSpotInLayer(page);
    await penStroke(page, cdp, a.x, a.y);
  });
  // The pen owns the editor: a finger is locked out. This is #2512, and it is
  // the state whose *lifetime* the cases below are about.
  expect(await isLockedOut(page, 'touch')).toBe(true);
}

test.describe('T32 — #3260 pointer ownership does not outlive its editor', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'CDP pen/touch injection is Chromium-only',
  );
  test.use({ hasTouch: true });

  test('1) another document gets its own pointer state', async ({ page }) => {
    await captureViewerApplication(page);
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await penOwnsTheEditor(page, cdp);
    const firstState = await pointerStateId(page);
    expect(firstState).not.toBeNull();

    await routeToOtherViewer(page);

    // A fresh pointer state, and nobody owns the editor: the pen of the
    // previous document does not lock the finger out of this one.
    await expect
      .poll(async () => await pointerStateId(page), { timeout: 15_000 })
      .not.toBe(firstState);
    expect(await isLockedOut(page, 'touch')).toBe(false);
  });

  test('2) the finger draws on the new document', async ({ page }) => {
    await captureViewerApplication(page);
    await openViewer(page);
    const cdp = await page.context().newCDPSession(page);

    await penOwnsTheEditor(page, cdp);

    await routeToOtherViewer(page);

    await landFirstStroke(page, async () => {
      await activateDrawByTouch(page, cdp);
      const a = await freeSpotInLayer(page);
      await touchStroke(page, cdp, a.x, a.y);
    });
    expect(await countEditors(page)).toBe(1);
  });
});
