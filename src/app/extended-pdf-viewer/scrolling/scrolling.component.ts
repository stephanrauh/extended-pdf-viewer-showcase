import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-scrolling',

    standalone: true,
    templateUrl: './scrolling.component.html',
    styleUrls: ['./scrolling.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class ScrollingComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  private _fullscreen = false;

  public zoom = 'page-width';
  public scrollingcomponentTab: string = 'regularpdffiles';
  public codeTab: string = 'htmltemplate';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get src(): string {
    if (this.scrollingcomponentTab === 'regularpdffiles') {
      return './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';
    } else {
      return './assets/pdfs/issue1707-with-rulers.pdf';
    }
  }

  public scroll(pageNumber: number, top: number | string): void {
    this.pdfService.scrollPageIntoView(pageNumber, { top });
  }

  public scrollLeft(pageNumber: number, left: string): void {
    this.pdfService.scrollPageIntoView(pageNumber, { left });
  }

  /*
  public scrollRight(pageNumber: number, right: string): void {
    // this.pdfService.scrollPageIntoView(pageNumber, { right });
  }
  */
}
