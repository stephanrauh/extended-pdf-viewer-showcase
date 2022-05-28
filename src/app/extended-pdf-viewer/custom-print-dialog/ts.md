```typescript
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { PagesLoadedEvent } from 'ngx-extended-pdf-viewer/lib/pages-loaded-event';

interface EventBus {
  dispatch(eventName: string): void;
}

@Component({
  selector: 'app-custom-progress-bar',
  templateUrl: './custom-print-dialog.component.html',
  styleUrls: ['./custom-print-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomPrintDialogComponent {
  public printPercentage = 0;
  public totalPages = 0;
  public currentPageRendered = 0;
  public showProgress = false;
  public showCompleted = false;
  public hideBuiltInProgress = true;

  constructor(private pdfService: NgxExtendedPdfViewerService) {  }

  public onBeforePrint() {
    if (this.hideBuiltInProgress) {
      const node = document.querySelector('.pdf-wrapper #printServiceDialog') as Element;
      node.setAttribute('style', 'display:none!important');
    }
    this.showCompleted = false;
    this.showProgress = true;
  }

  public onAfterPrint() {
    const node = document.querySelector('.pdf-wrapper #printServiceDialog') as Element;
    node.removeAttribute('style');
    this.showCompleted = true;
    this.showProgress = false;
  }

  public print() {
    this.pdfService.print();
  }

  public cancel() {
    document.getElementById('printCancel')?.click();
  }

  get isPrintCancelled(): boolean {
    return this.totalPages !== this.currentPageRendered;
  }

  public onProgress(event: ProgressBarEvent): void {
    if (this.showProgress) {
      this.totalPages = event.total;
      this.printPercentage = event.percent;
      this.currentPageRendered = event.page ?? 0;
    }
  }
}
```
