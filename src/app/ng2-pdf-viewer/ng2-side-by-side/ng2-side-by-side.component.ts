import { Component, OnChanges } from '@angular/core';

@Component({
  selector: 'app-ng2-side-by-side',
  templateUrl: './ng2-side-by-side.component.html',
  styleUrls: ['./ng2-side-by-side.component.css'],
})
export class Ng2SideBySideComponent {
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }
}
