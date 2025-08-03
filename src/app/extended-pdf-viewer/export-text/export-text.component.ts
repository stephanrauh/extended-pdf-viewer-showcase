import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-export-text',

    standalone: true,
    templateUrl: './export-text.component.html',
    styleUrls: ['./export-text.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class ExportTextComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  public fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public background: string | undefined;

  public extractedText: string | undefined;

  public extractedLines: string[] = [];

  public exporttextcomponentTab: string = 'htmltemplate';

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
    this.exporttextcomponentTab = "extractedtext";
    this.extractedLines = [];
    this.extractedText = await this.pdfViewerService.getPageAsText(1);
  }

  public async exportAsLines(): Promise<void> {
    this.exporttextcomponentTab = "extractedtext";
    const lines = await this.pdfViewerService.getPageAsLines(1);
    this.extractedText = undefined;
    this.extractedLines = lines.map((line) => line.text);
    console.log(lines);
  }
}
