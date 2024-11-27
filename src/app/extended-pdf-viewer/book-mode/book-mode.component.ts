import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { IPDFViewerApplication, PageRenderedEvent, PageRenderEvent, PDFNotificationService } from 'ngx-extended-pdf-viewer';

@Component({
standalone: false,
  selector: 'app-book-mode',
  templateUrl: './book-mode.component.html',
  styleUrls: ['./book-mode.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookModeComponent {

  public page = 1;

  public fullscreen = false;



  private PDFViewerApplication!: IPDFViewerApplication;

  constructor(notificationService: PDFNotificationService) {
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
