import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-touch-gestures',
    
    standalone: true,
    templateUrl: './touch-gestures.component.html',
    styleUrls: ['./touch-gestures.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class TouchGesturesComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public isMobile!: boolean;

  public zoomLevels = ['auto', 'page-actual', 'page-fit', 'page-width', 0.5, 0.67, 0.75, 0.82, 0.9, 1, 1.1, 1.15, 1.25, 1.5];

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    this.isMobile = isBrowser() ? 'ontouchstart' in document.documentElement : false;
    pdfDefaultOptions.doubleTapZoomFactor = '125%';
    pdfDefaultOptions.doubleTapResetsZoomOnSecondDoubleTap = true;
  }
}
