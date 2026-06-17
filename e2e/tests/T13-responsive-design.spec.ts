import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';

test.describe.configure({ mode: 'parallel' });

test.describe('T13 — /responsive-design', () => {
  test('showFindButton dropdown toggles the find button in the toolbar', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/responsive-design');
    await viewer.waitForFirstPageRender();

    // The interactive show*Button dropdowns live on the 'responsive
    // design' tab — the default 'breakpoints' tab is descriptive text
    // only.
    await page
      .getByRole('button', { name: 'responsive design', exact: true })
      .click();

    // Default showFindButton='xxl' (visible once viewer width >=
    // 830px). The test runs in a 1920px viewport, so the find button
    // is visible up front.
    const findButton = page.locator('#primaryViewFind');
    await expect(findButton).toBeVisible();

    // The labels aren't `for`-linked to their selects, so target by
    // following-sibling. selectOption matches the rendered option text
    // produced by withExplanation().
    const findDropdown = page
      .locator('label', { hasText: 'showFindButton' })
      .locator('xpath=following-sibling::select[1]');

    await findDropdown.selectOption({ label: 'false (hidden)' });
    await expect(findButton).toBeHidden({ timeout: 5_000 });

    await findDropdown.selectOption({ label: 'always-visible' });
    await expect(findButton).toBeVisible({ timeout: 5_000 });
  });

  test('raising the xxl breakpoint hides xxl-gated buttons without a viewport resize', async ({
    page,
  }) => {
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/responsive-design');
    await viewer.waitForFirstPageRender();

    // The xs..xxl number inputs live on the 'custom breakpoints demo'
    // tab. Their setters mutate PdfBreakpoints and call
    // pdfViewer.onResize(), so the toolbar re-evaluates without an
    // actual window resize.
    await page
      .getByRole('button', { name: 'custom breakpoints demo', exact: true })
      .click();

    // showSidebarButton defaults to 'xxl'. At a 1920px viewport the
    // viewer is wider than the default xxl (830px), so the sidebar
    // toggle is visible up front.
    const sidebarBtn = page.locator('#viewsManagerToggleButton');
    await expect(sidebarBtn).toBeVisible();

    // Raise xxl past the viewer width — every 'xxl' button should
    // collapse. Match the label by exact text so we don't grab xs/sm/etc.
    const xxlInput = page
      .locator('label', { hasText: /^xxl$/ })
      .locator('xpath=following-sibling::input[1]');
    await xxlInput.fill('5000');
    // Force a blur — some browsers / ngModel configs only fire
    // 'change' on commit, and the setter must run for onResize() to
    // be invoked.
    await xxlInput.blur();

    await expect(sidebarBtn).toBeHidden({ timeout: 5_000 });
  });
});

test.describe('T13 — /simple default toolbar responsive layout', () => {
  // Picked to span pdf.js's default breakpoints (xs=490 .. xxl=830
  // applied to the viewer width, which on /simple is ~55% of the
  // viewport because the settings panel takes the rest).
  const VIEWPORTS = [1920, 1280, 1024, 800, 600, 480];

  for (const width of VIEWPORTS) {
    test(`at viewport ${width}px the toolbar stays single-row with no overlapping items`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const viewer = new PdfViewerPage(page);
      await viewer.goto('/extended-pdf-viewer/simple');
      await viewer.waitForViewerMounted();

      // Don't require canvas visibility — at narrow viewports the
      // showcase's settings panel pushes the viewer below the fold,
      // so the canvas can be in the DOM and rendered without being
      // visible to Playwright. The test is about toolbar layout, so
      // wait only for the toolbar to have a layout box.
      // Wait for pdf.js's responsive toolbar to *settle* into a single row.
      // On mount the toolbar can briefly render every item at full width —
      // which wraps to two/three rows — before the breakpoint logic hides the
      // overflow items. Snapshotting `height` as soon as it first has a box
      // catches that transient (seen intermittently on webkit), so poll until
      // the height is in the single-row band instead of measuring once.
      //
      // A single-row pdf.js toolbar is ~32px tall; a wrapped layout is ~64px+.
      // 50px tolerates theme padding but excludes wrapping. The `h > 0` half of
      // the band also covers "no layout box yet", so this one poll waits for
      // both "mounted" and "settled".
      const toolbar = page.locator('#toolbarViewer').first();
      await expect
        .poll(
          async () => {
            const h = (await toolbar.boundingBox())?.height ?? 0;
            return h > 0 && h < 50;
          },
          {
            timeout: 5_000,
            message: `toolbar should settle to a single row (~32px, <50px) at viewport ${width}px`,
          },
        )
        .toBe(true);

      // Now stable — snapshot once more for a precise px in the failure message.
      const toolbarBox = await toolbar.boundingBox();
      expect(
        toolbarBox!.height,
        `toolbar wrapped to ${toolbarBox!.height}px at viewport ${width}px`,
      ).toBeLessThan(50);

      // Walk each section's direct children — that's the layout
      // granularity, since each child is a self-contained toolbar
      // item. Skip CSS-hidden children: pdf.js's responsive design
      // hides items via class toggles rather than removing them, and
      // a hidden zero-width item would falsely flag as an overlap.
      for (const sectionId of [
        'toolbarViewerLeft',
        'toolbarViewerMiddle',
        'toolbarViewerRight',
      ]) {
        const items = await page.evaluate((id) => {
          const root = document.getElementById(id);
          if (!root) return [] as { id: string; x: number; right: number }[];
          return Array.from(root.children)
            .filter((c) => {
              const cs = getComputedStyle(c as HTMLElement);
              return cs.display !== 'none' && cs.visibility !== 'hidden';
            })
            .map((c) => {
              const r = (c as HTMLElement).getBoundingClientRect();
              return {
                id: (c as HTMLElement).id || (c as HTMLElement).tagName,
                x: r.left,
                right: r.right,
              };
            })
            .filter((it) => it.right > it.x);
        }, sectionId);

        const sorted = items.slice().sort((a, b) => a.x - b.x);
        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const cur = sorted[i];
          // 1px tolerance for sub-pixel layout rounding.
          expect(
            prev.right,
            `#${sectionId} @ ${width}px: "${prev.id}" right=${prev.right.toFixed(1)} overlaps "${cur.id}" left=${cur.x.toFixed(1)}`,
          ).toBeLessThanOrEqual(cur.x + 1);
        }
      }
    });
  }

  test('the count of visible toolbar items drops when the viewport narrows and recovers when it widens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 800 });
    const viewer = new PdfViewerPage(page);
    await viewer.goto('/extended-pdf-viewer/simple');
    await viewer.waitForFirstPageRender();

    // Picking a specific button (e.g. #primaryViewFind) is brittle —
    // /simple sets some buttons to "always-visible" so they never
    // collapse. Count all visible interactive items instead: pdf.js's
    // responsive system toggles classes that flip elements between
    // visible and zero-box-or-display:none, so a drop in this count
    // proves the responsive system reacted to the resize.
    const countVisible = () =>
      page.evaluate(() => {
        const root = document.getElementById('toolbarViewer');
        if (!root) return 0;
        return Array.from(
          root.querySelectorAll(
            'button, input, select, a, [role="button"]',
          ),
        ).filter((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return false;
          const r = (el as HTMLElement).getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        }).length;
      });

    const wideCount = await countVisible();
    expect(
      wideCount,
      'expected some visible toolbar items at 1920px',
    ).toBeGreaterThan(0);

    await page.setViewportSize({ width: 480, height: 800 });
    await expect.poll(countVisible, { timeout: 5_000 }).toBeLessThan(wideCount);

    await page.setViewportSize({ width: 1920, height: 800 });
    await expect.poll(countVisible, { timeout: 5_000 }).toBe(wideCount);
  });
});
