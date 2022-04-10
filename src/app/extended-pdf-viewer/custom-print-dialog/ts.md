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
export class CustomPrintDialogComponent implements OnInit, OnDestroy {
  private _eventBus: EventBus;
  private _observer: MutationObserver;

  printPercentage = 0;
  totalPages = 0;
  currentPageRendered = 0;
  showProgress = false;
  showCompleted = false;
  hideBuiltInProgress = true;

  ngOnInit() {
    const node = document.querySelector('#printContainer');
    if (node) {
      this._observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
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
        childList: true,
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
    this._eventBus = event.source['eventBus'];
  }

  onBeforePrint() {
    if (this.hideBuiltInProgress) {
      const node: Element = document.querySelector('.pdf-wrapper #printServiceOverlay .dialog');
      node.setAttribute('style', 'display:none!important');
    }
    this.showCompleted = false;
    this.showProgress = true;
  }

  onAfterPrint() {
    const node: Element = document.querySelector('.pdf-wrapper #printServiceOverlay .dialog');
    node.removeAttribute('style');
    this.showCompleted = true;
  }

  print() {
    this._eventBus.dispatch('print');
  }

  cancel() {
    document.getElementById('printCancel').click();
  }

  get isPrintCancelled(): boolean {
    return this.totalPages !== this.currentPageRendered;
  }

  public onProgress(progress: ProgressBarEvent): void {
    console.log(progress);
  }
}
```
