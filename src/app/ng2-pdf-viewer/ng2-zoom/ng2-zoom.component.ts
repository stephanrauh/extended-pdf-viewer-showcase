import { Component } from '@angular/core';

@Component({
  selector: 'app-ng2-zoom',
  templateUrl: './ng2-zoom.component.html',
  styleUrls: ['./ng2-zoom.component.css']
})
export class Ng2ZoomComponent {

  public zoom!: number;

  public zoomScale!: string;

  public originalSize = false;

  public fitToPage = true

  public autoresize = false;
}
