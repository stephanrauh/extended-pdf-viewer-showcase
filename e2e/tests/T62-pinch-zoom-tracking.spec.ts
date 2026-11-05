import type { Page } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T62 — a pinch zoom follows the fingers.
 *
 * The point of the page which is under the fingers when a pinch starts has to stay under them
 * while they zoom and move, as it does in pdf.js's own viewer. Every frame of the gesture is
 * checked, not only the last one, against the mapping a two-finger gesture defines: from one
 * touch move to the next, a point at `p` moves to
 *     previousMidpoint + newScale / oldScale * (p - previousMidpoint) + midpointMovement
 * with the scale which the viewer actually applied (it rounds and clamps).
 *
 * It used to be off by `totalScaleRatio * (midpoint - startMidpoint)`: during a gesture every
 * scale update restored the position at which the gesture began, then applied only the latest
 * movement of the fingers. 55 to 75 px after 15 frames of a slow pinch, in the direction
 * opposite to the movement. Two more defects of the same code are covered here: a two-finger
 * pan between two scale updates was undone by the next one, and a pinch at the zoom limit
 * didn't move the content at all, and the movement a scroll boundary swallowed still counted, so
 * moving the fingers back from the edge did nothing until it was used up. Finally, 400 ms after the gesture, the scale snaps to a whole
 * percent; deep in a long document, that moved the content by 140 px.
 *
 * The gestures are TouchEvents dispatched to the viewer container, so they go through pdf.js's
 * TouchManager like real fingers do; one move per animation frame. The geometry is read with
 * getBoundingClientRect(). This proves the bookkeeping, not the latency of a real device.
 *
 * Bounds: a stationary pinch is off by up to 3 px (the browser snaps scroll offsets and page
 * sizes to device pixels, and the gap between pages does not scale), so 4 px is the bound.
 */

test.describe.configure({ mode: 'parallel' });
test.use({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, hasTouch: true });

const BOUND = 4;

type Frame = { factor: number; pan: [number, number] };
type Scenario = {
  start: number;
  scroll?: [number, number];
  scrollMode?: number;
  maxZoom?: number;
  minZoom?: number;
  embed?: boolean;
  warmup?: boolean;
  /** the first frames aren't checked: the point is measured again after them */
  unchecked?: number;
  segments: Frame[][];
};
type Result = {
  startScale: number;
  endScale: number;
  cumulative: [number, number][];
  minMargin: number;
  snapJump: [number, number];
  minScrollLeft: number;
  endScrollLeft: number;
  error?: string;
};

const frames = (n: number, factor: number, pan: [number, number]): Frame[] => Array.from({ length: n }, () => ({ factor, pan }));

async function pdf(pages: number, size: [number, number]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    doc.addPage(size).drawText(`Page ${i}`, { x: 100, y: size[1] - 200, size: 30, font });
  }
  return Buffer.from(await doc.save());
}

/** One tall page, 612 x 1600 pt: at 200 % far from every scroll boundary. */
async function openTall(page: Page): Promise<void> {
  await open(page, 'tall', await pdf(1, [612, 1600]));
}

async function openLong(page: Page): Promise<void> {
  await open(page, 'long', await pdf(40, [612, 792]));
}

async function open(page: Page, name: string, body: Buffer): Promise<void> {
  const url = `/generated/t62-${name}.pdf`;
  await page.route(`**${url}`, (route) => route.fulfill({ body, contentType: 'application/pdf' }));
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${url}&zoom=100`);
  await viewer.waitForFirstPageRender();
  await page.waitForFunction(() => (window as any).__ngxEvents?.some((e: { name: string }) => e.name === 'pagesLoaded'));
}

async function pinch(page: Page, scenario: Scenario): Promise<Result> {
  return await page.evaluate(runGesture, scenario);
}

function expectTracking(result: Result, bound = BOUND): void {
  expect(result.error).toBeUndefined();
  expect(result.endScale).not.toBe(result.startScale);
  const worst = Math.max(...result.cumulative.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))));
  expect(worst, `per-frame error ${JSON.stringify(result.cumulative.map((p) => p.map((v) => +v.toFixed(1))))}`).toBeLessThanOrEqual(bound);
}

test.describe('the content follows the fingers during a pinch', () => {
  for (const [name, start, factor, pan] of [
    ['stationary zoom in', 2, 1.02, [0, 0]],
    ['zoom in, moving', 2, 1.02, [3, 4]],
    ['zoom in, moving the other way', 2, 1.02, [-3, -4]],
    ['stationary zoom out', 3, 0.98, [0, 0]],
    ['zoom out, moving', 3, 0.98, [3, 4]],
    ['zoom out, moving the other way', 3, 0.98, [-3, -4]],
  ] as [string, number, number, [number, number]][]) {
    test(name, async ({ page }) => {
      await openTall(page);
      const result = await pinch(page, { start, segments: [frames(15, factor, pan)] });
      // far from the scroll boundaries: nothing was clamped
      expect(result.minMargin).toBeGreaterThan(100);
      expectTracking(result);
    });
  }

  test('pauses of the fingers and two-finger panning between scale updates', async ({ page }) => {
    await openTall(page);
    const paused = await pinch(page, { start: 2, segments: [[...frames(5, 1.02, [3, 4]), ...frames(6, 1, [0, 0]), ...frames(5, 1.02, [3, 4])]] });
    expectTracking(paused);
    const alternating = Array.from({ length: 16 }, (_, i): Frame => (i % 2 ? { factor: 1, pan: [5, -2] } : { factor: 1.02, pan: [3, 4] }));
    expectTracking(await pinch(page, { start: 2, segments: [alternating] }));
  });

  test('a two-finger pan without zooming', async ({ page }) => {
    await openTall(page);
    const result = await pinch(page, { start: 2, warmup: false, segments: [frames(15, 1, [4, -3])] });
    expect(result.endScale).toBe(result.startScale);
    expect(Math.max(...result.cumulative.flat().map(Math.abs))).toBeLessThanOrEqual(BOUND);
  });

  test('at the zoom limits, the content keeps following the fingers', async ({ page }) => {
    await openTall(page);
    const atMax = await pinch(page, { start: 2, maxZoom: 2.1, segments: [frames(15, 1.02, [3, 4])] });
    expect(atMax.endScale).toBe(2.1);
    expectTracking(atMax);
    const atMin = await pinch(page, { start: 3, minZoom: 2.85, segments: [frames(15, 0.98, [3, 4])] });
    expect(atMin.endScale).toBe(2.85);
    expectTracking(atMin);
  });

  test('moving back from a scroll boundary during the pinch', async ({ page }) => {
    await openTall(page);
    // 20 frames to the right push the content against the left edge (the container would have to
    // scroll to -300 px), then the fingers move back. The swallowed movement must not count:
    // the content follows the fingers back at once.
    const result = await pinch(page, {
      start: 2,
      scroll: [100, 1800],
      unchecked: 20,
      segments: [[...frames(20, 1.01, [20, 0]), ...frames(10, 1.01, [-5, 0])]],
    });
    expect(result.minScrollLeft).toBe(0);
    expect(result.endScrollLeft).toBeGreaterThan(20);
    expectTracking(result);
  });

  test('a second pinch right after the first one', async ({ page }) => {
    await openTall(page);
    // within the 400 ms drawing delay: the second gesture continues the first one's bookkeeping
    expectTracking(await pinch(page, { start: 2, segments: [frames(8, 1.02, [3, 4]), frames(8, 1.02, [-2, 3])] }));
  });

  test('a viewer which is not at the top left of the page', async ({ page }) => {
    await openTall(page);
    expectTracking(await pinch(page, { start: 2, embed: true, segments: [frames(15, 1.02, [3, 4])] }));
  });

  test('deep in a long document, and in horizontal scroll mode', async ({ page }) => {
    await openLong(page);
    expectTracking(await pinch(page, { start: 2, scroll: [200, 7000], segments: [frames(15, 1.02, [3, 4])] }));
    // The gaps between the pages don't scale: a point on a page right of the first visible one
    // lags by the scale change times those gaps (pdf.js's viewer has the same limitation).
    expectTracking(await pinch(page, { start: 1, scrollMode: 1, scroll: [2500, 100], segments: [frames(15, 1.02, [3, 4])] }), 8);
  });
});

test('the scale snap at the end of a pinch does not move the content', async ({ page }) => {
  await openLong(page);
  // One step to 123.5 %, which snaps to 124 % once the gesture pauses: deep in the document
  // (page 30), the snap moved the content by the scale change times the scroll offset.
  const result = await pinch(page, { start: 1, scroll: [0, 30000], segments: [frames(1, 1.2355, [0, 0])] });
  expect(result.endScale).toBe(1.235);
  expect(Math.abs(result.snapJump[0])).toBeLessThanOrEqual(BOUND);
  expect(Math.abs(result.snapJump[1])).toBeLessThanOrEqual(BOUND);
  expect(await page.evaluate(() => (window as any).__ngxApp.pdfViewer.currentScale)).toBe(1.24);
});

test('Ctrl+wheel (a trackpad pinch) keeps the point under the mouse, including the snap', async ({ page }) => {
  await openTall(page);
  const mid = await page.evaluate(async () => {
    const w = window as any;
    const v = w.__ngxApp.pdfViewer;
    v.currentScaleValue = '2';
    await new Promise((resolve) => setTimeout(resolve, 300));
    v.container.scrollTop = 1800;
    v.container.scrollLeft = 200;
    v.update();
    await new Promise((resolve) => setTimeout(resolve, 700));
    const rect = v.container.getBoundingClientRect();
    const m = [Math.round(rect.x + rect.width / 2), Math.round(rect.y + rect.height / 2)];
    const div = v._pages[0].div as HTMLElement;
    const r = div.getBoundingClientRect();
    const fraction = [(m[0] - r.x) / r.width, (m[1] - r.y) / r.height];
    w.__t62Point = () => {
      const now = div.getBoundingClientRect();
      return [now.x + fraction[0] * now.width - m[0], now.y + fraction[1] * now.height - m[1]];
    };
    return m;
  });
  await page.mouse.move(mid[0], mid[1]);
  await page.keyboard.down('Control');
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, -25);
    await page.waitForTimeout(30);
  }
  await page.keyboard.up('Control');
  const during = await page.evaluate(() => ({ off: (window as any).__t62Point(), scale: (window as any).__ngxApp.pdfViewer.currentScale }));
  expect(during.scale).toBeGreaterThan(2);
  await page.waitForTimeout(800);
  const after: number[] = await page.evaluate(() => (window as any).__t62Point());
  for (const offset of [...during.off, ...after]) {
    expect(Math.abs(offset)).toBeLessThanOrEqual(BOUND);
  }
});

test('removing the viewer 3D CSS preserves pinch positioning in an embedded and long document', async ({ page }) => {
  const disable3d = () => page.evaluate(() => {
    const style = (window as any).__ngxApp.pdfViewer.viewer.style as CSSStyleDeclaration;
    style.setProperty('transform', 'none', 'important');
    style.setProperty('-webkit-backface-visibility', 'visible', 'important');
    style.setProperty('backface-visibility', 'visible', 'important');
  });
  await openTall(page);
  await disable3d();
  expectTracking(await pinch(page, { start: 2, segments: [frames(15, 1.02, [0, 0])] }));
  expectTracking(await pinch(page, { start: 2, embed: true, segments: [frames(15, 1.02, [3, 4])] }));
  await openLong(page);
  await disable3d();
  expectTracking(await pinch(page, { start: 2, scroll: [200, 7000], segments: [frames(15, 1.02, [3, 4])] }));
});

test('single-scroll experiment preserves finger tracking and boundary reversal', async ({ page }) => {
  await openTall(page);
  await page.evaluate(() => { (window as any).__ngxApp.pdfViewer.singleScrollDuringPinch = true; });
  for (const [start, factor, pan] of [
    [2, 1.02, [0, 0]], [2, 1.02, [3, 4]], [2, 1.02, [-3, -4]],
    [3, .98, [0, 0]], [3, .98, [3, 4]], [3, .98, [-3, -4]],
  ] as [number, number, [number, number]][]) {
    const result = await pinch(page, { start, segments: [frames(15, factor, pan)] });
    expect(result.minMargin).toBeGreaterThan(100);
    expectTracking(result);
  }
  const boundary = await pinch(page, { start: 2, scroll: [100, 1800], unchecked: 20,
    segments: [[...frames(20, 1.01, [20, 0]), ...frames(10, 1.01, [-5, 0])]] });
  expect(boundary.minScrollLeft).toBe(0);
  expectTracking(boundary);
  expectTracking(await pinch(page, { start: 2, embed: true, segments: [frames(15, 1.02, [3, 4])] }));
  await openLong(page);
  await page.evaluate(() => { (window as any).__ngxApp.pdfViewer.singleScrollDuringPinch = true; });
  expectTracking(await pinch(page, { start: 2, scroll: [200, 7000], segments: [frames(15, 1.02, [3, 4])] }));
});

/** Runs in the page: performs the gesture and measures the tracked point every frame. */
async function runGesture(scenario: Scenario): Promise<Result> {
  const w = window as any;
  const app = w.__ngxApp;
  const v = app.pdfViewer;
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const frame = () => new Promise(requestAnimationFrame);
  const host = document.querySelector('ngx-extended-pdf-viewer') as HTMLElement;

  await delay(600); // a previous gesture's drawing delay and snap are over
  const limits = [v.maxZoom, v.minZoom];
  if (scenario.embed) {
    host.style.display = 'block';
    host.style.marginTop = '173px';
    host.style.marginLeft = '61px';
    document.body.style.paddingBottom = '1500px';
    window.scrollTo(0, 97);
  }
  if (scenario.scrollMode !== undefined && v.scrollMode !== scenario.scrollMode) {
    v.scrollMode = scenario.scrollMode;
    await delay(500);
  }
  v.currentScaleValue = String(scenario.start);
  await delay(300);
  const [left, top] = scenario.scroll ?? [scenario.start === 2 ? 200 : 500, 1800];
  v.container.scrollTop = top;
  v.container.scrollLeft = left;
  v.update();
  await delay(700);
  if (scenario.maxZoom) v.maxZoom = scenario.maxZoom;
  if (scenario.minZoom) v.minZoom = scenario.minZoom;

  try {
    const container = v.container as HTMLElement;
    const rect = container.getBoundingClientRect();
    // not on a pixel boundary, so the rounding of the coordinates can't hide an error
    let mid = [rect.x + rect.width / 2 + 0.5, rect.y + rect.height / 2 + 0.25];
    const pageDiv = (v._pages as { div: HTMLElement }[])
      .map((p) => p.div)
      .find((div) => {
        const r = div.getBoundingClientRect();
        return r.left <= mid[0] && mid[0] <= r.right && r.top <= mid[1] && mid[1] <= r.bottom;
      });
    if (!pageDiv) {
      return {
        startScale: v.currentScale,
        endScale: v.currentScale,
        cumulative: [],
        minMargin: 0,
        snapJump: [0, 0],
        minScrollLeft: 0,
        endScrollLeft: 0,
        error: 'no page under the midpoint',
      };
    }
    const r0 = pageDiv.getBoundingClientRect();
    const fraction = [(mid[0] - r0.x) / r0.width, (mid[1] - r0.y) / r0.height];
    const point = () => {
      const r = pageDiv.getBoundingClientRect();
      return [r.x + fraction[0] * r.width, r.y + fraction[1] * r.height];
    };

    let id = 40;
    // screen coordinates differ from client ones, as they do on a device
    const send = (type: string, m: number[], gap: number) => {
      const make = (identifier: number, x: number) =>
        new Touch({ identifier, target: container, clientX: x, clientY: m[1], screenX: x + 400, screenY: m[1] + 600 });
      const pair = [make(id, m[0] - gap), make(id + 1, m[0] + gap)];
      const touches = type === 'touchend' ? [] : pair;
      container.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches, targetTouches: touches, changedTouches: pair }));
    };

    let expected = point();
    const startScale = v.currentScale;
    const cumulative: [number, number][] = [];
    const margins: number[] = [];
    let frameCount = 0;
    let minScrollLeft = Infinity;
    for (const [index, segment] of scenario.segments.entries()) {
      id += 2;
      let gap = 100;
      send('touchstart', mid, gap);
      if (scenario.warmup !== false) {
        // crosses TouchManager's pinch threshold; it doesn't zoom yet
        gap = segment[0].factor < 1 ? 80 : 120;
        send('touchmove', mid, gap);
      }
      for (const { factor, pan } of segment) {
        await frame();
        const before = v.currentScale;
        const previous = [...mid];
        mid = [previous[0] + pan[0], previous[1] + pan[1]];
        if (factor !== 1) gap *= factor;
        send('touchmove', mid, gap);
        const ratio = v.currentScale / before;
        expected = expected.map((x, j) => previous[j] + (x - previous[j]) * ratio + pan[j]);
        const actual = point();
        minScrollLeft = Math.min(minScrollLeft, container.scrollLeft);
        if (++frameCount <= (scenario.unchecked ?? 0)) {
          expected = actual;
          continue;
        }
        cumulative.push([actual[0] - expected[0], actual[1] - expected[1]]);
        margins.push(
          Math.min(
            container.scrollTop,
            container.scrollLeft,
            container.scrollHeight - container.clientHeight - container.scrollTop,
            container.scrollWidth - container.clientWidth - container.scrollLeft,
          ),
        );
      }
      send('touchend', mid, gap);
      if (index < scenario.segments.length - 1) await frame();
    }
    const endScale = v.currentScale;
    const endScrollLeft = container.scrollLeft;
    const beforeSnap = point();
    await delay(800); // the 400 ms drawing delay, then the snap to a whole percent
    const afterSnap = point();
    return {
      startScale,
      endScale,
      cumulative,
      minMargin: Math.min(...margins),
      snapJump: [afterSnap[0] - beforeSnap[0], afterSnap[1] - beforeSnap[1]],
      minScrollLeft,
      endScrollLeft,
    };
  } finally {
    v.maxZoom = limits[0];
    v.minZoom = limits[1];
    if (scenario.embed) {
      host.style.marginTop = host.style.marginLeft = '';
      document.body.style.paddingBottom = '';
      window.scrollTo(0, 0);
    }
  }
}
