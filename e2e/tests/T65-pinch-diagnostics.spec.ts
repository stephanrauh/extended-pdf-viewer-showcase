import { readFile } from 'node:fs/promises';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.use({ viewport: { width: 1200, height: 1000 }, hasTouch: true });

test('the diagnostic panel requires the query parameter', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/simple');
  await viewer.waitForFirstPageRender();
  await expect(page.locator('#pinch-diagnostics')).toHaveCount(0);
});

test('a standalone device can record a pinch, copy a summary, download a trace, and leave the page', async ({ page }) => {
  const viewer = new PdfViewerPage(page);
  await viewer.goto('/extended-pdf-viewer/simple?pinchDebug=1');
  await viewer.waitForFirstPageRender();
  const panel = page.getByRole('region', { name: 'Pinch diagnostic' });
  // <section> has a landmark role when named.
  await expect(panel).toBeVisible();
  const original3d = await page.evaluate(() => {
    const viewer = (window as any).__ngxApp.pdfViewer.viewer as HTMLElement;
    (window as any).__t65StyledViewer = viewer;
    (window as any).__t65InputMethods = { viewer: (window as any).__ngxApp.pdfViewer,
      updateScale: (window as any).__ngxApp.pdfViewer.updateScale, panBy: (window as any).__ngxApp.pdfViewer.panBy };
    const container = (window as any).__ngxApp.pdfViewer.container as HTMLElement;
    (window as any).__t65ScrollMethods = { container, scrollTo: container.scrollTo, scrollBy: container.scrollBy,
      ownTop: Object.getOwnPropertyDescriptor(container, 'scrollTop'), ownLeft: Object.getOwnPropertyDescriptor(container, 'scrollLeft'),
      overflow: container.style.getPropertyValue('overflow') };
    return ['transform', '-webkit-backface-visibility', 'backface-visibility'].map(property => ({
      property, value: viewer.style.getPropertyValue(property), priority: viewer.style.getPropertyPriority(property),
    }));
  });
  await panel.getByRole('button', { name: '3D CSS: default', exact: true }).click();
  await expect(panel.getByRole('button', { name: '3D CSS: off', exact: true })).toBeVisible();
  expect(await page.evaluate(() => {
    const style = getComputedStyle((window as any).__t65StyledViewer);
    return { transform: style.transform, backface: style.backfaceVisibility };
  })).toEqual({ transform: 'none', backface: 'visible' });
  const supportsScrollLock = await page.evaluate(() => typeof (window as any).__ngxApp.pdfViewer.touchPinchScrollLock === 'boolean');
  if (usingBleedingEdge) expect(supportsScrollLock).toBe(true);
  await panel.getByRole('button', { name: 'Record', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Recording');
  await expect(panel.getByRole('button', { name: '3D CSS: off', exact: true })).toBeDisabled();
  const scrollLock = await page.evaluate(async () => {
    const v = (window as any).__ngxApp.pdfViewer, target = v.container;
    const r = target.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
    const send = (type: string, gap: number) => {
      // Desktop WebKit doesn't expose a constructible Touch. Plain contacts
      // exercise the same listeners without requiring physical touch hardware.
      const pair = [-1, 1].map((sign, id) => ({ identifier: id, target, clientX: x + sign * gap, clientY: y, screenX: x + sign * gap, screenY: y }));
      const touches = type === 'touchend' ? [] : pair;
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, { touches: { value: touches }, targetTouches: { value: touches }, changedTouches: { value: pair } });
      target.dispatchEvent(event);
    };
    const before = { width: target.clientWidth, height: target.clientHeight, overflow: getComputedStyle(target).overflow };
    send('touchstart', 100);
    const locked = { width: target.clientWidth, height: target.clientHeight, overflow: getComputedStyle(target).overflow };
    send('touchmove', 120);
    for (let i = 0; i < 8; i++) {
      await new Promise(requestAnimationFrame);
      send('touchmove', 120 * 1.03 ** (i + 1));
    }
    const beforePan = target.scrollTop;
    v.panBy(0, -10);
    const panDelta = target.scrollTop - beforePan;
    send('touchend', 160);
    // A real navigation supplies a page-change snapshot, including its caller
    // and the position left by the preceding gesture.
    v.currentPageNumber = 6;
    await new Promise(requestAnimationFrame);
    return { before, locked, panDelta, after: getComputedStyle(target).overflow };
  });
  expect(scrollLock.locked.overflow).toBe(supportsScrollLock ? 'hidden' : scrollLock.before.overflow);
  expect(scrollLock.locked.width).toBe(scrollLock.before.width);
  expect(scrollLock.locked.height).toBe(scrollLock.before.height);
  expect(scrollLock.panDelta).toBeCloseTo(10, 0);
  expect(scrollLock.after).toBe(scrollLock.before.overflow);
  await panel.getByRole('button', { name: 'Stop', exact: true }).click();
  const text = await panel.getByRole('textbox', { name: 'Diagnostic summary' }).inputValue();
  const summary = JSON.parse(text);
  expect(summary.gestures).toBe(1);
  expect(summary.operations.scale).toBeGreaterThan(0);
  expect(summary.bundle).toMatch(/viewer-.*\.mjs$/);
  expect(summary.viewer3dCssDisabled).toBe(true);
  expect(summary.layoutAtStart.transform).toBe('none');
  expect(summary.layoutAtStart.backfaceVisibility).toBe('visible');
  expect(summary.layoutAtStart.mountedPages).toBeGreaterThan(1);
  expect(summary.scrollProbeVersion).toBe(2);
  expect(summary.pinchScrollLockEnabled).toBe(supportsScrollLock ? true : null);
  expect(await page.evaluate(() => {
    const saved = (window as any).__t65InputMethods;
    return saved.viewer.updateScale === saved.updateScale && saved.viewer.panBy === saved.panBy;
  })).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { (window as any).__copiedPinchSummary = value; } } });
  });
  await panel.getByRole('button', { name: 'Copy summary' }).click();
  await expect(panel.getByRole('status')).toHaveText('Summary copied.');
  expect(await page.evaluate(() => (window as any).__copiedPinchSummary)).toBe(text);
  const downloading = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download trace' }).click();
  const download = await downloading;
  const trace = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(trace.summary).toEqual(summary);
  expect(trace.entries.length).toBeGreaterThan(0);
  expect(trace.inputScrolls.length).toBeGreaterThan(0);
  expect(trace.inputScrolls.some((e: { kind: string }) => e.kind === 'updateScale')).toBe(true);
  const pageChange = trace.entries.find((e: { kind: string; page: number }) => e.kind === 'page-change' && e.page === 6);
  expect(pageChange.scroll.phase).toBe('after-input');
  expect(pageChange.scroll.lastInput).toBeDefined();
  expect(Number.isFinite(pageChange.scroll.topAfterGeometry)).toBe(true);
  expect(pageChange.scroll.stack).toBeTruthy();
  expect(trace.outsideScrollWrites.some((e: { operation: string }) => e.operation === 'scrollTop')).toBe(true);
  expect(await page.evaluate(() => {
    const s = (window as any).__t65ScrollMethods;
    return s.container.scrollTo === s.scrollTo && s.container.scrollBy === s.scrollBy &&
      Object.getOwnPropertyDescriptor(s.container, 'scrollTop') === s.ownTop && Object.getOwnPropertyDescriptor(s.container, 'scrollLeft') === s.ownLeft;
  })).toBe(true);
  const supportsSingleScroll = await page.evaluate(() => typeof (window as any).__ngxApp.pdfViewer.singleScrollDuringPinch === 'boolean');
  await panel.getByRole('button', { name: 'Pinch scroll lock: default', exact: true }).click();
  if (supportsScrollLock) {
    await expect(panel.getByRole('button', { name: 'Pinch scroll lock: off', exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as any).__ngxApp.pdfViewer.touchPinchScrollLock)).toBe(false);
    await page.evaluate(() => { (window as any).__t65ScrollLockViewer = (window as any).__ngxApp.pdfViewer; });
  } else {
    await expect(panel.getByRole('status')).toContainText('requires the newer viewer bundle');
  }
  await panel.getByRole('button', { name: 'Single scroll: off' }).click();
  if (supportsSingleScroll) {
    await expect(panel.getByRole('button', { name: 'Single scroll: on' })).toBeVisible();
    expect(await page.evaluate(() => (window as any).__ngxApp.pdfViewer.singleScrollDuringPinch)).toBe(true);
    await page.evaluate(() => { (window as any).__t65ExperimentViewer = (window as any).__ngxApp.pdfViewer; });
  } else {
    await expect(panel.getByRole('status')).toContainText('requires the newer viewer bundle');
  }
  // Start another recording, then navigate through Angular: removes the panel
  // and its touch/render listeners and cancels its automatic-stop timer.
  await panel.getByRole('button', { name: 'Record', exact: true }).click();
  await page.evaluate(() => {
    const target = (window as any).__ngxApp.pdfViewer.container;
    const pair = [0, 1].map(identifier => ({ identifier, target, clientX: 400 + identifier * 200, clientY: 700, screenX: 400 + identifier * 200, screenY: 700 }));
    const event = new Event('touchstart', { bubbles: true, cancelable: true });
    Object.defineProperties(event, { touches: { value: pair }, targetTouches: { value: pair }, changedTouches: { value: pair } });
    target.dispatchEvent(event);
  });
  await page.locator('a[href="/extended-pdf-viewer/two-way-binding"]').first().click({ force: true });
  await expect(page.locator('app-two-way-binding')).toBeAttached();
  await expect(page.locator('#pinch-diagnostics')).toHaveCount(0);
  expect(await page.evaluate(() => {
    const viewer = (window as any).__t65StyledViewer as HTMLElement;
    return ['transform', '-webkit-backface-visibility', 'backface-visibility'].map(property => ({
      property, value: viewer.style.getPropertyValue(property), priority: viewer.style.getPropertyPriority(property),
    }));
  })).toEqual(original3d);
  if (supportsSingleScroll) expect(await page.evaluate(() => (window as any).__t65ExperimentViewer.singleScrollDuringPinch)).toBe(false);
  if (supportsScrollLock) expect(await page.evaluate(() => (window as any).__t65ScrollLockViewer.touchPinchScrollLock)).toBe(true);
  expect(await page.evaluate(() => {
    const saved = (window as any).__t65InputMethods;
    return saved.viewer.updateScale === saved.updateScale && saved.viewer.panBy === saved.panBy;
  })).toBe(true);
  expect(await page.evaluate(() => {
    const s = (window as any).__t65ScrollMethods;
    return s.container.style.getPropertyValue('overflow') === s.overflow && s.container.scrollTo === s.scrollTo && s.container.scrollBy === s.scrollBy &&
      Object.getOwnPropertyDescriptor(s.container, 'scrollTop') === s.ownTop && Object.getOwnPropertyDescriptor(s.container, 'scrollLeft') === s.ownLeft;
  })).toBe(true);
});
