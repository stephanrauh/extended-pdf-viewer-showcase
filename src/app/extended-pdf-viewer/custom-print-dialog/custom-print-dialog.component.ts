import { Component, ViewEncapsulation } from '@angular/core';
import { NgxExtendedPdfViewerService, ProgressBarEvent } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
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
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private pdfService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {}

  public onBeforePrint() {
    if (this.hideBuiltInProgress) {
      const node = document.querySelector('ngx-extended-pdf-viewer #printServiceDialog') as Element;
      node.setAttribute('style', 'display:none!important');
    }
    this.showCompleted = false;
    this.showProgress = true;
  }

  public onAfterPrint() {
    const node = document.querySelector('ngx-extended-pdf-viewer #printServiceDialog') as Element;
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
