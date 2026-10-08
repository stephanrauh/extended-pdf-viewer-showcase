import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { BUTTONS } from '../poms/toolbar-buttons';
import { stubPrint } from '../poms/print-stub';
import { readServedPdf } from '../poms/pdf-file';

/**
 * T46 — the [disableXxx] flags, the search options and the zoom limits.
 *
 * Runs on the bare viewer (src/app/e2e-harness). The disable tests switch the
 * flag back off at runtime (window.__setInput), so each one proves both
 * sides: the disabled button does nothing, the re-enabled button works.
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';
const TEXT = '/assets/pdfs/blind-text-collection.pdf';

type Recorded = { name: string; t: number; payload: any };

async function open(page: Page, query: string): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?${query}`);
  await viewer.waitForFirstPageRender();
  await expect.poll(() => page.evaluate(() => (window as any).__ngxApp?.pdfViewer?.pagesCount ?? 0), { timeout: 30_000 }).toBeGreaterThan(0);
  return viewer;
}

/** Reads the viewer's state: `expr` is evaluated with `app` = PDFViewerApplication. */
const state = (page: Page, expr: string) => page.evaluate((e) => new Function('app', `return (${e});`)((window as any).__ngxApp), expr);

test.describe('T46 — [disableXxx] flags', () => {
  type Case = { flag: string; button: keyof typeof BUTTONS; expr: string; query?: string; src?: string };
  const events = (name: string) => `(window.__ngxEvents || []).filter(e => e.name === '${name}').length`;
  const CASES: Case[] = [
    { flag: 'disablePreviousAndNextPageButtons', button: 'next', expr: 'app.page' },
    { flag: 'disableFirstAndLastPageButtons', button: 'last', expr: 'app.page' },
    { flag: 'disablePagingButtons', button: 'next', expr: 'app.page' },
    { flag: 'disableZoomButtons', button: 'zoomIn', expr: 'app.pdfViewer.currentScale' },
    { flag: 'disableRotateCwButton', button: 'rotateCw', expr: 'app.pdfViewer.pagesRotation' },
    { flag: 'disableRotateCcwButton', button: 'rotateCcw', expr: 'app.pdfViewer.pagesRotation' },
    { flag: 'disableHandToolButton', button: 'handTool', expr: 'app.pdfCursorTools.activeTool', query: '&handTool=false' },
    { flag: 'disableSidebarButton', button: 'sidebar', expr: "document.getElementById('viewsManagerToggleButton').getAttribute('aria-expanded')" },
    { flag: 'disableFindButton', button: 'find', expr: "!!document.getElementById('findbar')?.checkVisibility()" },
    { flag: 'disablePropertiesButton', button: 'properties', expr: "!!document.querySelector('dialog[open]')" },
    { flag: 'disableSpreadButton', button: 'spreadOdd', expr: 'app.pdfViewer.spreadMode' },
    { flag: 'disableHorizontalScrollButton', button: 'scrollHorizontal', expr: 'app.pdfViewer.scrollMode' },
    { flag: 'disableWrappedScrollButton', button: 'scrollWrapped', expr: 'app.pdfViewer.scrollMode' },
    { flag: 'disableSinglePageModeButton', button: 'scrollPage', expr: 'app.pdfViewer.scrollMode' },
    { flag: 'disableBookModeButton', button: 'bookMode', expr: 'app.pdfViewer.pageViewMode' },
    // Printing renders every page before it calls print(): ~9 s for the 641 pages of DOC.
    { flag: 'disablePrintButton', button: 'print', expr: 'window.__printCalls', src: TEXT },
    { flag: 'disableDownloadButton', button: 'download', expr: events('pdfDownloaded') },
    { flag: 'disableTextEditor', button: 'freeText', expr: 'app.pdfViewer.annotationEditorMode' },
    { flag: 'disableDrawEditor', button: 'ink', expr: 'app.pdfViewer.annotationEditorMode' },
    { flag: 'disableHighlightEditor', button: 'highlight', expr: 'app.pdfViewer.annotationEditorMode' },
    { flag: 'disableStampEditor', button: 'stamp', expr: 'app.pdfViewer.annotationEditorMode' },
    { flag: 'disableEditorButtons', button: 'ink', expr: 'app.pdfViewer.annotationEditorMode' },
  ];

  for (const { flag, button, expr, query = '', src = DOC } of CASES) {
    test(`[${flag}]: ${button} is disabled and does nothing, and works again once re-enabled`, async ({ page }) => {
      await stubPrint(page);
      // Downloads must not leave the browser.
      page.on('download', (d) => d.cancel());
      await open(page, `src=${src}&show=always-visible&${flag}=true${query}`);
      const toolbarButton = page.locator(`#${BUTTONS[button].toolbar}`);
      await expect(toolbarButton).toBeVisible();
      await expect(toolbarButton).toBeDisabled();
      const before = await state(page, expr);
      await toolbarButton.click({ force: true });
      await page.waitForTimeout(500);
      expect(await state(page, expr), 'a disabled button has no effect').toEqual(before);

      await page.evaluate((f) => (window as any).__setInput(f, false), flag);
      await expect(toolbarButton).toBeEnabled();
      await toolbarButton.click();
      await expect.poll(() => state(page, expr), { message: 're-enabled, the button works', timeout: 10_000 }).not.toEqual(before);
    });
  }

  test('[disablePageNumber]: the page field is read-only, and navigation by typing is off', async ({ page }) => {
    const viewer = await open(page, `src=${DOC}&disablePageNumber=true`);
    await expect(page.locator('#pageNumber')).toBeDisabled();
    await page.evaluate(() => (window as any).__setInput('disablePageNumber', false));
    await expect(page.locator('#pageNumber')).toBeEnabled();
    await viewer.gotoPage(4);
    await expect.poll(() => state(page, 'app.page')).toBe(4);
  });

  test('[disableZoomDropdown]: the zoom dropdown is disabled', async ({ page }) => {
    await open(page, `src=${DOC}&disableZoomDropdown=true`);
    await expect(page.locator('#scaleSelect')).toBeDisabled();
    await page.evaluate(() => (window as any).__setInput('disableZoomDropdown', false));
    await expect(page.locator('#scaleSelect')).toBeEnabled();
    await page.locator('#scaleSelect').selectOption('2');
    await expect.poll(() => state(page, 'app.pdfViewer.currentScale')).toBe(2);
  });

  test('[disableForms]: form fields are read-only', async ({ page }) => {
    await open(page, 'src=/assets/pdfs/OoPdfFormExample.pdf&disableForms=true');
    const field = page.locator('.annotationLayer [name="firstName"]');
    await expect(field).toBeVisible({ timeout: 15_000 });
    await expect(field).toBeDisabled();
  });
});

test.describe('T46 — search options', () => {
  /** Searches with the find bar and returns the settled number of matches. */
  async function search(
    page: Page,
    query: string,
    options: { matchCase?: boolean; entireWord?: boolean; matchDiacritics?: boolean; multiple?: boolean } = {},
  ): Promise<number> {
    if (!(await page.locator('#findInput').isVisible())) {
      await page.locator('#primaryViewFind').click();
    }
    const boxes = { matchCase: '#findMatchCase', entireWord: '#findEntireWord', matchDiacritics: '#findMatchDiacritics', multiple: '#findMultiple' };
    // The checkboxes themselves are tiny; users click their labels.
    for (const [option, selector] of Object.entries(boxes)) {
      const wanted = !!options[option as keyof typeof options];
      if ((await page.locator(selector).isChecked()) !== wanted) {
        await page.locator(`label[for="${selector.substring(1)}"]`).click();
      }
      await expect(page.locator(selector)).toBeChecked({ checked: wanted });
    }
    const start = await page.evaluate(() => (window as any).__ngxEvents.length);
    await page.locator('#findInput').fill(query);
    await page.locator('#findInput').press('Enter');
    let last = -1;
    let total = -1;
    await expect
      .poll(
        async () => {
          const counts: Recorded[] = await page.evaluate(
            ({ s, q }) => (window as any).__ngxEvents.slice(s).filter((e: any) => e.name === 'updateFindMatchesCount' && e.payload.query === q),
            { s: start, q: query },
          );
          const state: Recorded[] = await page.evaluate((s) => (window as any).__ngxEvents.slice(s).filter((e: any) => e.name === 'updateFindState'), start);
          total = counts.at(-1)?.payload.total ?? -1;
          const settled = total === last && state.length > 0 && state.at(-1)!.payload !== 3;
          last = total;
          return settled;
        },
        { timeout: 20_000, intervals: [500] },
      )
      .toBe(true);
    return total;
  }

  test('match case finds fewer matches, all of them in the right case', async ({ page }) => {
    await open(page, `src=${TEXT}`);
    const text = (await readServedPdf(page, TEXT)).pageTexts.join(' ');
    const exact = (text.match(/\bFar\b/g) ?? []).length;
    const any = (text.match(/far/gi) ?? []).length;
    expect(exact, 'precondition: "Far" occurs').toBeGreaterThan(0);
    expect(any, 'precondition: "far" occurs in other cases, too').toBeGreaterThan(exact);

    const all = await search(page, 'far');
    const caseSensitive = await search(page, 'Far', { matchCase: true });
    expect(caseSensitive).toBeGreaterThan(0);
    expect(caseSensitive).toBeLessThan(all);
    expect(await search(page, 'FAR', { matchCase: true })).toBe(0);
  });

  test('whole words skips matches inside longer words', async ({ page }) => {
    await open(page, `src=${TEXT}`);
    const text = (await readServedPdf(page, TEXT)).pageTexts.join(' ');
    expect((text.match(/\Bthe|the\B/gi) ?? []).length, 'precondition: "the" occurs inside words').toBeGreaterThan(0);

    const partial = await search(page, 'the');
    const whole = await search(page, 'the', { entireWord: true });
    expect(whole).toBeGreaterThan(0);
    expect(whole).toBeLessThan(partial);
  });

  test('several words at once: the counts add up', async ({ page }) => {
    await open(page, `src=${TEXT}`);
    const a = await search(page, 'Vokalia');
    const b = await search(page, 'Consonantia');
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
    expect(await search(page, 'Vokalia Consonantia', { multiple: true })).toBe(a + b);
  });

  test('diacritics: ignored by default, respected on request', async ({ page }) => {
    await open(page, `src=${DOC}`);
    const loose = await search(page, 'portugues');
    const strict = await search(page, 'portugues', { matchDiacritics: true });
    const accented = await search(page, 'português', { matchDiacritics: true });
    expect(accented, 'precondition: the document says "português"').toBeGreaterThan(0);
    expect(loose, 'without the option, "portugues" finds "português" too').toBeGreaterThanOrEqual(accented);
    expect(strict).toBeLessThan(loose);
  });

  test('a regular expression via the service', async ({ page }) => {
    await open(page, `src=${TEXT}`);
    const plain = await search(page, 'Vokalia');
    const found = await page.evaluate(async () => {
      const promises = (window as any).__ngxService.find(/V[a-z]+lia/, { regexp: true, highlightAll: true });
      return (await Promise.all(promises ?? [])).reduce((sum: number, n: number) => sum + n, 0);
    });
    expect(found).toBe(plain);
  });

  test('Enter goes to the next match, Shift+Enter back to the previous one', async ({ page }) => {
    await open(page, `src=${TEXT}`);
    expect(await search(page, 'the')).toBeGreaterThan(3);
    const current = async () =>
      await page.evaluate(() => (window as any).__ngxEvents.filter((e: any) => e.name === 'updateFindMatchesCount').at(-1).payload.current);
    const first = await current();
    await page.locator('#findInput').press('Enter');
    await expect.poll(current).toBe(first + 1);
    await page.locator('#findInput').press('Enter');
    await expect.poll(current).toBe(first + 2);
    await page.locator('#findInput').press('Shift+Enter');
    await expect.poll(current).toBe(first + 1);
  });
});

test.describe('T46 — zoom limits', () => {
  const scale = (page: Page) => state(page, 'app.pdfViewer.currentScale') as Promise<number>;

  test('[maxZoom] and [minZoom] stop the zoom buttons', async ({ page }) => {
    await open(page, `src=${TEXT}&zoom=100&minZoom=0.5&maxZoom=2`);
    // Click until the button gives up: at the limit, pdf.js disables it.
    const clickUntilDisabled = async (id: string) => {
      const button = page.locator(`#${id}`);
      for (let i = 0; i < 25 && (await button.isEnabled()); i++) {
        await button.click();
        await page.waitForTimeout(100);
      }
      await expect(button).toBeDisabled();
    };
    await clickUntilDisabled(BUTTONS.zoomIn.toolbar);
    expect(await scale(page)).toBe(2);
    await clickUntilDisabled(BUTTONS.zoomOut.toolbar);
    expect(await scale(page)).toBe(0.5);
  });

  test('[maxZoom] and [minZoom] stop the keyboard shortcuts', async ({ page }) => {
    await open(page, `src=${TEXT}&zoom=100&minZoom=0.5&maxZoom=2`);
    await page.locator('#viewerContainer').click({ position: { x: 5, y: 5 } });
    for (let i = 0; i < 12; i++) await page.keyboard.press('ControlOrMeta+Equal');
    await expect.poll(() => scale(page)).toBe(2);
    for (let i = 0; i < 20; i++) await page.keyboard.press('ControlOrMeta+Minus');
    await expect.poll(() => scale(page)).toBe(0.5);
  });

  test('[maxZoom] caps a zoom set by the application, too', async ({ page }) => {
    await open(page, `src=${TEXT}&zoom=100&maxZoom=2`);
    await page.evaluate(() => (window as any).__setInput('zoom', 500));
    await expect.poll(() => scale(page)).toBeLessThanOrEqual(2);
  });

  test('[zoomLevels]: the dropdown offers exactly the given levels', async ({ page }) => {
    await open(page, `src=${TEXT}&zoomLevels=["page-width",0.5,1,3]`);
    const values = await page.locator('#scaleSelect option').evaluateAll((os) =>
      os.filter((o) => !(o as HTMLOptionElement).hidden && (o as HTMLOptionElement).value !== 'custom').map((o) => (o as HTMLOptionElement).value),
    );
    expect(values).toEqual(['page-width', '0.5', '1', '3']);
    await page.locator('#scaleSelect').selectOption('3');
    await expect.poll(() => scale(page)).toBe(3);
  });
});
