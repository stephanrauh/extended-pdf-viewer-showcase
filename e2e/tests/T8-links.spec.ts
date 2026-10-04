import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

// The /forms, /scripting and /file-info tests that used to live here were
// removed: they re-checked what T16 (form binding in both directions), T25
// (scripting on/off) and T17 (the metadata table) verify more precisely.

test.describe.configure({ mode: 'parallel' });

test.describe('T8 — /links', () => {
  // blind-text-collection.pdf: one page with four external links.
  const EXPECTED_LINKS = [
    'https://www.lipsum.com/',
    'http://www.texample.net/tikz/examples/text-shape/',
    'https://www.blindtextgenerator.com/lorem-ipsum',
    'https://www.blindtextgenerator.com/lorem-ipsum',
  ];

  test('every link annotation of the PDF becomes a link to its URL', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/links');
    await viewer.waitForFirstPageRender();

    const anchors = page.locator('ngx-extended-pdf-viewer .annotationLayer .linkAnnotation > a');
    await expect(anchors).toHaveCount(EXPECTED_LINKS.length, { timeout: 20_000 });
    expect(await anchors.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual(EXPECTED_LINKS);
    // Each link sits on top of its text: it has a real area on the page.
    for (const box of await anchors.evaluateAll((as) => as.map((a) => a.getBoundingClientRect().toJSON()))) {
      expect(box.width).toBeGreaterThan(5);
      expect(box.height).toBeGreaterThan(5);
    }
  });

  test('clicking a link opens its URL in a new tab', async ({ page, context }) => {
    // Answer the request locally: the test must not depend on a third-party site.
    await context.route('https://www.lipsum.com/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>lipsum stub</title>' }),
    );
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/links');
    await viewer.waitForFirstPageRender();

    const link = page.locator('ngx-extended-pdf-viewer .annotationLayer a[href="https://www.lipsum.com/"]');
    const newTab = context.waitForEvent('page', { timeout: 15_000 });
    await link.click();
    const tab = await newTab;
    await tab.waitForLoadState();
    expect(tab.url()).toBe('https://www.lipsum.com/');
    // The viewer stays where it was.
    expect(page.url()).toContain('/extended-pdf-viewer/links');
  });
});
