import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T47 — loading documents: passwords, drag and drop, switching documents
 * while one is still loading, range requests - and reading form data back.
 *
 * Runs on the bare viewer (src/app/e2e-harness), which records every output
 * in window.__ngxEvents.
 */

test.describe.configure({ mode: 'parallel' });

const PROTECTED = '/assets/pdfs/GraalVM-password-protected.pdf';
const PASSWORD = 'graalvm-rocks!';
const SMALL = '/assets/pdfs/blind-text-collection.pdf';
const BIG = '/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';
const FORM = '/assets/pdfs/OoPdfFormExample.pdf';

type Recorded = { name: string; t: number; payload: any };
const events = async (page: Page): Promise<Recorded[]> => (await page.evaluate(() => (window as any).__ngxEvents)) ?? [];
const named = async (page: Page, name: string) => (await events(page)).filter((e) => e.name === name);
const app = (page: Page, expr: string) => page.evaluate((e) => new Function('app', `return (${e});`)((window as any).__ngxApp), expr);

test.describe('T47 — password-protected documents', () => {
  test('a wrong password is rejected, the right one opens the document', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${PROTECTED}`);
    const dialog = page.locator('#passwordDialog');
    await expect(dialog).toBeVisible({ timeout: 30_000 });
    const prompt = await page.locator('#passwordText').textContent();

    await page.locator('#password').fill('wrong');
    await page.locator('#passwordSubmit').click();
    // Asked again, now with "incorrect password".
    await expect(dialog).toBeVisible();
    await expect(page.locator('#passwordText')).not.toHaveText(prompt!);
    await expect(page.locator('#password')).toHaveValue('');
    expect(await named(page, 'pdfLoaded')).toHaveLength(0);

    await page.locator('#password').fill(PASSWORD);
    await page.locator('#password').press('Enter');
    await expect(dialog).toBeHidden();
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);
    await expect.poll(async () => (await named(page, 'pdfLoaded')).length).toBe(1);
  });

  test('the password is hidden while typing, Enter submits without reloading, and Chrome has nothing to complain about', async ({ page }) => {
    const domWarnings: string[] = [];
    page.on('console', (m) => {
      if (/password/i.test(m.text()) && /\[DOM\]|form/i.test(m.text())) domWarnings.push(m.text());
    });
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${PROTECTED}`);
    await expect(page.locator('#passwordDialog')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    const url = page.url();
    let navigated = false;
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) navigated = true;
    });

    await page.locator('#password').fill(PASSWORD);
    await page.locator('#password').press('Enter');
    await viewer.waitForFirstPageRender();
    expect(navigated, 'Enter must not submit the form to the server').toBe(false);
    expect(page.url()).toBe(url);
    // pdf.js handles Enter and the OK button itself - the form must not check the password a second time.
    await page.waitForTimeout(500);
    expect((await named(page, 'pdfLoaded')).length).toBe(1);
    expect(domWarnings).toEqual([]);
  });

  test('cancelling the password dialog opens nothing', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${PROTECTED}`);
    await expect(page.locator('#passwordDialog')).toBeVisible({ timeout: 30_000 });
    await page.locator('#passwordCancel').click();
    await expect(page.locator('#passwordDialog')).toBeHidden();
    await page.waitForTimeout(1000);
    expect(await named(page, 'pdfLoaded')).toHaveLength(0);
    await expect(page.locator('.page canvas')).toHaveCount(0);
  });

  test('[password]: a password passed in opens the document without asking', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${PROTECTED}&password=${PASSWORD}`);
    await viewer.waitForFirstPageRender();
    await expect(page.locator('#passwordDialog')).toBeHidden();
    await viewer.assertCanvasHasContent(1);
  });
});

test.describe('T47 — drag and drop', () => {
  /** Drops `url`'s bytes as a file onto the viewer, like a user dragging a file from the desktop. */
  async function dropFile(page: Page, url: string, name: string): Promise<void> {
    const bytes = Array.from(new Uint8Array(await (await page.request.get(url)).body()));
    await page.evaluate(
      ({ bytes, name }) => {
        const file = new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const target = document.getElementById('viewerContainer')!;
        for (const type of ['dragenter', 'dragover', 'drop']) {
          target.dispatchEvent(new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }));
        }
      },
      { bytes, name },
    );
  }

  test('dropping a PDF file opens it', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${BIG}`);
    await viewer.waitForFirstPageRender();
    await expect.poll(async () => (await named(page, 'pdfLoaded')).map((e) => e.payload.pagesCount), { timeout: 30_000 }).toEqual([333]);

    await dropFile(page, SMALL, 'dropped.pdf');
    await expect.poll(async () => (await named(page, 'pdfLoaded')).map((e) => e.payload.pagesCount), { timeout: 30_000 }).toEqual([333, 1]);
    await viewer.waitForPageRender(1);
    await viewer.expectRenderedTextContains('Vokalia');
  });

  test('[enableDragAndDrop]="false": dropping does nothing', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${BIG}&enableDragAndDrop=false`);
    await viewer.waitForFirstPageRender();
    await expect.poll(async () => (await named(page, 'pdfLoaded')).length, { timeout: 30_000 }).toBe(1);

    await dropFile(page, SMALL, 'dropped.pdf');
    await page.waitForTimeout(2000);
    expect((await named(page, 'pdfLoaded')).length).toBe(1);
    expect(await app(page, 'app.pagesCount')).toBe(333);
  });
});

test.describe('T47 — network', () => {
  /**
   * Serves BIG the way a server with range support does - the dev server may
   * not - and records which byte ranges pdf.js asks for.
   */
  async function serveWithRanges(page: Page): Promise<string[]> {
    const bytes = Buffer.from(await (await page.request.get(BIG)).body());
    const ranges: string[] = [];
    await page.route(
      (u) => decodeURIComponent(u.pathname) === BIG,
      async (route) => {
        const range = route.request().headers()['range'];
        const headers = { 'Accept-Ranges': 'bytes', 'Content-Type': 'application/pdf' };
        const match = /bytes=(\d+)-(\d+)?/.exec(range ?? '');
        if (!match) {
          await route.fulfill({ status: 200, headers: { ...headers, 'Content-Length': String(bytes.length) }, body: bytes });
          return;
        }
        ranges.push(range);
        const from = Number(match[1]);
        const to = match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
        await route.fulfill({
          status: 206,
          headers: { ...headers, 'Content-Range': `bytes ${from}-${to}/${bytes.length}`, 'Content-Length': String(to - from + 1) },
          body: bytes.subarray(from, to + 1),
        });
      },
    );
    return ranges;
  }

  test('a large file is loaded in ranges: the first page shows without downloading everything', async ({ page }) => {
    const ranges = await serveWithRanges(page);
    const viewer = new PdfViewerPage(page);
    // Without streaming and auto-fetch, pdf.js loads only the ranges it needs.
    await viewer.goto(`/e2e/viewer?src=${BIG}&opt.disableStream=true&opt.disableAutoFetch=true`);
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);
    expect(ranges.length, 'range requests').toBeGreaterThan(0);
    const loaded = ranges.map((r) => /bytes=(\d+)-(\d+)/.exec(r)!).reduce((sum, m) => sum + Number(m[2]) - Number(m[1]) + 1, 0);
    expect(loaded, 'bytes loaded for page 1').toBeLessThan(1_694_231 / 2);
  });

  test('[disableRange] and [disableStream] off: the file is still shown when ranges are available', async ({ page }) => {
    const ranges = await serveWithRanges(page);
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${BIG}&opt.disableRange=true`);
    await viewer.waitForFirstPageRender();
    await viewer.assertCanvasHasContent(1);
    expect(ranges, 'no range requests with disableRange').toEqual([]);
  });

  test('[disableRange]: the file is loaded in one go', async ({ page }) => {
    const ranges: string[] = [];
    page.on('request', (r) => {
      if (decodeURIComponent(r.url()).endsWith(BIG) && r.headers()['range']) ranges.push(r.headers()['range']);
    });
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${BIG}&opt.disableRange=true&opt.disableStream=true`);
    await viewer.waitForFirstPageRender();
    expect(ranges).toEqual([]);
  });

  test('switching to another document while the first one is still loading shows the second one', async ({ page }) => {
    // Hold the big file back, so it's still loading when the source changes.
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(
      (u) => decodeURIComponent(u.pathname) === BIG,
      async (route) => {
        await held;
        await route.continue();
      },
    );
    const viewer = new PdfViewerPage(page);
    const requested = page.waitForRequest((r) => decodeURIComponent(r.url()).endsWith(BIG), { timeout: 30_000 });
    await viewer.goto(`/e2e/viewer?src=${BIG}`);
    await viewer.waitForViewerMounted();
    await requested;

    await page.evaluate((src) => (window as any).__setInput('src', src), SMALL);
    await expect.poll(async () => (await named(page, 'pdfLoaded')).map((e) => e.payload.pagesCount), { timeout: 30_000 }).toContain(1);
    release();
    await page.waitForTimeout(3000);

    // The late file must not replace the document the user asked for last.
    expect(await app(page, 'app.pagesCount')).toBe(1);
    expect((await named(page, 'pdfLoaded')).at(-1)!.payload.pagesCount).toBe(1);
    await viewer.assertCanvasHasContent(1);
  });
});

test.describe('T47 — form data', () => {
  type Field = { fieldAnnotation: { fieldName: string; fieldValue: unknown; value: unknown; exportValue?: string }; pageNumber: number };
  const formData = async (page: Page, current: boolean): Promise<Field[]> =>
    await page.evaluate(async (c) => {
      const fields = await (window as any).__ngxService.getFormData(c);
      return fields.map((f: any) => ({
        pageNumber: f.pageNumber,
        fieldAnnotation: { fieldName: f.fieldAnnotation.fieldName, fieldValue: f.fieldAnnotation.fieldValue, value: f.fieldAnnotation.value, exportValue: f.fieldAnnotation.exportValue },
      }));
    }, current);

  test('getFormData(): the current values of edited and untouched fields', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${FORM}`);
    await viewer.waitForFirstPageRender();
    const first = page.locator('.annotationLayer [name="firstName"]');
    await expect(first).toBeVisible({ timeout: 15_000 });

    const before = await formData(page, true);
    const byName = (fields: Field[], name: string) => fields.find((f) => f.fieldAnnotation.fieldName === name)!.fieldAnnotation;
    const lastNameBefore = byName(before, 'lastName');

    await first.fill('Ada');
    await first.press('Tab');
    const after = await formData(page, true);
    expect(byName(after, 'firstName').value).toBe('Ada');
    // A field nobody touched reports the value it has - the one in the file.
    expect(byName(after, 'lastName').value, 'untouched field').toEqual(lastNameBefore.fieldValue);

    // getFormData(false) reports the file's values only.
    const original = await formData(page, false);
    expect(byName(original, 'firstName').value).toBeUndefined();
    expect(byName(original, 'firstName').fieldValue).not.toBe('Ada');
  });

  test('[formData]: values set by the application appear in the fields; edits are reported back', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${FORM}&formData={"firstName":"Grace","lastName":"Hopper"}`);
    await viewer.waitForFirstPageRender();
    await expect(page.locator('.annotationLayer [name="firstName"]')).toHaveValue('Grace', { timeout: 15_000 });
    await expect(page.locator('.annotationLayer [name="lastName"]')).toHaveValue('Hopper');

    await page.locator('.annotationLayer [name="lastName"]').fill('Brewster Hopper');
    await page.locator('.annotationLayer [name="lastName"]').press('Tab');
    await expect.poll(async () => (await named(page, 'formDataChange')).at(-1)?.payload?.lastName).toBe('Brewster Hopper');
  });

  test('[disableForms]: fields are read-only and editing is impossible', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${FORM}&disableForms=true`);
    await viewer.waitForFirstPageRender();
    const first = page.locator('.annotationLayer [name="firstName"]');
    await expect(first).toBeVisible({ timeout: 15_000 });
    await expect(first).toBeDisabled();
    await page.evaluate(() => (window as any).__setInput('disableForms', false));
    await expect(first).toBeEnabled();
    await first.fill('Ada');
    await expect(first).toHaveValue('Ada');
  });

  // XFA forms: see T51, which uses our own XFA form with every kind of field.
});
