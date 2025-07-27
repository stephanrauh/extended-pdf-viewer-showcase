import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { isBrowser } from '../common/utilities';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';

@Component({
    selector: 'app-csp',
    
    standalone: true,
    templateUrl: './csp.component.html',
    styleUrls: ['./csp.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
    ],
})
export class CSPComponent implements OnDestroy {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
   public _useInlineScripts = false;
  public cspcomponentTab: string = 'gettingstarted';
  public codeTab: string = 'htmltemplate';

  constructor() {
    if (isBrowser()) {
      const urlParams = new URLSearchParams(window.location.search);
      this._useInlineScripts = urlParams.get('useInlineScripts') === 'true';
      pdfDefaultOptions.rangeChunkSize = 1024 * 1024;
    }
  }

  public get useInlineScripts() {
    return this._useInlineScripts;
  }

  public set useInlineScripts(value: boolean) {
    if (isBrowser()) {
      this._useInlineScripts = value;
      location.search = `useInlineScripts=${value}`;
    }
  }

  public ngOnDestroy() {
    pdfDefaultOptions.rangeChunkSize = 64 * 1024; // restore the default value
  }
}
