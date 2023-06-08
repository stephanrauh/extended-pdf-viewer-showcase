import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Component, OnInit } from '@angular/core';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-export-file',
  templateUrl: './export-file.component.html',
  styleUrls: ['./export-file.component.css'],
})
export class ExportFileComponent {
  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public blob: Blob | undefined;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfViewerService.recalculateSize());
  }

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public async getCurrentDocumentAsBlob(): Promise<void> {
    this.selectedTabIndex = 2;
    this.blob = await this.pdfViewerService.getCurrentDocumentAsBlob();
  }
}
