import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { drawInk, highlightWord, typeFreeText } from '../poms/editor-gestures';
import { downloadPdf, readPdf, readServedPdf, type SavedAnnotation } from '../poms/pdf-file';

/**
 * T40 — what the user changes in the viewer is in the file they save.
 *
 * Every test edits a document the way a user does, saves it with the
 * toolbar's download button, and reopens the downloaded bytes with pdf.js -
 * outside the viewer - to check that the edit is really in the file. The
 * viewer's own state (annotation storage, serialized editors) isn't trusted
 * here: only the bytes count.
 *
 * Runs on the bare viewer (src/app/e2e-harness), so each test sets exactly
 * the inputs it needs.
 */

test.describe.configure({ mode: 'parallel' });

const FORM = '/assets/pdfs/OoPdfFormExample.pdf';
const TEXT = '/assets/pdfs/blind-text-collection.pdf';
const FLYER = '/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf';

/** pdf.js AnnotationType values. */
const TYPE = { FREETEXT: 3, HIGHLIGHT: 9, INK: 15, WIDGET: 20 };

async function open(page: import('@playwright/test').Page, query: string): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?${query}`);
  await viewer.waitForFirstPageRender();
  return viewer;
}

const widget = (annotations: SavedAnnotation[], name: string) =>
  annotations.filter((a) => a.annotationType === TYPE.WIDGET && a.fieldName === name);

test('T40 — form values the user enters are in the saved file', async ({ page }) => {
  await open(page, `src=${FORM}`);
  const original = await readServedPdf(page, FORM);
  const field = (name: string) => page.locator(`.annotationLayer [name="${name}"]`);
  await expect(field('firstName')).toBeVisible({ timeout: 15_000 });

  await field('firstName').fill('Ada');
  await field('lastName').fill('Lovelace');
  await field('otherJobExperience').fill('Analytical Engine');
  await field('otherJobExperience').press('Tab');

  // A country other than the current one.
  const countries = await field('country').locator('option').evaluateAll((os) =>
    os.map((o) => (o as HTMLOptionElement).value).filter((v) => v.trim() !== ''),
  );
  const country = countries[countries.length - 1];
  await field('country').selectOption(country);

  // Flip a checkbox, whatever its initial state.
  const javaScript = field('javaScript');
  const wasChecked = await javaScript.isChecked();
  await javaScript.click();
  await expect(javaScript).toBeChecked({ checked: !wasChecked });

  // Pick the third education level.
  const radio = field('educationLevel').nth(2);
  await radio.check();
  const radioId = await radio.evaluate((el) => el.closest('[data-annotation-id]')!.getAttribute('data-annotation-id'));

  const saved = (await readPdf(page, await downloadPdf(page))).annotations;

  expect(widget(saved, 'firstName')[0].fieldValue).toBe('Ada');
  expect(widget(saved, 'lastName')[0].fieldValue).toBe('Lovelace');
  expect(widget(saved, 'otherJobExperience')[0].fieldValue).toBe('Analytical Engine');
  expect([widget(saved, 'country')[0].fieldValue].flat()).toEqual([country]);

  const savedJs = widget(saved, 'javaScript')[0];
  const originalJs = widget(original.annotations, 'javaScript')[0];
  expect(savedJs.fieldValue, 'the checkbox state changed in the file').not.toBe(originalJs.fieldValue);
  expect(savedJs.fieldValue === 'Off', 'saved checkbox state').toBe(wasChecked);

  // The radio group's value is the export value of the chosen button.
  const chosen = saved.find((a) => a.id === radioId)!;
  expect(chosen.radioButton).toBe(true);
  expect(widget(saved, 'educationLevel')[0].fieldValue).toBe(chosen.buttonValue);
});

test('T40 — drawn, typed and highlighted annotations are in the saved file', async ({ page }) => {
  const viewer = await open(page, `src=${TEXT}`);
  const original = await readServedPdf(page, TEXT);
  const typesBefore = original.annotations.map((a) => a.annotationType);
  expect(typesBefore).not.toContain(TYPE.INK);
  expect(typesBefore).not.toContain(TYPE.FREETEXT);
  expect(typesBefore).not.toContain(TYPE.HIGHLIGHT);

  await viewer.activateEditor('draw');
  await drawInk(page, 1, { x: 120, y: 60 });
  await viewer.activateEditor('draw');

  await viewer.activateEditor('text');
  await typeFreeText(page, 'T40 saved note', 1, { x: 0.6, y: 0.2 });
  await viewer.activateEditor('text');

  await viewer.activateEditor('highlight');
  const highlighted = await highlightWord(page, 'Vokalia');
  await viewer.activateEditor('highlight');

  const saved = await readPdf(page, await downloadPdf(page));
  const onPage1 = saved.annotations.filter((a) => a.page === 1);

  expect(onPage1.filter((a) => a.annotationType === TYPE.INK), 'ink').toHaveLength(1);
  const freeText = onPage1.filter((a) => a.annotationType === TYPE.FREETEXT);
  expect(freeText, 'free text').toHaveLength(1);
  expect(freeText[0].contents).toContain('T40 saved note');
  expect(onPage1.filter((a) => a.annotationType === TYPE.HIGHLIGHT), `highlight of "${highlighted}"`).toHaveLength(1);
  // Nothing else changed: the page text and page count are the original ones.
  expect(saved.numPages).toBe(original.numPages);
  expect(saved.pageTexts).toEqual(original.pageTexts);
});

test('T40 — a page the user moved stays moved in the saved file', async ({ page }) => {
  const viewer = await open(page, `src=${FLYER}&enablePageReordering=true&showMovePageButton=always-visible`);
  const original = await readServedPdf(page, FLYER);
  expect(original.numPages).toBeGreaterThan(1);
  expect(original.pageTexts[0]).not.toBe(original.pageTexts[1]);
  await expect.poll(async () => await viewer.getCurrentPage()).toBe(1);

  // Move page 1 one position down.
  await page.locator('#primaryMoveDownButton').click();
  await expect.poll(async () => await viewer.getTextLayerContent(1).catch(() => ''), { timeout: 15_000 }).not.toBe(
    await viewer.getTextLayerContent(2).catch(() => ''),
  );

  const saved = await readPdf(page, await downloadPdf(page));
  expect(saved.numPages).toBe(original.numPages);
  expect(saved.pageTexts[0], 'the old page 2 comes first').toBe(original.pageTexts[1]);
  expect(saved.pageTexts[1], 'the old page 1 comes second').toBe(original.pageTexts[0]);
  expect(saved.pageTexts.slice(2)).toEqual(original.pageTexts.slice(2));
});
