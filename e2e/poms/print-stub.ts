import type { Page } from '@playwright/test';

/**
 * Replaces window.print() - and print() of the iframes pdf.js may print
 * from - with a stub, because the real print dialog would block the test.
 * The stub counts its calls in `window.__printCalls` and records in
 * `window.__printedPages` how many pages pdf.js had put into its print
 * container at the moment it called print(). `window.__printedFingerprints`
 * holds a fingerprint of each printed page image (see `fingerprint()`), so a
 * test can tell which pages were printed, not just how many. Call it before
 * `goto()`.
 */
export async function stubPrint(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as any;
    w.__printCalls = 0;
    w.__printedPages = -1;
    w.__printedFingerprints = [];
    /** A page shrunk to 32 x 32 gray values: enough to tell the pages of a document apart. */
    w.__fingerprint = (source: CanvasImageSource) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 32, 32);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 32).data;
      const gray: number[] = [];
      for (let i = 0; i < data.length; i += 4) gray.push(Math.round((data[i] + data[i + 1] + data[i + 2]) / 3));
      return gray;
    };
    const stub = () => {
      w.__printCalls += 1;
      w.__printedPages = document.querySelectorAll('#printContainer > *').length;
      w.__printedFingerprints = Array.from(document.querySelectorAll<HTMLImageElement>('#printContainer img')).map((img) => w.__fingerprint(img));
    };
    window.print = stub;
    const patchIframes = () => {
      document.querySelectorAll('iframe').forEach((f) => {
        try {
          if (f.contentWindow) f.contentWindow.print = stub;
        } catch {
          // cross-origin iframe - not ours
        }
      });
    };
    new MutationObserver(patchIframes).observe(document, { childList: true, subtree: true });
    patchIframes();
  });
}
