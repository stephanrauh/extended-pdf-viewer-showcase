import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-side-by-side',
  templateUrl: './side-by-side.component.html',
  styleUrls: ['./side-by-side.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBySideComponent {
  public fullscreenService = inject(FullscreenService);
}
