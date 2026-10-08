import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { stubPrint } from '../poms/print-stub';

/**
 * T51 — special documents: restricted permissions, unusual fonts and image
 * formats, and XFA forms.
 *
 * Most files come from pdf.js's own test corpus in the sibling pdf.js/
 * checkout (../pdf.js/test/pdfs). They are served to the browser at test
 * time and never copied into this repository; without the checkout, those
 * tests are skipped - unless CI or E2E_REQUIRE_CORPUS is set: then a missing
 * file fails the test, so a pipeline can't go green without running them.
 * The XFA example is our own (pdf-creator/make-xfa-form.mjs).
 */

test.describe.configure({ mode: 'parallel' });

type Recorded = { name: string; t: number; payload: unknown };

const CORPUS = join(__dirname, '../../../pdf.js/test/pdfs');

/**
 * Serves a file of pdf.js's test corpus under /e2e-corpus/<name> and returns
 * that URL; skips the test if the corpus isn't there (fails it on CI).
 */
async function corpus(page: Page, name: string): Promise<string> {
  const file = join(CORPUS, name);
  if (process.env['CI'] || process.env['E2E_REQUIRE_CORPUS']) {
    expect(existsSync(file), `pdf.js test corpus not found: ${file}`).toBe(true);
  } else {
    test.skip(!existsSync(file), `pdf.js test corpus not found: ${file}`);
  }
  const url = `/e2e-corpus/${name}`;
  await page.route(
    (u) => u.pathname === url,
    (route) => route.fulfill({ body: readFileSync(file), contentType: 'application/pdf' }),
  );
  return url;
}

/** Collects console warnings and page errors that hint at missing assets or failed decoding. */
function watchForProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    const text = m.text();
    if (/(Unable to (load|decode)|fetchStandardFontData|fetchBuiltInCMap|wasm|JpxError|Jbig2Error|CCITT|failed to load|Error during font loading|Unable to compile font)/i.test(text)) {
      problems.push(`${m.type()}: ${text.slice(0, 200)}`);
    }
  });
  return problems;
}

/** The share of non-white pixels on page n's canvas. */
async function ink(page: Page, n = 1): Promise<number> {
  return await page.evaluate((num) => {
    const canvas = document.querySelector<HTMLCanvasElement>(`.page[data-page-number="${num}"] canvas`);
    if (!canvas || !canvas.width) return 0;
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let inked = 0;
    for (let i = 0; i < data.length; i += 16) {
      if (data[i] + data[i + 1] + data[i + 2] < 720) inked++;
    }
    return inked / (data.length / 16);
  }, n);
}

test.describe('T51 — restricted permissions', () => {
  // The file is encrypted; pdf.js's own integration test opens it with this password.
  const PASSWORD = '"1234"';

  test('[enablePermissions]: a document that forbids printing hides the print button and is not printed', async ({ page }) => {
    await stubPrint(page);
    const url = await corpus(page, 'print_protection.pdf');
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${url}&password=${PASSWORD}&opt.enablePermissions=true&showPrintButton=always-visible`);
    await viewer.waitForFirstPageRender();
    const permissions: number[] | null = await page.evaluate(async () => {
      const flags = await (window as any).__ngxApp.pdfDocument.getPermissions();
      return flags ? Array.from(flags as Iterable<number>) : null;
    });
    // pdf.js PermissionFlag: PRINT = 0x04, PRINT_HIGH_QUALITY = 0x800
    expect(permissions, 'the file restricts something').not.toBeNull();
    expect(permissions!.includes(0x04) || permissions!.includes(0x800), 'printing is forbidden by the file').toBe(false);

    // Like pdf.js's own viewer: no print button for a document that can't be printed.
    await expect(page.locator('#printButton')).toBeHidden();
    await page.locator('#viewerContainer').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('ControlOrMeta+p');
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => (window as any).__printCalls)).toBe(0);
  });

  test('without [enablePermissions], the same document can be printed', async ({ page }) => {
    await stubPrint(page);
    const url = await corpus(page, 'print_protection.pdf');
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${url}&password=${PASSWORD}&opt.enablePermissions=false&showPrintButton=always-visible`);
    await viewer.waitForFirstPageRender();
    await page.locator('#printButton').click();
    await expect.poll(async () => await page.evaluate(() => (window as any).__printCalls), { timeout: 30_000 }).toBe(1);
  });
});

test.describe('T51 — fonts and images', () => {
  // [file, what's special about it, minimum share of inked pixels on page 1]
  const FILES: Array<[string, string, number]> = [
    ['simpletype3font.pdf', 'Type3 font', 0.0005],
    ['mmtype1.pdf', 'Multiple Master Type1 font', 0.001],
    ['ArabicCIDTrueType.pdf', 'Arabic CID TrueType font', 0.0005],
    ['cid_cff.pdf', 'CID-keyed CFF font', 0.0005],
    ['TrueType_without_cmap.pdf', 'TrueType font without cmap', 0.0005],
    ['bug_jpx.pdf', 'JPEG 2000 image (needs the openjpeg WASM decoder from the assets folder)', 0.01],
    ['jbig2_symbol_offset.pdf', 'JBIG2 image', 0.001],
    ['ccitt_EndOfBlock_false.pdf', 'CCITT fax image', 0.01],
  ];

  for (const [file, description, minInk] of FILES) {
    test(`${description} (${file}) is painted without decoding errors`, async ({ page }) => {
      const problems = watchForProblems(page);
      const url = await corpus(page, file);
      const viewer = new PdfViewerPage(page);
      await viewer.goto(`/e2e/viewer?src=${url}`);
      await viewer.waitForFirstPageRender();
      await expect.poll(() => ink(page), { timeout: 20_000 }).toBeGreaterThan(minInk);
      await page.waitForTimeout(500);
      expect(problems).toEqual([]);
    });
  }

  test('CMYK colors, a CMYK image and an ICC color profile are painted in the right colors', async ({ page }) => {
    // Our own file, see pdf-creator/make-cmyk-demo.mjs - the positions below are the ones it uses.
    const problems = watchForProblems(page);
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/e2e/viewer?src=/assets/pdfs/cmyk-and-icc-demo.pdf');
    await viewer.waitForFirstPageRender();
    await expect.poll(() => ink(page), { timeout: 20_000 }).toBeGreaterThan(0.1);

    /** The color at a point given in PDF coordinates (origin bottom left, 612 x 792). */
    const colorAt = (x: number, y: number) =>
      page.evaluate(
        ([px, py]) => {
          const canvas = document.querySelector<HTMLCanvasElement>('.page[data-page-number="1"] canvas')!;
          const scale = canvas.width / 612;
          const [r, g, b] = canvas.getContext('2d')!.getImageData(Math.round(px * scale), Math.round((792 - py) * scale), 1, 1).data;
          return { r, g, b };
        },
        [x, y],
      );
    type Rgb = { r: number; g: number; b: number };
    const swatch = (i: number) => colorAt(50 + i * 74 + 30, 560 + 30);
    const icc = (i: number) => colorAt(50 + i * 120 + 50, 200 + 30);
    const expectColor = async (what: string, color: Promise<Rgb>, check: (c: Rgb) => boolean) => {
      const c = await color;
      expect(check(c), `${what}: rgb(${c.r}, ${c.g}, ${c.b})`).toBe(true);
    };

    await expectColor('cyan', swatch(0), ({ r, g, b }) => r < 90 && g > 120 && b > 180);
    await expectColor('magenta', swatch(1), ({ r, g, b }) => r > 150 && g < 90 && b > 70);
    await expectColor('yellow', swatch(2), ({ r, g, b }) => r > 200 && g > 200 && b < 90);
    await expectColor('black', swatch(3), ({ r, g, b }) => Math.max(r, g, b) < 70);
    await expectColor('red (magenta + yellow)', swatch(4), ({ r, g, b }) => r > 180 && g < 90 && b < 90);
    await expectColor('green (cyan + yellow)', swatch(5), ({ r, g, b }) => g > 110 && r < 90 && b < 130);
    await expectColor('blue (cyan + magenta)', swatch(6), ({ r, g, b }) => b > 100 && r < 110 && g < 90);

    // The CMYK image runs from cyan over magenta to yellow.
    await expectColor('image, left', colorAt(50 + 504 * 0.03, 430), ({ r, g, b }) => r < 90 && b > 180);
    await expectColor('image, middle', colorAt(50 + 504 * 0.5, 430), ({ r, g, b }) => r > 150 && g < 90);
    await expectColor('image, right', colorAt(50 + 504 * 0.97, 430), ({ r, g, b }) => r > 200 && g > 200 && b < 90);

    // The ICC-based color space with the file's own profile.
    await expectColor('ICC red', icc(0), ({ r, g, b }) => r > 180 && g < 100 && b < 100);
    await expectColor('ICC green', icc(1), ({ r, g, b }) => g > 120 && r < 100 && b < 110);
    await expectColor('ICC blue', icc(2), ({ r, g, b }) => b > 180 && r < 110 && g < 130);
    expect(problems).toEqual([]);
  });

  test('a CJK font that needs a CMap from the assets folder: text is extracted, not garbage', async ({ page }) => {
    const problems = watchForProblems(page);
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/e2e/viewer?src=/assets/pdfs/createFormAndUpdatePageCJKUserFont.pdf');
    await viewer.waitForFirstPageRender();
    await expect.poll(() => ink(page), { timeout: 20_000 }).toBeGreaterThan(0.0005);
    await expect
      .poll(async () => (await page.locator('.page[data-page-number="1"] .textLayer').textContent()) ?? '', { timeout: 15_000 })
      .toMatch(/[぀-ヿ一-鿿가-힯]/);
    expect(problems).toEqual([]);
  });
});

test.describe('T51 — XFA forms', () => {
  // Our own XFA form (pdf-creator/make-xfa-form.mjs) has a field of every kind. pdf.js renders all of
  // them except the password field, the image field and the signature field - those are left out here.
  // It also renders the list box and the editable combo box as plain dropdowns, and the comb field
  // as a text field limited to five characters.
  const XFA = '/assets/pdfs/xfa-form-example.pdf';

  /** Values for every kind of field that holds a value, by its unqualified name. */
  const VALUES = {
    GivenName: 'Ada',
    Comments: 'line one\nline two',
    BirthYear: '1815',
    MemberSince: '2026-10-07',
    PostalCode: '12345',
    Language: 'fr',
    Size: 'L',
    Topics: ['news', 'security'],
    Color: 'blue',
    Newsletter: '1',
    ContactBy: 'phone',
  };

  async function openXfa(page: Page, query = ''): Promise<void> {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${XFA}${query}`);
    await viewer.waitForViewerMounted();
    await expect(page.locator('.xfaLayer').first()).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => (window as any).__ngxApp.pdfDocument.isPureXfa)).toBe(true);
  }

  /** What each field shows: text, the selected option(s), or whether a box is checked. */
  const shown = (page: Page) =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.xfaLayer input, .xfaLayer textarea, .xfaLayer select')).map((e) => {
        if (e instanceof HTMLSelectElement) return Array.from(e.selectedOptions, (o) => o.value).join('+');
        const field = e as HTMLInputElement;
        if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
        return field.value;
      }),
    );

  test('every kind of field is rendered, visibly - check boxes and radio buttons, too', async ({ page }) => {
    const problems = watchForProblems(page);
    await openXfa(page);
    const layer = page.locator('.xfaLayer');
    await expect(layer.first()).toContainText('Membership application');
    // Not the placeholder text for viewers without XFA support.
    await expect(page.locator('.page').first()).not.toContainText('does not support XFA');

    await expect(layer.locator('input.xfaTextfield')).toHaveCount(6); // two names, number, date, postal code, contact
    await expect(layer.locator('textarea')).toHaveCount(1);
    await expect(layer.locator('select:not([multiple])')).toHaveCount(3);
    await expect(layer.locator('select[multiple]')).toHaveCount(1);
    await expect(layer.locator('input[type="checkbox"]')).toHaveCount(1);
    await expect(layer.locator('input[type="radio"]')).toHaveCount(3);
    await expect(layer.locator('button')).toHaveCount(1);
    await expect(layer.locator('input.xfaTextfield').nth(4)).toHaveAttribute('maxlength', '5');

    // An application's CSS reset (here: @tailwindcss/forms in the showcase) must not make them invisible.
    for (const box of await layer.locator('input[type="checkbox"], input[type="radio"]').all()) {
      await expect(box).toBeVisible();
      expect(await box.evaluate((b) => getComputedStyle(b).appearance)).not.toBe('none');
    }
    // The data stored in the form.
    expect((await shown(page)).slice(0, 2)).toEqual(['Lovelace', '']);
    // (xfaLayerRendered) reports the XFA layer of each page.
    await expect
      .poll(async () => ((await page.evaluate(() => (window as any).__ngxEvents)) as Recorded[]).filter((e) => e.name === 'xfaLayerRendered').length)
      .toBeGreaterThan(0);
    expect(problems).toEqual([]);
  });

  test('[formData]: every kind of field shows the value the application passes', async ({ page }) => {
    await openXfa(page, `&formData=${encodeURIComponent(JSON.stringify(VALUES))}`);
    await expect
      .poll(() => shown(page), { timeout: 15_000 })
      .toEqual([
        'Lovelace', // FamilyName: not in VALUES, so the form's own value
        'Ada',
        'line one\nline two',
        '1815',
        '2026-10-07',
        '12345',
        'fr',
        'L',
        'news+security',
        'blue',
        true, // Newsletter
        false, // ContactBy: e-mail
        true, // ContactBy: phone
        false, // ContactBy: letter
        '', // FamilyName of the emergency contact
      ]);
  });

  test('(formDataChange): every kind of field reports what the user enters', async ({ page }) => {
    await openXfa(page);
    const layer = page.locator('.xfaLayer');
    const text = layer.locator('input.xfaTextfield');
    await text.nth(0).fill('Byron');
    await text.nth(1).fill('Augusta');
    await layer.locator('textarea').fill('three\nfour');
    await text.nth(2).fill('1816');
    await text.nth(4).fill('54321');
    const selects = layer.locator('select');
    await selects.nth(0).selectOption('de');
    await selects.nth(1).selectOption('S');
    await selects.nth(2).selectOption(['releases', 'events']);
    await selects.nth(3).selectOption('green');
    await layer.locator('input[type="checkbox"]').click();
    await layer.locator('input[type="radio"]').nth(2).click();
    await text.nth(5).fill('Babbage');
    await text.nth(5).press('Tab');

    const reported = async () => {
      const all = (await page.evaluate(() => (window as any).__ngxEvents.filter((e: any) => e.name === 'formDataChange'))) as Recorded[];
      const data = (all.at(-1)?.payload ?? {}) as Record<string, unknown>;
      // The full names are path names like "...applicant.FamilyName"; look them up by their end.
      const byPath = (path: string) => Object.entries(data).find(([key]) => key.endsWith(path))?.[1];
      return {
        familyName: byPath('applicant.FamilyName'),
        givenName: byPath('applicant.GivenName'),
        comments: byPath('applicant.Comments'),
        birthYear: byPath('applicant.BirthYear'),
        postalCode: byPath('applicant.PostalCode'),
        language: byPath('choices.Language'),
        size: byPath('choices.Size'),
        topics: byPath('choices.Topics'),
        color: byPath('choices.Color'),
        newsletter: byPath('choices.Newsletter'),
        contactBy: byPath('choices.ContactBy'),
        contactFamilyName: byPath('contact.FamilyName'),
      };
    };
    await expect
      .poll(reported, { timeout: 10_000 })
      .toEqual({
        familyName: 'Byron',
        givenName: 'Augusta',
        comments: 'three\nfour',
        birthYear: '1816',
        postalCode: '54321',
        language: 'de',
        size: 'S',
        topics: ['releases', 'events'],
        color: 'green',
        newsletter: '1',
        contactBy: 'mail',
        contactFamilyName: 'Babbage',
      });
  });

  test('an XFA form from pdf.js\'s test corpus is rendered as XFA', async ({ page }) => {
    const url = await corpus(page, 'xfa_filled_imm1344e.pdf');
    const viewer = new PdfViewerPage(page);
    await viewer.goto(`/e2e/viewer?src=${url}`);
    await viewer.waitForViewerMounted();
    await expect(page.locator('.xfaLayer').first()).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => (window as any).__ngxApp.pdfDocument.isPureXfa)).toBe(true);
    // The form's own text, rendered as HTML by the XFA layer.
    await expect.poll(async () => ((await page.locator('.xfaLayer').first().textContent()) ?? '').trim().length, { timeout: 15_000 }).toBeGreaterThan(100);
  });

  test('[enableXfa]="false": the placeholder page is shown instead', async ({ page }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/e2e/viewer?src=/assets/pdfs/xfa-form-example.pdf&opt.enableXfa=false');
    await viewer.waitForFirstPageRender();
    await expect(page.locator('.xfaLayer')).toHaveCount(0);
    await viewer.expectRenderedTextContains('does not support XFA');
  });
});
