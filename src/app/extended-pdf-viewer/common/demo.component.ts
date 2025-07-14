import { Component, inject, Input } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { CopyrightComponent } from './copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css'],
    imports: [MatCard, CopyrightComponent, FullscreenButtonComponent, AsyncPipe]
})
export class DemoComponent {
  public fullscreenService = inject(FullscreenService);
  @Input() src!: string;
  @Input() additionalNote = '';
  @Input() showNote = false;

}
