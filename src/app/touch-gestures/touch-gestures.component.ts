import { Component } from '@angular/core';

@Component({
  selector: 'app-touch-gestures',
  templateUrl: './touch-gestures.component.html',
  styleUrls: ['./touch-gestures.component.css']
})
export class TouchGesturesComponent {
  public enablePinchOnMobile = true;

  public isMobile = 'ontouchstart' in document.documentElement;
}
