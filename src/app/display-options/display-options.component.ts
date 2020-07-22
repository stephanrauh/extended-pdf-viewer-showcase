import { Component } from '@angular/core';

@Component({
  selector: 'app-display-options',
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.css']
})
export class DisplayOptionsComponent {
  public showBorders = false;
  public backgroundColor = '#F8F8FD';
}
