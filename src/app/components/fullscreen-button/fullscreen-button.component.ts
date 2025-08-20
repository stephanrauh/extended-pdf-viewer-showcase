import { Component, inject } from '@angular/core';
import { FullscreenService } from '../../services/fullscreen.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-fullscreen-button',
    standalone: true,
  template: `
    <button (click)="toggleFullscreen()" [title]="(fullscreenService.isFullscreen$ | async) ? 'Exit fullscreen' : 'Enter fullscreen'">
      <svg class="w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
      </svg>
    </button>
  `,
  styles: [
    `
      button {
        border: none;
        background: none;
      }
      button:hover {
        background-color: rgba(0, 0, 0, 0.04);
        color: rgba(0, 0, 0, 0.8);
      }
    `,
  ],
  imports: [AsyncPipe],
})
export class FullscreenButtonComponent {
  fullscreenService = inject(FullscreenService);

  toggleFullscreen(): void {
    this.fullscreenService.toggleFullscreen();
  }
}
