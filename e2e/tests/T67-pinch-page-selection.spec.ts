import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.use({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, hasTouch: true });
test.skip(!usingBleedingEdge, 'The pinch anchor navigation fix is in the bleeding-edge engine');

test('a zoom anchor on another page does not announce a navigation on every pinch frame', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/simple');
  await viewer.waitForFirstPageRender();
  const result = await page.evaluate(async () => {
    const app = (window as any).__ngxApp, v = app.pdfViewer;
    v.currentScaleValue = '.3'; v.currentPageNumber = 330;
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Keep page 330 fully visible, with a strip of 329 above it. The viewer
    // correctly keeps 330 selected, while the location refers to first page 329.
    v.container.scrollTop -= 50;
    v.update();
    const initial = { current: v.currentPageNumber, location: v._location.pageNumber };
    const events: number[] = [], frames: { page: number; visible: number[]; events: number[] }[] = [];
    const onPage = (e: { pageNumber: number }) => events.push(e.pageNumber);
    app.eventBus.on('pagechanging', onPage);
    v.setTouchPinching(true);
    try {
      const r = v.container.getBoundingClientRect(), origin = [r.x + r.width / 2, r.y + r.height / 2];
      for (let i = 0; i < 20; i++) {
        await new Promise(requestAnimationFrame);
        const previous = events.length;
        app.updateZoom(null, 1.01, origin);
        await Promise.resolve();
        frames.push({ page: v.currentPageNumber, visible: v._getVisiblePages().views.map((p: { id: number }) => p.id), events: events.slice(previous) });
      }
      return { initial, frames };
    } finally {
      app.eventBus.off('pagechanging', onPage);
      v.setTouchPinching(false);
    }
  });
  expect(result.initial.current).not.toBe(result.initial.location);
  for (const frame of result.frames) {
    expect(frame.visible).toContain(frame.page);
    expect(frame.events.length, JSON.stringify(result.frames)).toBeLessThanOrEqual(1);
    if (frame.events.length) expect(frame.events[0]).toBe(frame.page);
  }
});

test('panning away from a zoom anchor still updates the visible page without painting an evicted offscreen anchor', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/simple');
  await viewer.waitForFirstPageRender();
  const result = await page.evaluate(async () => {
    const app = (window as any).__ngxApp, v = app.pdfViewer;
    v.currentScaleValue = '.3'; v.currentPageNumber = 330;
    await new Promise(resolve => setTimeout(resolve, 1500));
    const r = v.container.getBoundingClientRect(), origin = [r.x + r.width / 2, r.y + r.height / 2];
    const anchor = v._pages[v._location.pageNumber - 1];
    const events: number[] = [], frames: { page: number; events: number[] }[] = [];
    const onPage = (e: { pageNumber: number }) => events.push(e.pageNumber);
    let anchorDraws = 0;
    const onRender = (e: { pageNumber: number }) => { if (e.pageNumber === anchor.id) anchorDraws++; };
    v.setTouchPinching(true); app.eventBus.on('pagechanging', onPage);
    try {
      for (let i = 0; i < 35; i++) {
        await new Promise(requestAnimationFrame);
        const previous = events.length;
        app.updateZoom(null, 1.002, origin, [0, 100]);
        await Promise.resolve();
        frames.push({ page: v.currentPageNumber, events: events.slice(previous) });
      }
      const visible = v._getVisiblePages().views.map((p: { id: number }) => p.id);
      // Cache eviction is allowed for an offscreen page. Restoring its PDF
      // point on the next zoom step must not turn that into a paint request.
      anchor.destroy();
      app.eventBus.on('pagerender', onRender);
      app.updateZoom(null, 1.002, origin);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { anchor: anchor.id, current: v.currentPageNumber, visible, frames, anchorDraws };
    } finally {
      app.eventBus.off('pagechanging', onPage); app.eventBus.off('pagerender', onRender);
      v.setTouchPinching(false);
    }
  });
  expect(result.current).toBeLessThan(325);
  expect(result.visible).not.toContain(result.anchor);
  expect(Math.max(...result.visible)).toBeLessThan(result.anchor - 2);
  for (const frame of result.frames) {
    expect(frame.events.length, JSON.stringify(result.frames)).toBeLessThanOrEqual(1);
    if (frame.events.length) expect(frame.events[0]).toBe(frame.page);
  }
  expect(result.anchorDraws).toBe(0);
});

test('two-way page and pageLabel bindings report a pinch page change without navigating back', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/simple');
  await viewer.waitForFirstPageRender();
  const result = await page.evaluate(async () => {
    const w = window as any, app = w.__ngxApp, v = app.pdfViewer;
    const parent = w.ng.getComponent(document.querySelector('app-simple'));
    const component = w.ng.getComponent(document.querySelector('ngx-extended-pdf-viewer'));
    v.currentScaleValue = '.3'; v.currentPageNumber = 330;
    await new Promise(resolve => setTimeout(resolve, 1500));
    const initial = { current: v.currentPageNumber, label: v.currentPageLabel };
    const writes: { field: string; value: unknown }[] = [];
    const outputs: { field: string; value: unknown }[] = [];
    const restore: (() => void)[] = [];
    // Both binding effects navigate through these setters. Count even writes
    // of the current value: those can still scroll to the top of the page.
    for (const field of ['currentPageNumber', 'currentPageLabel']) {
      let proto = v;
      while (!Object.getOwnPropertyDescriptor(proto, field)) proto = Object.getPrototypeOf(proto);
      const descriptor = Object.getOwnPropertyDescriptor(proto, field)!;
      const own = Object.getOwnPropertyDescriptor(v, field);
      Object.defineProperty(v, field, { configurable: true,
        get() { return descriptor.get!.call(this); },
        set(value) { writes.push({ field, value }); descriptor.set!.call(this, value); },
      });
      restore.push(() => { if (own) Object.defineProperty(v, field, own); else delete v[field]; });
    }
    const pageSub = component.page.subscribe((value: unknown) => outputs.push({ field: 'page', value }));
    const labelSub = component.pageLabel.subscribe((value: unknown) => outputs.push({ field: 'label', value }));
    v.setTouchPinching(true);
    try {
      const r = v.container.getBoundingClientRect(), origin = [r.x + r.width / 2, r.y + r.height / 2];
      for (let i = 0; i < 40; i++) {
        await new Promise(requestAnimationFrame);
        app.updateZoom(null, 1.005, origin, i < 20 ? null : [0, 15]);
      }
      v.setTouchPinching(false);
      await new Promise(resolve => setTimeout(resolve, 700)); // includes Angular feedback and the final zoom snap
      return { initial, writes, outputs, current: v.currentPageNumber, label: v.currentPageLabel,
        parentPage: parent.page, parentLabel: parent.pageLabel,
        componentPage: component.page(), componentLabel: component.pageLabel() };
    } finally {
      pageSub.unsubscribe(); labelSub.unsubscribe();
      for (const fn of restore.reverse()) fn();
      v.setTouchPinching(false);
    }
  });
  expect(result.current).not.toBe(result.initial.current);
  expect(result.label).not.toBe(result.initial.label);
  expect(result.outputs).toContainEqual({ field: 'page', value: result.current });
  expect(result.outputs).toContainEqual({ field: 'label', value: result.label });
  expect(result.parentPage).toBe(result.current);
  expect(result.parentLabel).toBe(result.label);
  expect(result.componentPage).toBe(result.current);
  expect(result.componentLabel).toBe(result.label);
  expect(result.writes).toEqual([]);
});
