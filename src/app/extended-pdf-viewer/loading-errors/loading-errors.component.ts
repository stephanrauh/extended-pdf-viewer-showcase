import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';

const MISSING_FILE = '/assets/pdfs/this-file-does-not-exist.pdf';
const WORKING_FILE = '/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf';

@Component({
  selector: 'app-loading-errors',
  standalone: true,
  templateUrl: './loading-errors.component.html',
  imports: [FormsModule, AsyncPipe, LanguagePipe, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective],
})
export class LoadingErrorsComponent {
  private themeService = inject(ThemeService);
  public fullscreenService = inject(FullscreenService);

  public get theme(): string {
    return this.themeService.theme();
  }

  public readonly files = [
    { label: 'a file that does not exist', src: MISSING_FILE },
    { label: 'a working PDF file', src: WORKING_FILE },
  ];

  public src = MISSING_FILE;

  public showLoadingErrorMessage = true;

  public loadingErrorMessage = '';

  public lastError = '';

  public onPdfLoadingFailed(error: Error): void {
    this.lastError = `${error.name}: ${error.message}`;
  }

  public onPdfLoaded(): void {
    this.lastError = '';
  }

  public get sourcecode(): string {
    const message = this.loadingErrorMessage.trim() ? `\n  [loadingErrorMessage]="'${this.loadingErrorMessage.trim().replace(/'/g, "\\'")}'"` : '';
    return `<ngx-extended-pdf-viewer
  [src]="'${this.src}'"
  [showLoadingErrorMessage]="${this.showLoadingErrorMessage}"${message}
  (pdfLoadingFailed)="onPdfLoadingFailed($event)">
</ngx-extended-pdf-viewer>`;
  }
}
