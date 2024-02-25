import { Component } from '@angular/core';
import { AnnotationLayerRenderedEvent, IPDFViewerApplication, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-annotation-layer-api',
  templateUrl: './annotation-layer-api.component.html',
  styleUrls: ['./annotation-layer-api.component.css'],
})
export class AnnotationLayerApiComponent {
  private _fullscreen = false;

  public isLocalhost = isLocalhost();

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async addImage(): Promise<void> {
    await this.pdfService.addImageToAnnotationLayer('assets/images/ChatGPT-PDF-Viewer-Logo.jpg', 11, 0, 0, 50, 50, 0);
  }
}
