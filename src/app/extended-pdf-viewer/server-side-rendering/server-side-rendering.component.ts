import { Component } from '@angular/core';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-server-side-rendering',
  templateUrl: './server-side-rendering.component.html',
  styleUrls: ['./server-side-rendering.component.css']
})
export class ServerSideRenderingComponent {
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public onAnnotationLayerRendered(event: AnnotationLayerRenderedEvent): void {
    const copyrightHint = event.source.div.querySelector('.freeTextAnnotation');
    if (copyrightHint && copyrightHint instanceof HTMLElement) {
      copyrightHint.style.left="20%";
      const canvas = copyrightHint.querySelector("canvas");
      if (canvas) {
        canvas.style.width="50%"
      }
    }
  }
}
