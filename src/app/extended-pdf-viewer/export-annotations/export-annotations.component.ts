import { EditorAnnotation, FreeTextEditorAnnotation, InkEditorAnnotation, NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Component } from '@angular/core';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-export-annotations',
  templateUrl: './export-annotations.component.html',
  styleUrls: ['./export-annotations.component.css'],
})
export class ExportAnnotationsComponent {
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

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public exportAnnotations(): void {
    this.selectedTabIndex = 4;
    this.rawAnnotations = this.pdfViewerService.getSerializedAnnotations();
  }

  public addTextEditor(): void {
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
      rect: [
        x,
        y,
        x+width,
        y+height
      ],
      rotation: 0,
    };
    console.log(textEditorAnnotation);
    console.log('Before update');
    this.pdfViewerService.addEditorAnnotation(textEditorAnnotation);
    console.log('After update');
    let anno = this.pdfViewerService.getSerializedAnnotations();
    if (anno) {
      console.log(anno[0]);
    }
  }

  public addDrawing(): void {
    const x = 400 * Math.random();
    const y = 350 + 500 * Math.random();
    const drawing: InkEditorAnnotation = {
      annotationType: 15,
      color: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
      thickness: Math.random() * 10,
      opacity: 1,
      paths: [
        {
          bezier: [x + 0.5, y, x + 0.5, y + 44, x + 44, y + 66, x + 88, y + 44],
          points: [x + 0.5, y, x + 0.5, y + 44],
        },
      ],
      pageIndex: 0,
      rect: [x, y, x + 100, y + 66],
      rotation: 0,
    };
    this.pdfViewerService.addEditorAnnotation(drawing);
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

  public updateAnnotation(index: number, event: Event): void {
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
        this.pdfViewerService.addEditorAnnotation(annotation);
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
      this.src ='/assets/pdfs/pdf-sample.pdf';
    } else if (tab === 1) {
      this.src = '/assets/pdfs/OoPdfFormExample.pdf';
    }
  }
}
