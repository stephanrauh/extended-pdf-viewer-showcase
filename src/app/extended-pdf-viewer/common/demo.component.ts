import { Component, inject, Input } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent {
  public fullscreenService = inject(FullscreenService);
  @Input() src!: string;
  @Input() additionalNote = '';
  @Input() showNote = false;

}
