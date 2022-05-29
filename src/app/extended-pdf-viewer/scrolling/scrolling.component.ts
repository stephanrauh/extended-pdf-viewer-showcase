import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-scrolling',
  templateUrl: './scrolling.component.html',
  styleUrls: ['./scrolling.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollingComponent {
  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) { }

  public scroll(pageNumber: number, top: number | string): void {
    this.pdfService.scrollPageIntoView(pageNumber, {top});
  }
}
