import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-browser-support',
    
    standalone: true,
    templateUrl: './browser-support.component.html',
    styleUrls: ['./browser-support.component.css'],
    imports: [],
})
export class BrowserSupportComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
}
