import { Component } from '@angular/core';
import { PageViewModeType, ScrollModeType } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: false,
  selector: 'app-display-options',
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.css'],
})
export class DisplayOptionsComponent {
  public showBorders = false;

  public scrollMode = ScrollModeType.horizontal;

  public pageViewMode: PageViewModeType = 'multiple';

  public spread: 'off' | 'odd' | 'even' = 'off';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }
}
