import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, PagesLoadedEvent } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: false,
  selector: 'app-pages-loaded',
  templateUrl: './pages-loaded.component.html',
  styleUrls: ['./pages-loaded.component.css'],
})
export class PagesLoadedComponent {
  public messages: string[] = [];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public onEvent(type: string, event: any): void {
    const now = new Date().toLocaleTimeString();
    let e = '(no parameters)';
    if (event) {
      if (event.source) {
        event.source = undefined;
      }
      try {
        e = 'Event type: ' + event.constructor.name + ' Event: ' + JSON.stringify(event).substring(0, 60);
      } catch {
        e = 'Event type: ' + event.constructor.name + ' Event: ' + event;
      }
    }
    this.messages.push(`${now} ${type} ${e}`);
  }

  public onPagesLoaded(pagecount: PagesLoadedEvent): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Loaded a document with ${pagecount.pagesCount} pages`);
  }

  public onPdfLoadingFailed(error: Error): void {
    const now = new Date().toLocaleTimeString();
    this.messages.push(`${now} Failed to load a PDF document ${error}`);
  }
}
