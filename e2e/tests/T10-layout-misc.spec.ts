import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T10 — /theming', () => {
  test('switching to dark mode flips the html data-theme attribute', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/theming');
    await viewer.waitForFirstPageRender();

    // Button-label-only checks pass even if the visual theme stops
    // applying. Assert the actual attribute that drives the CSS.
    const htmlDataTheme = () =>
      page.evaluate(
        () => document.documentElement.getAttribute('data-theme') ?? '',
      );
    const before = await htmlDataTheme();
    await page.getByRole('button', { name: /Switch to dark mode/i }).click();

    await expect.poll(htmlDataTheme, { timeout: 5_000 }).not.toBe(before);
    expect(await htmlDataTheme()).toMatch(/dark/i);
  });
});

test.describe('T10 — /hiding-buttons', () => {
  test('"showFindButton" toggles the Find icon in the toolbar', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/hiding-buttons');
    await viewer.waitForFirstPageRender();

    // The demo defaults `showFindButton=false` so the icon starts hidden.
    const findButton = page.locator('#primaryViewFind');
    await expect(findButton).toBeHidden();

    await page.getByLabel(/showFindButton/i).first().check();
    await expect(findButton).toBeVisible({ timeout: 5_000 });

    await page.getByLabel(/showFindButton/i).first().uncheck();
    await expect(findButton).toBeHidden({ timeout: 5_000 });
  });
});

test.describe('T10 — /disable-buttons', () => {
  test('checking "All editors" disables every editor toolbar button', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/disable-buttons');
    await viewer.waitForFirstPageRender();

    // Every editor toolbar button — checking just one is too easy to
    // regress (the test passes if "All" only disables the highlight).
    const editorButtonIds = [
      '#primaryEditorHighlight',
      '#primaryEditorFreeText',
      '#primaryEditorInk',
      '#primaryEditorStamp',
      '#primaryEditorSignatureButton',
    ] as const;
    for (const id of editorButtonIds) {
      await expect(page.locator(id)).toBeEnabled();
    }

    await page.getByLabel(/All editors/i).check();

    for (const id of editorButtonIds) {
      await expect(page.locator(id)).toBeDisabled({ timeout: 5_000 });
    }
  });
});

test.describe('T10 — /contextmenu', () => {
  test('[contextMenuAllowed]="false" suppresses the native menu; toggle restores it', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/contextmenu');
    await viewer.waitForFirstPageRender();

    // Install a passive contextmenu observer on the viewer container.
    // We can't see the native browser menu from Playwright, so we check
    // the event's `defaultPrevented` flag — pdf.js calls preventDefault
    // when `[contextMenuAllowed]="false"`, and stops doing so once the
    // checkbox flips it true.
    await page.evaluate(() => {
      (window as any).__ctxPrevented = null;
      document.addEventListener(
        'contextmenu',
        (e) => ((window as any).__ctxPrevented = e.defaultPrevented),
        false,
      );
    });

    await viewer.viewerContainer.click({ button: 'right' });
    await expect
      .poll(
        async () => await page.evaluate(() => (window as any).__ctxPrevented),
        { timeout: 5_000 },
      )
      .toBe(true);

    // Flip the demo's toggle; the next right-click must reach the browser.
    await page.getByLabel(/allowContextMenu/).check();
    await page.evaluate(() => ((window as any).__ctxPrevented = null));
    await viewer.viewerContainer.click({ button: 'right' });
    await expect
      .poll(
        async () => await page.evaluate(() => (window as any).__ctxPrevented),
        { timeout: 5_000 },
      )
      .toBe(false);
  });
});

test.describe('T10 — /modify-page-order', () => {
  test('dragging thumbnail 2 to the top reorders page 1 to its content', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/modify-page-order');
    await viewer.waitForFirstPageRender();

    // Sidebar is set to visible by the demo (`[sidebarVisible]="true"`),
    // but pdf.js renders the thumbnail panel lazily once the document
    // loads. The ngx wrapper hosts thumbnails under `#thumbnailsView`
    // (plural) and pdf.js renders each as `<div class="thumbnail"
    // page-number="N">` — the attribute is `page-number`, NOT
    // `data-page-number`.
    const thumb1 = page.locator(
      '#thumbnailsView .thumbnail[page-number="1"]',
    );
    const thumb2 = page.locator(
      '#thumbnailsView .thumbnail[page-number="2"]',
    );
    await thumb1.waitFor({ state: 'attached', timeout: 30_000 });
    await thumb2.waitFor({ state: 'attached', timeout: 30_000 });

    // The demo ships without `[textLayer]="true"`, so the canvas pixel hash
    // is the identity signal: after the move, the first page must show
    // exactly what page 2 showed before, and the second page what page 1
    // showed - not merely "something different".
    await viewer.waitForPageRender(1);
    await viewer.waitForPageRender(2);
    await viewer.assertCanvasHasContent(1);
    await viewer.assertCanvasHasContent(2);
    const beforeHash = await viewer.hashCanvas(1);
    const page2Hash = await viewer.hashCanvas(2);
    expect(beforeHash).not.toBe('');
    expect(page2Hash, 'pages 1 and 2 must look different for this test to mean anything').not.toBe(beforeHash);

    // pdf.js's thumbnail reordering uses `mousedown`-based dragging
    // (the thumbnail element has `draggable=false`), so Playwright's
    // HTML5 `dragTo` doesn't trigger it. Drive the mouse manually:
    // hover → mousedown → small movements → mouseup, with movement
    // gradual enough to trigger the dragstart threshold.
    const b1 = await thumb1.boundingBox();
    const b2 = await thumb2.boundingBox();
    expect(b1).not.toBeNull();
    expect(b2).not.toBeNull();
    const sourceX = b2!.x + b2!.width / 2;
    const sourceY = b2!.y + b2!.height / 2;
    const targetX = b1!.x + b1!.width / 2;
    const targetY = b1!.y + 5;
    await page.mouse.move(sourceX, sourceY);
    await page.mouse.down();
    await page.mouse.move(sourceX, sourceY - 10, { steps: 5 });
    await page.mouse.move(targetX, targetY, { steps: 25 });
    await page.mouse.up();

    await expect
      .poll(async () => await viewer.hashCanvas(1), { timeout: 15_000 })
      .toBe(page2Hash);
    await expect
      .poll(async () => await viewer.hashCanvas(2), { timeout: 15_000 })
      .toBe(beforeHash);
  });
});

test.describe('T10 — /layers', () => {
  test('toggling an optional content layer re-renders the canvas pixels', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/layers');
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent();

    // Switch to the "Live Demo" tab where the per-layer toggle buttons
    // appear (populated by `listLayers()` after pagesLoaded).
    await page
      .getByRole('button', { name: 'Live Demo', exact: true })
      .click();

    const toggleButton = page.getByRole('button', { name: /^toggle / }).first();
    await toggleButton.waitFor({ state: 'attached', timeout: 30_000 });

    const visiblePage = await viewer.waitForCurrentPage();
    await viewer.assertCanvasHasContent(visiblePage);
    await viewer.snapshotCanvas('before', visiblePage);

    await toggleButton.click();

    // Toggling a layer must change the visible pixels — render-only checks
    // would pass when toggleLayer silently no-ops.
    await expect
      .poll(async () => await viewer.countChangedPixels('before', visiblePage), { timeout: 15_000 })
      .toBeGreaterThan(5_000);
    const layerSize = await viewer.countChangedPixels('before', visiblePage);

    // Toggling it back restores the original rendering (up to anti-aliasing
    // noise) - so the change above was that layer, not an unrelated re-render.
    await toggleButton.click();
    await expect
      .poll(async () => await viewer.countChangedPixels('before', visiblePage), { timeout: 15_000 })
      .toBeLessThan(layerSize / 100);
  });
});
