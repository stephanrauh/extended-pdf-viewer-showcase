import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-prerendering',

    standalone: true,
    templateUrl: './prerendering.component.html',
    styleUrls: ['./prerendering.component.css'],
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        RouterLink,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class PrerenderingComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public spreadMode: 'off' | 'even' | 'odd' = 'off';

  public page = 17;

  public pageLabel = '';

  public prerenderedPages = '';

  public currentlyRenderedPages = '';

  public currentlyRequestedPage: string | number = '(none)';

  public pagesToRender = '(none)';

  public visiblePages = '';
  public prerenderingcomponentTab: string = 'prerenderingstrategy';
  public codeTab: string = 'htmltemplate';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.ignoreDestinationZoom = true;
  }

  public onPageRendered(): void {
    if (!this.pdfViewerService.isRenderQueueEmpty()) {
      // try again later when the pages requested by the pdf.js core or the user have been rendered
      setTimeout(() => this.onPageRendered(), 100);
    }

    const pagesBefore = this.spreadMode === 'off' ? 2 : 2;
    const pagesAfter = this.spreadMode === 'off' ? 2 : 5;
    const startPage = Math.max(this.page - pagesBefore, 1);
    const endPage = Math.min(
      this.page + pagesAfter,
      this.pdfViewerService.numberOfPages()
    );

    let finished = true;
    for (let page = startPage; page <= endPage; page++) {
      const pageIndex = page - 1;
      if (!this.pdfViewerService.hasPageBeenRendered(pageIndex)) {
        this.pdfViewerService.addPageToRenderQueue(pageIndex);
        this.statistics(pageIndex + 1, `${startPage} -> ${endPage}`);
        finished = false;
        break;
      }
    }
    if (finished) {
      this.statistics('(none)', `${startPage} -> ${endPage}`);
    }
    this.cdr.markForCheck();
  }

  private statistics(
    requestedPage: number | string,
    pagesToRender: string
  ): void {
    this.currentlyRenderedPages = String(
      this.pdfViewerService.currentlyRenderedPages()
    ).replace(/,/g, ', ');
    this.currentlyRequestedPage = requestedPage;
    this.pagesToRender = pagesToRender;
    this.visiblePages = String(
      this.pdfViewerService.getCurrentlyVisiblePageNumbers()
    ).replace(',', ', ');
  }
}
