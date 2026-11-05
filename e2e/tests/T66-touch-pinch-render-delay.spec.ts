import type { Page } from '@playwright/test';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });
test.use({ viewport: { width: 1400, height: 1000 }, hasTouch: true, deviceScaleFactor: 2 });
test.skip(!usingBleedingEdge, 'Touch-lifetime rendering delay is in the bleeding-edge engine');

async function prepare(page: Page) {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/simple');
  await page.waitForFunction(() => (window as any).__ngxApp?.pdfViewer?._pages?.[4]?.pdfPage);
  await page.evaluate(async () => {
    const v = (window as any).__ngxApp.pdfViewer;
    v.currentScaleValue = '1.2'; v.currentPageNumber = 5;
    await new Promise((resolve) => setTimeout(resolve, 900));
  });
  await viewer.waitForPageRender(5);
  await page.waitForFunction(() => (window as any).__ngxApp.pdfViewer._pages[4].renderingState === 3);
}

for (const ending of ['touchend', 'touchcancel']) {
  test(`a ${ending === 'touchend' ? 'pause' : 'pan'} beyond 400ms preserves the cached canvas until ${ending}`, async ({ page }) => {
    await prepare(page);
    const result = await page.evaluate(async (ending) => {
      const app = (window as any).__ngxApp, v = app.pdfViewer, target = v.container, p = v._pages[4];
      const originalCanvas = p.canvas, originalReset = p.reset, originalDraw = p.draw;
      let resets = 0, draws = 0;
      p.reset = function (...args: any[]) { resets++; return originalReset.apply(this, args); };
      p.draw = function (...args: any[]) { draws++; return originalDraw.apply(this, args); };
      const r = target.getBoundingClientRect();
      let x = r.x + r.width / 2;
      const y = r.y + r.height / 2;
      const send = (type: string, gap: number) => {
        const pair = [-1, 1].map((sign, id) => ({ identifier: id, target, clientX: x + sign * gap, clientY: y, screenX: x + sign * gap, screenY: y }));
        const contacts = type === 'touchend' || type === 'touchcancel' ? [] : pair;
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(event, { touches: { value: contacts }, targetTouches: { value: contacts }, changedTouches: { value: pair } });
        target.dispatchEvent(event);
      };
      try {
        send('touchstart', 100); send('touchmove', 120); send('touchmove', 123.55);
        const duringScale = v.currentScale;
        const deadline = performance.now() + 650;
        while (performance.now() < deadline) {
          await new Promise(requestAnimationFrame);
          if (ending === 'touchcancel') { x += .25; send('touchmove', 123.55); }
        }
        const during = { resets, draws, sameCanvas: p.canvas === originalCanvas, scale: v.currentScale };
        send(ending, 123.55);
        await new Promise((resolve) => setTimeout(resolve, 650));
        return { duringScale, during, after: { resets, draws, sameCanvas: p.canvas === originalCanvas, scale: v.currentScale } };
      } finally { p.reset = originalReset; p.draw = originalDraw; }
    }, ending);
    expect(result.duringScale).toBeGreaterThan(1.2);
    expect(result.during.scale).toBe(result.duringScale);
    expect(result.during.resets).toBe(0);
    expect(result.during.draws).toBe(0);
    expect(result.during.sameCanvas).toBe(true);
    expect(result.after.resets).toBeGreaterThan(0);
    expect(result.after.draws).toBeGreaterThan(0);
    expect(result.after.sameCanvas).toBe(false);
    expect(result.after.scale).toBe(Math.round(result.duringScale * 100) / 100);
  });
}

for (const ending of ['one finger left', 'touchcancel', 'destroy']) {
  test(`native scroll lock works without diagnostics and restores overflow after ${ending}`, async ({ page }) => {
    await prepare(page);
    const result = await page.evaluate(async (ending) => {
      const app = (window as any).__ngxApp, v = app.pdfViewer, target = v.container as HTMLElement;
      target.style.setProperty('overflow-x', 'auto', 'important');
      target.style.setProperty('overflow-y', 'scroll');
      const styles = () => ['overflow', 'overflow-x', 'overflow-y'].map(property => ({ property,
        value: target.style.getPropertyValue(property), priority: target.style.getPropertyPriority(property) }));
      const original = styles(), before = { width: target.clientWidth, height: target.clientHeight, scale: v.currentScale };
      const r = target.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
      const send = (type: string, count: number, gap = 100) => {
        const pair = [-1, 1].map((sign, identifier) => ({ identifier, target, clientX: x + sign * gap, clientY: y, screenX: x + sign * gap, screenY: y }));
        const contacts = pair.slice(0, count);
        const changed = type === 'touchstart' ? contacts.slice(-1) : type === 'touchmove' ? contacts : pair.slice(count);
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(event, { touches: { value: contacts }, targetTouches: { value: contacts }, changedTouches: { value: changed } });
        target.dispatchEvent(event);
      };
      send('touchstart', 1);
      const singleFinger = styles();
      send('touchstart', 2);
      // Repeated start notifications must keep the original styles.
      v.setTouchPinching(true);
      const locked = { overflow: getComputedStyle(target).overflow, width: target.clientWidth, height: target.clientHeight };
      send('touchmove', 2, 120); send('touchmove', 2, 125);
      const zoomed = v.currentScale;
      const top = target.scrollTop;
      v.panBy(0, -10);
      const pan = target.scrollTop - top;
      if (ending === 'destroy') await app.testingClose();
      else send(ending === 'touchcancel' ? 'touchcancel' : 'touchend', ending === 'one finger left' ? 1 : 0, 125);
      const restored = styles();
      if (ending !== 'destroy') send('touchend', 0, 125);
      return { original, singleFinger, before, locked, zoomed, pan, restored };
    }, ending);
    expect(result.singleFinger).toEqual(result.original);
    expect(result.locked.overflow).toBe('hidden');
    expect(result.locked.width).toBe(result.before.width);
    expect(result.locked.height).toBe(result.before.height);
    expect(result.zoomed).toBeGreaterThan(result.before.scale);
    expect(result.pan).toBeCloseTo(10, 0);
    expect(result.restored).toEqual(result.original);
  });
}

test('wheel zoom still refreshes after its idle delay', async ({ page }) => {
  await prepare(page);
  const result = await page.evaluate(async () => {
    const app = (window as any).__ngxApp, v = app.pdfViewer, p = v._pages[4];
    const before = p.canvas, r = v.container.getBoundingClientRect();
    app.updateZoom(null, 1.02958, [r.x + r.width / 2, r.y + r.height / 2]);
    const immediate = p.canvas === before;
    await new Promise((resolve) => setTimeout(resolve, 650));
    return { immediate, refreshed: p.canvas !== before, scale: v.currentScale };
  });
  expect(result.immediate).toBe(true);
  expect(result.refreshed).toBe(true);
  expect(result.scale).toBe(1.24);
});
