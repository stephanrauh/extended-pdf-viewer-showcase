import { Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

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
 *   numbers, `[...]`/`{...}` are read as JSON; everything else stays a string.
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

function parseValue(raw: string): unknown {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if (/^[[{]/.test(raw)) {
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
  template: `<ng-container *ngComponentOutlet="viewer; inputs: inputs; ngModule: viewerModule" />`,
})
export class ViewerHarnessComponent {
  public readonly viewer = NgxExtendedPdfViewerComponent;
  public readonly viewerModule = NgxExtendedPdfViewerModule;
  public readonly inputs: Record<string, unknown> = { ...DEFAULT_INPUTS };

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const show = params.get('show');
    if (show !== null) {
      for (const name of BUTTON_INPUTS) {
        this.inputs[name] = parseValue(show);
      }
    }
    for (const key of params.keys) {
      if (key === 'show') continue;
      const value = parseValue(params.get(key)!);
      if (key.startsWith('opt.')) {
        (pdfDefaultOptions as Record<string, unknown>)[key.substring(4)] = value;
      } else {
        this.inputs[key] = value;
      }
    }
  }
}
