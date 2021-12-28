import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-touch-gestures',
  templateUrl: './touch-gestures.component.html',
  styleUrls: ['./touch-gestures.component.css']
})
export class TouchGesturesComponent {

  public isMobile = 'ontouchstart' in document.documentElement;

  public enablePinchOnMobile = this.isMobile;

  public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width',
                       0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 1.25, 1.5];

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
    pdfDefaultOptions.doubleTapZoomFactor = "125%";
  }
}
