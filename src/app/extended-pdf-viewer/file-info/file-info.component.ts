import { Component } from '@angular/core';
import {
  NgxExtendedPdfViewerService,
  PdfDocumentInfo,
  PdfDocumentPropertiesExtractor
} from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';


@Component({
  selector: 'app-simple',
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.css'],
})
export class FileInfoComponent {

  public fileInfo!: PdfDocumentInfo;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  public onPagesLoaded() {
    new PdfDocumentPropertiesExtractor().getDocumentProperties().then((result) => this.fileInfo = result);
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
