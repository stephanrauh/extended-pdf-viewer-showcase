```typescript
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { AnnotationEditorEvent, IPDFViewerApplication, NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService, PDFNotificationService } from 'ngx-extended-pdf-viewer';

/** pdf.js AnnotationEditorType values we care about. */
const EDITOR_NONE = 0;
const EDITOR_FREETEXT = 3;
const EDITOR_INK = 15;

/** The payload pdf.js dispatches on the `switchannotationeditormode` event bus. */
interface SwitchModeEvent {
  mode: number;
  /** Present only when an *existing* annotation/editor is being activated (double-click). */
  editId?: string | null;
  mustEnterInEditMode?: boolean;
}

/**
 * The three states the demo cycles through.
 * - `none`  : editor off (pdf.js mode NONE) — the document is just a viewer.
 * - `drag`  : editor on, but empty-canvas presses are suppressed, so existing
 *             annotations move/resize and nothing new is painted.
 * - `paint` : editor on, empty-canvas presses draw as usual.
 */
type DragState = 'none' | 'drag' | 'paint';

@Component({
  selector: 'app-drag-mode',
  standalone: true,
  templateUrl: './drag-mode.component.html',
  imports: [NgxExtendedPdfViewerModule],
})
export class DragModeComponent implements OnDestroy {
  private pdfService = inject(NgxExtendedPdfViewerService);
  private notificationService = inject(PDFNotificationService);

  /** Current state of the drag/paint cycle. */
  public state: DragState = 'none';

  /** Aborts the capture-phase listeners while they are not needed. */
  private captureAC: AbortController | undefined;

  /** The pdf.js app instance, once ready — kept so we can unsubscribe on destroy. */
  private pdfApp: IPDFViewerApplication | undefined;

  /**
   * Timestamp of the last handled gesture. One double-click can reach us twice —
   * the native `dblclick` *and* the `switchannotationeditormode` event pdf.js
   * dispatches while handling it — so we collapse anything within this window
   * into a single toggle. The two arrive in the same tick; distinct double-clicks
   * are always further apart.
   */
  private lastGestureTs = 0;
  private static readonly GESTURE_DEDUPE_MS = 150;

  constructor() {
    // The app instance appears asynchronously; subscribe to the mode-change bus
    // once it is ready.
    effect(() => {
      const app = this.notificationService.onPDFJSInitSignal();
      if (app && app !== this.pdfApp) {
        this.pdfApp = app;
        app.eventBus.on('switchannotationeditormode', this.onSwitchAnnotationEditorMode);
      }
    });
  }

  /** Enter drag mode: editor on (ink tool) + empty-canvas presses suppressed. */
  public enterDrag(): void {
    this.state = 'drag';
    this.pdfService.switchAnnotationEdtorMode(EDITOR_INK);
    this.enableSuppression();
  }

  /** Enter paint mode: editor on (ink tool) + empty-canvas presses allowed. */
  public enterPaint(): void {
    this.state = 'paint';
    this.pdfService.switchAnnotationEdtorMode(EDITOR_INK);
    this.disableSuppression();
  }

  /** Turn the editor off entirely. */
  public enterNone(): void {
    this.state = 'none';
    this.pdfService.switchAnnotationEdtorMode(EDITOR_NONE);
    this.disableSuppression();
  }

  /**
   * The toolbar button: `none`/`paint` → drag, `drag` → paint. Unlike the
   * gesture path, the button drives the pdf.js mode itself (enter/switch).
   */
  public cycle(): void {
    this.state === 'drag' ? this.enterPaint() : this.enterDrag();
  }

  /**
   * pdf.js reports a mode change. Two cases matter:
   *  - a switch to NONE (tool off, Escape) → reset, drop suppression;
   *  - a switch caused by double-clicking an existing, non-text annotation
   *    (identified by `editId`) → treat as the gesture. This is the *fallback*
   *    that catches the first activation from NONE, where the freshly-drawn path
   *    fires no native `dblclick`. A plain toolbar pick has no `editId`, so it is
   *    ignored (behaves as paint) and cannot loop with our own mode switches.
   */
  private onSwitchAnnotationEditorMode = (event: SwitchModeEvent): void => {
    if (event.mode === EDITOR_NONE) {
      this.state = 'none';
      this.disableSuppression();
      return;
    }
    if (event.editId == null || event.mode === EDITOR_FREETEXT) {
      return; // toolbar tool / our own switch / text editing — not the gesture
    }
    this.handleGesture();
  };

  /**
   * The native `dblclick`. Once an editor mode is live the DOM is stable and the
   * real `dblclick` fires reliably on the annotation/editor — this is what makes
   * the *second* and later double-clicks toggle. FreeText is exempt (its
   * double-click edits text); empty-page double-clicks are ignored.
   */
  public onViewerDoubleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.freeTextEditor, .freeTextAnnotation')) {
      return; // let pdf.js edit the text
    }
    if (
      !target?.closest(
        '.inkEditor, .stampEditor, .signatureEditor, .highlightEditor, ' + '.inkAnnotation, .highlightAnnotation, .stampAnnotation, .canvasWrapper > svg'
      )
    ) {
      return; // not on an annotation → leave it
    }
    this.handleGesture();
  }

  /**
   * Single funnel for both the native `dblclick` and the event-bus fallback.
   * Debounced so a double-click that reaches us through both paths toggles once.
   * pdf.js already owns the editor mode here, so we only flip our suppression —
   * no `switchAnnotationEdtorMode`, which avoids re-entrancy during dispatch.
   */
  private handleGesture(): void {
    const now = Date.now();
    if (now - this.lastGestureTs < DragModeComponent.GESTURE_DEDUPE_MS) {
      return;
    }
    this.lastGestureTs = now;
    if (this.state === 'drag') {
      this.state = 'paint';
      this.disableSuppression();
    } else {
      this.state = 'drag';
      this.enableSuppression();
    }
  }

  private enableSuppression(): void {
    if (this.captureAC) {
      return;
    }
    const ac = new AbortController();
    this.captureAC = ac;
    // Capture phase runs before pdf.js's own bubble-phase create/draw handlers.
    document.addEventListener('pointerdown', this.suppressEmptyCanvasPress, { capture: true, signal: ac.signal });
    document.addEventListener('pointerup', this.suppressEmptyCanvasPress, { capture: true, signal: ac.signal });
  }

  private disableSuppression(): void {
    this.captureAC?.abort();
    this.captureAC = undefined;
  }

  /**
   * Block only presses that land on the *empty* annotation-editor layer. Presses
   * on an existing editor have that editor as their target, so they fall through
   * and the annotation drags / resizes as usual.
   */
  private suppressEmptyCanvasPress = (event: PointerEvent): void => {
    const target = event.target as HTMLElement | null;
    if (target?.classList?.contains('annotationEditorLayer')) {
      event.stopImmediatePropagation();
    }
  };

  /** Committing a freshly drawn annotation drops back to drag mode. */
  public onAnnotationEditorEvent(event: AnnotationEditorEvent): void {
    if (event.type === 'added') {
      this.enterDrag();
    }
  }

  public ngOnDestroy(): void {
    this.pdfApp?.eventBus.off('switchannotationeditormode', this.onSwitchAnnotationEditorMode);
    this.disableSuppression();
  }
}
```
