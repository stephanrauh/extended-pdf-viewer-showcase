import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
standalone: false,
  selector: 'app-touch-gestures',
  templateUrl: './touch-gestures.component.html',
  styleUrls: ['./touch-gestures.component.css'],
})
export class TouchGesturesComponent {
  public isMobile!: boolean;

  public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width', 0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 1.25, 1.5];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(private pdfService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {
    this.isMobile = isBrowser() ? 'ontouchstart' in document.documentElement : false;
    pdfDefaultOptions.doubleTapZoomFactor = '125%';
    pdfDefaultOptions.doubleTapResetsZoomOnSecondDoubleTap = true;
  }
}
