import { Component, effect } from '@angular/core';
import {
  AnnotationLayerRenderedEvent,
  IPDFViewerApplication,
  NgxExtendedPdfViewerService,
  PdfDocumentInfo,
  PdfDocumentPropertiesExtractor,
  PDFNotificationService
} from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';


@Component({
  selector: 'app-simple',
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.css'],
})
export class FileInfoComponent {

  private PDFViewerApplication: IPDFViewerApplication | undefined;

  public fileInfo!: PdfDocumentInfo;



  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  public onPagesLoaded() {
    if (this.PDFViewerApplication) {
    new PdfDocumentPropertiesExtractor().getDocumentProperties(this.PDFViewerApplication).then((result) => this.fileInfo = result);
    }
  }

  constructor(public notificationService: PDFNotificationService) {
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }
}
