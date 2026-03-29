import { EditorAnnotation, FreeTextEditorAnnotation, NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule, HighlightEditorAnnotation, InkEditorAnnotation } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-export-annotations',

    standalone: true,
    templateUrl: './export-annotations.component.html',
    styleUrls: ['./export-annotations.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
        AsyncPipe,
        JsonPipe,
    ],
})
export class ExportAnnotationsComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  private _fullscreen = false;

  public rawAnnotations: EditorAnnotation[] | null | undefined = null;

  public src = '/assets/pdfs/pdf-sample.pdf';
  public exportannotationscomponentTab: string = 'livedemo';
  public codeTab: string = 'htmltemplate';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public exportAnnotations(): void {
    this.codeTab = 'livedemo';
    this.rawAnnotations = this.pdfViewerService.getSerializedAnnotations();
    this.cdr.markForCheck();
  }

  public async addTextEditor(): Promise<void> {
    const x = Math.round(Math.random() * 400);
    const y = Math.round(350 + Math.random() * 500);
    const fontSize = Math.round(Math.random() * 30 + 10);
    const height = fontSize * 1.75;
    const width = fontSize * 5.8;
    const textEditorAnnotation: FreeTextEditorAnnotation = {
      annotationType: 3,
      color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
      fontSize: fontSize,
      value: 'Hello world!',
      pageIndex: 0,
      rect: [x, y, x + width, y + height],
      rotation: 0,
    };
    console.log(textEditorAnnotation);
    console.log('Before update');
    await this.pdfViewerService.addEditorAnnotation(textEditorAnnotation);
    console.log('After update');
    const anno = this.pdfViewerService.getSerializedAnnotations();
    if (anno) {
      console.log(anno[0]);
    }
  }

  public async addHighlight(): Promise<void> {
    // Create a highlight at a random position (in PDF points)
    const left = 100 + Math.random() * 200;
    const bottom = 300 + Math.random() * 300;
    const width = 100 + Math.random() * 150;
    const height = 12 + Math.random() * 8;
    const right = left + width;
    const top = bottom + height;

    // quadPoints in Adobe Acrobat format: tL, tR, bL, bR for each box
    const quadPoints = [
      left, top,      // top-left
      right, top,     // top-right
      left, bottom,   // bottom-left
      right, bottom,  // bottom-right
    ];

    const highlightAnnotation: HighlightEditorAnnotation = {
      opacity: 0.5,
      thickness: 10,
      annotationType: 9 as const,
      color: [255, 255, 0], // Yellow highlight
      quadPoints,
      pageIndex: 0,
      rect: [left, bottom, right, top],
      rotation: 0 as const,
    };

    await this.pdfViewerService.addEditorAnnotation(highlightAnnotation);
  }

  public async addDrawing(): Promise<void> {
    const x = 400 * Math.random();
    const y = 350 + 500 * Math.random();
    const thickness = 5 + Math.random() * 5; // Thickness between 5-10
    const drawing: InkEditorAnnotation = {
      annotationType: 15,
      color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
      thickness: thickness,
      opacity: 1,
      paths: {
        // Bezier curves - create a gentle wave with properly calculated control points
        lines: [
          [NaN, NaN, NaN, NaN, x, y,
           x + 10, y + 15, x + 20, y + 25, x + 30, y + 20,
           x + 40, y + 15, x + 50, y + 25, x + 60, y + 20]
        ],
        // Raw points of the path
        points: [
          [x, y, x + 30, y + 20, x + 60, y + 20]
        ]
      },
      pageIndex: 0,
      // Note: rect is recalculated during deserialization, so this value is mostly ignored
      rect: [x, y, x + 60, y + 25],
      rotation: 0,
    };
    console.log(drawing);
    console.log('Before adding drawing');
    await this.pdfViewerService.addEditorAnnotation(drawing);
    console.log('After adding drawing');
    const anno = this.pdfViewerService.getSerializedAnnotations();
    if (anno) {
      console.log(anno[anno.length - 1]);
    }
  }

  public removeEditors(): void {
    this.pdfViewerService.removeEditorAnnotations();
  }

  public removeTextEditors(): void {
    const filter = (serial: any) => serial?.annotationType === 3 && serial?.pageIndex === 0;
    this.pdfViewerService.removeEditorAnnotations(filter);
  }

  public removeDrawingEditors(): void {
    const filter = (serial: any) => serial?.annotationType === 15;
    this.pdfViewerService.removeEditorAnnotations(filter);
  }

  public async updateAnnotation(index: number, event: Event): Promise<void> {
    const textarea = event.target as HTMLTextAreaElement;
    console.log('Before update');
    let anno = this.pdfViewerService.getSerializedAnnotations();
    if (anno) {
      console.log(anno[0]);
    }
    if (this.rawAnnotations) {
      const value = textarea.value.replace(/\n/g, '');
      this.rawAnnotations[index] = JSON.parse(value);

      this.removeEditors();
      for (const annotation of this.rawAnnotations) {
        await this.pdfViewerService.addEditorAnnotation(annotation);
      }
    }
    console.log('After update');
    anno = this.pdfViewerService.getSerializedAnnotations();
    if (anno) {
      console.log(anno[0]);
    }
    this.cdr.markForCheck();
  }

  public adjustSize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  public countRows(json: string): number {
    return json?.split(/\r\n|\r|\n/)?.length;
  }

  public changePdfFile(tab: number): void {
    if (tab === 0) {
      this.src = '/assets/pdfs/pdf-sample.pdf';
    } else if (tab === 1) {
      this.src = '/assets/pdfs/OoPdfFormExample.pdf';
    }
  }
}
