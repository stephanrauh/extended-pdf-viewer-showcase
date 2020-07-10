import { Component } from '@angular/core';

@Component({
  selector: 'app-touch-gestures',
  templateUrl: './touch-gestures.component.html',
  styleUrls: ['./touch-gestures.component.css']
})
export class TouchGesturesComponent {

  public isMobile = 'ontouchstart' in document.documentElement;

  public enablePinchOnMobile = this.isMobile;

  public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width',
                       0.2, 0.25, 0.33, 0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 1.25, 1.5, 1.66, 1.8, 2, 2.5, 3, 3.5, 4];
}
