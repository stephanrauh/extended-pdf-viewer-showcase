import { Component, effect, inject } from '@angular/core';
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

  public onPagesLoaded() {
    if (this.PDFViewerApplication) {
      new PdfDocumentPropertiesExtractor().getDocumentProperties(this.PDFViewerApplication).then((result) => (this.fileInfo = result));
    }
  }

  constructor() {
    const notificationService = this.notificationService;

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }
}
