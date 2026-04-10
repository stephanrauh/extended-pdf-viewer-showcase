import { Component, ViewEncapsulation, inject, effect } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IPDFViewerApplication, NgxExtendedPdfViewerModule, pdfDefaultOptions, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-custom-pdf-viewer',
    standalone: true,
    templateUrl: './custom-pdf-viewer.component.html',
    styleUrls: ['./custom-pdf-viewer.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        SetMinifiedLibraryUsageDirective,
        AsyncPipe,
    ],
})
export class CustomPdfViewerComponent {
  private themeService = inject(ThemeService);
  fullscreenService = inject(FullscreenService);

  public get theme(): string {
    return this.themeService.theme();
  }

  public codeTab: string = 'description';
  public currentPage = 1;
  public totalPages = 0;
  public pages: number[] = [];

  private PDFViewerApplication: IPDFViewerApplication | undefined;

  constructor() {
    pdfDefaultOptions.enableComment = false;

    const notificationService = inject(PDFNotificationService);
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public onPagesLoaded(event: { pagesCount: number }): void {
    this.totalPages = event.pagesCount;
    this.pages = Array.from({ length: event.pagesCount }, (_, i) => i + 1);
  }

  public onPageChange(page: number | undefined): void {
    if (page) {
      this.currentPage = page;
    }
  }

  public goToPage(page: number): void {
    if (this.PDFViewerApplication) {
      this.PDFViewerApplication.page = page;
    }
  }
}
