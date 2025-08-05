import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import {
  IPDFViewerApplication,
  PdfDocumentInfo,
  PdfDocumentPropertiesExtractor,
  PDFNotificationService,
  NgxExtendedPdfViewerModule,
} from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-simple',
  standalone: true,
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class FileInfoComponent {
  private themeService = inject(ThemeService);

  private cdr = inject(ChangeDetectorRef);

  public get theme(): string {
    return this.themeService.theme();
  }
  notificationService = inject(PDFNotificationService);
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  private PDFViewerApplication: IPDFViewerApplication | undefined;

  public fileInfo!: PdfDocumentInfo;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public async onPagesLoaded() {
    if (this.PDFViewerApplication) {
      const result = await new PdfDocumentPropertiesExtractor().getDocumentProperties(this.PDFViewerApplication);
      console.log(result);
      this.fileInfo = result;
      this.cdr.markForCheck();
    }
  }

  constructor() {
    const notificationService = this.notificationService;

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }
}
