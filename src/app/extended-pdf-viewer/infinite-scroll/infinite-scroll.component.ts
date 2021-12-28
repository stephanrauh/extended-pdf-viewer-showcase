import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, PagesLoadedEvent, pdfDefaultOptions, ScrollModeType } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.css'],
})
export class InfiniteScrollComponent {
  public filenames = [
    '/assets/pdfs/PdfFormExample.pdf',
    '/assets/pdfs/user-experience.pdf',
    '/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf',
  ];

  public ScrollModeType = ScrollModeType;

  // tslint:disable-next-line: variable-name
  private _showWidgets = false;

  public zoom = '100%';

  public file = 0;

  public showPdfViewer = true;

    private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    // pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }

  public get showWidgets(): boolean {
    return this._showWidgets;
  }

  public set showWidgets(v: boolean) {
    if (this._showWidgets !== v) {
      this.showPdfViewer = false;
      setTimeout(() => this.showPdfViewer = true);
    }
    this._showWidgets = v;
  }
}
