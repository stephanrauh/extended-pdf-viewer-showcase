import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import {
  THEME_COMBOS,
  applyThemeContext,
  comboLabel,
  expectReadable,
  expectThemeDirection,
} from '../poms/theme-audit';

/**
 * T28 — theming across the OS color scheme × the viewer theme (#3219).
 *
 * The library must look right for all four combinations of {OS light/dark} ×
 * {viewer light/dark}. The regression in #3219 was the outline sidebar turning
 * white-on-white when the OS was dark and the viewer theme light.
 *
 * Each test pins both inputs (OS via emulated `prefers-color-scheme`, viewer via
 * the showcase ThemeService's localStorage key), opens a UI surface, and checks:
 *   - **readability**: every visible label/icon has ≥ 3:1 contrast against its
 *     real background (`expectReadable`);
 *   - **theme direction**: panels are dark in the dark theme / light in the
 *     light theme regardless of the OS (`expectThemeDirection`).
 * Assertions are soft, so one test run reports every offending surface at once.
 *
 * Scope: chromium only. `light-dark()` resolution is engine-independent for our
 * purposes, and WebKit's color-scheme emulation would only add noise.
 *
 * /simple is the canonical route: its PDF ("The Public Domain") ships a rich
 * outline, so it exercises the exact #3219 surface plus the whole viewer chrome.
 */

const SIMPLE = '/extended-pdf-viewer/simple';
const PASSWORDS = '/extended-pdf-viewer/passwords';

test.describe('T28 theming — OS × viewer theme', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'theme CSS resolution is engine-independent; audited on chromium only',
  );
  test.describe.configure({ mode: 'parallel' });

  for (const combo of THEME_COMBOS) {
    test.describe(comboLabel(combo), () => {
      test('viewer chrome is readable and follows the viewer theme', async ({
        page,
      }) => {
        const pdf = new PdfViewerPage(page);
        await applyThemeContext(page, combo);
        await pdf.goto(SIMPLE);
        await pdf.waitForFirstPageRender();

        await test.step('main toolbar', async () => {
          await expectThemeDirection(
            page,
            '#toolbarContainer',
            combo.viewer,
            'main toolbar',
          );
          await expectReadable(page, '#toolbarViewer', 'main toolbar');
        });

        await test.step('views-manager panel + outline tree', async () => {
          // The /simple PDF auto-opens the views manager (PageMode=UseOutlines),
          // so only toggle when it's actually closed — otherwise we'd close it.
          if (!(await pdf.isSidebarOpen())) {
            await pdf.toggleSidebar();
          }
          await expect
            .poll(() => pdf.isSidebarOpen(), { timeout: 5_000 })
            .toBe(true);
          await page.locator('#viewsManager').waitFor({ state: 'visible' });
          await expectThemeDirection(
            page,
            '#viewsManager',
            combo.viewer,
            'sidebar panel',
          );

          // Switch to the outline view — the exact #3219 surface. ngx renders
          // its own sidebar view buttons (#viewOutline), replacing pdf.js's
          // views-manager selector (which is an invisible dummy in this build).
          await page.locator('#viewOutline').click();
          await page
            .locator('#outlinesView .treeItem a')
            .first()
            .waitFor({ state: 'visible' });
          await expectReadable(page, '#viewsManager', 'sidebar + outline');
        });

        await test.step('secondary (Tools) menu', async () => {
          await pdf.openSecondaryToolbar();
          await expectThemeDirection(
            page,
            '#secondaryToolbar',
            combo.viewer,
            'secondary menu',
          );
          await expectReadable(page, '#secondaryToolbar', 'secondary menu');
        });

        await test.step('document properties dialog', async () => {
          await pdf.openSecondaryToolbar();
          await expect(page.locator('#secondaryToolbar')).toBeVisible();
          // The secondary toolbar renders title-based buttons (not the #id of
          // the hidden primary shy-button), so target it by its title.
          await page
            .locator('#secondaryToolbar')
            .getByTitle(/Document Properties/)
            .click();
          const dialog = page.locator('#documentPropertiesDialog');
          await dialog.waitFor({ state: 'visible' });
          await expectReadable(
            page,
            '#documentPropertiesDialog',
            'document properties dialog',
          );
          await page.keyboard.press('Escape');
        });

        await test.step('find bar', async () => {
          await pdf.openFindBar();
          await expectThemeDirection(page, '#findbar', combo.viewer, 'find bar');
          await expectReadable(page, '#findbar', 'find bar');
          await page.keyboard.press('Escape');
        });

        await test.step('editor toolbars', async () => {
          const editors = [
            ['highlight', '#editorHighlightParamsToolbar'],
            ['draw', '#editorInkParamsToolbar'],
            ['text', '#editorFreeTextParamsToolbar'],
            ['stamp', '#editorStampParamsToolbar'],
          ] as const;
          for (const [mode, paramsId] of editors) {
            await pdf.activateEditor(mode);
            const params = page.locator(paramsId);
            if (await params.isVisible().catch(() => false)) {
              await expectReadable(page, paramsId, `${mode} editor toolbar`);
            }
          }
        });

        await test.step('comments surfaces follow the viewer theme', async () => {
          // The comments sidebar, the add-comment dialog and comment popups are
          // styled with light-dark(); #3219 pins their color-scheme to the
          // viewer theme (they used to follow the OS → invisible text / a light
          // panel under the dark theme). Opening them needs fiddly multi-step
          // flows (place a comment, drag a highlight…), but the regression is a
          // CSS property and the underlying colors are light-dark() pairs, so we
          // assert the computed color-scheme directly — reliable even while the
          // surface is still hidden, and exactly what would have caught the bug.
          const schemes = await page.evaluate(() =>
            ['#editorCommentsSidebar', '#commentManagerDialog', '.commentPopup'].map(
              (sel) => {
                const el = document.querySelector(sel);
                return { sel, scheme: el ? getComputedStyle(el).colorScheme : null };
              },
            ),
          );
          const present = schemes.filter((s) => s.scheme !== null);
          expect(
            present.length,
            'no comments surfaces found in the DOM',
          ).toBeGreaterThan(0);
          for (const { sel, scheme } of present) {
            expect
              .soft(scheme, `${sel} color-scheme should follow the viewer theme`)
              .toBe(combo.viewer);
          }
        });
      });

      // NOTE: form fields / the annotation layer are intentionally NOT audited.
      // A PDF form field renders its text in a colour baked into the PDF, over
      // the *page canvas pixels* (white) — and a <canvas> has no CSS
      // background-color, so a DOM-colour contrast audit can't see the real
      // background and would false-positive (black-on-white reads as
      // black-on-dark-chrome). Form-field readability is a PDF-content concern,
      // not viewer theming; it would need a pixel-based check, out of scope here.

      test('password prompt is readable', async ({ page }) => {
        const pdf = new PdfViewerPage(page);
        await applyThemeContext(page, combo);
        await pdf.goto(PASSWORDS);
        const dialog = page.locator('#passwordDialog');
        await dialog.waitFor({ state: 'visible' });
        await expectReadable(page, '#passwordDialog', 'password dialog');
      });
    });
  }
});
