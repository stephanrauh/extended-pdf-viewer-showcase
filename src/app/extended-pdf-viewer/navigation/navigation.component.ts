import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule],
})
export class NavigationComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public _namedDest: string | undefined;

  public page: number | undefined;

  public fullscreen = false;
  public activeTab: string = 'html';

  public get namedDest() {
    return this._namedDest;
  }

  public set namedDest(dest: string | undefined) {
    // reset the attribute to force change detection:
    this._namedDest = undefined;
    setTimeout(() => {
      this._namedDest = dest;
      this.cdr.markForCheck();
    });
  }
}
