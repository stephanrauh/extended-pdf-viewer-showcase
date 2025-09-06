import { Injectable, signal, effect, Injector, runInInjectionContext } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'extended-pdf-viewer-theme';
  
  // Signal to track current theme
  public readonly theme = signal<Theme>(this.getInitialTheme());
  
  // Computed signal to track if dark mode is active
  public readonly isDarkMode = signal(this.theme() === 'dark');

  constructor(private injector: Injector) {
    // Use setTimeout with runInInjectionContext to delay initialization and prevent circular dependency issues
    setTimeout(() => {
      runInInjectionContext(this.injector, () => {
        // Effect to update DOM and localStorage when theme changes
        effect(() => {
          const currentTheme = this.theme();
          this.updateDocument(currentTheme);
          this.saveToStorage(currentTheme);
          this.syncPdfViewerTheme(currentTheme);
          this.isDarkMode.set(currentTheme === 'dark');
        });
      });
    }, 0);
  }

  /**
   * Toggle between light and dark theme
   */
  public toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  /**
   * Set specific theme
   */
  public setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'light';
    }

    try {
      // Try to get from app localStorage first
      const saved = localStorage.getItem(this.storageKey) as Theme;
      if (saved && (saved === 'light' || saved === 'dark')) {
        return saved;
      }

      // Check if PDF viewer has a theme preference
      const pdfTheme = localStorage.getItem('ngx-extended-pdf-viewer.theme') as Theme;
      if (pdfTheme && (pdfTheme === 'light' || pdfTheme === 'dark')) {
        return pdfTheme;
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari in certain contexts
      console.warn('localStorage not available, falling back to system preference');
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Update document classes and CSS variables
   */
  private updateDocument(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme class
    root.classList.add(`${theme}-theme`);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveToStorage(theme: Theme): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, theme);
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari in certain contexts
      console.warn('Failed to save theme preference - localStorage not available');
    }
  }

  /**
   * Sync theme with ngx-extended-pdf-viewer's theme system
   */
  private syncPdfViewerTheme(theme: Theme): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      // Update the PDF viewer's theme localStorage key
      localStorage.setItem('ngx-extended-pdf-viewer.theme', theme);
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari in certain contexts
      console.warn('Failed to sync PDF viewer theme - localStorage not available');
    }
  }
}