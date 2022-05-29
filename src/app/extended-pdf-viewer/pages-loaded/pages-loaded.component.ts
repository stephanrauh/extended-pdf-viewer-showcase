import { Component, OnInit } from '@angular/core';
import { NgxExtendedPdfViewerService, PagesLoadedEvent } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-pages-loaded',
  templateUrl: './pages-loaded.component.html',
  styleUrls: ['./pages-loaded.component.css'],
})
export class PagesLoadedComponent {
  public messages: Array<string> = [];

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public onEvent(type: string, event: any): void {
    const now = new Date().toLocaleTimeString();
    let e = '(no parameters)';
    if (event) {
      if (event.source) {
        event.source = undefined;
      }
      try {
        e = 'Event type: ' + event.constructor.name + ' Event: ' + JSON.stringify(event);
      } catch (exception) {
        e = 'Event type: ' + event.constructor.name + ' Event: ' + event;
      }
    }
    this.messages.push(`${now} ${type} ${e}`);
  }

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Loaded a document with ${pagecount.pagesCount} pages`);
  }

  public onPdfLoadingFailed(error: any): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Failed to load a PDF document ${error}`);
  }
}
