import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { highlightWord, typeFreeText } from '../poms/editor-gestures';
import { downloadPdf, openInViewer, readPdf, type SavedAnnotation } from '../poms/pdf-file';

/**
 * T44 — comments, images and signatures, created through the UI.
 *
 * Every test does what a user does - clicks the editor's buttons, fills the
 * dialogs, drags the result around - and then checks the file the user saves:
 * reopened with pdf.js, outside the viewer. Runs on the bare viewer
 * (src/app/e2e-harness).
 */

test.describe.configure({ mode: 'parallel' });

const TEXT = '/assets/pdfs/blind-text-collection.pdf';
const IMAGE = readFileSync(join(__dirname, '../../src/assets/images/ChatGPT-PDF-Viewer-Logo.jpg'));

/** pdf.js AnnotationType values. */
const TYPE = { HIGHLIGHT: 9, STAMP: 13, POPUP: 16 };

async function open(page: Page, query = ''): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${TEXT}${query}`);
  await viewer.waitForFirstPageRender();
  return viewer;
}

const ofType = (annotations: SavedAnnotation[], type: number) => annotations.filter((a) => a.annotationType === type);
const save = async (page: Page) => await readPdf(page, await downloadPdf(page));

/** CSS pixels per PDF unit on page 1. */
async function pixelsPerUnit(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const view = (window as any).__ngxApp.pdfViewer.getPageView(0);
    return view.viewport.width / (view.pdfPage.view[2] - view.pdfPage.view[0]);
  });
}

/** Drags from the middle of `handle` by (dx, dy). */
async function drag(page: Page, handle: Locator, dx: number, dy: number): Promise<void> {
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 15 });
  await page.mouse.up();
}

test.describe('T44 — comments', () => {
  async function highlightWithComment(page: Page, comment: string): Promise<void> {
    await page.locator('#primaryEditorHighlight').click();
    await highlightWord(page, 'Vokalia');
    await page.locator('.highlightEditor .editToolbar button.comment').click();
    const dialog = page.locator('#commentManagerDialog');
    await expect(dialog).toBeVisible();
    await page.locator('#commentManagerTextInput').fill(comment);
    await page.locator('#commentManagerSaveButton').click();
    await expect(dialog).toBeHidden();
  }

  /** Opens the comment of the first commented annotation and returns its popup. */
  async function showComment(page: Page): Promise<Locator> {
    await page.locator('.annotationCommentButton:visible').first().click();
    const popup = page.locator('#commentPopup');
    await expect(popup).toBeVisible();
    return popup;
  }

  test('a comment added to a highlight is shown, and saved with it', async ({ page }) => {
    await open(page);
    await highlightWithComment(page, 'Where is Vokalia?');
    // Leave the highlight mode: the comment stays reachable.
    await page.locator('#primaryEditorHighlight').click();
    await expect(page.locator('.annotationCommentButton:visible')).toHaveCount(1);
    await expect((await showComment(page)).locator('.commentPopupText')).toHaveText('Where is Vokalia?');

    const saved = await save(page);
    const highlights = ofType(saved.annotations, TYPE.HIGHLIGHT);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].contents).toBe('Where is Vokalia?');
  });

  test('editing a comment changes it in the file', async ({ page }) => {
    await open(page);
    await highlightWithComment(page, 'First thoughts');
    const popup = await showComment(page);
    await popup.locator('.commentPopupEdit').click();
    const input = page.locator('#commentManagerTextInput');
    await expect(input).toHaveValue('First thoughts');
    await input.fill('Second thoughts');
    await page.locator('#commentManagerSaveButton').click();
    await expect((await showComment(page)).locator('.commentPopupText')).toHaveText('Second thoughts');

    const highlights = ofType((await save(page)).annotations, TYPE.HIGHLIGHT);
    expect(highlights.map((h) => h.contents)).toEqual(['Second thoughts']);
  });

  test('removing a comment keeps the highlight, without the comment', async ({ page }) => {
    await open(page);
    await highlightWithComment(page, 'Never mind');
    await (await showComment(page)).locator('.commentPopupDelete').click();
    await expect(page.locator('.annotationCommentButton:visible')).toHaveCount(0);

    const saved = await save(page);
    const highlights = ofType(saved.annotations, TYPE.HIGHLIGHT);
    expect(highlights).toHaveLength(1);
    expect(highlights[0].contents).toBe('');
    expect(ofType(saved.annotations, TYPE.POPUP)).toHaveLength(0);
  });

  test('cancelling the comment dialog adds no comment', async ({ page }) => {
    await open(page);
    await page.locator('#primaryEditorHighlight').click();
    await highlightWord(page, 'Vokalia');
    await page.locator('.highlightEditor .editToolbar button.comment').click();
    await page.locator('#commentManagerTextInput').fill('Not this one');
    await page.locator('#commentManagerCancelButton').click();
    await expect(page.locator('#commentManagerDialog')).toBeHidden();
    await expect(page.locator('.annotationCommentButton:visible')).toHaveCount(0);

    expect(ofType((await save(page)).annotations, TYPE.HIGHLIGHT).map((h) => h.contents)).toEqual(['']);
  });

  test('a saved comment is there when the file is opened again', async ({ page }) => {
    await open(page);
    await highlightWithComment(page, 'See you next time');
    const bytes = await downloadPdf(page);

    await openInViewer(page, bytes);
    await expect(page.locator('.annotationCommentButton:visible')).toHaveCount(1, { timeout: 15_000 });
    await expect((await showComment(page)).locator('.commentPopupText')).toHaveText('See you next time');
  });
});

test.describe('T44 — images (stamp editor)', () => {
  async function addImage(page: Page): Promise<Locator> {
    await page.locator('#primaryEditorStamp').click();
    const chooser = page.waitForEvent('filechooser');
    await page.locator('#editorStampAddImage').click();
    await (await chooser).setFiles({ name: 'logo.jpg', mimeType: 'image/jpeg', buffer: IMAGE });
    const stamp = page.locator('.stampEditor').first();
    await expect(stamp.locator('canvas')).toBeVisible({ timeout: 15_000 });
    return stamp;
  }

  test('an uploaded image is painted on the page and saved as a stamp', async ({ page }) => {
    const viewer = await open(page);
    await viewer.snapshotCanvas('before', 1);
    const stamp = await addImage(page);
    // The image itself is drawn: its canvas isn't blank.
    const inked = await stamp.locator('canvas').evaluate((c: HTMLCanvasElement) => {
      const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 0 && data[i] + data[i + 1] + data[i + 2] < 600) n++;
      return n / (data.length / 4);
    });
    expect(inked).toBeGreaterThan(0.05);

    const stamps = ofType((await save(page)).annotations, TYPE.STAMP);
    expect(stamps).toHaveLength(1);
    const box = (await stamp.boundingBox())!;
    const scale = await pixelsPerUnit(page);
    // The saved rectangle has the size the image has on screen.
    expect((stamps[0].rect[2] - stamps[0].rect[0]) * scale).toBeCloseTo(box.width, -1);
    expect((stamps[0].rect[3] - stamps[0].rect[1]) * scale).toBeCloseTo(box.height, -1);
  });

  test('moving and resizing the image changes its saved position and size', async ({ page }) => {
    await open(page);
    const stamp = await addImage(page);
    const scale = await pixelsPerUnit(page);
    const [before] = ofType((await save(page)).annotations, TYPE.STAMP);

    // Shrink it with the bottom-right handle, then move it right and down.
    await drag(page, stamp.locator('.resizer.bottomRight'), -100, -100);
    await expect.poll(async () => (await stamp.boundingBox())!.width).toBeLessThan((before.rect[2] - before.rect[0]) * scale - 50);
    await drag(page, stamp.locator('canvas'), 60, 40);

    const [after] = ofType((await save(page)).annotations, TYPE.STAMP);
    const width = (r: number[]) => r[2] - r[0];
    expect(width(after.rect), 'smaller').toBeLessThan(width(before.rect) - 50 / scale);
    // PDF y grows upwards: moving down lowers the top edge. The top-left
    // corner moved by the drag only (the resize kept it in place).
    expect((after.rect[0] - before.rect[0]) * scale).toBeCloseTo(60, -1);
    expect((before.rect[3] - after.rect[3]) * scale).toBeCloseTo(40, -1);
  });

  test('removing the image removes it from the file', async ({ page }) => {
    await open(page);
    const stamp = await addImage(page);
    await stamp.locator('.editToolbar .deleteButton').click();
    await expect(page.locator('.stampEditor')).toHaveCount(0);
    expect(ofType((await save(page)).annotations, TYPE.STAMP)).toHaveLength(0);
  });

  test('alternative text: entered in the dialog, saved in the structure tree', async ({ page }) => {
    await open(page, '&opt.enableAltText=true');
    const stamp = await addImage(page);
    await stamp.locator('.editToolbar .altText').click();
    const dialog = page.locator('#altTextDialog');
    await expect(dialog).toBeVisible();
    await page.locator('#descriptionTextarea').fill('The viewer logo');
    await page.locator('#altTextSave').click();
    await expect(dialog).toBeHidden();
    await expect(stamp.locator('.editToolbar .altText')).toHaveClass(/done/);

    expect((await save(page)).altTexts).toContain('The viewer logo');
  });

  test('alternative text: a decorative image gets none', async ({ page }) => {
    await open(page, '&opt.enableAltText=true');
    const stamp = await addImage(page);
    await stamp.locator('.editToolbar .altText').click();
    await page.locator('#descriptionTextarea').fill('Not saved');
    await page.locator('#decorativeButton').check();
    await page.locator('#altTextSave').click();

    const saved = await save(page);
    expect(ofType(saved.annotations, TYPE.STAMP)).toHaveLength(1);
    expect(saved.altTexts).not.toContain('Not saved');
  });

});

test.describe('T44 — changing annotations', () => {
  async function addImage(page: Page): Promise<Locator> {
    await page.locator('#primaryEditorStamp').click();
    const chooser = page.waitForEvent('filechooser');
    await page.locator('#editorStampAddImage').click();
    await (await chooser).setFiles({ name: 'logo.jpg', mimeType: 'image/jpeg', buffer: IMAGE });
    const stamp = page.locator('.stampEditor').first();
    await expect(stamp.locator('canvas')).toBeVisible({ timeout: 15_000 });
    return stamp;
  }

  test('copy and paste duplicates the selected image', async ({ page }) => {
    await open(page);
    const stamp = await addImage(page);
    await expect(stamp).toHaveClass(/selectedEditor/);
    await page.keyboard.press('ControlOrMeta+c');
    await page.keyboard.press('ControlOrMeta+v');
    await expect(page.locator('.stampEditor')).toHaveCount(2);

    const stamps = ofType((await save(page)).annotations, TYPE.STAMP);
    expect(stamps).toHaveLength(2);
    const size = (r: number[]) => [Math.round(r[2] - r[0]), Math.round(r[3] - r[1])];
    expect(size(stamps[1].rect), 'the copy has the same size').toEqual(size(stamps[0].rect));
  });

  test('the Delete key removes the selected image', async ({ page }) => {
    await open(page);
    const stamp = await addImage(page);
    await expect(stamp).toHaveClass(/selectedEditor/);
    await page.keyboard.press('Delete');
    await expect(page.locator('.stampEditor')).toHaveCount(0);
    expect(ofType((await save(page)).annotations, TYPE.STAMP)).toHaveLength(0);
  });

  test("changing a highlight's color in its toolbar changes the saved color", async ({ page }) => {
    await open(page);
    await page.locator('#primaryEditorHighlight').click();
    await highlightWord(page, 'Vokalia');
    const [before] = ofType((await save(page)).annotations, TYPE.HIGHLIGHT);

    const editor = page.locator('.highlightEditor').first();
    await editor.click();
    await editor.locator('.editToolbar .colorPicker').click();
    await page.locator('.highlightEditor .editToolbar [role="listbox"] button[title="Green"], .highlightEditor .editToolbar button[title="Green"]').first().click();

    const [after] = ofType((await save(page)).annotations, TYPE.HIGHLIGHT);
    expect(after.color).not.toEqual(before.color);
    const [r, g, b] = after.color!;
    expect(g, 'green').toBeGreaterThan(r);
    expect(g, 'green').toBeGreaterThan(b);
  });

  test('the font size chosen before typing is the saved font size', async ({ page }) => {
    await open(page);
    await page.locator('#primaryEditorFreeText').click();
    const size = page.locator('#editorFreeTextFontSize');
    await expect(size).toBeVisible();
    await size.fill('40');
    await size.dispatchEvent('change');
    await typeFreeText(page, 'Big words', 1, { x: 0.6, y: 0.2 });

    const freeTexts = (await save(page)).annotations.filter((a) => a.subtype === 'FreeText');
    expect(freeTexts.map((f) => f.contents)).toEqual(['Big words']);
    expect(freeTexts[0].fontSize).toBe(40);
  });
});

test.describe('T44 — signatures', () => {
  const SIGNING = '&opt.enableSignatureEditor=true&showSignatureEditor=true';

  async function openDialog(page: Page): Promise<Locator> {
    await page.locator('#primaryEditorSignatureButton').click();
    await page.locator('#editorSignatureAddSignature').click();
    const dialog = page.locator('#addSignatureDialog');
    await expect(dialog).toBeVisible();
    return dialog;
  }

  async function addAndCheck(page: Page, description: string): Promise<void> {
    const add = page.locator('#addSignatureAddButton');
    await expect(add).toBeEnabled();
    await add.click();
    await expect(page.locator('#addSignatureDialog')).toBeHidden();
    await expect(page.locator('.signatureEditor')).toHaveCount(1);

    const saved = await save(page);
    const stamps = ofType(saved.annotations, TYPE.STAMP);
    expect(stamps, 'a signature is saved as a stamp').toHaveLength(1);
    expect(saved.altTexts).toContain(description);
  }

  test('a typed signature is placed on the page and saved with its description', async ({ page }) => {
    await open(page, SIGNING);
    await openDialog(page);
    await page.locator('#addSignatureTypeButton').click();
    await expect(page.locator('#addSignatureAddButton')).toBeDisabled();
    await page.locator('#addSignatureTypeInput').fill('Ada Lovelace');
    await expect(page.locator('#addSignatureDescInput')).toHaveValue('Ada Lovelace');
    await addAndCheck(page, 'Ada Lovelace');
  });

  test('a drawn signature', async ({ page }) => {
    await open(page, SIGNING);
    await openDialog(page);
    await page.locator('#addSignatureDrawButton').click();
    await expect(page.locator('#addSignatureAddButton')).toBeDisabled();
    const pad = page.locator('#addSignatureDraw');
    const box = (await pad.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3, { steps: 10 });
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.6, { steps: 10 });
    await page.mouse.up();
    await page.locator('#addSignatureDescInput').fill('My squiggle');
    await addAndCheck(page, 'My squiggle');
  });

  /** A scanned signature: dark strokes on white, as a PNG file. */
  async function signatureImage(page: Page): Promise<Buffer> {
    const base64 = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 400, 150);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(30, 110);
      ctx.bezierCurveTo(100, 10, 160, 140, 220, 60);
      ctx.bezierCurveTo(260, 10, 320, 140, 370, 40);
      ctx.stroke();
      return canvas.toDataURL('image/png').split(',')[1];
    });
    return Buffer.from(base64, 'base64');
  }

  test('a signature from an image file', async ({ page }) => {
    await open(page, SIGNING);
    await openDialog(page);
    await page.locator('#addSignatureImageButton').click();
    const file = { name: 'my-signature.png', mimeType: 'image/png', buffer: await signatureImage(page) };
    await page.locator('#addSignatureFilePicker').setInputFiles(file);
    // The file name is the default description.
    await expect(page.locator('#addSignatureDescInput')).toHaveValue('my-signature.png', { timeout: 10_000 });
    await page.locator('#addSignatureDescInput').fill('Scanned signature');
    await addAndCheck(page, 'Scanned signature');
  });

  test('an image without a signature in it is rejected with a message', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await open(page, SIGNING);
    await openDialog(page);
    await page.locator('#addSignatureImageButton').click();
    // A colorful logo has no strokes pdf.js could take as a signature.
    await page.locator('#addSignatureFilePicker').setInputFiles({ name: 'logo.jpg', mimeType: 'image/jpeg', buffer: IMAGE });

    await expect(page.locator('#addSignatureError')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#addSignatureErrorTitle')).not.toHaveText('');
    await expect(page.locator('#addSignatureAddButton')).toBeDisabled();
    expect(errors, 'no uncaught errors').toEqual([]);

    await page.locator('#addSignatureErrorCloseButton').click();
    await expect(page.locator('#addSignatureError')).toBeHidden();
  });

  test('a saved signature can be placed again with one click', async ({ page }) => {
    await open(page, SIGNING);
    await openDialog(page);
    await page.locator('#addSignatureTypeButton').click();
    await page.locator('#addSignatureTypeInput').fill('Ada Lovelace');
    await expect(page.locator('#addSignatureSaveCheckbox')).toBeChecked();
    await page.locator('#addSignatureAddButton').click();
    await expect(page.locator('.signatureEditor')).toHaveCount(1);

    const savedButton = page.locator('.toolbarAddSignatureButton', { hasText: 'Ada Lovelace' });
    await expect(savedButton).toBeVisible();
    await savedButton.click();
    await expect(page.locator('.signatureEditor')).toHaveCount(2);

    expect(ofType((await save(page)).annotations, TYPE.STAMP)).toHaveLength(2);
  });

  test('cancelling the dialog places no signature', async ({ page }) => {
    await open(page, SIGNING);
    await openDialog(page);
    await page.locator('#addSignatureTypeButton').click();
    await page.locator('#addSignatureTypeInput').fill('Not me');
    await page.locator('#addSignatureCancelButton').click();
    await expect(page.locator('#addSignatureDialog')).toBeHidden();
    await expect(page.locator('.signatureEditor')).toHaveCount(0);
    expect(ofType((await save(page)).annotations, TYPE.STAMP)).toHaveLength(0);
  });
});
