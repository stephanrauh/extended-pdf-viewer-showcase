import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-export-text',
    templateUrl: './export-text.component.html',
    styleUrls: ['./export-text.component.css'],
    imports: [
        MatCard,
        MatButton,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class ExportTextComponent {
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public background: string | undefined;

  public extractedText: string | undefined;

  public extractedLines: string[] = [];

  public selectedTabIndex = 0;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
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
    this.extractedLines = lines.map((line) => line.text);
    console.log(lines);
  }
}
