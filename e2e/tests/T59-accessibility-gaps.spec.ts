import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

/**
 * T59 — the accessibility topics T54 and T56 don't cover (React-migration.md, Step 1):
 * live announcements, dialog semantics, visible keyboard focus, Windows high-contrast
 * mode, reduced motion, reflow at 320 px, the structure tree of tagged PDFs and the
 * contrast of the toolbar's text fields.
 *
 * Tests marked `test.fail()` document a defect that isn't fixed yet: the suite stays
 * green, and Playwright reports "expected to fail, but passed" once it is. Remove the
 * marker then.
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';

async function open(page: Page, query = '', src = DOC): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?src=${src}${query}`);
  await viewer.waitForFirstPageRender();
  await page.waitForTimeout(500);
  return viewer;
}

async function find(page: Page, term: string): Promise<void> {
  await page.locator('#viewerContainer').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('ControlOrMeta+f');
  await page.keyboard.type(term);
  await page.keyboard.press('Enter');
}

/** The pixels of the element (plus a margin for focus rings) as PNG. */
async function look(page: Page, target: string | Locator, margin = 4): Promise<Buffer> {
  const element = typeof target === 'string' ? page.locator(target).first() : target;
  const box = await element.evaluate((e) => {
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  return await page.screenshot({ clip: { x: box.x - margin, y: box.y - margin, width: box.width + 2 * margin, height: box.height + 2 * margin } });
}

test.describe('live announcements', () => {
  test('the find result is a live region, and it follows the current match', async ({ page }) => {
    await open(page);
    await find(page, 'principiantes');
    const count = page.locator('#findResultsCount');
    await expect(count).toHaveText(/1\D+of\D+\d+/, { timeout: 15_000 });
    expect(await count.evaluate((e) => e.closest('[aria-live]')?.getAttribute('aria-live'))).toBe('polite');
    await page.keyboard.press('Enter');
    await expect(count).toHaveText(/2\D+of\D+\d+/);
  });

  test('the find result is announced once: no live region inside another one', async ({ page }) => {
    await open(page);
    await find(page, 'principiantes');
    await expect(page.locator('#findResultsCount')).toHaveText(/of/, { timeout: 15_000 });
    const liveAncestors = await page.locator('#findResultsCount').evaluate((e) => {
      let n = 0;
      for (let a: Element | null = e; a; a = a.parentElement) if (a.hasAttribute('aria-live')) n++;
      return n;
    });
    expect(liveAncestors).toBe(1);
  });
});

test.describe('dialogs', () => {
  test('an open dialog is modal: the page behind it is inert, and Tab stays in the dialog', async ({ page }) => {
    await open(page, '&show=always-visible');
    await page.locator('#documentProperties').click();
    const dialog = page.locator('#documentPropertiesDialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((d) => d.matches(':modal'))).toBe(true);
    // a click on a toolbar button hits the dialog's backdrop instead
    const hit = await page.locator('#printButton').evaluate((b) => {
      const r = b.getBoundingClientRect();
      const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return b === e || b.contains(e);
    });
    expect(hit).toBe(false);
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      // inside the dialog, or on the browser's own controls (the body is the active element then)
      const where = await page.evaluate(() => (document.activeElement === document.body ? 'browser' : document.activeElement?.closest('dialog[open]') ? 'dialog' : document.activeElement?.id || document.activeElement?.tagName));
      expect(['dialog', 'browser']).toContain(where);
    }
  });

  test('the document properties dialog has an accessible name', async ({ page }) => {
    await open(page, '&show=always-visible');
    await page.locator('#documentProperties').click();
    await expect(page.locator('#documentPropertiesDialog')).toBeVisible();
    await expect(page.locator('#documentPropertiesDialog')).toHaveAccessibleName(/\S/);
  });

  test('the password dialog has an accessible name', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/e2e/viewer?src=/assets/pdfs/GraalVM-password-protected.pdf');
    await expect(page.locator('#passwordDialog')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('#passwordDialog')).toHaveAccessibleName(/\S/);
  });
});

test.describe('visible keyboard focus', () => {
  /** ids of the enabled controls in `scope` that look the same with and without the keyboard focus. */
  async function invisibleFocus(page: Page, scope: string): Promise<string[]> {
    await page.mouse.move(0, 0);
    const ids = await page.locator(scope).first().evaluate((root) =>
      Array.from(root.querySelectorAll<HTMLElement>('button, input, select'))
        .filter((e) => e.id && e.checkVisibility() && e.getBoundingClientRect().width > 0 && !(e as HTMLButtonElement).disabled)
        .map((e) => e.id),
    );
    expect(ids.length, `controls in ${scope}`).toBeGreaterThan(0);
    const invisible: string[] = [];
    for (const id of ids) {
      const control = page.locator(`${scope} [id="${id}"]`).first();
      // a checkbox shows its focus on the option around it
      const zone = (await control.evaluate((e) => e.matches('[type=checkbox]'))) ? control.locator('xpath=..') : control;
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      const before = await look(page, zone);
      await control.focus();
      await page.keyboard.press('Shift'); // a key press makes the browser treat the focus as keyboard focus
      const after = await look(page, zone);
      if (before.equals(after)) invisible.push(id);
    }
    return invisible;
  }

  for (const theme of ['light', 'dark']) {
    test(`${theme} theme: every control of the toolbar, the menu and the find bar shows the keyboard focus`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: 1920, height: 1000 });
      await open(page, `&theme=${theme}&show=always-visible`);
      expect(await invisibleFocus(page, '#toolbarViewer'), 'toolbar').toEqual([]);
      await page.locator('#secondaryToolbarToggle').click();
      await expect(page.locator('#secondaryToolbar')).toBeVisible();
      expect(await invisibleFocus(page, '#secondaryToolbar'), 'menu').toEqual([]);
      await page.keyboard.press('Escape');
      await find(page, 'que');
      await expect(page.locator('#findbar')).toBeVisible();
      expect(await invisibleFocus(page, '#findbar'), 'find bar').toEqual([]);
    });
  }
});

test.describe('Windows high-contrast mode (forced-colors: active)', () => {
  test('the toolbar icons stay visible', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await open(page, '&show=always-visible');
    // an icon draws in the text color; forced colors keeps it distinct from the background
    for (const id of ['primaryZoomIn', 'printButton', 'secondaryToolbarToggle']) {
      const [color, background] = await page.locator(`#${id} svg`).first().evaluate((svg) => {
        const toolbar = svg.closest('#toolbarContainer')!;
        return [getComputedStyle(svg).color, getComputedStyle(toolbar).backgroundColor];
      });
      expect(color, id).not.toBe(background);
    }
  });

  async function looksDifferentOnAndOff(page: Page): Promise<boolean> {
    await open(page, '&show=always-visible');
    await expect(page.locator('#scrollVertical')).toHaveAttribute('aria-pressed', 'true');
    const on = await look(page, '#scrollVertical', 0);
    await page.locator('#scrollWrapped').click();
    await expect(page.locator('#scrollVertical')).toHaveAttribute('aria-pressed', 'false');
    await page.mouse.move(0, 0);
    const off = await look(page, '#scrollVertical', 0);
    return !on.equals(off);
  }

  // guards the comparison below: without forced colors, the difference is there
  test('without forced colors, a toggle button looks different on and off', async ({ page }) => {
    expect(await looksDifferentOnAndOff(page)).toBe(true);
  });

  test('a toggle button shows whether it is on', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await looksDifferentOnAndOff(page), 'the button looks the same on and off').toBe(true);
  });
});

test.describe('reduced motion', () => {
  async function flipDuration(page: Page): Promise<number> {
    await open(page, '&pageViewMode=book&show=always-visible');
    await expect.poll(() => page.evaluate(() => !!(window as any).__ngxApp.pdfViewer.pageFlip)).toBe(true);
    await page.waitForTimeout(500);
    const flip = () =>
      page.evaluate(() => {
        const pageFlip = (window as any).__ngxApp.pdfViewer.pageFlip;
        return { index: pageFlip.getCurrentPageIndex() as number, state: pageFlip.getState() as string };
      });
    const before = (await flip()).index;
    const start = Date.now();
    await page.locator('#primaryNext').click();
    // a reduced-motion flip can be over before a poll ever sees the state 'flipping'
    await expect.poll(async () => {
      const { index, state } = await flip();
      return index !== before && state === 'read';
    }, { intervals: [25] }).toBe(true);
    return Date.now() - start;
  }

  test('without the preference, book mode turns the page with an animation', async ({ page }) => {
    expect(await flipDuration(page)).toBeGreaterThan(600);
  });

  test('with prefers-reduced-motion, book mode turns the page (almost) at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await flipDuration(page)).toBeLessThan(300);
  });
});

test.describe('reflow (WCAG 1.4.10)', () => {
  for (const height of [640, 256]) {
    test(`at 320 x ${height} px, every control is reachable without scrolling sideways`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await open(page);
      await page.setViewportSize({ width: 320, height });
      // the showcase opens its navigation over the page on narrow screens
      await page.getByRole('button', { name: 'Toggle sidenav' }).click();
      const viewer = page.locator('ngx-extended-pdf-viewer');
      await expect.poll(async () => (await viewer.boundingBox())!.width).toBeGreaterThan(280);
      await page.waitForTimeout(500);

      const outside = await viewer.evaluate((v) => {
        const vr = v.getBoundingClientRect();
        return Array.from(v.querySelectorAll<HTMLElement>('#toolbarContainer :is(button, input, select)'))
          .filter((e) => e.checkVisibility() && e.getBoundingClientRect().width > 0)
          .filter((e) => e.getBoundingClientRect().left < vr.left - 1 || e.getBoundingClientRect().right > vr.right + 1)
          .map((e) => e.id);
      });
      expect(outside, 'toolbar controls cut off').toEqual([]);

      await page.locator('#secondaryToolbarToggle').click();
      const menu = page.locator('#secondaryToolbar');
      await expect(menu).toBeVisible();
      const m = await menu.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return { left: r.left, right: r.right };
      });
      expect(m.left).toBeGreaterThanOrEqual(0);
      expect(m.right).toBeLessThanOrEqual(320);
      // vertical scrolling is allowed: the last entry has to be reachable, by whichever element scrolls
      const last = menu.locator('button:visible').last();
      await last.scrollIntoViewIfNeeded();
      await expect(last).toBeInViewport({ ratio: 1 });
    });
  }
});

test.describe('tagged PDFs', () => {
  test('the structure tree of a tagged PDF is in the page, and it points to the text', async ({ page }) => {
    await open(page, '', '/assets/pdfs/CDK.pdf');
    const pageDiv = page.locator('.page[data-page-number="1"]');
    await expect(pageDiv.locator('.textLayer span').first()).toBeAttached({ timeout: 15_000 });
    // pdf.js puts the elements carrying aria-owns into the canvas
    const owners = pageDiv.locator('[aria-owns]');
    await expect(owners.first()).toBeAttached({ timeout: 15_000 });
    const result = await pageDiv.evaluate((p) => {
      const owners = Array.from(p.querySelectorAll('[aria-owns]'));
      const ids = owners.flatMap((o) => o.getAttribute('aria-owns')!.split(/\s+/));
      // the tree can also own the links of the annotation layer
      const missing = ids.filter((id) => !p.querySelector(`:is(.textLayer, .annotationLayer) [id="${CSS.escape(id)}"]`));
      return { owners: owners.length, ids: ids.length, missing };
    });
    expect(result.ids, 'references from the structure tree to the text layer').toBeGreaterThan(0);
    expect(result.missing, 'references to text that is not in this page').toEqual([]);
  });
});

test.describe('text contrast', () => {
  // axe can't judge these fields ("overlapped by another element"), so the test computes it.
  for (const theme of ['light', 'dark']) {
    test(`${theme} theme: the text fields of the toolbar have a contrast of 4.5:1 or more`, async ({ page }) => {
      await open(page, `&theme=${theme}`);
      for (const selector of ['#numPages', '#scaleSelect', '#pageNumber']) {
        const ratio = await page.locator(selector).evaluate((e) => {
          const parse = (c: string) => c.match(/[\d.]+/g)!.map(Number);
          const luminance = ([r, g, b]: number[]) => {
            const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          let bg = 'rgb(255, 255, 255)';
          for (let a: Element | null = e; a; a = a.parentElement) {
            const c = parse(getComputedStyle(a).backgroundColor);
            if (c.length < 4 || c[3] > 0) {
              bg = getComputedStyle(a).backgroundColor;
              break;
            }
          }
          const [hi, lo] = [luminance(parse(getComputedStyle(e).color)), luminance(parse(bg))].sort((x, y) => y - x);
          return (hi + 0.05) / (lo + 0.05);
        });
        expect(ratio, selector).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
