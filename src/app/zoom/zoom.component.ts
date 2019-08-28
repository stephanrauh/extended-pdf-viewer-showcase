import { Component } from '@angular/core';

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.css']
})
export class ZoomComponent {
  private _zoomSetting: number | string | undefined = 'page-width';

  public currentZoomFactor: number;

  // getter and setter make the demo nicer -
  // you probably don't need them in your code
  public get zoomSetting() {
    return String(this._zoomSetting);
  }

  public set zoomSetting(zoom: string) {
    if (isNaN(Number(zoom))) {
      this._zoomSetting = zoom;
    } else {
      this._zoomSetting = zoom + '%';
    }
  }

  public updateZoomFactor(zoom: number): void {
    this.currentZoomFactor = zoom;
  }
}
