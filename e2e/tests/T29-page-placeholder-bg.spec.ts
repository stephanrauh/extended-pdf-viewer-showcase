import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { applyThemeContext, ViewerTheme } from '../poms/theme-audit';

/**
 * T29 — the `--page-placeholder-background-color` CSS variable (#3226).
 *
 * `.pdfViewer .page` paints a placeholder background until its canvas has
 * rendered. It used to be hard-coded to the theme color, which flashes when you
 * scroll to an un-rendered page or switch the PDF source. #3226 exposed it as a
 * CSS variable so embedders can override it (e.g. `transparent`) to remove the
 * flash, while the per-theme default is preserved.
 *
 * The flash itself is a sub-frame transient that can't be observed reliably, so
 * this is a *wiring* guard, asserted on computed style (matching the suite's
 * screenshot-averse philosophy — see T28 / theme-audit.ts):
 *   1. with no override, `.page`'s background equals the theme default;
 *   2. an override on `ngx-extended-pdf-viewer` cascades to `.page` (the custom
 *      property inherits), so `transparent` and an arbitrary color both win.
 *
 * Engine-independent (compiled theme CSS + custom-property inheritance), so it
 * runs on every project rather than chromium-only.
 */

const SIMPLE = '/extended-pdf-viewer/simple';

/** The compiled per-theme default for `$page-background`, as a computed rgb(). */
const THEME_DEFAULT: Record<ViewerTheme, string> = {
  light: 'rgb(212, 212, 215)', // #d4d4d7
  dark: 'rgb(42, 42, 46)', // #2a2a2e
};

/** Computed `background-color` of the first `.page` placeholder. */
async function pageBackgroundColor(pdf: PdfViewerPage): Promise<string> {
  return pdf.page.evaluate(() => {
    const el = document.querySelector('ngx-extended-pdf-viewer .pdfViewer .page');
    return el ? getComputedStyle(el).backgroundColor : '';
  });
}

/** Set the override on the host element; the custom property inherits to `.page`. */
async function setPlaceholderOverride(
  pdf: PdfViewerPage,
  value: string,
): Promise<void> {
  await pdf.page.addStyleTag({
    content: `ngx-extended-pdf-viewer { --page-placeholder-background-color: ${value}; }`,
  });
}

test.describe('T29 page placeholder background (#3226)', () => {
  for (const viewer of ['light', 'dark'] as const) {
    test.describe(`viewer:${viewer}`, () => {
      test('defaults to the theme color, and the CSS variable overrides it', async ({
        page,
      }) => {
        const pdf = new PdfViewerPage(page);
        await applyThemeContext(page, { viewer, os: viewer });
        await pdf.goto(SIMPLE);
        await pdf.waitForFirstPageRender();
        await page
          .locator('ngx-extended-pdf-viewer .pdfViewer .page')
          .first()
          .waitFor({ state: 'attached' });

        await test.step('default equals the theme color', async () => {
          expect(await pageBackgroundColor(pdf)).toBe(THEME_DEFAULT[viewer]);
        });

        await test.step('transparent override removes the fill', async () => {
          await setPlaceholderOverride(pdf, 'transparent');
          await expect
            .poll(() => pageBackgroundColor(pdf))
            .toBe('rgba(0, 0, 0, 0)');
        });

        await test.step('an arbitrary color override is honored', async () => {
          await setPlaceholderOverride(pdf, 'rgb(10, 20, 30)');
          await expect
            .poll(() => pageBackgroundColor(pdf))
            .toBe('rgb(10, 20, 30)');
        });
      });
    });
  }
});
