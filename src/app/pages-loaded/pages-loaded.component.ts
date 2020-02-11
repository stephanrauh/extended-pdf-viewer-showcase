import { Component, OnInit } from '@angular/core';
import { PagesLoadedEvent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pages-loaded',
  templateUrl: './pages-loaded.component.html',
  styleUrls: ['./pages-loaded.component.css']
})
export class PagesLoadedComponent implements OnInit {
  public messages: Array<string> = [];

  constructor() {}

  ngOnInit() {}

  public onEvent(type: string, event: any): void {
    const now = new Date().toLocaleTimeString();
    let e = '(no parameters)';
    if (event) {
      e =
        'Event type: ' +
        event.constructor.name +
        ' Event: ' +
        event;
    }
    this.messages.push(`${now} ${type} ${e}`);
  }

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(
      `${now} Loaded a document with ${pagecount.pagesCount}  pages`
    );
  }
}
