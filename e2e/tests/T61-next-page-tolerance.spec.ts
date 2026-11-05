import { PDFDocument, StandardFonts } from 'pdf-lib';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

// Tiny pages leave the following page fully visible. If the current page is
// clipped by a rounding pixel, selecting the most visible page used to make
// the next navigation skip it. Cover both infinite-scroll viewport producers.
test.describe('T61 — next page with nearly fully visible pages', () => {
  test.skip(!usingBleedingEdge, 'The clipping tolerance is in the bleeding-edge engine');
  test.use({ viewport: { width: 900, height: 600 } });

  let pdf: Buffer;
  test.beforeAll(async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (let i = 1; i <= 12; i++) {
      doc.addPage([300, 300]).drawText(`Page ${i}`, { x: 30, y: 150, size: 30, font });
    }
    pdf = Buffer.from(await doc.save());
  });

  for (const layout of ['normal', 'outer-container', 'window'] as const) {
    for (const clippedPixels of [1, 2, 10]) {
      test(`${layout}: ${clippedPixels}px clipping selects the expected page`, async ({ page }) => {
        await page.route('**/generated/next-page-tolerance.pdf', (route) =>
          route.fulfill({ body: pdf, contentType: 'application/pdf' }),
        );
        const viewer = new PdfViewerPage(page);
        const mode = layout === 'normal' ? 'multiple' : 'infinite-scroll';
        await viewer.goto(`/e2e/viewer?src=/generated/next-page-tolerance.pdf&zoom=25&pageViewMode=${mode}&height=300px`);
        await viewer.waitForFirstPageRender();
        await expect.poll(() => page.evaluate(() => (window as any).__ngxApp.pdfViewer._pages.length)).toBe(12);

        await page.evaluate((layout) => {
          const v = (window as any).__ngxApp.pdfViewer;
          if (layout === 'normal') {
            v.currentPageNumber = 3;
            return;
          }
          const host = document.querySelector<HTMLElement>('ngx-extended-pdf-viewer')!;
          // Give the viewer a predictable viewport independently of the
          // showcase's navigation and its own <main> scrolling container.
          const fixture = document.createElement('div');
          fixture.id = 'navigation-scroll-fixture';
          fixture.style.cssText = 'width:600px; margin:0; padding:0; border:0;';
          if (layout === 'outer-container') {
            fixture.style.cssText += 'height:300px; overflow:auto; position:relative; margin-top:100px;';
          } else if (layout === 'window') {
            fixture.style.paddingTop = '100px';
          }
          document.body.append(fixture);
          fixture.append(host);
          for (const sibling of Array.from(document.body.children)) {
            if (sibling !== fixture && sibling instanceof HTMLElement) sibling.style.display = 'none';
          }
          document.body.style.cssText = 'margin:0; height:auto; overflow:visible;';
          document.documentElement.style.overflow = 'visible';
          host.style.width = '600px';
          // Moving the host changes the scrolling ancestor cached by the
          // engine. Switching modes asks it to discover the new ancestor.
          v.pageViewMode = 'multiple';
          v.pageViewMode = 'infinite-scroll';
          v.currentPageNumber = 3;
        }, layout);

        // Programmatic infinite-scroll navigation has a 500ms settling guard.
        // Exercise selection after it expires, so it cannot mask the bug.
        await page.waitForTimeout(650);
        const before = await page.evaluate(async ({ layout, clippedPixels }) => {
          const v = (window as any).__ngxApp.pdfViewer;
          const target = v._pages[2].div as HTMLElement;
          if (layout === 'normal') {
            v.container.scrollTop = target.offsetTop + target.clientTop + clippedPixels;
          } else {
            const rect = target.getBoundingClientRect();
            if (layout === 'window') {
              window.scrollBy(0, rect.top + clippedPixels);
            } else {
              const outer = document.getElementById('navigation-scroll-fixture')!;
              outer.scrollTop += rect.top - outer.getBoundingClientRect().top + clippedPixels;
            }
          }
          await new Promise(requestAnimationFrame);
          // Select the target without scrolling again or restarting the
          // navigation guard: update() must decide whether to retain it.
          await v._setCurrentPageNumber(3);
          v.update();
          const visible = v._getVisiblePages().views;
          return {
            selected: v.currentPageNumber,
            currentPercent: visible.find((p: any) => p.id === 3)?.percent,
            nextPercent: visible.find((p: any) => p.id === 4)?.percent,
            clipped: layout === 'normal'
              ? v.container.scrollTop - target.offsetTop - target.clientTop
              : (layout === 'window' ? 0 : document.getElementById('navigation-scroll-fixture')!.getBoundingClientRect().top)
                - target.getBoundingClientRect().top,
          };
        }, { layout, clippedPixels });

        expect(before.clipped, 'the page is actually clipped by the requested amount').toBeCloseTo(clippedPixels, 0);
        expect(before.currentPercent).toBeLessThan(100);
        expect(before.nextPercent, 'the next page is fully visible').toBe(100);
        const selected = clippedPixels <= 1 ? 3 : 4;
        expect(before.selected, JSON.stringify(before)).toBe(selected);

        // The 2px and 10px cases verify the selection cutoff. The rounding
        // case also covers the original Next/Previous navigation regression.
        if (clippedPixels === 1) {
          // Calling the viewer API avoids Playwright scrolling an offscreen
          // toolbar into view and changing the geometry under test.
          await page.evaluate(() => (window as any).__ngxApp.pdfViewer.nextPage());
          await page.waitForTimeout(650);
          await expect.poll(() => page.evaluate(() => (window as any).__ngxApp.pdfViewer.currentPageNumber)).toBe(selected + 1);
          await page.evaluate(() => (window as any).__ngxApp.pdfViewer.previousPage());
          await page.waitForTimeout(650);
          await expect.poll(() => page.evaluate(() => (window as any).__ngxApp.pdfViewer.currentPageNumber)).toBe(selected);
        }
      });
    }
  }
});
