import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /keyboard demonstrates three keyboard-control inputs:
//   [ignoreKeyboard]  — disable all keyboard shortcuts
//   [ignoreKeys]      — block specific keys (default ['j', 'k', 'F4'])
//   [acceptKeys]      — allow-list mode (default [], i.e. inactive)
//
// pdf.js binds both 'n' and 'j' to "next page" (web/app.js: case 74,
// case 78 → turnPage = 1). The demo's default ignoreKeys filters 'j'
// but lets 'n' through, so we get a clean A/B in a single page load:
// 'n' must advance, 'j' must not. We then flip ignoreKeyboard via
// the demo's checkbox and verify 'n' is suppressed too.

const KEYBOARD = '/extended-pdf-viewer/keyboard';

test.describe('T24 — /keyboard demo enforces ignoreKeys and ignoreKeyboard', () => {
  test('default ignoreKeys=[j,k,F4] blocks j but allows n; ignoreKeyboard=true blocks n', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(KEYBOARD);
    await viewer.waitForFirstPageRender();

    // Demo sets [page]="2" — wait for the viewer to actually land
    // there before sniffing keyboard behaviour.
    await viewer.waitForPageRender(2);
    await viewer.expectViewportOnPage(2);

    // Focus the viewer container so pdf.js's keyboard handlers see
    // the keypress. Without focus, neither 'n' nor 'j' would advance,
    // and the test would falsely "prove" ignoreKeys.
    await viewer.viewerContainer.click();

    // 'n' is NOT in the default ignoreKeys list — it must advance.
    await page.keyboard.press('n');
    await viewer.expectViewportOnPage(3);

    // 'j' IS in the default ignoreKeys list — it must NOT advance.
    // Capture the current page first; if 'j' leaked through, the
    // viewport would move to page 4.
    await page.keyboard.press('j');
    // Give pdf.js a beat to apply any (rejected) page turn.
    await page.waitForTimeout(500);
    await viewer.expectViewportOnPage(3);

    // Switch to the "demo" sub-tab so the ignoreKeyboard checkbox
    // becomes interactive (it lives inside the demo-tab content —
    // tab label is lowercase 'demo'). getByRole trims whitespace
    // around button text content, which a plain locator does not.
    await page.getByRole('button', { name: 'demo', exact: true }).click();

    const ignoreKeyboardCheckbox = page
      .locator('label', { hasText: 'ignoreKeyboard' })
      .locator('input[type="checkbox"]')
      .first();
    await ignoreKeyboardCheckbox.check();

    // Re-focus the viewer (clicking the tab moved focus away).
    await viewer.viewerContainer.click();

    // Now 'n' must also be ignored — ignoreKeyboard=true wins over
    // every other allow/block list.
    await page.keyboard.press('n');
    await page.waitForTimeout(500);
    await viewer.expectViewportOnPage(3);
  });
});
