import { Component } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent {
  public _namedDest: string | undefined;

  public page: number | undefined;

  public fullscreen = false;

  public get namedDest() {
    return this._namedDest;
  }

  public set namedDest(dest: string | undefined) {
    // reset the attribute to force change detection:
    this._namedDest = undefined;
    setTimeout(() => (this._namedDest = dest));
  }
}
