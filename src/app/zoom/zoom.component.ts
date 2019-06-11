import { Component } from '@angular/core';

@Component({
  selector: 'app-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.css']
})
export class ZoomComponent {
  public zoomSetting: number | string | undefined = 'page-width';
}
