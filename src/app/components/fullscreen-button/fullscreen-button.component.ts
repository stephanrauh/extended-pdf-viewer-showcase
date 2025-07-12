import { Component } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-fullscreen-button',
  template: `
    <button
      mat-icon-button
      (click)="toggleFullscreen()"
      [title]="(fullscreenService.isFullscreen$ | async) ? 'Exit fullscreen' : 'Enter fullscreen'"
      style="height: 36px; width: 36px; color: rgba(0,0,0,0.6);">
      <mat-icon style="font-size: 20px; height: 20px; width: 20px;">
        {{ (fullscreenService.isFullscreen$ | async) ? 'fullscreen_exit' : 'fullscreen' }}
      </mat-icon>
    </button>
  `,
  styles: [`
    button:hover {
      background-color: rgba(0,0,0,0.04);
      color: rgba(0,0,0,0.8);
    }
  `]
})
export class FullscreenButtonComponent {
  constructor(public fullscreenService: FullscreenService) {}

  toggleFullscreen(): void {
    this.fullscreenService.toggleFullscreen();
  }
}
