import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { PagesLoadedEvent, NgxExtendedPdfViewerService, ProgressBarEvent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-custom-progress-bar',
  templateUrl: './custom-print-dialog.component.html',
  styleUrls: ['./custom-print-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CustomPrintDialogComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  private _observer!: MutationObserver;

  printPercentage = 0;
  totalPages = 0;
  currentPageRendered = 0;
  showProgress = false;
  showCompleted = false;
  hideBuiltInProgress = true;
    private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    // pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }

  ngOnInit() {
    const node = document.querySelector('#printContainer');
    if (node) {
      this._observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          try {
            const count: number = mutation.target.childNodes.length;
            if (count > 0) {
              this.currentPageRendered = count;
              this.printPercentage = Math.round((count / this.totalPages) * 100);
            }
          } catch (error) {
            this.printPercentage = 0;
          }
        });
      });

      this._observer.observe(node, {
        childList: true
      });
    }
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  onPagesLoaded(event: PagesLoadedEvent) {
    this.totalPages = event.pagesCount;
  }

  onBeforePrint() {
    if (this.hideBuiltInProgress) {
      const node = document.querySelector('.pdf-wrapper #printServiceOverlay .dialog') as Element;
      node.setAttribute('style', 'display:none!important');
    }
    this.showCompleted = false;
    this.showProgress = true;
  }

  onAfterPrint() {
    const node = document.querySelector('.pdf-wrapper #printServiceOverlay .dialog') as Element;
    node.removeAttribute('style');
    this.showCompleted = true;
  }

  print() {
    this.pdfService.print();
  }

  cancel() {
    document.getElementById('printCancel')?.click();
  }

  get isPrintCancelled(): boolean {
    return this.totalPages !== this.currentPageRendered;
  }

  public onProgress(event: ProgressBarEvent): void {
    console.log(event);
  }
}
