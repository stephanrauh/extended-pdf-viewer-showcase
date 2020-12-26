import { Component } from '@angular/core';

@Component({
  selector: 'app-ng2-zoom',
  templateUrl: './ng2-zoom.component.html',
  styleUrls: ['./ng2-zoom.component.css']
})
export class Ng2ZoomComponent {

  public zoom: number | undefined = undefined;

  public zoomScale: string | undefined = undefined;

  public originalSize: Boolean | undefined = undefined;

  public fitToPage: Boolean | undefined = undefined;

  public autoresize: Boolean | undefined = undefined;
}
