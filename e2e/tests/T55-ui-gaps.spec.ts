import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { downloadPdf, readPdf, readServedPdf } from '../poms/pdf-file';
import { drawInk, highlightWord, typeFreeText } from '../poms/editor-gestures';

/**
 * T55 — viewer controls no other spec touches (found with the UI coverage map,
 * e2e/coverage). Every click is followed by a check of what it did, so each
 * control counts as "thorough" on the map.
 */

test.describe.configure({ mode: 'parallel' });

const FLYER = '/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf';

/** The first 25 non-blank characters: enough to tell the flyer's pages apart. */
const key = (text: string) => text.replace(/\s+/g, '').slice(0, 25);

/**
 * The text of the page the viewer shows as page n, read from its pdf.js page
 * object. Doesn't scroll: the move buttons act on the current page, and
 * scrolling would change it.
 */
async function shownText(page: Page, n: number): Promise<string | null> {
  return await page.evaluate(async (num) => {
    const view = (window as any).__ngxApp.pdfViewer.getPageView(num - 1);
    if (!view?.pdfPage) return null;
    const text = await view.pdfPage.getTextContent();
    return text.items
      .map((i: any) => i.str)
      .join('')
      .replace(/\s+/g, '')
      .slice(0, 25);
  }, n);
}

test.describe('T55 — move page up / down', () => {
  test('the toolbar and the secondary menu move the current page, and the download keeps the new order', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${FLYER}&showMovePageButton=always-in-secondary-menu`);
    await viewer.waitForFirstPageRender();
    await page.waitForFunction(() => (window as any).pdfjsLib?.getDocument, null, { timeout: 30_000 });
    const F = (await readServedPdf(page, FLYER)).pageTexts.map(key);
    expect(new Set(F).size, 'the flyer pages are distinguishable').toBe(10);

    await viewer.gotoPage(3);
    await expect.poll(() => viewer.getCurrentPage()).toBe(3);

    const openMenu = async () => {
      if (await page.locator('#secondaryToolbar').evaluate((el) => el.classList.contains('hidden'))) {
        await page.locator('#secondaryToolbarToggle').click();
      }
    };

    // A pdf-shy-button shows either its toolbar or its menu copy, never both:
    // start with the menu copies, then move the buttons into the toolbar.
    await test.step('secondary menu: move page 3 up twice', async () => {
      for (const expectedPage of [2, 1]) {
        await openMenu();
        await page.locator('#secondaryMoveUpButton').click();
        await expect.poll(() => viewer.getCurrentPage(), { message: 'the moved page stays current' }).toBe(expectedPage);
      }
      await expect.poll(() => shownText(page, 1)).toBe(F[2]);
      await expect.poll(() => shownText(page, 2)).toBe(F[0]);
      await expect.poll(() => shownText(page, 3)).toBe(F[1]);
    });

    await test.step('secondary menu: move it down again', async () => {
      await openMenu();
      await page.locator('#secondaryMoveDownButton').click();
      await expect.poll(() => viewer.getCurrentPage()).toBe(2);
      await expect.poll(() => shownText(page, 1)).toBe(F[0]);
      await expect.poll(() => shownText(page, 2)).toBe(F[2]);
    });

    await test.step('toolbar: move page 5 up, then the downloaded file has the same order', async () => {
      await page.evaluate(() => (window as any).__setInput('showMovePageButton', true));
      await viewer.gotoPage(5);
      await expect.poll(() => viewer.getCurrentPage()).toBe(5);
      await page.locator('#primaryMoveUpButton').click();
      await expect.poll(() => viewer.getCurrentPage()).toBe(4);
      const expected = [F[0], F[2], F[1], F[4], F[3], ...F.slice(5)];
      for (const n of [1, 2, 3, 4, 5]) {
        await expect.poll(() => shownText(page, n), { message: `viewer page ${n}` }).toBe(expected[n - 1]);
      }
      const saved = await readPdf(page, await downloadPdf(page));
      expect(saved.pageTexts.map(key), 'the pages of the downloaded file').toEqual(expected);
    });
  });
});

const TEXT = '/assets/pdfs/blind-text-collection.pdf';

async function openText(page: Page, query = ''): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${TEXT}${query}`);
  await viewer.waitForFirstPageRender();
  return viewer;
}

test.describe('T55 — find bar', () => {
  test('next / previous step through the matches, "Highlight all" marks every match', async ({ page }) => {
    const viewer = await openText(page);
    await viewer.openFindBar();
    // Page 1 says "blind" four times.
    await page.locator('#findInput').fill('blind');

    // "1 of 7 matches", with the numbers wrapped in bidi isolation marks.
    const count = page.locator('#findResultsCount');
    const counter = async () => ((await count.textContent()) ?? '').replace(/[\u2068\u2069]/g, '');
    await expect.poll(counter, { timeout: 15_000 }).toMatch(/^1 of \d+/);
    const total = Number((await counter()).match(/of (\d+)/)![1]);
    expect(total, 'enough matches to step through').toBeGreaterThan(3);

    // Each match on a page gets its own highlight span, the current one is `.selected`.
    const selected = page.locator('.textLayer .highlight.selected');
    const selectedOffset = async () =>
      await page.evaluate(() => {
        const el = document.querySelector('.textLayer .highlight.selected');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return `${Math.round(r.top)},${Math.round(r.left)}`;
      });

    const first = await selectedOffset();
    await page.locator('#findNext').click();
    await expect.poll(counter).toMatch(new RegExp(`^2 of ${total}`));
    await expect(selected).toHaveCount(1);
    await expect.poll(selectedOffset, { message: 'another match is selected' }).not.toBe(first);

    await page.locator('#findNext').click();
    await expect.poll(counter).toMatch(new RegExp(`^3 of ${total}`));

    await page.locator('#findPrevious').click();
    await expect.poll(counter).toMatch(new RegExp(`^2 of ${total}`));
    await page.locator('#findPrevious').click();
    await expect.poll(counter).toMatch(new RegExp(`^1 of ${total}`));
    await expect.poll(selectedOffset, { message: 'back on the first match' }).toBe(first);

    // Without "Highlight all", only the current match is marked.
    const highlights = page.locator('.textLayer .highlight');
    // The checkbox itself is styled away; the user clicks its label.
    const box = page.locator('#findHighlightAll');
    const label = page.locator('label[for="findHighlightAll"]');
    if (await box.isChecked()) {
      await label.click();
      await expect(box).not.toBeChecked();
    }
    await expect(highlights).toHaveCount(1);

    await label.click();
    await expect(box).toBeChecked();
    await expect.poll(async () => await highlights.count(), { message: 'every visible match is marked' }).toBeGreaterThan(1);

    await label.click();
    await expect(box).not.toBeChecked();
    await expect(highlights).toHaveCount(1);
  });
});

/** The annotations the editors would save right now. */
async function serialized(page: Page): Promise<any[]> {
  return await page.evaluate(() => (window as any).__ngxApp.pdfViewer.getSerializedAnnotations() ?? []);
}

const TYPE = { FREETEXT: 3, HIGHLIGHT: 9, INK: 15 };

test.describe('T55 — editor parameter panels', () => {
  test('the draw tool: thickness and opacity chosen before drawing are the stroke\'s', async ({ page }) => {
    const viewer = await openText(page, '&show=always-visible');
    await viewer.activateEditor('draw');
    const thickness = page.locator('#editorInkThickness');
    const opacity = page.locator('#editorInkOpacity');
    await expect(thickness).toBeVisible();
    expect(await thickness.inputValue(), 'the test changes the thickness').not.toBe('17');

    await thickness.fill('17');
    await expect(thickness).toHaveValue('17');
    await opacity.fill('0.4');
    await expect(opacity).toHaveValue('0.4');

    await drawInk(page);
    const [ink] = (await serialized(page)).filter((a) => a.annotationType === TYPE.INK);
    expect(ink.thickness).toBe(17);
    expect(ink.opacity).toBeCloseTo(0.4, 2);
  });

  test('the text tool: the color chosen before typing is the text\'s color', async ({ page }) => {
    const viewer = await openText(page, '&show=always-visible');
    await viewer.activateEditor('text');
    const color = page.locator('#editorFreeTextColor');
    await expect(color).toBeVisible();
    await color.fill('#d01070');
    await expect(color).toHaveValue('#d01070');

    await typeFreeText(page, 'Colored words', 1, { x: 0.6, y: 0.2 });
    const [freeText] = (await serialized(page)).filter((a) => a.annotationType === TYPE.FREETEXT);
    expect(Array.from(freeText.color)).toEqual([0xd0, 0x10, 0x70]);
  });

  test('the highlight tool: the free-highlight thickness, and "Show all" hides and shows the highlights', async ({
    page,
  }) => {
    const viewer = await openText(page, '&show=always-visible');
    await viewer.activateEditor('highlight');
    const thickness = page.locator('#editorFreeHighlightThickness');
    await expect(thickness).toBeVisible();
    await expect(thickness).toBeEnabled();
    expect(await thickness.inputValue(), 'the test changes the thickness').not.toBe('20');
    await thickness.fill('20');
    await expect(thickness).toHaveValue('20');

    // A stroke in the left margin, away from any text, is a free highlight.
    const layer = page.locator('.page[data-page-number="1"] .annotationEditorLayer');
    await expect(layer).toBeVisible();
    await page.waitForTimeout(150);
    const box = (await layer.boundingBox())!;
    await page.mouse.move(box.x + 12, box.y + 120);
    await page.mouse.down();
    await page.mouse.move(box.x + 14, box.y + 260, { steps: 15 });
    await page.mouse.up();
    await expect(page.locator('.highlightEditor')).toHaveCount(1, { timeout: 10_000 });
    await expect.poll(async () => (await serialized(page)).filter((a) => a.annotationType === TYPE.HIGHLIGHT).length).toBe(1);
    const [free] = (await serialized(page)).filter((a) => a.annotationType === TYPE.HIGHLIGHT);
    expect(free.thickness).toBe(20);

    await highlightWord(page, 'Vokalia');
    const editors = page.locator('.highlightEditor');
    await expect(editors).toHaveCount(2);

    const showAll = page.locator('#editorHighlightShowAll');
    await expect(showAll).toHaveAttribute('aria-pressed', 'true');
    await showAll.click();
    await expect(showAll).toHaveAttribute('aria-pressed', 'false');
    await expect(editors.nth(0)).toBeHidden();
    await expect(editors.nth(1)).toBeHidden();

    await showAll.click();
    await expect(showAll).toHaveAttribute('aria-pressed', 'true');
    await expect(editors.nth(0)).toBeVisible();
    await expect(editors.nth(1)).toBeVisible();
  });
});

test.describe('T55 — signature dialog', () => {
  const SIGNING = '&opt.enableSignatureEditor=true&showSignatureEditor=true';

  async function scribble(page: Page): Promise<void> {
    const pad = page.locator('#addSignatureDraw');
    const box = (await pad.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3, { steps: 10 });
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.6, { steps: 10 });
    await page.mouse.up();
  }

  test('"Clear" wipes the drawing; an unticked "Save signature" places it without keeping it', async ({ page }) => {
    await openText(page, SIGNING);
    await page.locator('#primaryEditorSignatureButton').click();
    await page.locator('#editorSignatureAddSignature').click();
    await expect(page.locator('#addSignatureDialog')).toBeVisible();
    await page.locator('#addSignatureDrawButton').click();

    const add = page.locator('#addSignatureAddButton');
    const strokes = page.locator('#addSignatureDraw path');
    await scribble(page);
    await expect(add).toBeEnabled();
    await expect(strokes).not.toHaveCount(0);

    await page.locator('#clearSignatureButton').click();
    await expect(strokes).toHaveCount(0);
    await expect(add).toBeDisabled();

    await scribble(page);
    await expect(add).toBeEnabled();
    await page.locator('#addSignatureDescInput').fill('Just this once');
    const keep = page.locator('#addSignatureSaveCheckbox');
    await expect(keep).toBeChecked();
    await keep.click();
    await expect(keep).not.toBeChecked();

    await add.click();
    await expect(page.locator('#addSignatureDialog')).toBeHidden();
    await expect(page.locator('.signatureEditor')).toHaveCount(1);
    // A kept signature gets a button in the signature panel (see T44); this one doesn't.
    // The signature tool is still on, its panel open.
    await expect(page.locator('#editorSignatureAddSignature')).toBeVisible();
    await expect(page.locator('.toolbarAddSignatureButton')).toHaveCount(0);
  });
});

test.describe('T55 — the page flip tool', () => {
  const BOOK = '/assets/pdfs/Portugues-para-principiantes.pdf';
  const currentPage = (page: Page) => page.evaluate(() => (window as any).__ngxApp.page);
  const flipState = (page: Page) => page.evaluate(() => (window as any).__ngxApp?.pdfViewer?.pageFlip?.getState());

  /** Drags the bottom-right corner of the right page to the left side of the book (see T52). */
  async function dragPage(page: Page): Promise<void> {
    const b = await page.evaluate(() => {
      const rects = Array.from(document.querySelectorAll<HTMLElement>('.page.stf__item[data-page-number]'))
        .filter((p) => getComputedStyle(p).display !== 'none')
        .map((p) => p.getBoundingClientRect())
        .filter((r) => r.width > 0);
      return {
        left: Math.min(...rects.map((r) => r.left)),
        right: Math.max(...rects.map((r) => r.right)),
        bottom: Math.min(...rects.map((r) => r.bottom)),
      };
    });
    await page.mouse.move(b.right - 15, b.bottom - 15);
    await page.mouse.down();
    await page.mouse.move(b.left + (b.right - b.left) * 0.15, b.bottom - 40, { steps: 25 });
    await page.mouse.up();
  }

  async function expectNoTurn(page: Page, at: number): Promise<void> {
    await dragPage(page);
    await page.waitForTimeout(1500);
    expect(await currentPage(page), 'the select tool doesn\'t turn pages').toBe(at);
  }

  async function expectTurn(page: Page, to: number): Promise<void> {
    await dragPage(page);
    await expect.poll(() => currentPage(page), { timeout: 10_000 }).toBe(to);
    await expect.poll(() => flipState(page)).toBe('read');
  }

  const openMenu = async (page: Page) => {
    if (await page.locator('#secondaryToolbar').evaluate((el) => el.classList.contains('hidden'))) {
      await page.locator('#secondaryToolbarToggle').click();
    }
  };

  test('the toolbar and the menu button switch dragging pages back on after the select tool', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(
      `/e2e/viewer?src=${BOOK}&pageViewMode=book&page=2&zoom=page-fit&handTool=false&showPageFlipButton=always-in-secondary-menu&showHandToolButton=always-in-secondary-menu`,
    );
    await viewer.waitForPageRender(2);
    await expect.poll(() => flipState(page), { timeout: 15_000 }).toBe('read');
    await expect.poll(() => currentPage(page), { timeout: 10_000 }).toBe(2);

    const menuButton = page.locator('#secondaryCursorPageFlipTool');
    await test.step('the menu button', async () => {
      await openMenu(page);
      await page.locator('#secondaryCursorSelectTool').click();
      await expectNoTurn(page, 2);

      await openMenu(page);
      await expect(menuButton).toHaveAttribute('aria-pressed', 'false');
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-pressed', 'true');
      await expectTurn(page, 4);
    });

    await test.step('the toolbar button', async () => {
      await page.evaluate(() => (window as any).__setInput('showPageFlipButton', 'always-visible'));
      const toolbarButton = page.locator('#primaryCursorPageFlipTool');
      await expect(toolbarButton).toBeVisible();
      await openMenu(page);
      await page.locator('#secondaryCursorSelectTool').click();
      await expect(toolbarButton).toHaveAttribute('aria-pressed', 'false');
      await expectNoTurn(page, 4);

      await toolbarButton.click();
      await expect(toolbarButton).toHaveAttribute('aria-pressed', 'true');
      await expectTurn(page, 6);
    });
  });
});

test.describe('T55 — the comments sidebar', () => {
  test('the comment button opens the list of comments, its close button closes it', async ({ page }) => {
    await openText(page);
    await page.locator('#primaryEditorHighlight').click();
    await highlightWord(page, 'Vokalia');
    await page.locator('.highlightEditor .editToolbar button.comment').click();
    await page.locator('#commentManagerTextInput').fill('Where is Vokalia?');
    await page.locator('#commentManagerSaveButton').click();
    await expect(page.locator('#commentManagerDialog')).toBeHidden();
    await page.locator('#primaryEditorHighlight').click();

    const sidebar = page.locator('#editorCommentParamsToolbar');
    const list = page.locator('#editorCommentsSidebarList > li');
    const expectOpen = async () => {
      await expect(sidebar).toBeVisible();
      await expect(list).toHaveCount(1);
      await expect(list.first()).toContainText('Where is Vokalia?');
      expect(await page.evaluate(() => (window as any).__ngxApp.pdfViewer.annotationEditorMode), 'comment mode').toBe(16);
    };
    const close = async () => {
      await page.locator('#editorCommentsSidebarCloseButton').click();
      await expect(sidebar).toBeHidden();
      expect(await page.evaluate(() => (window as any).__ngxApp.pdfViewer.annotationEditorMode), 'no editor').toBe(0);
    };

    // By default the button lives in the secondary menu.
    await page.locator('#secondaryToolbarToggle').click();
    await page.locator('#secondaryEditorCommentButton').click();
    await expectOpen();
    await close();

    await page.evaluate(() => (window as any).__setInput('showCommentEditor', 'always-visible'));
    const button = page.locator('#editorCommentButton');
    await expect(button).toBeVisible();
    await button.click();
    await expectOpen();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await close();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('T55 — the sidebar', () => {
  const BOOK = '/assets/pdfs/Portugues-para-principiantes.pdf';

  async function openSidebar(page: Page, query = ''): Promise<PdfViewerPage> {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${BOOK}&sidebarVisible=true${query}`);
    await viewer.waitForFirstPageRender();
    await expect.poll(() => viewer.isSidebarOpen()).toBe(true);
    return viewer;
  }

  test('"Find current outline item" marks the chapter of the current page', async ({ page }) => {
    const viewer = await openSidebar(page);
    await page.locator('#viewOutline').click();
    const chapters = page.locator('#outlinesView > .treeItem > a');
    await expect.poll(() => chapters.count(), { timeout: 15_000 }).toBeGreaterThan(2);
    const button = page.locator('#viewsManagerCurrentOutlineButton');
    const marked = page.locator('#outlinesView .treeItem.selected > a');
    // The marked entry can be a section; report the chapter it belongs to.
    const markedChapter = () =>
      page.evaluate(() => {
        const top = Array.from(document.querySelectorAll('#outlinesView > .treeItem'));
        return top.findIndex((item) => item.matches('.selected') || !!item.querySelector('.treeItem.selected'));
      });
    const lastChapter = (await chapters.count()) - 1;

    // The last page belongs to the last chapter, the first page doesn't.
    const lastPage = await viewer.getPageCount();
    await viewer.gotoPage(lastPage);
    await expect.poll(() => viewer.getCurrentPage()).toBe(lastPage);
    await expect(button).toBeEnabled({ timeout: 10_000 });
    await button.click();
    await expect(marked).toHaveCount(1);
    await expect(marked).toBeVisible();
    await expect.poll(markedChapter).toBe(lastChapter);

    await viewer.gotoPage(1);
    await expect.poll(() => viewer.getCurrentPage()).toBe(1);
    await button.click();
    await expect(marked).toHaveCount(1);
    await expect.poll(markedChapter).toBe(0);
  });

  test('dragging the resizer makes the sidebar wider and narrower', async ({ page }) => {
    await openSidebar(page);
    const sidebar = page.locator('#viewsManager');
    const resizer = page.locator('#viewsManagerResizer');
    const width = async () => Math.round((await sidebar.boundingBox())!.width);
    const before = await width();

    const drag = async (dx: number) => {
      const box = (await resizer.boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx, y, { steps: 10 });
      await page.mouse.up();
    };

    await drag(120);
    await expect.poll(width).toBeGreaterThan(before + 100);
    await expect(resizer).toHaveAttribute('aria-valuenow', String(await width()));

    await drag(-120);
    await expect.poll(width).toBeLessThan(before + 20);
  });

  test('the deselect button clears the selection of pages', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${FLYER}&sidebarVisible=true&enableSplitMerge=true`);
    await viewer.waitForFirstPageRender();
    await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(10, { timeout: 20_000 });
    const box = (n: number) => page.locator(`#thumbnailsView .thumbnail[page-number="${n}"] input[type="checkbox"]`);
    const deselect = page.locator('#viewsManagerStatusActionDeselectButton');
    await expect(deselect).toBeHidden();

    for (const n of [1, 3]) {
      await box(n).scrollIntoViewIfNeeded();
      await box(n).check();
    }
    await expect(deselect).toBeVisible();

    await deselect.click();
    await expect(box(1)).not.toBeChecked();
    await expect(box(3)).not.toBeChecked();
    await expect(deselect).toBeHidden();
  });
});
