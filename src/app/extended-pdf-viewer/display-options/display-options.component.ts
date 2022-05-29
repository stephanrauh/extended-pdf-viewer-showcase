import { Component, NgZone } from '@angular/core';
import { NgxExtendedPdfViewerService, ScrollModeType } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-display-options',
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.css']
})
export class DisplayOptionsComponent {
  public showBorders = false;

  public backgroundColor = '#F8F8FD';

  // tslint:disable-next-line: variable-name
  private _scrollMode = ScrollModeType.horizontal;

  public get scrollMode(): ScrollModeType {
    return this._scrollMode;
  }

  public set scrollMode(mode: ScrollModeType) {
    this.ngZone.run(() => this._scrollMode = mode);
  }

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private ngZone: NgZone, private pdfService: NgxExtendedPdfViewerService) {}
}
