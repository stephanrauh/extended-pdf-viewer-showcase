import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures';

/**
 * T58 — two viewers on one page (React-migration.md, Step 2).
 *
 * The target behavior: each viewer shows its own document, every id reference
 * (`for=`, `aria-controls`, `aria-labelledby`, ...) points into its own viewer,
 * and operating one viewer leaves the other alone. The ids themselves stay
 * duplicated: the CSS and pdf.js rely on them, and WCAG 2.2 no longer requires
 * unique ids (4.1.1 Parsing was removed).
 *
 * Step 2 is in progress, so the tests that don't work yet are marked
 * `test.fail()`: the suite stays green, and Playwright reports "expected to
 * fail, but passed" as soon as a test starts working. Remove the marker then.
 *
 * The harness is /e2e/two-viewers: viewer a shows Portugues-para-principiantes.pdf
 * (641 pages), viewer b BootsFaces_Deep_Dive_1.0.pdf (53 pages).
 */

test.describe.configure({ mode: 'parallel' });

const A = '[data-viewer="a"] ngx-extended-pdf-viewer';
const B = '[data-viewer="b"] ngx-extended-pdf-viewer';

type RecordedEvent = { name: string; payload: any };

function events(page: Page, viewer: 0 | 1, name: string): Promise<RecordedEvent[]> {
  return page.evaluate(
    ([i, n]) => ((window as any).__viewers?.[i]?.events ?? []).filter((e: RecordedEvent) => e.name === n),
    [viewer, name] as const,
  );
}

async function openBoth(page: Page, query = ''): Promise<void> {
  await page.goto(`/e2e/two-viewers${query}`);
  await expect(page.locator(A)).toBeAttached();
  await expect(page.locator(B)).toBeAttached();
}

test.describe('T58 two viewers on one page', () => {
  // Not marked test.fail(): it guards the harness itself. Without it, a broken
  // route would make every test.fail() test "pass".
  test('the harness shows two viewers with their own hooks', async ({ page }) => {
    await openBoth(page);
    await expect(page.locator('ngx-extended-pdf-viewer')).toHaveCount(2);
    expect(await page.evaluate(() => (window as any).__viewers?.length)).toBe(2);
  });

  test('each viewer loads and renders its own document', async ({ page }) => {
    await openBoth(page);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded'))[0]?.payload?.pagesCount, { timeout: 30_000 }).toBe(641);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded'))[0]?.payload?.pagesCount, { timeout: 30_000 }).toBe(53);
    await expect(page.locator(`${A} .page[data-page-number="1"] canvas`)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(`${B} .page[data-page-number="1"] canvas`)).toBeVisible({ timeout: 30_000 });
  });

  // The ids stay duplicated (the CSS and pdf.js rely on them), but no reference may cross
  // into the other viewer: the browser would resolve it to the first viewer's element.
  test('every id reference (labels, aria-*) resolves inside its own viewer', async ({ page }) => {
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const viewers = await page.evaluate(() => {
      // the IDL properties return the elements the browser uses, whether set by id or by element
      const properties = [
        'ariaLabelledByElements',
        'ariaDescribedByElements',
        'ariaControlsElements',
        'ariaOwnsElements',
        'ariaDetailsElements',
        'ariaErrorMessageElements',
        'ariaFlowToElements',
      ];
      return [...document.querySelectorAll('ngx-extended-pdf-viewer')].map((host) => {
        let references = 0;
        const outside: string[] = [];
        for (const el of host.querySelectorAll<HTMLElement>('*')) {
          for (const property of properties) {
            for (const target of ((el as any)[property] ?? []) as Element[]) {
              references++;
              if (!host.contains(target)) outside.push(`${el.id || el.tagName}.${property} → #${target.id}`);
            }
          }
          if (el instanceof HTMLLabelElement && el.htmlFor) {
            references++;
            const target = document.getElementById(el.htmlFor);
            if (target && !host.contains(target)) outside.push(`label for="${el.htmlFor}"`);
          }
        }
        return { references, outside };
      });
    });
    for (const [i, viewer] of viewers.entries()) {
      expect(viewer.references, `viewer ${i} has id references`).toBeGreaterThan(50);
      expect(viewer.outside, `viewer ${i}: references into the other viewer`).toEqual([]);
    }
  });

  test("clicking a label in viewer b operates viewer b's control", async ({ page }) => {
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.locator(`${B} #primaryViewFind`).click();
    await expect(page.locator(`${B} #findbar`)).toBeVisible();
    await page.locator(`${B} #findbar label`).filter({ hasText: /highlight all/i }).click();
    await expect(page.locator(`${B} #findHighlightAll`)).toBeChecked();
    await expect(page.locator(`${A} #findHighlightAll`)).not.toBeChecked();
  });

  test('axe finds nothing in viewer b', async ({ page }) => {
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(500);
    const { violations } = await new AxeBuilder({ page })
      .include('[data-viewer="b"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const report = violations.map((v) => `${v.id}: ${v.nodes.slice(0, 5).map((n) => n.target.join(' ')).join(' | ')}`).join('\n');
    expect(violations.map((v) => v.id), report).toEqual([]);
  });

  test('paging one viewer leaves the other where it is', async ({ page }) => {
    // Viewer b shows a portrait document here, too. With the landscape slides, a jump to
    // page 5 leaves page 6 as the only fully visible page, so pdf.js reports page 6 -
    // in a single viewer, too.
    await openBoth(page, '?b.src=/assets/pdfs/Portugues-para-principiantes.pdf');
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.evaluate(() => (window as any).__viewers[1].setInput('page', 5));
    await expect(page.locator(`${B} #pageNumber`)).toHaveValue('5');
    await expect(page.locator(`${A} #pageNumber`)).toHaveValue('1');
    // [page] set from outside isn't echoed as (pageChange), so viewer a must not have emitted one either
    expect(await events(page, 0, 'pageChange')).toEqual([]);
  });

  test('keyboard shortcuts act on the viewer the user works with', async ({ page }) => {
    await openBoth(page, '?b.src=/assets/pdfs/Portugues-para-principiantes.pdf');
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);

    // focus inside viewer b: only b turns the page
    await page.locator(`${B} #viewerContainer`).click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('n');
    await expect(page.locator(`${B} #pageNumber`)).toHaveValue('2');
    await expect(page.locator(`${A} #pageNumber`)).toHaveValue('1');

    // then viewer a
    await page.locator(`${A} #viewerContainer`).click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('n');
    await expect(page.locator(`${A} #pageNumber`)).toHaveValue('2');
    await expect(page.locator(`${B} #pageNumber`)).toHaveValue('2');

    // a key outside both viewers goes to the one used last (a)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('n');
    await expect(page.locator(`${A} #pageNumber`)).toHaveValue('3');
    await expect(page.locator(`${B} #pageNumber`)).toHaveValue('2');
  });

  test("printing viewer b prints b's pages, and only once", async ({ page }) => {
    // the browser's print dialog would block the test, so window.print only records what it would print
    await page.addInitScript(() => {
      (window as any).__prints = [];
      window.print = () => {
        const containers = [...document.querySelectorAll('#printContainer')];
        (window as any).__prints.push(containers.map((container) => container.children.length));
      };
    });
    await openBoth(page, '?b.src=/assets/pdfs/pdf-sample.pdf');
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded'))[0]?.payload?.pagesCount, { timeout: 30_000 }).toBe(1);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);

    await page.locator(`${B} #printButton`).click();
    await expect.poll(async () => (await events(page, 1, 'afterPrint')).length, { timeout: 30_000 }).toBe(1);

    // one print job, one print container, holding b's single page - not a's 641
    expect(await page.evaluate(() => (window as any).__prints)).toEqual([[1]]);
    expect(await events(page, 0, 'beforePrint')).toEqual([]);
    await expect(page.locator('#printContainer')).toHaveCount(0);
  });
});
