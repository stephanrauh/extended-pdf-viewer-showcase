import type { Page } from '@playwright/test';

/**
 * Replaces window.print() - and print() of the iframes pdf.js may print
 * from - with a stub, because the real print dialog would block the test.
 * The stub counts its calls in `window.__printCalls` and records in
 * `window.__printedPages` how many pages pdf.js had put into its print
 * container at the moment it called print(). Call it before `goto()`.
 */
export async function stubPrint(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as any;
    w.__printCalls = 0;
    w.__printedPages = -1;
    const stub = () => {
      w.__printCalls += 1;
      w.__printedPages = document.querySelectorAll('#printContainer > *').length;
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
