import { effect, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { WindowRefService } from './window-ref.servce';
import { IPDFViewerApplication, PDFNotificationService } from 'ngx-extended-pdf-viewer';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  public logs: Array<string> = [];

  private PDFViewerApplication!: IPDFViewerApplication;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private windowRefService: WindowRefService,
  notificationService: PDFNotificationService) {
    if (this.windowRefService.nativeWindow) {
    effect(() => {
      if (this.PDFViewerApplication = notificationService.onPDFJSInitSignal()) {
        this.init();
      }
    });
  }
  }

  public init() {
    if (this.windowRefService.nativeWindow) {
      if (this.PDFViewerApplication?.ngxConsole) {
      this.PDFViewerApplication.ngxConsole.ngxConsoleFilter = (level: string, message: any): boolean => {
        this.logs.push(message);
        return true;
      };
    }
    }
  }
}
