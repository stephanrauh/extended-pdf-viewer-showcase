import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.css'],
})
export class MobileComponent {
  public fullscreenService = inject(FullscreenService);

  public mobileFriendlyZoomSetting = '150%';

}
