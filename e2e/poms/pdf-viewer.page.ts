import { Page, Locator, expect } from '@playwright/test';

export type ZoomPreset =
  | 'auto'
  | 'page-actual'
  | 'page-fit'
  | 'page-width'
  | string;

export type ScrollMode = 'vertical' | 'horizontal' | 'wrapped' | 'page';
export type SpreadMode = 'none' | 'odd' | 'even';
export type EditorMode = 'highlight' | 'draw' | 'text' | 'stamp' | 'signature';

const EDITOR_MODE_IDS: Record<EditorMode, string> = {
  highlight: 'primaryEditorHighlight',
  draw: 'primaryEditorInk',
  text: 'primaryEditorFreeText',
  stamp: 'primaryEditorStamp',
  signature: 'primaryEditorSignatureButton',
};

const SCROLL_MODE_IDS: Record<ScrollMode, string> = {
  vertical: 'scrollVertical',
  horizontal: 'scrollHorizontal',
  wrapped: 'scrollWrapped',
  page: 'scrollPage',
};

const SPREAD_MODE_IDS: Record<SpreadMode, string> = {
  none: 'spreadNone',
  odd: 'spreadOdd',
  even: 'spreadEven',
};

/**
 * Page object for the standard ngx-extended-pdf-viewer instance.
 *
 * Mental model: every method does one user-visible thing. Tests read top-down,
 * helpers are named after what the user did (gotoPage, zoomIn, openSidebar),
 * not after the DOM detail they touched.
 */
export class PdfViewerPage {
  readonly page: Page;
  readonly viewerHost: Locator;
  readonly viewerContainer: Locator;
  readonly pageNumberInput: Locator;
  readonly zoomSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewerHost = page.locator('ngx-extended-pdf-viewer').first();
    this.viewerContainer = page.locator('#viewerContainer').first();
    this.pageNumberInput = page.locator('#pageNumber').first();
    this.zoomSelect = page
      .getByRole('combobox', { name: 'Zoom' })
      .first();
  }

  // ─── navigation ──────────────────────────────────────────────────────────

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  // ─── mount / readiness ───────────────────────────────────────────────────

  async waitForViewerMounted(): Promise<void> {
    await this.viewerHost.waitFor({ state: 'attached' });
    await this.viewerContainer.waitFor({ state: 'attached' });
  }

  /**
   * Waits for any page canvas to appear inside the viewer. pdf.js renders
   * pages lazily near the viewport, so demos that open at page N (e.g.
   * /simple opens at page 5) may never paint a canvas for page 1. Use
   * {@link waitForPageRender} to wait for a specific page.
   */
  async waitForFirstPageRender(timeoutMs = 60_000): Promise<void> {
    await this.waitForViewerMounted();
    const anyCanvas = this.page
      .locator('ngx-extended-pdf-viewer .page canvas')
      .first();
    await anyCanvas.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async waitForPageRender(pageNumber: number, timeoutMs = 60_000): Promise<void> {
    await this.waitForViewerMounted();
    const canvas = this.page
      .locator(`.page[data-page-number="${pageNumber}"] canvas`)
      .first();
    await canvas.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  // ─── page introspection ──────────────────────────────────────────────────

  async getPageCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const el = document.querySelector('#numPages, .pageNumber + span');
      if (el?.textContent) {
        const match = el.textContent.match(/\d+/);
        if (match) return Number(match[0]);
      }
      return document.querySelectorAll('.page').length;
    });
  }

  async getRenderedPageCount(): Promise<number> {
    return await this.page.locator('.page canvas').count();
  }

  /**
   * Returns the current page number reported by the viewer. We read the
   * input value via `page.evaluate` (not Playwright's locator.inputValue)
   * because the input is populated asynchronously by pdf.js — locator
   * resolution can race the value being set and Playwright's inputValue
   * has been observed to return non-numeric strings during the gap.
   * Returns 0 when the input is missing, empty, or non-numeric so callers
   * can poll for a valid value with a simple `> 0` predicate.
   */
  async getCurrentPage(): Promise<number> {
    return await this.page.evaluate(() => {
      const el = document.getElementById('pageNumber') as
        | HTMLInputElement
        | null;
      if (!el) return 0;
      const raw = (el.value ?? '').trim();
      if (raw === '') return 0;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : 0;
    });
  }

  /**
   * Waits for `#pageNumber` to hold a finite positive number, then returns
   * it. pdf.js populates the input asynchronously after the first canvas
   * paints, so a bare {@link getCurrentPage} call can race and return 0.
   */
  async waitForCurrentPage(timeoutMs = 15_000): Promise<number> {
    await expect
      .poll(async () => await this.getCurrentPage(), { timeout: timeoutMs })
      .toBeGreaterThan(0);
    return await this.getCurrentPage();
  }

  /**
   * Returns the `data-page-number` of the `.page` element whose top edge
   * is closest to the viewer-container's scroll position. This is the
   * page the user is actually looking at, derived from layout alone — no
   * dependency on pdf.js's toolbar input being populated.
   *
   * Some demos (e.g. /simple with `[(page)]="page"` two-way binding) take
   * longer than 15s for `#pageNumber.value` to settle, even though the
   * canvas paints in 2s. Use this as a fallback when {@link
   * waitForCurrentPage} is unreliable or unavailable.
   *
   * Returns 0 if no `.page` element has a layout yet.
   */
  async getCurrentPageFromViewport(): Promise<number> {
    return await this.page.evaluate(() => {
      const container =
        document.querySelector<HTMLElement>('#viewerContainer');
      if (!container) return 0;
      const target = container.scrollTop;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      const pages = document.querySelectorAll<HTMLElement>(
        '.page[data-page-number]',
      );
      for (const page of pages) {
        if (page.offsetHeight === 0) continue;
        const dist = Math.abs(page.offsetTop - target);
        if (dist < bestDistance) {
          bestDistance = dist;
          best = Number(page.dataset.pageNumber ?? '0');
        }
      }
      return best;
    });
  }

  /** Polls {@link getCurrentPageFromViewport} until it matches `expected`. */
  async expectViewportOnPage(expected: number, timeoutMs = 15_000): Promise<void> {
    await expect
      .poll(async () => await this.getCurrentPageFromViewport(), {
        timeout: timeoutMs,
      })
      .toBe(expected);
  }

  async getCanvasSize(
    pageNumber?: number,
  ): Promise<{ width: number; height: number }> {
    return await this.page.evaluate((pageNum) => {
      const canvas =
        pageNum === undefined
          ? document.querySelector<HTMLCanvasElement>(
              'ngx-extended-pdf-viewer .page canvas',
            )
          : document.querySelector<HTMLCanvasElement>(
              `.page[data-page-number="${pageNum}"] canvas`,
            );
      return canvas
        ? { width: canvas.width, height: canvas.height }
        : { width: 0, height: 0 };
    }, pageNumber);
  }

  /**
   * Cheap pixel fingerprint of a rendered page canvas. Used to detect "the
   * canvas looks different now" after navigation, zoom, or rotation, without
   * caring about exact dimensions (pdf.js may re-render with the same
   * intrinsic width while the pixel content is completely different).
   *
   * Returns the empty string if the canvas isn't present.
   */
  async hashCanvas(pageNumber?: number): Promise<string> {
    return await this.page.evaluate((pageNum) => {
      const canvas =
        pageNum === undefined
          ? document.querySelector<HTMLCanvasElement>(
              'ngx-extended-pdf-viewer .page canvas',
            )
          : document.querySelector<HTMLCanvasElement>(
              `.page[data-page-number="${pageNum}"] canvas`,
            );
      if (!canvas) return '';
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      const { width, height } = canvas;
      const data = ctx.getImageData(0, 0, width, height).data;
      // FNV-1a-ish rolling hash over every 16th byte — cheap and good
      // enough to detect re-renders.
      let h = 2166136261;
      for (let i = 0; i < data.length; i += 16) {
        h ^= data[i];
        h = Math.imul(h, 16777619);
      }
      return `${width}x${height}:${(h >>> 0).toString(16)}`;
    }, pageNumber);
  }

  /**
   * Returns the text content of a page's text layer. Useful for "I navigated
   * to page N — is the right text actually showing?" assertions. Returns the
   * empty string if the text layer isn't present (route may have
   * `textLayer="false"`, or the page hasn't been rendered yet).
   */
  async getTextLayerContent(pageNumber: number): Promise<string> {
    return await this.page.evaluate((pageNum) => {
      const layer = document.querySelector(
        `.page[data-page-number="${pageNum}"] .textLayer`,
      );
      return layer?.textContent?.trim() ?? '';
    }, pageNumber);
  }

  /** Number of annotation elements rendered inside the given page. */
  async getAnnotationCount(pageNumber: number): Promise<number> {
    return await this.page
      .locator(`.page[data-page-number="${pageNumber}"] .annotationLayer > *`)
      .count();
  }

  /**
   * Asserts that some rendered page canvas has actual ink on it.
   * Polls until any canvas inside the target page has non-white pixels —
   * pdf.js often attaches the canvas before painting it, and may render
   * multiple canvases per page (main render + editor overlay).
   *
   * Pass a `pageNumber` to target a specific page; omit it to scan every
   * page canvas inside the viewer (useful when the visible page isn't 1).
   */
  async assertCanvasHasContent(
    pageNumber?: number,
    minNonWhiteRatio = 0.001,
  ): Promise<void> {
    await expect
      .poll(
        async () =>
          await this.page.evaluate(
            ({ pageNum, threshold }) => {
              const selector =
                pageNum === undefined
                  ? 'ngx-extended-pdf-viewer .page canvas'
                  : `.page[data-page-number="${pageNum}"] canvas`;
              const canvases =
                document.querySelectorAll<HTMLCanvasElement>(selector);
              let best = -1;
              for (const canvas of canvases) {
                if (canvas.width === 0 || canvas.height === 0) continue;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;
                try {
                  const sample = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                  ).data;
                  let nonWhite = 0;
                  for (let i = 0; i < sample.length; i += 4) {
                    const r = sample[i];
                    const g = sample[i + 1];
                    const b = sample[i + 2];
                    const a = sample[i + 3];
                    if (a > 0 && (r < 250 || g < 250 || b < 250)) nonWhite++;
                  }
                  const ratio = nonWhite / (sample.length / 4);
                  if (ratio >= threshold) return ratio;
                  if (ratio > best) best = ratio;
                } catch {
                  // tainted canvas — skip
                }
              }
              return best;
            },
            { pageNum: pageNumber, threshold: minNonWhiteRatio },
          ),
        { timeout: 30_000 },
      )
      .toBeGreaterThanOrEqual(minNonWhiteRatio);
  }

  // ─── high-level assertions ───────────────────────────────────────────────
  // These exist so individual tests state *what they expect to see* instead
  // of restating the polling/selector mechanics every time.

  /**
   * Asserts the rendered text layer for `pageNumber` contains `phrase`.
   * Polls because the text layer is populated asynchronously after the
   * canvas first paints. Use this to prove the correct PDF/page is showing,
   * not just that *some* canvas rendered.
   */
  async expectPageText(
    pageNumber: number,
    phrase: string,
    timeoutMs = 15_000,
  ): Promise<void> {
    await expect
      .poll(async () => await this.getTextLayerContent(pageNumber), {
        timeout: timeoutMs,
      })
      .toContain(phrase);
  }

  /**
   * Asserts at least one rendered text layer in the document contains
   * `phrase`. Looser than {@link expectPageText} — useful when the page
   * number depends on layout (multi-column demos, wrapped scroll, etc.).
   */
  async expectRenderedTextContains(
    phrase: string,
    timeoutMs = 15_000,
  ): Promise<void> {
    await expect
      .poll(
        async () =>
          await this.page.evaluate(() =>
            Array.from(document.querySelectorAll('.textLayer'))
              .map((l) => l.textContent ?? '')
              .join('\n'),
          ),
        { timeout: timeoutMs },
      )
      .toContain(phrase);
  }

  /**
   * Reads pdf.js's `data-main-rotation` attribute. pdf.js sets this on
   * each rendered layer (canvasWrapper / textLayer / annotationLayer) via
   * `setLayerDimensions`, NOT on the `.page` wrapper itself, so we scan
   * the page's children. The attribute is only present when rotation is
   * non-zero, so a missing attribute means 0.
   */
  async getMainRotation(pageNumber: number): Promise<number> {
    return await this.page.evaluate((pageNum) => {
      const page = document.querySelector<HTMLElement>(
        `.page[data-page-number="${pageNum}"]`,
      );
      if (!page) return 0;
      const rotated = page.querySelector<HTMLElement>('[data-main-rotation]');
      const raw = rotated?.getAttribute('data-main-rotation') ?? '0';
      return Number(raw);
    }, pageNumber);
  }

  /**
   * Bounding box (in viewer-container coordinates) of a single layer inside
   * a page. Returns null when the layer isn't present — annotation/editor
   * layers are absent unless the page actually has those features.
   */
  async getLayerBox(
    pageNumber: number,
    layer:
      | '.canvasWrapper'
      | 'canvas'
      | '.textLayer'
      | '.annotationLayer'
      | '.annotationEditorLayer',
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return await this.page.evaluate(
      ({ pageNum, sel }) => {
        const page = document.querySelector<HTMLElement>(
          `.page[data-page-number="${pageNum}"]`,
        );
        const container =
          document.querySelector<HTMLElement>('#viewerContainer');
        if (!page || !container) return null;
        const el = page.querySelector<HTMLElement>(sel);
        if (!el) return null;
        const eb = el.getBoundingClientRect();
        const cb = container.getBoundingClientRect();
        return {
          x: eb.left - cb.left + container.scrollLeft,
          y: eb.top - cb.top + container.scrollTop,
          width: eb.width,
          height: eb.height,
        };
      },
      { pageNum: pageNumber, sel: layer },
    );
  }

  /**
   * Asserts that the page's overlay layers align with its canvas wrapper.
   * "Align" means within `tolerancePx` for each of (x, y, width, height).
   * Layers that aren't present on the page are skipped — only the canvas
   * wrapper is required.
   *
   * Use after zoom or rotation to catch layouts that re-render the canvas
   * but leave the overlays at the old size.
   *
   * `.annotationEditorLayer` is excluded by default: pdf.js positions it
   * relative to the page, not the canvas wrapper, and when editing is not
   * active it can sit far off the wrapper (large translate). Editor-mode
   * tests should compare it against the page or the wrapper while the
   * editor is engaged.
   */
  async expectVisiblePageLayersAligned(
    pageNumber: number,
    tolerancePx = 2,
    options: { includeAnnotationEditorLayer?: boolean } = {},
  ): Promise<void> {
    const wrapper = await this.getLayerBox(pageNumber, '.canvasWrapper');
    expect(wrapper, `.canvasWrapper missing on page ${pageNumber}`).not.toBeNull();
    const ref = wrapper!;

    const checked: Array<
      '.textLayer' | '.annotationLayer' | '.annotationEditorLayer'
    > = ['.textLayer', '.annotationLayer'];
    if (options.includeAnnotationEditorLayer) {
      checked.push('.annotationEditorLayer');
    }
    for (const sel of checked) {
      const box = await this.getLayerBox(pageNumber, sel);
      if (!box) continue;
      expect(
        Math.abs(box.x - ref.x),
        `${sel} x misaligned on page ${pageNumber}`,
      ).toBeLessThanOrEqual(tolerancePx);
      expect(
        Math.abs(box.y - ref.y),
        `${sel} y misaligned on page ${pageNumber}`,
      ).toBeLessThanOrEqual(tolerancePx);
      expect(
        Math.abs(box.width - ref.width),
        `${sel} width misaligned on page ${pageNumber}`,
      ).toBeLessThanOrEqual(tolerancePx);
      expect(
        Math.abs(box.height - ref.height),
        `${sel} height misaligned on page ${pageNumber}`,
      ).toBeLessThanOrEqual(tolerancePx);
    }
  }

  // ─── page navigation (toolbar) ───────────────────────────────────────────
  // ngx-extended-pdf-viewer renders each shy-button twice (primary toolbar +
  // secondary menu). We target the stable `primary*` ids to avoid grabbing a
  // hidden secondary copy.

  async gotoPage(n: number): Promise<void> {
    await this.pageNumberInput.fill(String(n));
    await this.pageNumberInput.press('Enter');
  }

  async nextPage(): Promise<void> {
    await this.page.locator('#primaryNext').click();
  }

  async previousPage(): Promise<void> {
    await this.page.locator('#primaryPrevious').click();
  }

  async firstPage(): Promise<void> {
    await this.page.locator('#primaryFirstPage').click();
  }

  async lastPage(): Promise<void> {
    await this.page.locator('#primaryLastPage').click();
  }

  // ─── zoom (toolbar) ──────────────────────────────────────────────────────

  async zoomIn(): Promise<void> {
    await this.page.locator('#primaryZoomIn').click();
  }

  async zoomOut(): Promise<void> {
    await this.page.locator('#primaryZoomOut').click();
  }

  async setZoom(value: ZoomPreset): Promise<void> {
    await this.zoomSelect.selectOption(value);
  }

  /** Current value of the zoom dropdown (e.g. 'auto', '1', '1.25'). */
  async getZoomValue(): Promise<string> {
    return await this.zoomSelect.inputValue();
  }

  // ─── sidebar (toolbar) ───────────────────────────────────────────────────

  async toggleSidebar(): Promise<void> {
    await this.page.locator('#viewsManagerToggleButton').click();
  }

  async isSidebarOpen(): Promise<boolean> {
    return (
      (await this.page
        .locator('#viewsManagerToggleButton')
        .getAttribute('aria-expanded')) === 'true'
    );
  }

  // ─── find (toolbar) ──────────────────────────────────────────────────────
  // The Find button is only rendered when `textLayer="true"`; routes without
  // a text layer don't expose this interaction at all.

  async openFindBar(): Promise<void> {
    await this.page.locator('#primaryViewFind').click();
    await this.page.locator('#findInput').first().waitFor({ state: 'visible' });
  }

  async findInDocument(query: string): Promise<void> {
    await this.openFindBar();
    const findInput = this.page.locator('#findInput').first();
    await findInput.fill(query);
    await findInput.press('Enter');
  }

  // ─── secondary toolbar (behind the Tools button) ─────────────────────────

  async openSecondaryToolbar(): Promise<void> {
    await this.ensureSecondaryMenuOpen();
  }

  /**
   * Switches scroll mode by clicking the secondary-menu copy of the button
   * directly. We use `force: true` because the menu is hidden by default and
   * the open/close cycle is unreliable when several mode changes happen in
   * sequence — the underlying click handler fires regardless of visibility.
   */
  async setScrollMode(mode: ScrollMode): Promise<void> {
    await this.clickSecondaryMenuItem(SCROLL_MODE_IDS[mode]);
  }

  async setSpreadMode(mode: SpreadMode): Promise<void> {
    await this.clickSecondaryMenuItem(SPREAD_MODE_IDS[mode]);
  }

  private async clickSecondaryMenuItem(primaryId: string): Promise<void> {
    const secondaryId =
      'secondary' + primaryId.charAt(0).toUpperCase() + primaryId.slice(1);
    // Open the menu so the item becomes visible, then click it for real.
    // Some entries (spread modes) won't fire if the parent is hidden.
    await this.ensureSecondaryMenuOpen();
    await this.page.locator(`#${secondaryId}`).click();
  }

  private async ensureSecondaryMenuOpen(): Promise<void> {
    const isOpen = await this.page
      .locator('#secondaryToolbar')
      .evaluate((el) => !el.classList.contains('hidden'));
    if (isOpen) return;
    await this.page.locator('#secondaryToolbarToggle').click();
    await this.page
      .locator('#secondaryToolbar')
      .waitFor({ state: 'visible' });
  }

  /**
   * Page position. Reads `getBoundingClientRect` (which accounts for CSS
   * transforms used by pdf.js in non-vertical scroll modes) and adds the
   * viewer container's scroll offsets so the returned coordinates are in
   * the viewer's own coordinate system, stable across viewport scrolling
   * and meaningful for pages currently offscreen.
   */
  async getPageLayout(
    pageNumber: number,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return await this.page.evaluate((pageNum) => {
      const el = document.querySelector<HTMLElement>(
        `.page[data-page-number="${pageNum}"]`,
      );
      const container = document.querySelector<HTMLElement>('#viewerContainer');
      if (!el || !container) return null;
      const eb = el.getBoundingClientRect();
      const cb = container.getBoundingClientRect();
      return {
        x: eb.left - cb.left + container.scrollLeft,
        y: eb.top - cb.top + container.scrollTop,
        width: eb.width,
        height: eb.height,
      };
    }, pageNumber);
  }

  async rotateClockwise(): Promise<void> {
    await this.openSecondaryToolbar();
    await this.page
      .getByRole('button', { name: 'Rotate Clockwise' })
      .first()
      .click();
  }

  async rotateCounterclockwise(): Promise<void> {
    await this.openSecondaryToolbar();
    await this.page
      .getByRole('button', { name: 'Rotate Counterclockwise' })
      .first()
      .click();
  }

  async enableHandTool(): Promise<void> {
    await this.openSecondaryToolbar();
    await this.page
      .getByRole('button', { name: 'Enable hand tool' })
      .first()
      .click();
  }

  async enableTextSelectionTool(): Promise<void> {
    await this.openSecondaryToolbar();
    await this.page
      .getByRole('button', { name: 'Enable text selection tool' })
      .first()
      .click();
  }

  // ─── editor modes (toolbar) ──────────────────────────────────────────────

  async activateEditor(mode: EditorMode): Promise<void> {
    await this.page.locator(`#${EDITOR_MODE_IDS[mode]}`).click();
  }

  async isEditorActive(mode: EditorMode): Promise<boolean> {
    return await this.page
      .locator(`#${EDITOR_MODE_IDS[mode]}`)
      .evaluate((el) => el.classList.contains('toggled'));
  }

  // ─── text-layer / canvas overlay measurement ─────────────────────────────

  /**
   * Toggles a global stylesheet that forces every text-layer span to render
   * opaque red. pdf.js paints the text layer transparent (or near-transparent)
   * so canvas glyphs show through; flipping it to opaque red lets a page
   * screenshot reveal where the text layer actually lands relative to the
   * canvas-rendered ink.
   *
   * Idempotent — calling enable twice is safe; calling disable when nothing
   * was injected is a no-op.
   */
  async setTextLayerOpaqueRed(enabled: boolean): Promise<void> {
    await this.page.evaluate((on) => {
      const ID = '__e2e_textlayer_red__';
      document.getElementById(ID)?.remove();
      if (!on) return;
      const style = document.createElement('style');
      style.id = ID;
      // The text layer normally uses `color: transparent` and a low opacity,
      // and individual spans may carry `-webkit-text-fill-color` for caret
      // styling. Override every channel that could keep the glyph invisible.
      style.textContent = `
        .textLayer { opacity: 1 !important; }
        .textLayer span,
        .textLayer br {
          color: red !important;
          opacity: 1 !important;
          -webkit-text-fill-color: red !important;
          background-color: transparent !important;
          mix-blend-mode: normal !important;
        }
      `;
      document.head.appendChild(style);
    }, enabled);
  }

  /**
   * Screenshots one `.page` element and counts dark + pure-red pixels.
   * Decoding happens in the browser (PNG bytes → `<img>` → canvas →
   * `getImageData`) so no Node-side PNG dependency is needed.
   *
   * "Dark" = each of R, G, B < 80 (ink). "Red" = red channel dominates both
   * green and blue by at least 50 — accepts anti-aliased glyph edges that
   * a strict `R>180,G<80,B<80` check would drop.
   */
  async countPagePixels(
    pageNumber: number,
  ): Promise<{ dark: number; red: number; total: number }> {
    const locator = this.page.locator(`.page[data-page-number="${pageNumber}"]`);
    await locator.scrollIntoViewIfNeeded();
    const buffer = await locator.screenshot();
    const base64 = buffer.toString('base64');

    return await this.page.evaluate(async (b64) => {
      const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
      const url = URL.createObjectURL(blob);
      const img = new Image();
      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('PNG decode failed'));
          img.src = url;
        });
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const ctx = cv.getContext('2d');
        if (!ctx) return { dark: 0, red: 0, total: 0 };
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let dark = 0;
        let red = 0;
        const total = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a === 0) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r < 80 && g < 80 && b < 80) dark++;
          else if (r > 80 && r - g >= 50 && r - b >= 50) red++;
        }
        return { dark, red, total };
      } finally {
        URL.revokeObjectURL(url);
      }
    }, base64);
  }

  /**
   * For each non-empty <span> in the page's text layer, samples the canvas
   * region underneath (expanded by `paddingRatio` × the div's size to absorb
   * pdf.js's natural sub-pixel drift) and counts how many divs land on
   * actual ink.
   *
   * The text layer uses a different font than the rasterised canvas, and
   * individual glyphs may sit several pixels — occasionally a half-character
   * — away from their canvas counterparts. So this is an *approximate*
   * overlay check: it catches misaligned, missing, or wrongly-scaled text
   * layers, not glyph-level mismatches.
   *
   * Returns:
   * - divCount: text-layer spans with non-empty content
   * - divsOnInk: divs whose padded region exceeds `inkThreshold` non-white pixels
   * - coverage: divsOnInk / divCount
   * - meanInkDensity: average non-white-pixel ratio across all div regions
   */
  async measureTextLayerCoverage(
    pageNumber: number,
    options: { paddingRatio?: number; inkThreshold?: number } = {},
  ): Promise<{
    divCount: number;
    divsOnInk: number;
    coverage: number;
    meanInkDensity: number;
  }> {
    const paddingRatio = options.paddingRatio ?? 0.5;
    const inkThreshold = options.inkThreshold ?? 0.01;

    return await this.page.evaluate(
      ({ pageNum, pad, threshold }) => {
        const empty = {
          divCount: 0,
          divsOnInk: 0,
          coverage: 0,
          meanInkDensity: 0,
        };
        const pageEl = document.querySelector(
          `.page[data-page-number="${pageNum}"]`,
        );
        if (!pageEl) return empty;
        // Prefer the rendered page canvas; some pages also have an editor
        // overlay canvas which would be empty.
        const canvas =
          pageEl.querySelector<HTMLCanvasElement>('.canvasWrapper > canvas') ??
          pageEl.querySelector<HTMLCanvasElement>('canvas');
        if (!canvas || canvas.width === 0 || canvas.height === 0) return empty;
        const ctx = canvas.getContext('2d');
        if (!ctx) return empty;

        const canvasRect = canvas.getBoundingClientRect();
        if (canvasRect.width === 0 || canvasRect.height === 0) return empty;
        // canvas.width is the intrinsic pixel buffer; canvasRect.width is the
        // displayed size. The ratio absorbs both devicePixelRatio and any CSS
        // scaling pdf.js applies during zoom transitions.
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;

        let buf: Uint8ClampedArray;
        try {
          buf = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        } catch {
          return empty;
        }
        const W = canvas.width;
        const H = canvas.height;

        const inkDensity = (
          x: number,
          y: number,
          w: number,
          h: number,
        ): number => {
          const x0 = Math.max(0, Math.floor(x));
          const y0 = Math.max(0, Math.floor(y));
          const x1 = Math.min(W, Math.ceil(x + w));
          const y1 = Math.min(H, Math.ceil(y + h));
          if (x1 <= x0 || y1 <= y0) return 0;
          let nonWhite = 0;
          let total = 0;
          for (let yy = y0; yy < y1; yy++) {
            for (let xx = x0; xx < x1; xx++) {
              const i = (yy * W + xx) * 4;
              const r = buf[i];
              const g = buf[i + 1];
              const b = buf[i + 2];
              const a = buf[i + 3];
              if (a > 0 && (r < 250 || g < 250 || b < 250)) nonWhite++;
              total++;
            }
          }
          return total === 0 ? 0 : nonWhite / total;
        };

        const spans = Array.from(
          pageEl.querySelectorAll<HTMLElement>('.textLayer span'),
        ).filter((s) => (s.textContent ?? '').trim().length > 0);

        let divsOnInk = 0;
        let sumDensity = 0;
        let measured = 0;
        for (const span of spans) {
          const r = span.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          const padX = r.width * pad;
          const padY = r.height * pad;
          const x = (r.left - canvasRect.left - padX) * scaleX;
          const y = (r.top - canvasRect.top - padY) * scaleY;
          const w = (r.width + 2 * padX) * scaleX;
          const h = (r.height + 2 * padY) * scaleY;
          const density = inkDensity(x, y, w, h);
          sumDensity += density;
          measured++;
          if (density >= threshold) divsOnInk++;
        }

        const divCount = measured;
        return {
          divCount,
          divsOnInk,
          coverage: divCount === 0 ? 0 : divsOnInk / divCount,
          meanInkDensity: divCount === 0 ? 0 : sumDensity / divCount,
        };
      },
      { pageNum: pageNumber, pad: paddingRatio, threshold: inkThreshold },
    );
  }
}
