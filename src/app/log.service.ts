import { effect, Injectable } from '@angular/core';
import { IPDFViewerApplication, PDFNotificationService } from 'ngx-extended-pdf-viewer';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  public logs: string[] = [];

  private PDFViewerApplication!: IPDFViewerApplication;

  constructor(notificationService: PDFNotificationService) {
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
      if (this.PDFViewerApplication) {
        this.init();
      }
    });
  }

  public init(): void {
      if (this.PDFViewerApplication?.ngxConsole) {
      this.PDFViewerApplication.ngxConsole.ngxConsoleFilter = (level: string, message: string): boolean => {
        this.logs.push(message);
        return true;
      };
    }
  }
}
