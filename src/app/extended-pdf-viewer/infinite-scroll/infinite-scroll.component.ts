import { Component, inject } from '@angular/core';
import { ScrollModeType, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-infinite-scroll',
    
    standalone: true,
    templateUrl: './infinite-scroll.component.html',
    styleUrls: ['./infinite-scroll.component.css'],
    imports: [
        FormsModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class InfiniteScrollComponent {
  fullscreenService = inject(FullscreenService);

  public filenames = [
    '/assets/pdfs/PdfFormExample.pdf',
    '/assets/pdfs/user-experience.pdf',
    '/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf',
  ];

  public ScrollModeType = ScrollModeType;

   private _showWidgets = false;

  public zoom = '100%';

  public file = 1;

  public showPdfViewer = true;
  public infinitescrollcomponentTab: string = 'gettingstarted';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get showWidgets(): boolean {
    return this._showWidgets;
  }

  public set showWidgets(v: boolean) {
    if (this._showWidgets !== v) {
      this.showPdfViewer = false;
      setTimeout(() => this.showPdfViewer = true);
    }
    this._showWidgets = v;
  }
}
