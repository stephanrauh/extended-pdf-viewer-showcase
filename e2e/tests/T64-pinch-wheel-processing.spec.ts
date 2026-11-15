import type { Page } from '@playwright/test';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

// Synthetic pixel-wheel events model the trackpad's ctrlKey without holding
// the physical Ctrl key. Holding it would bypass the scroll guard and hide
// the WebKit regression. These tests check processing, not hardware latency.
test.describe.configure({ mode: 'parallel' });
test.use({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
test.skip(!usingBleedingEdge, 'The wheel fixes are in the bleeding-edge engine');

async function prepare(page: Page, route = '/extended-pdf-viewer/simple') {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(route);
  await viewer.waitForFirstPageRender();
  await page.waitForFunction(() => (window as any).__ngxApp?.pdfViewer?._pages?.[4]?.pdfPage);
  await page.evaluate(async () => {
    const v = (window as any).__ngxApp.pdfViewer;
    v.currentScaleValue = '1.25';
    v.currentPageNumber = 5;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  await viewer.waitForPageRender(5);
  const mid = await page.evaluate(() => {
    const r = (window as any).__ngxApp.pdfViewer.container.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(mid.x, mid.y);
}

test('each trackpad input zooms once, without binding feedback or redrawing the cached page', async ({ page }) => {
  await prepare(page, '/extended-pdf-viewer/two-way-binding');
  const result = await page.evaluate(async () => {
    const w = window as any;
    const app = w.__ngxApp, v = app.pdfViewer;
    const component = w.ng.getComponent(document.querySelector('ngx-extended-pdf-viewer'));
    const parent = w.ng.getComponent(document.querySelector('app-two-way-binding'));
    const pageView = v._pages[4];
    const originals = { zoom: app.updateZoom, setZoom: component.setZoom, draw: pageView.draw };
    let calls = 0, writes = 0, draws = 0;
    app.updateZoom = function (...args: any[]) { calls++; return originals.zoom.apply(this, args); };
    component.setZoom = function (...args: any[]) { writes++; return originals.setZoom.apply(this, args); };
    pageView.draw = function (...args: any[]) { draws++; return originals.draw.apply(this, args); };
    const steps = [];
    try {
      const r = v.container.getBoundingClientRect();
      for (let i = 0; i < 12; i++) {
        await new Promise(requestAnimationFrame);
        const before = v.currentScale, previousCalls = calls;
        v.container.dispatchEvent(new WheelEvent('wheel', {
          bubbles: true, cancelable: true, ctrlKey: true, deltaMode: 0, deltaY: -.22583,
          clientX: r.x + r.width / 2, clientY: r.y + r.height / 2,
        }));
        steps.push({ before, after: v.currentScale, calls: calls - previousCalls });
      }
      await new Promise(requestAnimationFrame); // let the parent's two-way binding settle
      return { steps, writes, draws, parentZoom: Number(parent.zoom), scale: v.currentScale };
    } finally {
      app.updateZoom = originals.zoom;
      component.setZoom = originals.setZoom;
      pageView.draw = originals.draw;
    }
  });
  expect(result.steps).toHaveLength(12);
  for (const step of result.steps) {
    expect(step.calls, JSON.stringify(result.steps)).toBe(1);
    expect(step.after).toBeGreaterThan(step.before);
  }
  expect(result.writes).toBe(0);
  expect(result.draws).toBe(0);
  expect(result.parentZoom).toBeCloseTo(result.scale * 100, 3);
});

test('CSS zoom does not resize the viewport; window and parent resizes still notify Angular', async ({ page }) => {
  await prepare(page);
  const callsDuringZoom = await page.evaluate(async () => {
    const w = window as any;
    const v = w.__ngxApp.pdfViewer;
    const component = w.ng.getComponent(document.querySelector('ngx-extended-pdf-viewer'));
    const original = component.onResize;
    w.__t64ResizeCalls = 0;
    component.onResize = function () { w.__t64ResizeCalls++; return original.call(this); };
    const r = v.container.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      await new Promise(requestAnimationFrame);
      w.__ngxApp.updateZoom(null, 1.005, [r.x + r.width / 2, r.y + r.height / 2]);
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
    return w.__t64ResizeCalls;
  });
  expect(callsDuringZoom).toBe(0);
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect.poll(() => page.evaluate(() => (window as any).__t64ResizeCalls)).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => {
    const w = window as any;
    const previous = { calls: w.__t64ResizeCalls, width: w.__ngxApp.pdfViewer.container.clientWidth };
    const host = document.querySelector<HTMLElement>('ngx-extended-pdf-viewer')!;
    host.style.display = 'block';
    host.style.width = '80%';
    return previous;
  });
  await expect.poll(() => page.evaluate(() => (window as any).__ngxApp.pdfViewer.container.clientWidth)).toBeLessThan(before.width);
  await expect.poll(() => page.evaluate(() => (window as any).__t64ResizeCalls)).toBeGreaterThan(before.calls);
});

// The guard (pdf.js issue 7022) ignores Ctrl+wheel while the document scrolls, so
// holding Ctrl during momentum scrolling doesn't zoom. Since pdf.js bug 1915803 it
// applies to the physical Ctrl key only: a trackpad pinch zooms even then. #3171
// keeps zoom-induced scrolling from setting `_isScrolling`; a separate scroll must
// still set it.
test('the scrolling guard still blocks physical Ctrl+wheel zoom during a separate scroll', async ({ page }) => {
  await prepare(page);
  const result = await page.evaluate(() => {
    const app = (window as any).__ngxApp, v = app.pdfViewer, container = v.container;
    const r = container.getBoundingClientRect();
    // A mouse wheel notch, with the physical Ctrl key held (see keydown below).
    const wheel = () => container.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true, cancelable: true, ctrlKey: true, deltaMode: 0, deltaY: -100,
      clientX: r.x + r.width / 2, clientY: r.y + r.height / 2,
    }));
    // Scroll first: a scroll that starts while Ctrl is down doesn't count.
    container.scrollTop += 100;
    container.dispatchEvent(new Event('scroll'));
    const guarded = app._isScrolling, before = v.currentScale;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', ctrlKey: true }));
    try {
      wheel();
      const during = v.currentScale;
      container.dispatchEvent(new Event('blur')); // end the separate scroll synchronously
      wheel();
      return { guarded, before, during, after: v.currentScale };
    } finally {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
    }
  });
  expect(result.guarded).toBe(true);
  expect(result.during).toBe(result.before);
  expect(result.after).toBeGreaterThan(result.before);
});

test('a trackpad pinch zooms even during a separate scroll (pdf.js bug 1915803)', async ({ page }) => {
  await prepare(page);
  const result = await page.evaluate(() => {
    const app = (window as any).__ngxApp, v = app.pdfViewer, container = v.container;
    const r = container.getBoundingClientRect();
    container.scrollTop += 100;
    container.dispatchEvent(new Event('scroll'));
    const guarded = app._isScrolling, before = v.currentScale;
    // ctrlKey without the physical Ctrl key: what a trackpad pinch sends.
    container.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true, cancelable: true, ctrlKey: true, deltaMode: 0, deltaY: -.22583,
      clientX: r.x + r.width / 2, clientY: r.y + r.height / 2,
    }));
    return { guarded, before, after: v.currentScale };
  });
  expect(result.guarded).toBe(true);
  expect(result.after).toBeGreaterThan(result.before);
});

test('single-scroll experiment writes each scroll offset once per zoom step', async ({ page }) => {
  await prepare(page);
  const result = await page.evaluate(() => {
    const app = (window as any).__ngxApp, v = app.pdfViewer, container = v.container;
    const count = { scrollLeft: 0, scrollTop: 0 };
    for (const key of ['scrollLeft', 'scrollTop'] as const) {
      let proto = Object.getPrototypeOf(container);
      while (!Object.getOwnPropertyDescriptor(proto, key)) proto = Object.getPrototypeOf(proto);
      const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;
      Object.defineProperty(container, key, { configurable: true,
        get() { return descriptor.get!.call(this); },
        set(value) { count[key]++; descriptor.set!.call(this, value); },
      });
    }
    try {
      const r = container.getBoundingClientRect(), origin = [r.x + r.width / 2, r.y + r.height / 2];
      v.singleScrollDuringPinch = false;
      app.updateZoom(null, 1.004, origin);
      const normal = { ...count };
      count.scrollLeft = count.scrollTop = 0;
      v.singleScrollDuringPinch = true;
      app.updateZoom(null, 1.004, origin);
      return { normal, single: { ...count } };
    } finally { delete container.scrollLeft; delete container.scrollTop; }
  });
  expect(result.normal).toEqual({ scrollLeft: 2, scrollTop: 2 });
  expect(result.single).toEqual({ scrollLeft: 1, scrollTop: 1 });
});
