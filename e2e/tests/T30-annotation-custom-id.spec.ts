import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T30 — the stable `customId` round-trip (#3225).
 *
 * #3076 gave every serialized annotation a temporary `id`
 * (`pdfjs_internal_editor_N`) that pdf.js regenerates each session. #3225 adds
 * a developer-owned `customId` that, unlike `id`, survives the
 * getSerializedAnnotations() → store → addEditorAnnotation() round-trip.
 *
 * Pure-Angular unit tests can't prove this: the honoring happens in the
 * compiled engine (mypdf.js `editor.js` deserialize + `pdf_viewer.js`
 * getSerializedAnnotations). So this drives the real engine through the
 * export-annotations demo, whose "live demo" textarea editing performs a
 * genuine remove-all + re-add (see ExportAnnotationsComponent.updateAnnotation):
 *
 *   1. add a text annotation and export it → no customId yet;
 *   2. inject a customId into the textarea (triggers the re-add);
 *   3. export AGAIN — a fresh getSerializedAnnotations() — and assert the
 *      customId came back, while the temporary `id` is still present too.
 *
 * Step 3 is the real test: it reads the model back out of the engine, so the
 * customId can only be there if deserialize honored it AND the export emitted
 * it. Without #3225 the second export would drop the customId and this fails.
 */
test.describe.configure({ mode: 'parallel' });

const ROUTE = '/extended-pdf-viewer/export-annotations';
const CUSTOM_ID = 'e2e-custom-id-9f3a';

async function gotoExportRoute(page: PdfViewerPage['page']): Promise<PdfViewerPage> {
  // The bleeding-edge build is selected globally by the seedStorage fixture
  // (see fixtures.ts) whenever mypdf.js is on the bleeding-edge branch; this
  // test is skipped otherwise, so no per-test seeding is needed here.
  const viewer = new PdfViewerPage(page);
  await viewer.goto(ROUTE);
  await viewer.waitForFirstPageRender();
  await viewer.waitForPageRender(1);
  return viewer;
}

/** Click "Export annotations" and return the JSON shown in the first textarea. */
async function exportFirstAnnotation(page: PdfViewerPage['page']): Promise<string> {
  await page
    .getByRole('button', { name: 'Export annotations', exact: true })
    .click();
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 10_000 });
  return textarea.inputValue();
}

test.describe('T30 — annotation customId round-trip (#3225)', () => {
  test('a developer-supplied customId survives save → restore, the temporary id does not', async ({
    page,
  }) => {
    const viewer = await gotoExportRoute(page);

    // 1. Add a text annotation and export it. It has a temporary `id` but no customId.
    await page
      .getByRole('button', { name: 'Add text editor', exact: true })
      .click();
    const initialJson = await exportFirstAnnotation(viewer.page);
    const initial = JSON.parse(initialJson);

    expect(initial.id, 'a temporary id is assigned').toBeTruthy();
    expect(initial.customId, 'no customId before we set one').toBeUndefined();

    // 2. Inject our own customId into the textarea. The (change) handler removes
    //    every editor and re-adds them from the edited JSON — a real round-trip
    //    through the engine's deserialize path.
    const edited = { ...initial, customId: CUSTOM_ID };
    const textarea = viewer.page.locator('textarea').first();
    await textarea.fill(JSON.stringify(edited));
    await textarea.dispatchEvent('change');

    // Wait for the remove-all + re-add to settle: the editor reappears on the
    // editor layer once the annotation has been deserialized back in.
    const editorLayerItems = viewer.page.locator(
      '.page[data-page-number="1"] .annotationEditorLayer > *',
    );
    await expect.poll(() => editorLayerItems.count(), { timeout: 10_000 }).toBeGreaterThan(0);

    // 3. Export again (a fresh getSerializedAnnotations) and assert the customId
    //    came back from the engine — it can only be there if deserialize honored
    //    it and the export re-emitted it.
    const restored = JSON.parse(await exportFirstAnnotation(viewer.page));
    expect(restored.customId, 'customId is preserved').toBe(CUSTOM_ID);
    expect(restored.id, 'a temporary id is still present alongside it').toBeTruthy();
    expect(
      restored.id,
      'the temporary id is regenerated, not equal to the stable customId',
    ).not.toBe(CUSTOM_ID);
  });

  // #3271: removeEditorAnnotations(filter) passed an object without the
  // customId to the filter, so a restored annotation couldn't be removed by
  // its stable id. The demo's button uses `serial => serial?.customId !== undefined`.
  test('removeEditorAnnotations can filter by customId after a restore (#3271)', async ({ page }) => {
    const viewer = await gotoExportRoute(page);
    const textEditors = viewer.page.locator('.page[data-page-number="1"] .freeTextEditor');

    // 1. A text annotation, restored with a customId (remove-all + re-add).
    await page.getByRole('button', { name: 'Add text editor', exact: true }).click();
    const initial = JSON.parse(await exportFirstAnnotation(viewer.page));
    const textarea = viewer.page.locator('textarea').first();
    await textarea.fill(JSON.stringify({ ...initial, customId: CUSTOM_ID }));
    await textarea.dispatchEvent('change');
    await expect(textEditors).toHaveCount(1, { timeout: 10_000 });

    // 2. A second text annotation without a customId.
    await page.getByRole('button', { name: 'Add text editor', exact: true }).click();
    await expect(textEditors).toHaveCount(2, { timeout: 10_000 });

    // 3. Remove by customId: only the restored annotation goes.
    await page.getByRole('button', { name: 'Remove annotations with a customId', exact: true }).click();
    await expect(textEditors).toHaveCount(1, { timeout: 10_000 });

    const remaining = JSON.parse(await exportFirstAnnotation(viewer.page));
    expect(remaining.customId, 'the annotation without a customId is kept').toBeUndefined();
  });

  // The demo must work on its own, using only its buttons: before, none of the
  // "Add" buttons set a customId, so "Remove annotations with a customId" did nothing.
  test('the demo buttons add an annotation with a customId and remove it again (#3271)', async ({ page }) => {
    const viewer = await gotoExportRoute(page);
    const textEditors = viewer.page.locator('.page[data-page-number="1"] .freeTextEditor');

    await page.getByRole('button', { name: 'Add text editor', exact: true }).click();
    await expect(textEditors).toHaveCount(1, { timeout: 10_000 });
    await page.getByRole('button', { name: 'Add text editor with a customId', exact: true }).click();
    await expect(textEditors).toHaveCount(2, { timeout: 10_000 });

    await page.getByRole('button', { name: 'Remove annotations with a customId', exact: true }).click();
    await expect(textEditors).toHaveCount(1, { timeout: 10_000 });
    const remaining = JSON.parse(await exportFirstAnnotation(viewer.page));
    expect(remaining.customId, 'the annotation without a customId is kept').toBeUndefined();
    expect(remaining.value).toBe('Hello world!');
  });
});
