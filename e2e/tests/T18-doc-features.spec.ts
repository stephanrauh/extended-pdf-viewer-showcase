import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /i18n initialises with language='nl-BE' and switches via a Dutch
// fallback locale ('nl'). Selecting de-DE rebuilds the viewer with a
// different Fluent locale; the per-button label changes from
// "Vorige" / "Inzoomen" to "Zurück" / "Vergrößern".

test.describe('T18 — /i18n locale switch updates toolbar labels', () => {
  const I18N = '/extended-pdf-viewer/i18n';

  // pdf-shy-button renders a single <button data-l10n-id="…">
  // (no inner label span). Fluent applies the locale's `.title`
  // attribute onto the button — so the `title=` value IS the
  // localised text once translation has loaded. The lib seeds the
  // attribute with "Previous Page" / "Zoom In" so we can poll until
  // it changes.
  const readButtonTitle = async (
    page: import('@playwright/test').Page,
    primaryId: string,
  ): Promise<string> =>
    (await page.locator(`#${primaryId}`).getAttribute('title')) ?? '';

  test('switching from nl-BE to de-DE retranslates the toolbar buttons', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(I18N);
    await viewer.waitForFirstPageRender();

    // Wait for Fluent to apply the initial nl-BE → nl translation.
    // nl/viewer.ftl: pdfjs-previous-button → .title = "Vorige pagina"
    await expect
      .poll(
        async () => await readButtonTitle(page, 'primaryPrevious'),
        { timeout: 15_000 },
      )
      .toMatch(/Vorige pagina/);

    expect(await readButtonTitle(page, 'primaryZoomIn')).toMatch(
      /Inzoomen/,
    );

    // The demo unmounts the viewer for one frame on language change
    // (hidePdfViewer toggle), then re-mounts with the new [language].
    const languageSelect = page
      .locator('select')
      .filter({ has: page.locator('option[value="de-DE"]') })
      .first();
    await languageSelect.selectOption('de-DE');

    // Wait for the viewer to reappear and German titles to apply.
    // de/viewer.ftl: pdfjs-previous-button → .title = "Eine Seite zurück"
    await viewer.waitForFirstPageRender();
    await expect
      .poll(
        async () => await readButtonTitle(page, 'primaryPrevious'),
        { timeout: 15_000 },
      )
      .toMatch(/Eine Seite zurück/);

    expect(await readButtonTitle(page, 'primaryZoomIn')).toMatch(
      /Vergrößern/,
    );
  });
});

// /prerendering opens at page 17 with a custom (pageRendered) handler
// that pushes pages [page-2 … page+2] into the render queue when
// spreadMode is 'off' (the default). Page 15 — two pages BEFORE the
// current page — is a strong probe: pdf.js's natural rendering
// queue prioritises pages ahead, so a painted canvas behind the
// viewport implies the custom backward prerender ran.

test.describe('T18 — /prerendering paints pages around the viewport', () => {
  const PRERENDERING = '/extended-pdf-viewer/prerendering';

  test('page 15 (2 pages behind the current page) is prerendered', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(PRERENDERING);
    await viewer.waitForPageRender(17);

    // The recursive setTimeout chain in onPageRendered may take a
    // while to drain the entire range; allow generous time.
    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const canvas = document.querySelector<HTMLCanvasElement>(
              '.page[data-page-number="15"] canvas',
            );
            return canvas ? canvas.width > 0 && canvas.height > 0 : false;
          }),
        { timeout: 30_000 },
      )
      .toBe(true);
  });
});

// /perfect-scrollbar wraps the viewer in an <ng-scrollbar>
// from ngx-scrollbar. The element only mounts after the demo's
// (pagesLoaded) handler flips pdfReady=true.

test.describe('T18 — /perfect-scrollbar mounts the third-party scrollbar', () => {
  const PERFECT = '/extended-pdf-viewer/perfect-scrollbar';

  test('an <ng-scrollbar> appears once the PDF has loaded', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(PERFECT);
    await viewer.waitForFirstPageRender();

    // The custom element materialises after pagesLoaded; the demo
    // waits a single requestAnimationFrame before setting pdfReady.
    const scrollbar = page.locator('ng-scrollbar');
    await expect(scrollbar).toHaveCount(1, { timeout: 15_000 });

    // Sanity check: the static attributes pdfReady gives us are
    // visible. [externalViewport] / [externalContentWrapper] are
    // Angular property bindings and never reach the DOM as attrs,
    // so we read the ones that are templated as plain attributes.
    await expect(scrollbar).toHaveAttribute('track', 'vertical');
    await expect(scrollbar).toHaveAttribute('visibility', 'hover');
  });
});
