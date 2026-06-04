import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /signatures loads unverified-signature.pdf with
// [showUnverifiedSignatures]="showSignature". The demo defaults to
// showSignature=true and constructs with enableSignatureEditor=true,
// so the unverified-signature warning bar and the signature editor
// toolbar button should both be present.

const SIGNATURES = '/extended-pdf-viewer/signatures';

test.describe('T19 — /signatures unverified-signature warning bar', () => {
  test('the warning bar is rendered when showUnverifiedSignatures is true', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIGNATURES);
    await viewer.waitForFirstPageRender();

    // The warning div is conditionally rendered inside the lib's
    // template as `<div class="unverified-signature-warning">…</div>`.
    const warning = page.locator('.unverified-signature-warning');
    await expect(warning).toHaveCount(1, { timeout: 15_000 });
    await expect(warning).toBeVisible();
    // The fluent translation is async; assert on the English fallback
    // baked into the template (substring is stable across locales).
    await expect(warning).toContainText(/signature/i);
  });

  test('unchecking "show signature" remounts the viewer without the warning', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIGNATURES);
    await viewer.waitForFirstPageRender();
    await expect(page.locator('.unverified-signature-warning')).toHaveCount(
      1,
      { timeout: 15_000 },
    );

    // The demo's checkbox setter toggles showPdf=false then back to
    // true via a 100ms setTimeout — the viewer unmounts and remounts
    // with the new [showUnverifiedSignatures] binding.
    const checkbox = page
      .locator('label')
      .filter({ hasText: /^show signature$/ })
      .locator('input[type="checkbox"]')
      .first();
    await checkbox.uncheck();

    await viewer.waitForFirstPageRender();
    await expect(page.locator('.unverified-signature-warning')).toHaveCount(
      0,
      { timeout: 15_000 },
    );
  });
});

test.describe('T19 — /signatures signature editor toolbar button', () => {
  test('the signature editor button is rendered when enableSignatureEditor=true', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(SIGNATURES);
    await viewer.waitForFirstPageRender();

    // pdfDefaultOptions.enableSignatureEditor is flipped on in the
    // demo's constructor, so the toolbar should expose
    // #primaryEditorSignatureButton (see PdfViewerPage.EDITOR_MODE_IDS).
    await expect(
      page.locator('#primaryEditorSignatureButton'),
    ).toBeVisible({ timeout: 15_000 });
  });
});
