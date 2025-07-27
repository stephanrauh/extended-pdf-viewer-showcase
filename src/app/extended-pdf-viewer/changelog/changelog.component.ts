import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
    selector: 'app-changelog',
    
    standalone: true,
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.css'],
    imports: [Ie11MarkdownComponent]
})
export class ChangelogComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
}
