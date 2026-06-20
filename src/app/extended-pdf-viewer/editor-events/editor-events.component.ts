import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AnnotationEditorEvent, PagesLoadedEvent, NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService, PdfPageCropBox } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-editor-events',

  standalone: true,
  templateUrl: './editor-events.component.html',
  styleUrls: ['./editor-events.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective, AsyncPipe, DecimalPipe, RouterLink],
})
export class EditorEventsComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);
  private pdfViewerService = inject(NgxExtendedPdfViewerService);

  public activeTab = 'html';

  public messages: string[] = [];

  /**
   * The normalized rectangle (0..1, top-left origin) of the most recently
   * added / moved / resized annotation editor, plus the page it lives on.
   * This is exactly what the annotationEditorEvent reports — note how every
   * value is a fraction below 1.
   */
  public annotationRect: PdfPageCropBox | undefined;
  public annotationPage: number | undefined;
  public annotationEditorType: string | undefined;

  /** The cropped screenshot of that annotation, as a PNG data URL. */
  public screenshotDataURL: string | undefined;
  public screenshotWidth = 0;
  public screenshotHeight = 0;

  private changeDetector = inject(ChangeDetectorRef);

  private toolbarMap: Record<string, string> = {
    inkEditor: 'editorInkParamsToolbar',
    highlightEditor: 'editorHighlightParamsToolbar',
  };

  public onEvent(type: string, event: any): void {
    if (type === 'annotationEditorEvent') {
      this.onEditorEvent(event as AnnotationEditorEvent);
      // Remember the live editor rectangle BEFORE the logging code below wipes
      // event.source. The editor exposes its position and size as normalized
      // 0..1 page-relative fractions (top-left origin) - the very same numbers
      // that show up in event.value and that puzzle people ("why is it < 1?").
      this.rememberAnnotationRect(event as AnnotationEditorEvent);
    }
    const now = new Date().toLocaleTimeString();
    let e = '(no parameters)';
    if (event) {
      if (event.source) {
        event.source = undefined;
      }
      try {
        e = 'Event type: ' + event.constructor.name + ' Event: ' + JSON.stringify(event).substring(0, 60);
      } catch {
        e = 'Event type: ' + event.constructor.name + ' Event: ' + event;
      }
    }
    this.messages.push(`${now} ${type} ${e}`);
    this.changeDetector.detectChanges();
  }

  private onEditorEvent(event: AnnotationEditorEvent): void {
    const toolbarId = this.toolbarMap[event.editorType];
    if (!toolbarId) return;

    const toolbar = document.getElementById(toolbarId);
    if (!toolbar) return;

    if (event.type === 'drawingStarted') {
      toolbar.classList.add('hidden');
    }
    if (event.type === 'drawingStopped') {
      toolbar.classList.remove('hidden');
    }
  }

  private rememberAnnotationRect(event: AnnotationEditorEvent): void {
    // Don't react to the editor disappearing.
    if (event.type === 'removed') {
      return;
    }
    const editor = event.source;
    // The live editor always has the *current* rectangle, so we read it from
    // there rather than from event.value. (event.value is unreliable for this:
    // "sizeChanged" reports the rect from *before* the resize, and a free-text
    // box also changes size on "fontSizeChanged" / "commit", which carry no
    // rectangle at all.) Refreshing on every event keeps width/height in sync
    // no matter how the annotation was resized.
    if (!editor || typeof editor.x !== 'number' || typeof editor.width !== 'number') {
      return;
    }
    this.annotationRect = {
      x: editor.x,
      y: editor.y,
      width: editor.width,
      height: editor.height,
    };
    this.annotationPage = (event as any).page;
    this.annotationEditorType = event.editorType;
  }

  /**
   * Takes a screenshot of just the remembered annotation. Because the editor's
   * rectangle is already in normalized 0..1 page-relative coordinates, we can
   * pass it straight to getPageAsCanvas() as the cropBox - no manual maths.
   */
  public async takeScreenshot(): Promise<void> {
    if (!this.annotationRect || !this.annotationPage) {
      return;
    }
    const canvas = await this.pdfViewerService.getPageAsCanvas(
      this.annotationPage,
      { scale: 3 }, // render at 3x so the cropped thumbnail stays crisp
      undefined, // background
      undefined, // backgroundColorToReplace -> keeps the default
      undefined, // annotationMode -> keeps the default (renders annotations)
      this.annotationRect, // <-- the normalized rectangle from the editor event
    );
    if (canvas) {
      this.screenshotWidth = canvas.width;
      this.screenshotHeight = canvas.height;
      this.screenshotDataURL = canvas.toDataURL();
      this.changeDetector.detectChanges();
    }
  }

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Loaded a document with ${pagecount.pagesCount} pages`);
  }

  public onPdfLoadingFailed(error: Error): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Failed to load a PDF document ${error}`);
  }
}
