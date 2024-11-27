import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-smartphone',
  templateUrl: './smartphone.component.html',
  styleUrls: ['./smartphone.component.css', './devices.min.css'],
})
export class SmartphoneComponent {
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

}
