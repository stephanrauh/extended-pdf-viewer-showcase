import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-security',
    
    standalone: true,
    templateUrl: './security.component.html',
    styleUrls: ['./security.component.css'],
    imports: [],
})
export class SecurityComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
}
