import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import type { Page } from '@playwright/test';

/**
 * T33 — restoring annotations is quiet and predictable (30.0.0-rc.3).
 *
 * Covers the three tickets that shipped together in that release:
 *
 *   #3240 — one `added` event per restored annotation, whatever its type;
 *           no phantom `moved`; the viewer stays in the editor mode it was in;
 *           restored annotations are neither selected nor focused; and an
 *           annotation the engine can't read is skipped instead of discarding
 *           the ones behind it.
 *   #3254 — a whole array in one `addEditorAnnotation()` call is one step:
 *           one undo removes the batch, not one annotation of it.
 *   #3237 — a `popup` (the comment) survives the export → store → re-add
 *           round-trip, on free text as well as on highlights, and a restored
 *           highlight keeps its stable `customId` (the #3225 regression found
 *           while fixing this).
 *
 * None of this is provable from Angular: every mechanism lives in the compiled
 * engine (mypdf.js `tools.js` addSerializedEditor, `annotation_editor_layer.js`
 * onceAdded, `editor.js` _dispatchAddedEvent, `freetext.js`/`highlight.js`
 * deserialize). So the tests drive the real engine through the
 * export-annotations demo and read the engine's own state back out.
 *
 * The events are taken from the pdf.js event bus rather than from the demo's
 * message list: `/editor-events` truncates each entry to 60 characters, which
 * is too little to tell one restored annotation from the next.
 *
 * The mode assertion was falsified before it was trusted: calling the engine's
 * `addSerializedEditor()` with the pre-fix argument list is not enough to bring
 * the bug back, because the trigger is not the selection - it is the keyboard
 * focus the restored editor used to be given. Focusing a restored highlight by
 * hand still flips `annotationEditorMode` to 9 (highlight) and marks the editor
 * `.selectedEditor`, so both assertions here fail the moment that focus returns.
 */
test.describe.configure({ mode: 'parallel' });

const ROUTE = '/extended-pdf-viewer/export-annotations';

// ─── engine access ─────────────────────────────────────────────────────────

type EditorEvent = {
  type: string;
  id?: string;
  page?: number;
  editorType?: string;
};

/**
 * Capture the viewer's `PDFViewerApplication` — the library publishes it on this
 * one-shot event (see pdf-script-loader.service.ts).
 */
async function captureViewerApplication(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, any>;
    w.__ngxEvents = [];
    document.addEventListener('ngxViewerFileHasBeenLoaded', (e: Event) => {
      w.__ngxApp = (e as CustomEvent).detail.PDFViewerApplication;
    });
  });
}

/**
 * Record every `annotation-editor-event` the pdf.js event bus dispatches.
 *
 * The bus is created after `ngxViewerFileHasBeenLoaded` fires, so this is armed
 * from the test rather than from the init script - which is early enough: every
 * event under test is caused by a call the test makes afterwards.
 */
async function recordEditorEvents(page: Page): Promise<void> {
  await expect
    .poll(async () => await page.evaluate(() => !!(window as any).__ngxApp?.eventBus), {
      timeout: 15_000,
    })
    .toBe(true);
  await page.evaluate(() => {
    const w = window as unknown as Record<string, any>;
    if (w.__ngxBusHooked) {
      return;
    }
    w.__ngxBusHooked = true;
    w.__ngxApp.eventBus.on('annotation-editor-event', (ev: any) => {
      w.__ngxEvents.push({
        type: ev?.type,
        id: ev?.id,
        page: ev?.page,
        editorType: ev?.editorType,
      });
    });
  });
}

async function openViewer(page: Page): Promise<PdfViewerPage> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(ROUTE);
  await viewer.waitForFirstPageRender();
  await viewer.waitForPageRender(1);
  // The editor layer is what deserialize() needs; without it the engine skips
  // the annotation with a "layer … is not rendered yet" warning (#2656).
  await page
    .locator('.page[data-page-number="1"] .annotationEditorLayer')
    .first()
    .waitFor({ state: 'attached', timeout: 15_000 });
  await recordEditorEvents(page);
  return viewer;
}

/** Everything recorded so far. */
async function recordedEvents(page: Page): Promise<EditorEvent[]> {
  return await page.evaluate(() => (window as any).__ngxEvents as EditorEvent[]);
}

async function clearEvents(page: Page): Promise<void> {
  await page.evaluate(() => ((window as any).__ngxEvents.length = 0));
}

/**
 * The engine entry point the service's `addEditorAnnotation()` forwards to.
 * Calling it directly keeps the test on the code that changed; the service adds
 * nothing but the #3061 popup-hiding workaround around this call.
 */
async function addAnnotations(page: Page, data: unknown): Promise<void> {
  await page.evaluate(
    async (payload) => await (window as any).__ngxApp.pdfViewer.addEditorAnnotation(payload),
    data,
  );
}

async function serializedAnnotations(page: Page): Promise<any[]> {
  return await page.evaluate(
    () => (window as any).__ngxApp.pdfViewer.getSerializedAnnotations() ?? [],
  );
}

/** 0 = NONE, 3 = FREETEXT, 9 = HIGHLIGHT, 15 = INK. */
async function editorMode(page: Page): Promise<number> {
  return await page.evaluate(
    () => (window as any).__ngxApp.pdfViewer.annotationEditorMode,
  );
}

async function undo(page: Page): Promise<void> {
  await page.evaluate(() =>
    (
      window as any
    ).__ngxApp.pdfViewer._layerProperties.annotationEditorUIManager.undo(),
  );
}

// ─── annotation fixtures ───────────────────────────────────────────────────
// Fixed coordinates, unlike the demo's random ones: a test that moves its own
// input around can't tell a rounding bug from a restore bug.

const freeText = (value: string, extra: Record<string, unknown> = {}) => ({
  annotationType: 3,
  color: [10, 20, 30],
  fontSize: 12,
  value,
  pageIndex: 0,
  rect: [100, 600, 240, 621],
  rotation: 0,
  ...extra,
});

const highlight = (extra: Record<string, unknown> = {}) => ({
  annotationType: 9,
  color: [255, 255, 0],
  opacity: 0.5,
  thickness: 10,
  quadPoints: [120, 512, 260, 512, 120, 500, 260, 500],
  pageIndex: 0,
  rect: [120, 500, 260, 512],
  rotation: 0,
  ...extra,
});

// `NaN` does not survive JSON serialization into page.evaluate, so the ink
// annotation is rebuilt inside the page instead of being passed in.
async function addInk(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const drawing = {
      annotationType: 15,
      color: [200, 0, 0],
      thickness: 6,
      opacity: 1,
      paths: {
        lines: [[NaN, NaN, NaN, NaN, 150, 400, 170, 420, 190, 430, 210, 420]],
        points: [[150, 400, 180, 425, 210, 420]],
      },
      pageIndex: 0,
      rect: [150, 400, 210, 430],
      rotation: 0,
    };
    await (window as any).__ngxApp.pdfViewer.addEditorAnnotation(drawing);
  });
}

// ─── tests ─────────────────────────────────────────────────────────────────

test.describe('T33 — restoring annotations (#3240, #3254, #3237)', () => {
  // The fixes are on both fork branches (6.2 and bleeding-edge), so this runs
  // against whichever build the fixture selected — no skip.
  test.beforeEach(async ({ page }) => {
    await captureViewerApplication(page);
  });

  test('every restored annotation sends exactly one "added" event, and nothing else', async ({
    page,
  }) => {
    await openViewer(page);
    await clearEvents(page);

    // One call, three different editor types. Before #3240 only the highlight
    // announced itself: the free text reported a `moved` event for a move that
    // never happened, and the drawing reported nothing at all.
    await addAnnotations(page, [freeText('Alpha'), highlight()]);
    await addInk(page);

    await expect
      .poll(
        async () =>
          (await recordedEvents(page)).filter((e) => e.type === 'added').length,
        { timeout: 10_000 },
      )
      .toBe(3);

    const events = await recordedEvents(page);
    const added = events.filter((e) => e.type === 'added');

    expect(
      new Set(added.map((e) => e.id)).size,
      'each "added" event names a different annotation',
    ).toBe(3);
    expect(
      added.map((e) => e.page),
      'all three were restored onto page 1',
    ).toEqual([1, 1, 1]);
    expect(
      events.filter((e) => e.type === 'moved'),
      'no annotation was moved — restoring is not pasting',
    ).toEqual([]);
  });

  test('restoring an annotation leaves the editor mode alone, however often you do it', async ({
    page,
  }) => {
    const viewer = await openViewer(page);

    // The bug as reported: the first "Add highlight" behaved, every call after
    // it switched the viewer into highlight mode and left it there. The first
    // one was covered by pdf.js's own guard, so a single click proves nothing —
    // the assertion has to survive the repeat.
    const addHighlight = page.getByRole('button', {
      name: 'Add highlight',
      exact: true,
    });

    for (const attempt of [1, 2, 3]) {
      await addHighlight.click();
      await expect
        .poll(async () => await serializedAnnotations(page).then((a) => a.length), {
          timeout: 10_000,
        })
        .toBe(attempt);

      expect(
        await editorMode(page),
        `the viewer is still in NONE mode after highlight ${attempt}`,
      ).toBe(0);
      expect(
        await viewer.isEditorActive('highlight'),
        `the highlight tool is not switched on by highlight ${attempt}`,
      ).toBe(false);
    }
  });

  test('a restored annotation is neither selected nor given the keyboard focus', async ({
    page,
  }) => {
    await openViewer(page);

    await addAnnotations(page, [freeText('Beta')]);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(1);

    // Selecting an editor is what asked the toolbar to switch modes, and the
    // focus is what triggered the selection. Both must stay where they were.
    await expect(
      page.locator('.annotationEditorLayer .selectedEditor'),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('.annotationEditorLayer'),
      ),
      'the focus did not jump into the restored annotation',
    ).toBe(false);
  });

  test('an unreadable annotation is skipped, the ones behind it still arrive', async ({
    page,
  }) => {
    await openViewer(page);
    await clearEvents(page);

    // `annotationType: 99` has no editor registered, so the engine cannot build
    // it. It used to `return` at that point, silently dropping every annotation
    // that came after — restoring a stored batch lost its tail.
    await addAnnotations(page, [
      freeText('First'),
      { annotationType: 99, pageIndex: 0, rect: [0, 0, 10, 10], rotation: 0 },
      freeText('Third'),
    ]);

    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(2);

    const values = (await serializedAnnotations(page)).map((a) => a.value);
    expect(values, 'the annotation behind the broken one survived').toContain(
      'Third',
    );

    const added = (await recordedEvents(page)).filter((e) => e.type === 'added');
    expect(added, 'one "added" event per annotation that made it').toHaveLength(
      2,
    );
  });

  test('#3254 — a whole array restored in one call is a single undo step', async ({
    page,
  }) => {
    await openViewer(page);

    await addAnnotations(page, [
      freeText('One'),
      freeText('Two'),
      freeText('Three'),
    ]);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(3);

    await undo(page);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(0);
  });

  test('#3254 — three separate calls stay three undo steps', async ({ page }) => {
    await openViewer(page);

    // The counterpart to the test above: the batching is a property of the one
    // call, not of the engine collapsing everything it is given.
    for (const value of ['One', 'Two', 'Three']) {
      await addAnnotations(page, [freeText(value)]);
    }
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(3);

    await undo(page);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(2);
  });

  test('#3237 — a free text keeps its comment across a save/restore round-trip', async ({
    page,
  }) => {
    await openViewer(page);

    const COMMENT = 'Checked against the contract';
    await addAnnotations(page, [
      freeText('Gamma', { popup: { contents: COMMENT } }),
    ]);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(1);

    // First export: the comment was dropped on the way in before #3237 — free
    // text had no popup → comment mapping at all, unlike highlights and stamps.
    const exported = (await serializedAnnotations(page))[0];
    expect(exported.popup?.contents, 'the comment came back out').toBe(COMMENT);

    // Second round-trip: store → re-add → export again. This is the loop a real
    // application runs, and it is where the comment used to disappear.
    await page.evaluate(
      () => (window as any).__ngxApp.pdfViewer.removeEditorAnnotations(),
    );
    await addAnnotations(page, [exported]);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(1);

    const restored = (await serializedAnnotations(page))[0];
    expect(
      restored.popup?.contents,
      'the comment survived the second round-trip too',
    ).toBe(COMMENT);
  });

  test('#3237 — a highlight keeps its comment and its customId across a round-trip', async ({
    page,
  }) => {
    await openViewer(page);

    const COMMENT = 'Ambiguous wording';
    const CUSTOM_ID = 'e2e-highlight-4b71';
    await addAnnotations(page, [
      highlight({ customId: CUSTOM_ID, popup: { contents: COMMENT } }),
    ]);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(1);

    const exported = (await serializedAnnotations(page))[0];
    expect(exported.popup?.contents).toBe(COMMENT);
    expect(exported.customId).toBe(CUSTOM_ID);

    // A restored highlight used to come back without `isCopy` and without
    // `customId`, so the next export had lost both the comment and the stable
    // id of #3225.
    await page.evaluate(
      () => (window as any).__ngxApp.pdfViewer.removeEditorAnnotations(),
    );
    await addAnnotations(page, [exported]);
    await expect
      .poll(async () => (await serializedAnnotations(page)).length, {
        timeout: 10_000,
      })
      .toBe(1);

    const restored = (await serializedAnnotations(page))[0];
    expect(restored.popup?.contents, 'the comment is still there').toBe(COMMENT);
    expect(restored.customId, 'the stable customId is still there').toBe(
      CUSTOM_ID,
    );
  });
});
