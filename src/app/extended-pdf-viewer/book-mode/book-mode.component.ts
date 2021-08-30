import { Component } from '@angular/core';
import { PageRenderedEvent } from 'ngx-extended-pdf-viewer';
import { PageRenderEvent } from 'ngx-extended-pdf-viewer/lib/events/page-render-event';

@Component({
  selector: 'app-book-mode',
  templateUrl: './book-mode.component.html',
  styleUrls: ['./book-mode.component.css'],
})
export class BookModeComponent {

  public page = 1;

  constructor() { }

  public onPageRender(event: PageRenderEvent): void {
    console.log("Going to render page " + event.pageNumber);
  }

  public onPageRendered(event: PageRenderedEvent): void {
    console.log("Finished rendering page " + event.pageNumber);
  }

}
