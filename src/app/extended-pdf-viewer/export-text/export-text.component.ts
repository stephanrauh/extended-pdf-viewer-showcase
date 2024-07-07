import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { Component, OnInit } from '@angular/core';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-export-text',
  templateUrl: './export-text.component.html',
  styleUrls: ['./export-text.component.css'],
})
export class ExportTextComponent {
  public imageDataURL: string | undefined = undefined;

  public background: string | undefined;

  public extractedText: string | undefined;

  public extractedLines: Array<string> = [];

  public selectedTabIndex = 0;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public async exportAsText(): Promise<void> {
    this.selectedTabIndex = 3;
    this.extractedLines = [];
    this.extractedText = await this.pdfViewerService.getPageAsText(1);
  }

  public async exportAsLines(): Promise<void> {
    this.selectedTabIndex = 3;
    const lines = await this.pdfViewerService.getPageAsLines(1);
    this.extractedText = undefined;
    this.extractedLines = lines.map(line => line.text);
    console.log(lines);
  }
}
