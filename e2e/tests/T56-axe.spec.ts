import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { applyThemeContext, comboLabel, THEME_COMBOS, type ThemeCombo } from '../poms/theme-audit';

/**
 * T56 — an automated accessibility scan (axe-core) of every surface of the
 * viewer: toolbar, Tools menu, sidebar views, find bar, editor panels and
 * dialogs. Like T28, in all four combinations of the viewer theme and the OS
 * color scheme: the colors must follow the viewer theme, and the mismatched
 * combinations are where they used to follow the OS instead (#3219).
 *
 * axe checks the rules a machine can judge (roles, names, ARIA validity,
 * labels, contrast of text at WCAG AA). T54 covers what axe can't see:
 * states changing on interaction, keyboard operation and focus handling.
 *
 * Every surface is scanned in its own soft step, so one run reports all of
 * them. Only the viewer is scanned (`ngx-extended-pdf-viewer`), not the
 * harness page around it.
 */

test.describe.configure({ mode: 'parallel' });

const BOOK = '/assets/pdfs/Portugues-para-principiantes.pdf';
const PASSWORDS = '/extended-pdf-viewer/passwords';
const VIEWER = 'ngx-extended-pdf-viewer';

/** Runs axe on `include` (default: the whole viewer) and asserts softly that it found nothing. */
async function scan(page: Page, surface: string, include = VIEWER): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .include(include)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const report = violations
    .map(
      (v) =>
        `  • ${v.id} (${v.impact}): ${v.help}\n` +
        v.nodes
          .slice(0, 8)
          .map((n) => `      ${n.target.join(' ')}  ${n.failureSummary?.split('\n').slice(1, 2).join('').trim() ?? ''}`)
          .join('\n') +
        (v.nodes.length > 8 ? `\n      … and ${v.nodes.length - 8} more` : ''),
    )
    .join('\n');
  expect.soft(violations.map((v) => v.id), `${surface}: ${violations.length} axe rule(s) violated\n${report}`).toEqual([]);
}

/**
 * The harness doesn't read the showcase's theme from localStorage (that's the demo
 * pages' ThemeService), so the viewer theme goes in as the [theme] input.
 */
async function open(page: Page, theme: ThemeCombo, query = ''): Promise<PdfViewerPage> {
  await applyThemeContext(page, theme);
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${BOOK}&show=always-visible&theme=${theme.viewer}${query}`);
  await viewer.waitForFirstPageRender();
  await page.waitForTimeout(500);
  return viewer;
}

for (const theme of THEME_COMBOS) {
  test.describe(`T56 axe — ${comboLabel(theme)}`, () => {
    test('toolbar, document and the Tools menu', async ({ page }) => {
      const viewer = await open(page, theme, '&sidebarVisible=false');
      await scan(page, 'toolbar + document');
      await viewer.openSecondaryToolbar();
      await expect(page.locator('#secondaryToolbar')).toBeVisible();
      await scan(page, 'Tools menu', '#secondaryToolbar');
    });

    test('sidebar: thumbnails and outline', async ({ page }) => {
      await open(page, theme, '&sidebarVisible=true');
      await expect(page.locator('#viewsManager')).toBeVisible();
      await page.locator('#viewThumbnail').click();
      await page.locator('#thumbnailsView .thumbnail:visible').first().waitFor({ state: 'visible' });
      await scan(page, 'sidebar thumbnails', '#viewsManager');
      await page.locator('#viewOutline').click();
      await page.locator('#outlinesView .treeItem a').first().waitFor({ state: 'visible' });
      await scan(page, 'sidebar outline', '#viewsManager');
    });

    test('find bar with results', async ({ page }) => {
      const viewer = await open(page, theme);
      await viewer.openFindBar();
      await page.locator('#findInput').fill('casa');
      await expect(page.locator('#findResultsCount')).toHaveText(/\d/);
      await scan(page, 'find bar', '#findbar');
    });

    test('editor panels', async ({ page }) => {
      const viewer = await open(page, theme);
      const editors = [
        ['highlight', '#editorHighlightParamsToolbar'],
        ['draw', '#editorInkParamsToolbar'],
        ['text', '#editorFreeTextParamsToolbar'],
        ['stamp', '#editorStampParamsToolbar'],
      ] as const;
      for (const [mode, panel] of editors) {
        await page.waitForTimeout(150);
        await viewer.activateEditor(mode);
        await expect(page.locator(panel)).toBeVisible();
        await scan(page, `${mode} editor panel`, panel);
      }
    });

    test('document properties dialog', async ({ page }) => {
      await open(page, theme);
      await page.locator('#documentProperties').click();
      await expect(page.locator('#documentPropertiesDialog')).toBeVisible();
      await expect(page.locator('#pageCountField')).toHaveText(/\d/);
      await scan(page, 'document properties dialog', '#documentPropertiesDialog');
    });

    test('add-signature dialog', async ({ page }) => {
      await open(page, theme, '&opt.enableSignatureEditor=true&showSignatureEditor=true');
      await page.locator('#primaryEditorSignatureButton').click();
      await expect(page.locator('#editorSignatureParamsToolbar')).toBeVisible();
      await scan(page, 'signature panel', '#editorSignatureParamsToolbar');
      await page.locator('#editorSignatureAddSignature').click();
      await expect(page.locator('#addSignatureDialog')).toBeVisible();
      await scan(page, 'add-signature dialog', '#addSignatureDialog');
    });

    test('password dialog', async ({ page }) => {
      // A demo page, so the theme does come from localStorage here.
      await applyThemeContext(page, theme);
      const viewer = new PdfViewerPage(page);
      await viewer.goto(PASSWORDS);
      await expect(page.locator('#passwordDialog')).toBeVisible();
      await scan(page, 'password dialog', '#passwordDialog');
    });
  });
}
