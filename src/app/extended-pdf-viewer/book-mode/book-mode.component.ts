import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { IPDFViewerApplication, PageRenderedEvent, PageRenderEvent, PDFNotificationService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-book-mode',
    templateUrl: './book-mode.component.html',
    styleUrls: ['./book-mode.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCard, MatTabGroup, MatTab, Ie11MarkdownComponent, DemoComponent, RouterLink, NgxExtendedPdfViewerModule]
})
export class BookModeComponent {

  public page = 1;

  public fullscreen = false;



  private PDFViewerApplication!: IPDFViewerApplication;

  constructor() {
    const notificationService = inject(PDFNotificationService);

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public onPageRender(event: PageRenderEvent): void {
    console.log("Going to render page " + event.pageNumber);
  }

  public onPageRendered(event: PageRenderedEvent): void {
    let result = '';
    result += `${String(event.pageNumber).padStart(4, ' ')} `;
    for (const page of this.PDFViewerApplication.pdfViewer._pages) {
      const isLoading = page.div.querySelector('.loadingIcon');
      if (isLoading) {
        result += '!';
      } else {
        result += '' + page.renderingState;
      }
    }
    console.log(result);
  }
}
