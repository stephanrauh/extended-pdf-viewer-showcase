import { Directive, inject, Input, effect, OnInit } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Directive({
  selector: 'ngx-extended-pdf-viewer[pdfThemeSync]',
  standalone: true
})
export class PdfThemeSyncDirective implements OnInit {
  private themeService = inject(ThemeService);
  
  @Input() theme?: string;

  ngOnInit(): void {
    // Effect to update the PDF viewer theme when app theme changes
    effect(() => {
      const currentTheme = this.themeService.theme();
      // Update the component's theme input if it's bound
      if (this.theme !== undefined) {
        this.theme = currentTheme;
      }
    });
  }
}