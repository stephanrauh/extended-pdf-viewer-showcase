import { Component, OnInit } from '@angular/core';
import { PagesLoadedEvent } from '../../../../ngx-extended-pdf-viewer/projects/ngx-extended-pdf-viewer/src/lib/pages-loaded-event';

@Component({
  selector: 'app-pages-loaded',
  templateUrl: './pages-loaded.component.html',
  styleUrls: ['./pages-loaded.component.css']
})
export class PagesLoadedComponent implements OnInit {
  public messages: Array<string> = [];

  constructor() {}

  ngOnInit() {}

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Loaded a document with ${pagecount.pagesCount}  pages`);
  }
}
