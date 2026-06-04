import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /events and /pages-loaded both route to PagesLoadedComponent. The
// demo wires every public output of <ngx-extended-pdf-viewer> to an
// onEvent() handler that appends a formatted line into a visible
// `.messages` panel. The pagesLoaded output uses its own handler with
// a "Loaded a document with N pages" formatter.

const PAGES_LOADED_ROUTES = [
  '/extended-pdf-viewer/events',
  '/extended-pdf-viewer/pages-loaded',
];

test.describe('T17 — /events + /pages-loaded message panel', () => {
  for (const path of PAGES_LOADED_ROUTES) {
    test(`${path} captures the document lifecycle events`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(path);
      await viewer.waitForFirstPageRender();

      const messages = page.locator('div.messages > div');

      // The pagesLoaded handler is special-cased to write
      //   "<hh:mm:ss> Loaded a document with <N> pages"
      // We assert *some* line matches with a positive page count.
      await expect
        .poll(async () => await messages.allInnerTexts(), {
          timeout: 15_000,
        })
        .toEqual(
          expect.arrayContaining([
            expect.stringMatching(/Loaded a document with [1-9]\d* pages/),
          ]),
        );

      // The generic onEvent() handler formats every other line as
      //   "<hh:mm:ss> <eventName> Event type: <ctor> Event: ..."
      // We assert the headline lifecycle events all surfaced.
      const all = (await messages.allInnerTexts()).join('\n');
      expect(all, 'pdfLoadingStarts must appear').toMatch(
        /\bpdfLoadingStarts\b/,
      );
      expect(all, 'pdfLoaded must appear').toMatch(/\bpdfLoaded\b/);
      expect(all, 'pageRendered must appear').toMatch(/\bpageRendered\b/);
    });

    test(`${path} appends a zoomChange line when the user zooms in`, async ({
      page,
    }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(path);
      await viewer.waitForFirstPageRender();

      const messages = page.locator('div.messages > div');

      // themes_de_la_Science-fiction.pdf is a single-page document
      // (the demo's [page]="9" gets clamped to 1), so the prev/next
      // toolbar buttons are disabled. Zoom controls remain enabled
      // and the demo subscribes to (zoomChange), giving us a
      // user-driven event that always fires.
      const countZoom = async () =>
        (await messages.allInnerTexts()).filter((t) =>
          /\bzoomChange\b/.test(t),
        ).length;

      // Let any zoomChange emitted during init settle before we take
      // the baseline; pdf.js can fire one when it picks the initial
      // page-fit zoom.
      await page.waitForTimeout(500);
      const before = await countZoom();

      await viewer.zoomIn();

      await expect
        .poll(countZoom, { timeout: 10_000 })
        .toBeGreaterThan(before);
    });
  }
});

// /loading-indicator uses a custom overlay (`.loading-overlay`) driven
// off a four-state signal. The demo deliberately delays loading by 2s
// so the overlay is observable. Eventually the overlay unmounts when
// status becomes 'loaded and rendered'.

test.describe('T17 — /loading-indicator overlay lifecycle', () => {
  const LOADING_INDICATOR = '/extended-pdf-viewer/loading-indicator';

  test('the custom overlay is shown with "Loading the PDF..." text', async ({
    page,
  }) => {
    await page.goto(LOADING_INDICATOR, { waitUntil: 'domcontentloaded' });

    const overlay = page.locator('.loading-overlay');
    await expect(overlay).toBeVisible({ timeout: 10_000 });
    await expect(overlay).toContainText(/Loading the PDF\.\.\./);
  });

  test('the overlay disappears once load + render complete', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(LOADING_INDICATOR);
    await viewer.waitForFirstPageRender(60_000);

    // After the first page renders the demo schedules a 1s timeout
    // that flips status to 'loaded and rendered'; the overlay then
    // unmounts via the @if(showLoadingIndicator() || hasError()) gate.
    await expect(page.locator('.loading-overlay')).toHaveCount(0, {
      timeout: 15_000,
    });
  });
});

// /file-info renders a metadata table populated from
// PdfDocumentPropertiesExtractor after the (pagesLoaded) event fires.

test.describe('T17 — /file-info metadata table', () => {
  const FILE_INFO = '/extended-pdf-viewer/file-info';

  const EXPECTED_KEYS = [
    'author',
    'creationDate',
    'creator',
    'keywords',
    'linearized',
    'maybeFileSize',
    'modificationDate',
    'pdfFormatVersion',
    'producer',
    'subject',
    'title',
  ];

  test('every documented metadata field appears with a value', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FILE_INFO);
    await viewer.waitForFirstPageRender();

    // The metadata table is gated behind `@if (fileInfo)` — wait for
    // it to populate by polling on the key-bearing rows.
    await expect
      .poll(
        async () =>
          await page
            .locator('table tr td:first-child')
            .allInnerTexts(),
        { timeout: 15_000 },
      )
      .toEqual(expect.arrayContaining(EXPECTED_KEYS));

    const rows = await page.evaluate(() => {
      const out: Record<string, string> = {};
      document.querySelectorAll('table tr').forEach((tr) => {
        const tds = tr.querySelectorAll('td');
        if (tds.length === 2) {
          out[(tds[0].textContent ?? '').trim()] = (
            tds[1].textContent ?? ''
          ).trim();
        }
      });
      return out;
    });

    expect(rows['pdfFormatVersion']).toMatch(/^\d+\.\d+$/);
    expect(rows['producer']).not.toBe('');
    expect(rows['linearized']).toMatch(/^(true|false)$/);
  });
});

// /filtering-console-log overrides ngxConsoleFilter to capture the
// PDF.js version log line, suppress it, and re-render it into the
// explanatory column as `<p><i>{{ version }}</i></p>`.

test.describe('T17 — /filtering-console-log captured version', () => {
  const FILTERING = '/extended-pdf-viewer/filtering-console-log';

  test('the filter captures the PDF.js version line and displays it', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FILTERING);
    await viewer.waitForFirstPageRender();

    // The captured-version paragraph is the only `<p><i>` whose text
    // contains "PDF.js". The fallback placeholder paragraph reads
    // "(Since version 21.0, this demo requires you to reload the
    // page...)" and would fail this assertion.
    const versionItalic = page
      .locator('p > i', { hasText: /PDF\.js/ })
      .first();
    await expect(versionItalic).toBeVisible({ timeout: 15_000 });
    await expect(versionItalic).toContainText(
      /PDF\.js:\s+\d+\.\d+\.\d+/,
    );
  });
});
