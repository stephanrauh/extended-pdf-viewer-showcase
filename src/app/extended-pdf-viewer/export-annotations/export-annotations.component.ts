import { EditorAnnotation, FreeTextEditorAnnotation, InkEditorAnnotation, NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule, HighlightEditorAnnotation } from 'ngx-extended-pdf-viewer';
import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton } from '@angular/material/button';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-export-annotations',
    
    standalone: true,
    templateUrl: './export-annotations.component.html',
    styleUrls: ['./export-annotations.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        MatButton,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
        JsonPipe,
    ],
})
export class ExportAnnotationsComponent {
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;

  private _fullscreen = false;

  public rawAnnotations: EditorAnnotation[] | null | undefined = null;

  public src = '/assets/pdfs/pdf-sample.pdf';

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
    this.selectedTabIndex = 5;
    this.rawAnnotations = this.pdfViewerService.getSerializedAnnotations();
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
      isCopy: true,
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
    // Create a highlight at a random position
    const x = 200 + Math.random() * 200; // Left edge
    const y = 400 + Math.random() * 200; // Bottom edge
    const width = 100 + Math.random() * 100; // Width of highlight
    const height = 15 + Math.random() * 10; // Height of highlight (text line height)

    // Calculate coordinates for highlight
    const left = x;
    const bottom = y;
    const right = x + width;
    const top = y + height;

    // Create quadPoints object with numeric keys (like the export format)
    const quadPoints: any = {};
    quadPoints[0] = left;   // x1 - left edge start
    quadPoints[1] = top;    // y1 - top edge start
    quadPoints[2] = right;  // x2 - right edge end
    quadPoints[3] = top;    // y2 - top edge end
    quadPoints[4] = left;   // x3 - left edge start (bottom)
    quadPoints[5] = bottom; // y3 - bottom edge start
    quadPoints[6] = right;  // x4 - right edge end (bottom)
    quadPoints[7] = bottom; // y4 - bottom edge end

    const highlightAnnotation: HighlightEditorAnnotation = {
      annotationType: 9 as const,
      color: [255, 255, 0], // Yellow highlight
      opacity: 0.5,
      thickness: 12,
      quadPoints: quadPoints,
      outlines: [[ // Single outline rectangle
        left, bottom,   // Bottom-left
        left, top,      // Top-left
        right, top,     // Top-right
        right, bottom   // Bottom-right
      ]],
      pageIndex: 0,
      rect: [left, bottom, right, top], // Bounding box
      rotation: 0 as const,
      isCopy: true,
    };

    console.log(highlightAnnotation);
    console.log('Before adding highlight');
    await this.pdfViewerService.addEditorAnnotation(highlightAnnotation);
    console.log('After adding highlight');
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
