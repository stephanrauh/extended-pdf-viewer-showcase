import { PDFDocument } from 'pdf-lib';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T63 — navigating to a page which the viewer cuts off scrolls to it.
 *
 * pdf.js's `scrollIntoView` skips scrolling when the page is already visible. That check used
 * the browser window: in a viewer which doesn't fill the window, a page cut off by the viewer's
 * top edge can still be completely inside the window, so going to it did nothing.
 */

test('a page cut off by an embedded viewer is scrolled into view', async ({ page }) => {
  const doc = await PDFDocument.create();
  for (let i = 0; i < 10; i++) doc.addPage([612, 792]);
  const body = Buffer.from(await doc.save());
  await page.route('**/generated/t63.pdf', (route) => route.fulfill({ body, contentType: 'application/pdf' }));

  const viewer = new PdfViewerPage(page);
  await viewer.goto('/e2e/viewer?src=/generated/t63.pdf&zoom=50&height=600px');
  await viewer.waitForPageRender(1);
  await page.waitForFunction(() => (window as any).__ngxEvents?.some((e: { name: string }) => e.name === 'pagesLoaded'));

  const result = await page.evaluate(async () => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const host = document.querySelector('ngx-extended-pdf-viewer') as HTMLElement;
    host.style.display = 'block';
    host.style.marginTop = '200px';
    await delay(500);
    const v = (window as any).__ngxApp.pdfViewer;
    const container = v.container as HTMLElement;
    const div = v._pages[2].div as HTMLElement;
    const offset = () => div.getBoundingClientRect().top - container.getBoundingClientRect().top;
    // page 3's top edge 40 px above the viewer's top edge
    container.scrollTop += offset() + 40;
    await delay(300);
    const before = { offset: offset(), topInWindow: div.getBoundingClientRect().top };
    v.scrollPageIntoView({ pageNumber: 3 });
    await delay(300);
    return { before, after: offset() };
  });

  // the precondition: cut off by the viewer, but inside the window
  expect(result.before.offset).toBeCloseTo(-40, 0);
  expect(result.before.topInWindow).toBeGreaterThan(0);
  // the page border (9 px) sits above the viewer's edge, as after any page navigation
  expect(result.after).toBeGreaterThan(-12);
  expect(result.after).toBeLessThanOrEqual(1);
});
