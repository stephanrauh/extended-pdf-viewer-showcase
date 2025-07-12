import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-smartphone',
  templateUrl: './smartphone.component.html',
  styleUrls: ['./smartphone.component.css', './devices.min.css'],
})
export class SmartphoneComponent {
  public fullscreenService = inject(FullscreenService);

}
