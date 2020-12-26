import { Component, NgZone } from '@angular/core';
import { ScrollModeType } from 'ngx-extended-pdf-viewer';

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

  constructor(private ngZone: NgZone) {}
}
