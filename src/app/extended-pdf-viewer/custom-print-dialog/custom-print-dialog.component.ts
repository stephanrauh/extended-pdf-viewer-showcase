import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, ProgressBarEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';

@Component({
    selector: 'app-custom-progress-bar',
    templateUrl: './custom-print-dialog.component.html',
    styleUrls: ['./custom-print-dialog.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatCard,
        MatButton,
        MatCheckbox,
        FormsModule,
        MatProgressBar,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule,
    ],
})
export class CustomPrintDialogComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

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
