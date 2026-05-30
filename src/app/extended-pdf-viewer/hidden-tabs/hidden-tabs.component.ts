import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';

@Component({
  selector: 'app-hidden-tabs',
  standalone: true,
  templateUrl: './hidden-tabs.component.html',
  styleUrls: ['./hidden-tabs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Ie11MarkdownComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective],
})
export class HiddenTabsComponent {
  private themeService = inject(ThemeService);
  private pdfViewerService = inject(NgxExtendedPdfViewerService);

  public get theme(): string {
    return this.themeService.theme();
  }

  // tab3 is the regression-test tab and only appears on localhost.
  public readonly isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  public activeTab: 'tab1' | 'tab2' | 'tab3' = 'tab1';

  public codeTab: 'html' | 'typescript' = 'html';

  public scrollToSeven(): void {
    this.pdfViewerService.scrollPageIntoView(8);
  }
}
