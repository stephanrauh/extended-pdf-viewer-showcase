import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: false,
  selector: 'app-export-file',
  templateUrl: './export-file.component.html',
  styleUrls: ['./export-file.component.css'],
})
export class ExportFileComponent {
  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;

  private _fullscreen = false;

  public blob: Blob | undefined;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public async getCurrentDocumentAsBlob(): Promise<void> {
    this.selectedTabIndex = 2;
    this.blob = await this.pdfViewerService.getCurrentDocumentAsBlob();
  }
}
