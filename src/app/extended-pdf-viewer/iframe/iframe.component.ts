import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CopyrightComponent } from '../common/copyright.component';
import { FullscreenButtonComponent } from '../../components/fullscreen-button/fullscreen-button.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';

@Component({
    selector: 'app-iframe',
    
    standalone: true,
    templateUrl: './iframe.component.html',
    styleUrls: ['./iframe.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CopyrightComponent,
        FullscreenButtonComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
    ],
})
export class IFrameComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public url = '';

  constructor() {
    if (!this.isBrowser()) {
      this.url = '/assets/pdfs/CDK.pdf';
    } else if (location.pathname.endsWith('cdk')) {
      this.url = '/assets/pdfs/CDK.pdf';
    } else {
      this.url = '/assets/pdfs/GraalVM.pdf';
    }
  }

  /**
   * Checks if the code is running in a browser environment.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
