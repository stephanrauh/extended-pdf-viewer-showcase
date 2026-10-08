import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { PdfViewerPage } from '../poms/pdf-viewer.page';
import { BUTTONS } from '../poms/toolbar-buttons';
import { drawInk } from '../poms/editor-gestures';
import { stubPrint } from '../poms/print-stub';

/**
 * T50 — the outputs that report what the user does in the toolbar and the
 * sidebar: rotationChange, spreadChange, scrollModeChange,
 * pageViewModeChange, sidebarVisibleChange, activeSidebarViewChange,
 * findbarVisibleChange, propertiesDialogVisibleChange, handToolChange,
 * annotationEditorModeChanged, annotationEditorEvent, beforePrint/afterPrint,
 * thumbnailDrawn and linkAnnotationsAdded.
 *
 * Each test triggers the event the way a user does and checks that it fires
 * once, with the viewer's new state as payload - and fires again when the
 * user undoes the change. The bare viewer (src/app/e2e-harness) records every
 * output in window.__ngxEvents.
 */

test.describe.configure({ mode: 'parallel' });

const DOC = '/assets/pdfs/Portugues-para-principiantes.pdf';
const OUTLINE = '/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';

type Recorded = { name: string; t: number; payload: any };

async function open(page: Page, query: string): Promise<void> {
  const viewer = new PdfViewerPage(page);
  await viewer.goto(`/e2e/viewer?show=always-visible&${query}`);
  await viewer.waitForFirstPageRender();
  await expect.poll(async () => (await named(page, 'pagesLoaded')).length, { timeout: 30_000 }).toBe(1);
  await page.waitForTimeout(500);
}

const events = async (page: Page): Promise<Recorded[]> => (await page.evaluate(() => (window as any).__ngxEvents)) ?? [];
const named = async (page: Page, name: string) => (await events(page)).filter((e) => e.name === name);
const app = (page: Page, expr: string) => page.evaluate((e) => new Function('app', `return (${e});`)((window as any).__ngxApp), expr);

/**
 * Runs `action` and returns the payloads of the `name` events it caused,
 * once they have stopped coming.
 */
async function emitted(page: Page, name: string, action: () => Promise<unknown>): Promise<unknown[]> {
  const before = (await named(page, name)).length;
  await action();
  await expect.poll(async () => (await named(page, name)).length, { message: `${name} fires`, timeout: 10_000 }).toBeGreaterThan(before);
  await page.waitForTimeout(500);
  return (await named(page, name)).slice(before).map((e) => e.payload);
}

const press = (page: Page, button: keyof typeof BUTTONS) => page.locator(`#${BUTTONS[button].toolbar}`).click();

test('rotationChange: once per click, with the new rotation', async ({ page }) => {
  await open(page, `src=${DOC}`);
  expect(await emitted(page, 'rotationChange', () => press(page, 'rotateCw'))).toEqual([90]);
  expect(await app(page, 'app.pdfViewer.pagesRotation')).toBe(90);
  expect(await emitted(page, 'rotationChange', () => press(page, 'rotateCw'))).toEqual([180]);
  expect(await emitted(page, 'rotationChange', () => press(page, 'rotateCcw'))).toEqual([90]);
});

test('spreadChange: once per click, with the new spread', async ({ page }) => {
  await open(page, `src=${DOC}`);
  expect(await emitted(page, 'spreadChange', () => press(page, 'spreadOdd'))).toEqual(['odd']);
  expect(await app(page, 'app.pdfViewer.spreadMode')).toBe(1);
  expect(await emitted(page, 'spreadChange', () => press(page, 'spreadEven'))).toEqual(['even']);
  expect(await emitted(page, 'spreadChange', () => press(page, 'spreadNone'))).toEqual(['off']);
});

test('scrollModeChange: once per click, with the new scroll mode', async ({ page }) => {
  await open(page, `src=${DOC}`);
  expect(await emitted(page, 'scrollModeChange', () => press(page, 'scrollHorizontal'))).toEqual([1]);
  expect(await app(page, 'app.pdfViewer.scrollMode')).toBe(1);
  expect(await emitted(page, 'scrollModeChange', () => press(page, 'scrollWrapped'))).toEqual([2]);
  expect(await emitted(page, 'scrollModeChange', () => press(page, 'scrollVertical'))).toEqual([0]);
});

test('pageViewModeChange: book mode and back', async ({ page }) => {
  await open(page, `src=${DOC}`);
  expect(await emitted(page, 'pageViewModeChange', () => press(page, 'bookMode'))).toEqual(['book']);
  expect(await app(page, 'app.pdfViewer.pageViewMode')).toBe('book');
  const back = await emitted(page, 'pageViewModeChange', () => press(page, 'scrollVertical'));
  expect(back.at(-1)).toBe('multiple');
});

test('sidebarVisibleChange and activeSidebarViewChange', async ({ page }) => {
  await open(page, `src=${OUTLINE}&sidebarVisible=false`);
  expect(await emitted(page, 'sidebarVisibleChange', () => press(page, 'sidebar'))).toEqual([true]);
  // pdf.js's SidebarView: THUMBS = 1, OUTLINE = 2
  const views = await emitted(page, 'activeSidebarViewChange', () => page.locator('#viewOutline').click());
  expect(views).toEqual([2]);
  expect(await emitted(page, 'activeSidebarViewChange', () => page.locator('#viewThumbnail').click())).toEqual([1]);
  expect(await emitted(page, 'sidebarVisibleChange', () => press(page, 'sidebar'))).toEqual([false]);
});

test('findbarVisibleChange: opening and closing the find bar', async ({ page }) => {
  await open(page, `src=${DOC}`);
  expect(await emitted(page, 'findbarVisibleChange', () => press(page, 'find'))).toEqual([true]);
  expect(await emitted(page, 'findbarVisibleChange', () => page.locator('#findInput').press('Escape'))).toEqual([false]);
});

test('propertiesDialogVisibleChange: opening and closing the document properties', async ({ page }) => {
  await open(page, `src=${DOC}`);
  expect(await emitted(page, 'propertiesDialogVisibleChange', () => press(page, 'properties'))).toEqual([true]);
  await expect(page.locator('#documentPropertiesDialog')).toBeVisible();
  expect(await emitted(page, 'propertiesDialogVisibleChange', () => page.keyboard.press('Escape'))).toEqual([false]);
  await expect(page.locator('#documentPropertiesDialog')).toBeHidden();

  // The same with the Close button - and only one event.
  expect(await emitted(page, 'propertiesDialogVisibleChange', () => press(page, 'properties'))).toEqual([true]);
  expect(await emitted(page, 'propertiesDialogVisibleChange', () => page.locator('#documentPropertiesClose').click())).toEqual([false]);
  await expect(page.locator('#documentPropertiesDialog')).toBeHidden();
});

test('handToolChange: switching between the hand tool and the text selection tool', async ({ page }) => {
  await open(page, `src=${DOC}&handTool=false`);
  expect(await emitted(page, 'handToolChange', () => press(page, 'handTool'))).toEqual([true]);
  expect(await app(page, 'app.pdfCursorTools.activeTool')).toBe(1);
  expect(await emitted(page, 'handToolChange', () => press(page, 'selectTool'))).toEqual([false]);
});

test('annotationEditorModeChanged and annotationEditorEvent: drawing and deleting a stroke', async ({ page }) => {
  await open(page, `src=${DOC}`);
  const modes = await emitted(page, 'annotationEditorModeChanged', () => press(page, 'ink'));
  expect(modes.at(-1)).toEqual(expect.objectContaining({ mode: 15 }));

  const drawn = await emitted(page, 'annotationEditorEvent', () => drawInk(page));
  const types = drawn.map((e: any) => e.type);
  expect(types, `events: ${types}`).toContain('drawingStopped');
  for (const e of drawn as any[]) {
    expect(typeof e.type).toBe('string');
  }

  // drawInk() commits the stroke with Escape, which also ends the drawing mode.
  await expect.poll(() => app(page, 'app.pdfViewer.annotationEditorMode')).toBe(0);
  expect((await named(page, 'annotationEditorModeChanged')).at(-1)!.payload).toEqual(expect.objectContaining({ mode: 0 }));
  const again = await emitted(page, 'annotationEditorModeChanged', () => press(page, 'ink'));
  expect(again.at(-1)).toEqual(expect.objectContaining({ mode: 15 }));
});

test('beforePrint and afterPrint: once each, in that order', async ({ page }) => {
  await stubPrint(page);
  await open(page, 'src=/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf');
  await press(page, 'print');
  await expect.poll(async () => (await named(page, 'afterPrint')).length, { timeout: 30_000 }).toBe(1);
  await page.waitForTimeout(500);
  const all = (await events(page)).filter((e) => e.name === 'beforePrint' || e.name === 'afterPrint').map((e) => e.name);
  expect(all).toEqual(['beforePrint', 'afterPrint']);
});

test('thumbnailDrawn: one per thumbnail, for the right pages', async ({ page }) => {
  await open(page, 'src=/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf&sidebarVisible=true');
  await expect(page.locator('#thumbnailsView .thumbnail')).toHaveCount(10, { timeout: 20_000 });
  // Exactly one event for each of the ten thumbnails - none missing, none twice.
  const pageIds = async () => (await named(page, 'thumbnailDrawn')).map((e) => e.payload.pageId as number).sort((a, b) => a - b);
  await expect.poll(pageIds, { timeout: 20_000 }).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  await page.waitForTimeout(1000);
  expect(await pageIds(), 'no thumbnail reported twice').toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('linkAnnotationsAdded: once per page with links, with the page number', async ({ page }) => {
  await open(page, 'src=/assets/pdfs/blind-text-collection.pdf');
  await expect.poll(async () => (await named(page, 'linkAnnotationsAdded')).map((e) => e.payload.pageNumber), { timeout: 15_000 }).toEqual([1]);
  expect((await named(page, 'linkAnnotationsAdded'))[0].payload.error).toBeNull();
});
