import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="theme-toggle-button"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      (click)="toggleTheme()"
    >
      <svg class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
        @if (isDark()) {
          <!-- Sun icon for light mode -->
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        } @else {
          <!-- Moon icon for dark mode -->
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
        }
      </svg>
    </button>
  `,
  styles: [`
    .theme-toggle-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.375rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .theme-toggle-button:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .theme-toggle-button:active {
      transform: translateY(0);
    }

    .theme-icon {
      width: 1.25rem;
      height: 1.25rem;
      transition: transform 0.2s ease-in-out;
    }

    .theme-toggle-button:hover .theme-icon {
      transform: scale(1.1);
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  isDark = this.themeService.isDarkMode;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}