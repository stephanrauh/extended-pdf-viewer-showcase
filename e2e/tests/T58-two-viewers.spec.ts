import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, usingBleedingEdge } from '../fixtures';
import { downloadPdf, readPdf } from '../poms/pdf-file';

/**
 * T58 — two viewers on one page (React-migration.md, Step 2).
 *
 * The target behavior: each viewer shows its own document, every id reference
 * (`for=`, `aria-controls`, `aria-labelledby`, ...) points into its own viewer,
 * and operating one viewer leaves the other alone. The ids themselves stay
 * duplicated: the CSS and pdf.js rely on them, and WCAG 2.2 no longer requires
 * unique ids (4.1.1 Parsing was removed).
 *
 * Several viewers on one page need the bleeding-edge bundle (#3306).
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
  // guards the harness itself: a broken route would make the other tests meaningless
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

  test('searching in viewer b finds and highlights in viewer b only', async ({ page }) => {
    await openBoth(page, '?b.src=/assets/pdfs/Portugues-para-principiantes.pdf');
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.locator(`${B} #primaryViewFind`).click();
    await page.locator(`${B} #findInput`).fill('a');
    await page.locator(`${B} #findInput`).press('Enter');

    await expect(page.locator(`${B} .textLayer .highlight`).first()).toBeAttached({ timeout: 15_000 });
    await expect(page.locator(`${B} #findResultsCount`)).not.toBeEmpty();
    await expect(page.locator(`${A} #findbar`)).toBeHidden();
    expect(await page.locator(`${A} .textLayer .highlight`).count()).toBe(0);
  });

  test('[zoom] of viewer b zooms viewer b only', async ({ page }) => {
    await openBoth(page, '?b.src=/assets/pdfs/Portugues-para-principiantes.pdf');
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const pageWidth = (viewer: string) => page.locator(`${viewer} .page[data-page-number="1"]`).evaluate((el) => el.getBoundingClientRect().width);
    await page.evaluate(() => (window as any).__viewers[1].setInput('zoom', 50));
    await page.waitForTimeout(600);
    const widthA = await pageWidth(A);
    const widthB = await pageWidth(B);

    await page.evaluate(() => (window as any).__viewers[1].setInput('zoom', 100));
    await expect.poll(() => pageWidth(B)).toBeGreaterThan(widthB * 1.8);
    expect(await pageWidth(A)).toBe(widthA);
  });

  test('a drawing made in viewer b belongs to viewer b', async ({ page }) => {
    await page.setViewportSize({ width: 2800, height: 1000 });
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.locator(`${B} #primaryEditorInk`).click();
    const layer = page.locator(`${B} .page[data-page-number="1"] .annotationEditorLayer`);
    await expect(layer).toBeVisible();
    // a gesture made in the same instant as the click on the tool can get lost
    await page.waitForTimeout(150);
    const box = (await layer.boundingBox())!;
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 160, box.y + 140, { steps: 5 });
    await page.mouse.move(box.x + 220, box.y + 120, { steps: 5 });
    await page.mouse.up();
    // ends the drawing session and turns the stroke into an editor
    await page.keyboard.press('Escape');

    await expect(layer.locator(':scope > *')).toHaveCount(1);
    await expect(page.locator(`${A} .annotationEditorLayer > *`)).toHaveCount(0);
  });

  test('a dialog opened in viewer b opens in viewer b', async ({ page }) => {
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.locator(`${B} #secondaryToolbarToggle`).click();
    await page.locator(`${B} #secondaryToolbar`).getByTitle(/Document Properties/).click();

    await expect(page.locator(`${B} #documentPropertiesDialog`)).toBeVisible();
    await expect(page.locator(`${A} #documentPropertiesDialog`)).toBeHidden();
    // and it shows b's document
    await expect(page.locator(`${B} #fileNameField`)).toHaveText(/BootsFaces/);
  });

  test('ctrl + mouse wheel zooms the viewer under the mouse only', async ({ page }) => {
    await openBoth(page, '?b.src=/assets/pdfs/Portugues-para-principiantes.pdf');
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const pageWidth = (viewer: string) => page.locator(`${viewer} .page[data-page-number="1"]`).evaluate((el) => el.getBoundingClientRect().width);
    const widthA = await pageWidth(A);
    const widthB = await pageWidth(B);

    const box = (await page.locator(`${B} #viewerContainer`).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -200);
    await page.keyboard.up('Control');

    await expect.poll(() => pageWidth(B)).toBeGreaterThan(widthB * 1.05);
    expect(await pageWidth(A)).toBe(widthA);
  });

  test("opening an editor in viewer b moves the focus into b's editor toolbar", async ({ page }) => {
    // each viewer gets half the width; below that, the draw button moves into the overflow menu
    await page.setViewportSize({ width: 2800, height: 1000 });
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.locator(`${B} #primaryEditorInk`).click();
    await expect(page.locator(`${B} #editorInkParamsToolbar`)).toBeVisible();
    await expect.poll(() => page.evaluate((b) => !!document.querySelector(b)?.querySelector('#editorInkParamsToolbar')?.contains(document.activeElement), B)).toBe(true);

    // closing it returns the focus to b's button
    await page.locator(`${B} #primaryEditorInk`).click();
    await expect(page.locator(`${B} #primaryEditorInk`)).toBeFocused();
  });

  test("each viewer has its own responsive stylesheet, and keeps it when the other viewer goes away", async ({ page }) => {
    // wide enough that the responsive rules hide the buttons meant for narrow toolbars
    await page.setViewportSize({ width: 2800, height: 1000 });
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const stylesheets = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('ngx-extended-pdf-viewer')].map((host) => {
          const id = host.getAttribute('data-ngx-dynamic-css');
          return !!id && !!document.getElementById(id);
        }),
      );
    expect(await stylesheets()).toEqual([true, true]);
    expect(await page.evaluate(() => [...document.querySelectorAll('ngx-extended-pdf-viewer')].map((host) => host.getAttribute('data-ngx-dynamic-css')))).toEqual([
      'pdf-dynamic-css',
      expect.stringMatching(/^pdf-dynamic-css-\d+$/),
    ]);

    // the secondary menu's entries for narrow toolbars stay hidden in viewer b after viewer a is destroyed
    const narrowOnly = page.locator(`${B} #secondaryToolbar .visibleXXLView`).first();
    await expect(narrowOnly).toBeAttached();
    await page.evaluate(() => (window as any).__viewers[0].remove());
    await expect(page.locator(A)).toHaveCount(0);
    expect(await stylesheets()).toEqual([true]);
    await page.locator(`${B} #secondaryToolbarToggle`).click();
    await expect(page.locator(`${B} #secondaryToolbar`)).toBeVisible();
    await expect(narrowOnly).toBeHidden();
    await expect(page.locator(`${B} #primaryEditorInk`)).toBeVisible();
  });

  test('the same form in both viewers: each viewer keeps its own values and reports its own changes', async ({ page }) => {
    await openBoth(page, '?src=/assets/pdfs/OoPdfFormExample.pdf');
    const radios = (viewer: string) => page.locator(`${viewer} .annotationLayer input[type="radio"][name="educationLevel"]`);
    await expect(radios(A).first()).toBeAttached({ timeout: 30_000 });
    await expect(radios(B).first()).toBeAttached({ timeout: 30_000 });
    const checked = (viewer: string) => radios(viewer).evaluateAll((all) => all.map((radio) => (radio as HTMLInputElement).checked));

    // both start with the value stored in the PDF
    await expect.poll(() => checked(A)).toEqual(await checked(B));
    const initial = await checked(A);
    expect(initial).toContain(true);

    await radios(B).nth(1).check();
    await expect(radios(B).nth(1)).toBeChecked();
    expect(await checked(A)).toEqual(initial);
    // (formDataChange) comes from the viewer whose form changed
    await expect.poll(async () => (await events(page, 1, 'formDataChange')).length).toBeGreaterThan(0);
    expect(await events(page, 0, 'formDataChange')).toEqual([]);

    await radios(A).nth(2).check();
    await expect(radios(A).nth(2)).toBeChecked();
    await expect(radios(B).nth(1)).toBeChecked();
  });

  test('the same form in both viewers: each viewer saves its own values', async ({ page }) => {
    // wide enough for the download button to be in each toolbar
    await page.setViewportSize({ width: 2800, height: 1000 });
    await openBoth(page, '?src=/assets/pdfs/OoPdfFormExample.pdf');
    const field = (viewer: string, name: string) => page.locator(`${viewer} .annotationLayer [name="${name}"]`);
    await expect(field(A, 'firstName')).toBeVisible({ timeout: 30_000 });
    await expect(field(B, 'firstName')).toBeVisible({ timeout: 30_000 });

    await field(A, 'firstName').fill('Ada');
    await field(A, 'firstName').press('Tab');
    await field(A, 'educationLevel').nth(2).check();
    await field(B, 'firstName').fill('Grace');
    await field(B, 'firstName').press('Tab');
    await field(B, 'educationLevel').nth(1).check();
    // the saved radio group holds the export value of the chosen button
    const annotationId = (viewer: string, i: number) =>
      field(viewer, 'educationLevel').nth(i).evaluate((el) => el.closest('[data-annotation-id]')!.getAttribute('data-annotation-id'));
    const chosenInA = await annotationId(A, 2);
    const chosenInB = await annotationId(B, 1);

    for (const [viewer, firstName, chosenId] of [
      [B, 'Grace', chosenInB],
      [A, 'Ada', chosenInA],
    ] as const) {
      const saved = (await readPdf(page, await downloadPdf(page, viewer))).annotations;
      const widgets = (name: string) => saved.filter((a) => a.annotationType === 20 && a.fieldName === name);
      expect(widgets('firstName')[0].fieldValue, `firstName saved by ${viewer}`).toBe(firstName);
      const chosen = saved.find((a) => a.id === chosenId)!;
      expect(widgets('educationLevel')[0].fieldValue, `educationLevel saved by ${viewer}`).toBe(chosen.buttonValue);
    }
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

  test('when the last viewer goes away, window.print() is the browser\'s again', async ({ page }) => {
    await page.addInitScript(() => {
      const nativePrint = () => ((window as any).__nativePrints = ((window as any).__nativePrints ?? 0) + 1);
      window.print = nativePrint;
      (window as any).__nativePrint = nativePrint;
    });
    await openBoth(page);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.print === (window as any).__nativePrint)).toBe(false);

    // viewer b came last: it found the viewers' window.print() when it started
    await page.evaluate(() => (window as any).__viewers[0].remove());
    await expect(page.locator(A)).toHaveCount(0);
    await page.evaluate(() => (window as any).__viewers[1].remove());
    await expect(page.locator(B)).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.print === (window as any).__nativePrint)).toBe(true);
  });

  // pdf-actions-demo.pdf appends a line to its form field "log" for every script it runs
  test("the PDF's scripts of viewer b talk to viewer b only", async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => undefined;
    });
    await openBoth(page, '?src=/assets/pdfs/pdf-actions-demo.pdf&opt.enableScripting=true&opt.enableCatalogAAJavaScript=true');
    const log = (viewer: string) => page.locator(`${viewer} .annotationLayer [name="log"]`);
    for (const viewer of [A, B]) {
      await expect(log(viewer)).toHaveValue(/^\s*1\. Document-level JavaScript.*\n2\. PageOpen page 1/,{ timeout: 30_000 });
    }
    const logOfA = await log(A).inputValue();

    await page.locator(`${B} #printButton`).click();
    await expect.poll(async () => (await events(page, 1, 'afterPrint')).length, { timeout: 30_000 }).toBe(1);
    await expect(log(B)).toHaveValue(/WillPrint[\s\S]*DidPrint/);
    await expect(log(A)).toHaveValue(logOfA);
  });

  // An XFA form renders its radio buttons in the XFA layer, not in the annotation layer
  test('the same XFA form in both viewers: a radio button of viewer b leaves viewer a alone', async ({ page }) => {
    await openBoth(page, '?src=/assets/pdfs/xfa-form-example.pdf');
    const radios = (viewer: string) => page.locator(`${viewer} .xfaLayer input[type="radio"]`);
    await expect(radios(A).first()).toBeAttached({ timeout: 30_000 });
    await expect(radios(B).first()).toBeAttached({ timeout: 30_000 });
    // the three buttons of one group (ContactBy), none of them checked yet
    await expect(radios(A)).toHaveCount(3);

    await radios(A).nth(0).check();
    await radios(B).nth(1).check();
    await expect(radios(B).nth(1)).toBeChecked();
    await expect(radios(A).nth(0)).toBeChecked();
  });

  test("the secondary menu of viewer a operates viewer a (spread, scroll mode)", async ({ page }) => {
    await openBoth(page);
    await expect.poll(async () => (await events(page, 0, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect.poll(async () => (await events(page, 1, 'pagesLoaded')).length, { timeout: 30_000 }).toBeGreaterThan(0);

    await page.locator(`${A} #secondaryToolbarToggle`).click();
    await page.locator(`${A} #secondaryToolbar #secondarySpreadEven`).click();
    await expect(page.locator(`${A} #viewer .spread`).first()).toBeAttached();
    await expect(page.locator(`${B} #viewer .spread`)).toHaveCount(0);

    await page.locator(`${A} #secondaryToolbar #secondaryScrollWrapped`).click();
    await expect(page.locator(`${A} #viewer`)).toHaveClass(/scrollWrapped/);
    await expect(page.locator(`${B} #viewer`)).not.toHaveClass(/scrollWrapped/);
  });

  test('the side-by-side demo shows two viewers without iFrames', async ({ page }) => {
    test.skip(!usingBleedingEdge, 'the stable bundle still needs the iFrame work-around');
    await page.goto('/extended-pdf-viewer/side-by-side');
    const viewers = page.locator('ngx-extended-pdf-viewer');
    await expect(viewers).toHaveCount(2);
    await expect(page.locator('iframe')).toHaveCount(0);
    // CDK.pdf has 22 pages, GraalVM.pdf 39
    for (const [i, pages] of [[0, /\b22\b/], [1, /\b39\b/]] as const) {
      await expect(viewers.nth(i).locator('.page[data-page-number="1"] canvas')).toBeVisible({ timeout: 30_000 });
      await expect(viewers.nth(i).locator('#numPages')).toHaveText(pages);
    }
  });
});
