import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';

/**
 * T58 — two viewers on one page (React-migration.md, Step 2).
 *
 * The target behavior: each viewer shows its own document, the page has no
 * duplicate ids (every `for=`, `aria-controls` and `aria-labelledby` must point
 * into its own viewer), and operating one viewer leaves the other alone.
 *
 * Step 2 is in progress, so the tests are marked `test.fail()`: the suite stays
 * green, and Playwright reports "expected to fail, but passed" as soon as a
 * test starts working. Remove the marker then.
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
    test.fail(true, 'Step 2 in progress: a second viewer shares the first one');
    await openBoth(page);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded'))[0]?.payload?.pagesCount, { timeout: 30_000 }).toBe(641);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded'))[0]?.payload?.pagesCount, { timeout: 30_000 }).toBe(53);
    await expect(page.locator(`${A} .page[data-page-number="1"] canvas`)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(`${B} .page[data-page-number="1"] canvas`)).toBeVisible({ timeout: 30_000 });
  });

  test('no id appears twice on the page', async ({ page }) => {
    test.fail(true, 'Step 2 in progress: both viewers render the same ids');
    await openBoth(page);
    await expect(page.locator(`${B} .page[data-page-number="1"]`)).toBeAttached({ timeout: 30_000 });
    const duplicates = await page.evaluate(() => {
      const seen = new Map<string, number>();
      for (const el of document.querySelectorAll('[id]')) {
        seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      }
      return [...seen].filter(([, count]) => count > 1).map(([id]) => id);
    });
    expect(duplicates, `${duplicates.length} duplicate ids, e.g. ${duplicates.slice(0, 10).join(', ')}`).toEqual([]);
  });

  test('paging one viewer leaves the other where it is', async ({ page }) => {
    test.fail(true, 'Step 2 in progress: a second viewer shares the first one');
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.evaluate(() => (window as any).__viewers[1].setInput('page', 5));
    await expect.poll(async () => (await events(page, 1, 'pageChange')).at(-1)?.payload, { timeout: 10_000 }).toBe(5);
    await expect(page.locator(`${B} #pageNumber, ${B} [id$="pageNumber"]`).first()).toHaveValue('5');
    await expect(page.locator(`${A} #pageNumber`)).toHaveValue('1');
  });
});
