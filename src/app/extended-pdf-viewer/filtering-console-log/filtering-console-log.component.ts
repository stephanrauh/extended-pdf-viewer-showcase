import { Component, effect } from '@angular/core';
import { IPDFViewerApplication, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
standalone: false,
  selector: 'app-filtering-console-log',
  templateUrl: './filtering-console-log.component.html',
  styleUrls: ['./filtering-console-log.component.css'],
})
export class FilteringConsoleLogComponent {
  public version = '';

  private PDFViewerApplication!: IPDFViewerApplication;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(notificationService: PDFNotificationService, public fullscreenService: FullscreenService) {
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
