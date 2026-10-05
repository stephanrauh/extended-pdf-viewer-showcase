import { AfterViewInit, Component, inject, isSignal, OutputEmitterRef, signal, viewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

/**
 * A bare viewer for the Playwright suite (e2e/). It is not a demo: the route
 * is only registered in development builds, so it never reaches pdfviewer.net.
 *
 * Every query parameter becomes an input of <ngx-extended-pdf-viewer>, so a
 * test can configure the viewer directly instead of through a demo's controls:
 *
 *   /e2e/viewer?src=/assets/pdfs/x.pdf&page=3&showPrintButton=always-in-secondary-menu
 *
 * - `show=<visibility>` sets every button visibility input in BUTTON_INPUTS at
 *   once; an explicit `showXxx=` parameter still wins for that one button.
 * - `opt.<name>=<value>` sets `pdfDefaultOptions.<name>` before the viewer
 *   starts (e.g. `opt.enableSignatureEditor=true`).
 * - Values are parsed: `true`/`false` become booleans, plain numbers become
 *   numbers, `[...]`/`{...}`/`"..."` are read as JSON (so `"4"` is the string
 *   "4"); everything else stays a string.
 *
 * The NgxExtendedPdfViewerService is `window.__ngxService`, and
 * `window.__setInput(name, value)` changes an input while the viewer is running.
 *
 * Every output the viewer emits is recorded in `window.__ngxEvents` as
 * `{ name, t, payload }`: `t` is `performance.now()`, and the payload is a
 * JSON-safe copy (no `source`, no functions, no DOM nodes, cut off at depth 4).
 * Two-way bindings are recorded with their event name, e.g. `pageChange`.
 *
 * Inputs that aren't given keep the library's own defaults:
 * NgComponentOutlet only sets the inputs it is handed.
 */
const BUTTON_INPUTS = [
  'showSidebarButton',
  'showFindButton',
  'showFirstAndLastPageButtons',
  'showPreviousAndNextPageButtons',
  'showZoomButtons',
  'showPresentationModeButton',
  'showOpenFileButton',
  'showPrintButton',
  'showDownloadButton',
  'showSinglePageModeButton',
  'showVerticalScrollButton',
  'showHorizontalScrollButton',
  'showWrappedScrollButton',
  'showInfiniteScrollButton',
  'showBookModeButton',
  'showRotateCwButton',
  'showRotateCcwButton',
  'showHandToolButton',
  'showSpreadButton',
  'showPropertiesButton',
  'showTextEditor',
  'showStampEditor',
  'showDrawEditor',
  'showHighlightEditor',
  'showSignatureEditor',
  'showEraserEditor',
  'showUndoRedoButtons',
];

const DEFAULT_INPUTS: Record<string, unknown> = {
  src: '/assets/pdfs/Portugues-para-principiantes.pdf',
  textLayer: true,
  height: '85vh',
};

/** A JSON-safe copy of an event payload, for the tests to read. */
function summarize(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'function' ? undefined : value;
  }
  if (depth > 4 || seen.has(value) || value instanceof Node || value instanceof Window) {
    return '[…]';
  }
  seen.add(value);
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    const items = Array.from(value as ArrayLike<unknown>);
    return items.slice(0, 50).map((item) => summarize(item, depth + 1, seen));
  }
  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key !== 'source' && key !== 'eventBus') {
      copy[key] = summarize(item, depth + 1, seen);
    }
  }
  return copy;
}

function parseValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if (/^[[{"]/.test(raw)) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

@Component({
  selector: 'app-viewer-harness',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="viewer; inputs: inputs(); ngModule: viewerModule" />`,
})
export class ViewerHarnessComponent implements AfterViewInit {
  private readonly outlet = viewChild.required(NgComponentOutlet);
  public readonly viewer = NgxExtendedPdfViewerComponent;
  public readonly viewerModule = NgxExtendedPdfViewerModule;
  public readonly inputs = signal<Record<string, unknown>>({ ...DEFAULT_INPUTS });

  constructor() {
    // For tests that call the service API, e.g. mergeDocument().
    (window as unknown as Record<string, unknown>)['__ngxService'] = inject(NgxExtendedPdfViewerService);
    (window as unknown as Record<string, unknown>)['__setInput'] = (name: string, value: unknown) =>
      this.inputs.update((inputs) => ({ ...inputs, [name]: value }));
    const inputs = this.inputs();
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const show = params.get('show');
    if (show !== null) {
      for (const name of BUTTON_INPUTS) {
        inputs[name] = parseValue(show);
      }
    }
    for (const key of params.keys) {
      if (key === 'show') continue;
      const value = parseValue(params.get(key)!);
      if (key.startsWith('opt.')) {
        (pdfDefaultOptions as Record<string, unknown>)[key.substring(4)] = value;
      } else {
        inputs[key] = value;
      }
    }
  }

  public ngAfterViewInit(): void {
    const events: Array<{ name: string; t: number; payload: unknown }> = [];
    (window as unknown as Record<string, unknown>)['__ngxEvents'] = events;
    const viewer = this.outlet().componentInstance as Record<string, unknown>;
    const record = (eventName: string) => (payload: unknown) => events.push({ name: eventName, t: performance.now(), payload: summarize(payload) });
    for (const [name, member] of Object.entries(viewer)) {
      if (member instanceof OutputEmitterRef) {
        member.subscribe(record(name));
      } else if (isSignal(member) && typeof (member as { subscribe?: unknown }).subscribe === 'function') {
        // a model(): two-way binding
        (member as unknown as OutputEmitterRef<unknown>).subscribe(record(`${name}Change`));
      }
    }
    // @Output() getters, e.g. formDataChange, live on the prototype.
    const prototype = Object.getPrototypeOf(viewer);
    for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype))) {
      if (descriptor.get && name.endsWith('Change')) {
        const emitter = viewer[name] as { subscribe?: (next: (value: unknown) => void) => unknown } | undefined;
        if (typeof emitter?.subscribe === 'function') {
          emitter.subscribe(record(name));
        }
      }
    }
  }
}
