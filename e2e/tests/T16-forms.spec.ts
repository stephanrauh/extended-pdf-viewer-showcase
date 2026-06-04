import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

// /forms tab 0 ("Displaying Forms") loads OoPdfFormExample.pdf and
// exposes every form control via Angular bindings. pdf.js writes
// element.name = data.fieldName when rendering the annotation layer,
// so `.annotationLayer input[name="<fieldname>"]` finds the PDF copy
// of each Acroform field. The demo's formData keys match those
// fieldnames.

const FORMS = '/extended-pdf-viewer/forms';

// pdf.js renders form fields after the first paint; this helper
// blocks until at least one form field appears so subsequent
// assertions can find the PDF inputs.
async function waitForAnnotationLayer(
  page: import('@playwright/test').Page,
): Promise<void> {
  await expect
    .poll(
      async () =>
        await page.locator('.annotationLayer input, .annotationLayer select').count(),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);
}

test.describe('T16 — /forms text inputs (Angular → PDF)', () => {
  // The demo's text inputs use ngModel and update formData via
  // delayedUpdateFormData. Each Angular field maps to a PDF
  // fieldname (sometimes renamed — jobExperience → yearsOfExperience).
  const CASES: Array<{
    label: string;
    demoSelector: string;
    pdfName: string;
    value: string;
  }> = [
    {
      label: 'firstName',
      demoSelector: '#first-name-input',
      pdfName: 'firstName',
      value: 'Alice',
    },
    {
      label: 'lastName',
      demoSelector: '#last-name-input',
      pdfName: 'lastName',
      value: 'Anderson',
    },
    {
      label: 'jobExperience → yearsOfExperience',
      demoSelector: '#job-experience-input',
      pdfName: 'yearsOfExperience',
      value: '12',
    },
    {
      label: 'otherJobExperience',
      demoSelector: '#other-job-experience-textarea',
      pdfName: 'otherJobExperience',
      value: 'volunteer driver',
    },
  ];

  for (const c of CASES) {
    test(`typing into ${c.label} updates the PDF form field`, async ({ page }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(FORMS);
      await viewer.waitForFirstPageRender();
      await waitForAnnotationLayer(page);

      await page.locator(c.demoSelector).fill(c.value);
      await page.locator(c.demoSelector).blur();

      const pdfField = page
        .locator(`.annotationLayer [name="${c.pdfName}"]`)
        .first();
      await expect(pdfField).toHaveValue(c.value, { timeout: 10_000 });
    });
  }
});

test.describe('T16 — /forms select / multi-select (Angular → PDF)', () => {
  test('changing the demo Country dropdown updates the PDF country select', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FORMS);
    await viewer.waitForFirstPageRender();
    await waitForAnnotationLayer(page);

    const pdfCountry = page
      .locator('.annotationLayer select[name="country"]')
      .first();
    await expect(pdfCountry).toHaveValue('Spain');

    const demoCountry = page
      .locator('label', { hasText: /^Country$/ })
      .locator('xpath=following-sibling::select[1]');
    await demoCountry.selectOption('Germany');

    await expect(pdfCountry).toHaveValue('Germany', { timeout: 10_000 });
  });

  test('narrowing the demo Databases multi-select shrinks the PDF databases listbox selection', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FORMS);
    await viewer.waitForFirstPageRender();
    await waitForAnnotationLayer(page);

    const pdfDatabases = page
      .locator('.annotationLayer select[name="databases"]')
      .first();
    await expect(pdfDatabases).toBeAttached({ timeout: 10_000 });

    // Default demo selection is ['oracle', 'db2', 'sqlServer']; the
    // PDF listbox reflects that. We narrow to just 'oracle' (an option
    // we know exists in the PDF — the demo's 'postgreSQL' option is a
    // demo-only value the PDF listbox can't render).
    const selectedValues = async () =>
      await pdfDatabases.evaluate((el) =>
        Array.from((el as HTMLSelectElement).selectedOptions).map(
          (o) => o.value,
        ),
      );

    await expect
      .poll(async () => (await selectedValues()).length, { timeout: 10_000 })
      .toBeGreaterThan(1);

    const demoDatabases = page
      .locator('label', { hasText: /^Databases$/ })
      .locator('xpath=following-sibling::select[1]');

    // Angular's NgSelectMultipleControlValueAccessor rewrites BOTH
    // the option's `value` property AND HTML attribute to an internal
    // id, so we can only target options by their visible label. Pass
    // a single-entry array so Playwright treats this as a multi-select
    // narrowing operation.
    await demoDatabases.selectOption([{ label: 'Oracle' }]);

    await expect
      .poll(selectedValues, { timeout: 10_000 })
      .toEqual(['oracle']);
  });
});

test.describe('T16 — /forms checkboxes (Angular → PDF)', () => {
  // typeScript / javaScript: demo stores 'Yes'/'No' (export values).
  // java / cSharp: demo stores boolean. Both flavours render in pdf.js
  // as plain <input type="checkbox" name="…">.
  const CASES: Array<{
    label: string;
    pdfName: string;
    initiallyChecked: boolean;
  }> = [
    { label: 'TypeScript', pdfName: 'typeScript', initiallyChecked: true },
    { label: 'JavaScript', pdfName: 'javaScript', initiallyChecked: false },
    { label: 'Java', pdfName: 'java', initiallyChecked: true },
    { label: 'C#', pdfName: 'cSharp', initiallyChecked: true },
  ];

  for (const c of CASES) {
    test(`toggling the demo ${c.label} checkbox flips the PDF checkbox`, async ({
      page,
    }) => {
      const viewer = new PdfViewerPage(page);
      await viewer.goto(FORMS);
      await viewer.waitForFirstPageRender();
      await waitForAnnotationLayer(page);

      const pdfCheckbox = page
        .locator(`.annotationLayer input[type="checkbox"][name="${c.pdfName}"]`)
        .first();
      await expect(pdfCheckbox).toBeAttached();

      if (c.initiallyChecked) {
        await expect(pdfCheckbox).toBeChecked();
      } else {
        await expect(pdfCheckbox).not.toBeChecked();
      }

      const demoCheckbox = page
        .locator('label')
        .filter({ hasText: new RegExp(`^${c.label.replace('#', '\\#')}$`) })
        .locator('input[type="checkbox"]')
        .first();

      if (c.initiallyChecked) {
        await demoCheckbox.uncheck();
        await expect(pdfCheckbox).not.toBeChecked({ timeout: 10_000 });
      } else {
        await demoCheckbox.check();
        await expect(pdfCheckbox).toBeChecked({ timeout: 10_000 });
      }
    });
  }
});

test.describe('T16 — /forms educationLevel radios (Angular → PDF)', () => {
  // pdf.js renders radio buttons with name=fieldName but no `value`
  // attribute — per-radio identity lives in data-element-id, derived
  // from opaque PDF object IDs we can't predict. Instead of asserting
  // "exactly one PDF radio is checked" (which holds even if the demo
  // routes every label to the same PDF radio), we discover the
  // label → element-id map at runtime, verify the map is a bijection
  // (all 4 ids distinct), and verify it's stable across a second pass.
  const LABELS = [
    'High School Diploma',
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
  ] as const;

  test('each demo radio maps to a distinct, stable PDF radio', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FORMS);
    await viewer.waitForFirstPageRender();
    await waitForAnnotationLayer(page);

    const pdfRadios = page.locator(
      '.annotationLayer input[type="radio"][name="educationLevel"]',
    );
    await expect
      .poll(async () => await pdfRadios.count(), { timeout: 15_000 })
      .toBeGreaterThan(0);

    const checkedIds = async (): Promise<string[]> =>
      await page.evaluate(() =>
        Array.from(
          document.querySelectorAll<HTMLInputElement>(
            '.annotationLayer input[type="radio"][name="educationLevel"]',
          ),
        )
          .filter((el) => el.checked)
          .map((el) => el.getAttribute('data-element-id') ?? ''),
      );

    const clickDemo = async (label: string): Promise<void> => {
      await page
        .locator('label')
        .filter({ hasText: label })
        .locator('input[type="radio"]')
        .first()
        .check();
    };

    const idAfterSelecting = async (label: string): Promise<string> => {
      const before = await checkedIds();
      await clickDemo(label);
      // For most labels, the click changes the selection; poll until
      // the checked id differs from `before`. For the case where
      // `label` is already selected (idempotent), exit once a single
      // radio remains checked.
      await expect
        .poll(
          async () => {
            const now = await checkedIds();
            if (now.length !== 1) return false;
            if (before.length === 1 && before[0] === now[0]) {
              return true;
            }
            return before.length !== 1 || before[0] !== now[0];
          },
          { timeout: 10_000 },
        )
        .toBe(true);
      const after = await checkedIds();
      expect(after).toHaveLength(1);
      return after[0];
    };

    // First pass: discover the mapping.
    const firstPass: Record<string, string> = {};
    for (const label of LABELS) {
      firstPass[label] = await idAfterSelecting(label);
    }

    // All four labels must map to four distinct PDF radios — otherwise
    // the demo is funnelling multiple Angular options into one PDF
    // option (the gap this test now closes).
    const ids = LABELS.map((l) => firstPass[l]);
    expect(new Set(ids).size).toBe(LABELS.length);

    // Second pass: the mapping must be stable. Walk the labels in
    // reverse order so each click is a real transition (no idempotent
    // re-click of whatever happened to be last selected).
    for (let i = LABELS.length - 1; i >= 0; i--) {
      const label = LABELS[i];
      expect(await idAfterSelecting(label)).toBe(firstPass[label]);
    }
  });
});

test.describe('T16 — /forms two-way binding (PDF → Angular)', () => {
  test('typing into the PDF firstName input updates the demo first-name-input', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FORMS);
    await viewer.waitForFirstPageRender();
    await waitForAnnotationLayer(page);

    const pdfFirstName = page
      .locator('.annotationLayer input[type="text"][name="firstName"]')
      .first();

    // Clear and type a unique value into the PDF input. The
    // (formDataChange) event must flow back into the demo's
    // firstName state and from there to #first-name-input.
    await pdfFirstName.fill('');
    await pdfFirstName.fill('Testname');
    await pdfFirstName.blur();

    await expect(page.locator('#first-name-input')).toHaveValue('Testname', {
      timeout: 10_000,
    });
  });

  test('unchecking the PDF TypeScript checkbox unchecks the demo TypeScript checkbox', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto(FORMS);
    await viewer.waitForFirstPageRender();
    await waitForAnnotationLayer(page);

    const pdfTypeScript = page
      .locator('.annotationLayer input[type="checkbox"][name="typeScript"]')
      .first();
    await expect(pdfTypeScript).toBeChecked();

    const demoTypeScript = page
      .locator('label')
      .filter({ hasText: /^TypeScript$/ })
      .locator('input[type="checkbox"]')
      .first();
    await expect(demoTypeScript).toBeChecked();

    // Drive the change from the PDF side. The demo's [checked]
    // binding re-evaluates when typeScript flips to 'No' in
    // setFormData(), so the demo checkbox should follow.
    await pdfTypeScript.uncheck();
    await expect(demoTypeScript).not.toBeChecked({ timeout: 10_000 });
  });
});
