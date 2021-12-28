import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageRenderedEvent } from 'ngx-extended-pdf-viewer';
import { PageRenderEvent } from 'ngx-extended-pdf-viewer/lib/events/page-render-event';

@Component({
  selector: 'app-book-mode',
  templateUrl: './book-mode.component.html',
  styleUrls: ['./book-mode.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookModeComponent {

  public page = 1;

  public fullscreen = true;

  constructor() { }

  public onPageRender(event: PageRenderEvent): void {
    console.log("Going to render page " + event.pageNumber);
  }

  public onPageRendered(event: PageRenderedEvent): void {
    let result = '';
    result += `${String(event.pageNumber).padStart(4, ' ')} `;
    for (const page of (window as any).PDFViewerApplication.pdfViewer._pages) {
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
