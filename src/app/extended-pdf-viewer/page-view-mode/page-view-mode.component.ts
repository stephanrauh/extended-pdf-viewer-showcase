import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-page-view-mode',
  templateUrl: './page-view-mode.component.html',
  styleUrls: ['./page-view-mode.component.css'],
})
export class PageViewModeComponent {
  public page = 5;

  public spreadMode: 'off' | 'even' | 'odd' = 'off';

  public showBorders = true;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }
}
