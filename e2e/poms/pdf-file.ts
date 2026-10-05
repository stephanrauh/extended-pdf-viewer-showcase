import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

/** What a saved PDF contains, as pdf.js reads it back. */
export type PdfContents = {
  numPages: number;
  /** The text of each page, in page order. */
  pageTexts: string[];
  annotations: SavedAnnotation[];
  /** The alternative texts of the figures in the structure tree (where image and signature descriptions go). */
  altTexts: string[];
};

export type SavedAnnotation = {
  /** pdf.js's annotation id, e.g. '42R' - the viewer's `data-annotation-id`. */
  id: string;
  page: number;
  annotationType: number;
  subtype: string;
  /** The comment / free-text content, if any. */
  contents: string;
  /** [x1, y1, x2, y2] in PDF units, origin bottom-left. */
  rect: number[];
  /** [r, g, b], 0-255 - e.g. a highlight's color. */
  color?: number[];
  /** Free text: the font size. */
  fontSize?: number;
  /** Ink annotations only: the number of separate strokes. */
  inkLines?: number;
  /** Form widgets only. */
  fieldName?: string;
  fieldValue?: unknown;
  buttonValue?: unknown;
  checkBox?: boolean;
  radioButton?: boolean;
};

/**
 * Clicks the toolbar's download button and returns the bytes the browser
 * saved - the file the user ends up with, edits included.
 */
export async function downloadPdf(page: Page): Promise<Buffer> {
  const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
  await page.locator('#downloadButton').click();
  const download = await downloadPromise;
  return readFileSync((await download.path())!);
}

/**
 * Opens a PDF with the page's pdf.js - independent of the viewer, which stays
 * untouched - and reports its pages, texts and annotations.
 */
export async function readPdf(page: Page, bytes: Buffer): Promise<PdfContents> {
  return await page.evaluate(async (base64) => {
    const data = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const task = (window as any).pdfjsLib.getDocument({ data });
    const doc = await task.promise;
    const pageTexts: string[] = [];
    const annotations: any[] = [];
    const altTexts: string[] = [];
    const collectAlt = (node: any) => {
      if (node?.alt) altTexts.push(node.alt);
      for (const child of node?.children ?? []) collectAlt(child);
    };
    for (let n = 1; n <= doc.numPages; n++) {
      const p = await doc.getPage(n);
      collectAlt(await p.getStructTree());
      const text = await p.getTextContent();
      pageTexts.push(text.items.map((i: any) => i.str).join(' ').replace(/\s+/g, ' ').trim());
      for (const a of await p.getAnnotations()) {
        annotations.push({
          id: a.id,
          page: n,
          annotationType: a.annotationType,
          subtype: a.subtype,
          contents: a.contentsObj?.str ?? (Array.isArray(a.textContent) ? a.textContent.join('\n') : '') ?? '',
          rect: Array.from(a.rect ?? []),
          color: a.color ? Array.from(a.color) : undefined,
          fontSize: a.defaultAppearanceData?.fontSize,
          inkLines: Array.isArray(a.inkLists) ? a.inkLists.length : undefined,
          fieldName: a.fieldName,
          fieldValue: a.fieldValue,
          buttonValue: a.buttonValue,
          checkBox: a.checkBox,
          radioButton: a.radioButton,
        });
      }
    }
    const numPages = doc.numPages;
    await task.destroy();
    return { numPages, pageTexts, annotations, altTexts };
  }, bytes.toString('base64'));
}

/**
 * Opens `bytes` in the bare viewer (src/app/e2e-harness), the way a user
 * opens a file they saved earlier. `query` adds viewer inputs.
 */
export async function openInViewer(page: Page, bytes: Buffer, query = ''): Promise<void> {
  const url = `/e2e-saved-${Date.now()}.pdf`;
  // Match the path only: a glob would also match the viewer's own URL, whose query contains it.
  await page.route(
    (u) => u.pathname === url,
    (route) => route.fulfill({ body: bytes, contentType: 'application/pdf' }),
  );
  await page.goto(`/e2e/viewer?src=${url}${query}`, { waitUntil: 'domcontentloaded' });
  await page.locator('ngx-extended-pdf-viewer .page canvas').first().waitFor({ state: 'visible', timeout: 60_000 });
}

/** Reads a PDF the showcase serves, e.g. '/assets/pdfs/x.pdf'. */
export async function readServedPdf(page: Page, url: string): Promise<PdfContents> {
  const response = await page.request.get(url);
  return await readPdf(page, Buffer.from(await response.body()));
}
