import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-export-file',
    
    standalone: true,
    templateUrl: './export-file.component.html',
    styleUrls: ['./export-file.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class ExportFileComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public selectedTabIndex = 0;

  private _fullscreen = false;

  public blob: Blob | undefined;
  public exportfilecomponentTab: string = 'htmltemplate';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public async getCurrentDocumentAsBlob(): Promise<void> {
    this.selectedTabIndex = 2;
    this.blob = await this.pdfViewerService.getCurrentDocumentAsBlob();
  }
}
