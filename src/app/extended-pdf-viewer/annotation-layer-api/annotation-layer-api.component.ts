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



  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async addImage(parameters: any): Promise<void> {
    const { left, bottom, right, top, rotation } = parameters;
    await this.pdfService.addImageToAnnotationLayer({
      urlOrDataUrl: 'assets/images/ChatGPT-PDF-Viewer-Logo.jpg',
      page: 11,
      left,
      bottom,
      right,
      top,
      rotation
    });
  }
}
