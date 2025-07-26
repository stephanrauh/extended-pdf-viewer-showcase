import { Component, effect, inject } from '@angular/core';
import { IPDFViewerApplication, PDFNotificationService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-filtering-console-log',
    
    standalone: true,
    templateUrl: './filtering-console-log.component.html',
    styleUrls: ['./filtering-console-log.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class FilteringConsoleLogComponent {
  fullscreenService = inject(FullscreenService);

  public version = '';
  public activeTab: string = 'typescript';

  private PDFViewerApplication!: IPDFViewerApplication;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    const notificationService = inject(PDFNotificationService);

    effect(() => {
      if ((this.PDFViewerApplication = notificationService.onPDFJSInitSignal())) {
        this.init();
      }
    });
  }

  public init(): void {
    if (this.PDFViewerApplication?.ngxConsole) {
      this.PDFViewerApplication.ngxConsole.ngxConsoleFilter = (level: string, message: any): boolean => {
        if (message?.includes && message?.includes('modified by ngx-extended-pdf-viewer')) {
          const index = message.indexOf('(PDF.js');
          this.version = message.substring(index + 1).replace(')', '');
          return false;
        }
        return true;
      };
    }
  }
}
