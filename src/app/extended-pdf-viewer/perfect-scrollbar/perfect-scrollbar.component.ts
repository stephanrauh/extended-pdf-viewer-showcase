import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import PerfectScrollbar from 'perfect-scrollbar';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  minScrollbarLength: 100,
};

@Component({
  selector: 'app-perfect-scrollbar',
  standalone: true,
  templateUrl: './perfect-scrollbar.component.html',
  styleUrls: ['./perfect-scrollbar.component.css'],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class PerfectScrollbarComponent implements AfterViewInit, OnDestroy {
  config = inject<PerfectScrollbarConfigInterface>(PERFECT_SCROLLBAR_CONFIG);
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public scrollbar: PerfectScrollbar | undefined = undefined;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public ngAfterViewInit(): void {
    if (isBrowser()) {
      setTimeout(() => {
        if (!this.scrollbar) {
          const container = document.querySelector('#viewerContainer') as HTMLElement;
          this.scrollbar = new PerfectScrollbar(container, this.config);

          const sidebar = document.querySelector('#thumbnailView') as HTMLElement;
          if (sidebar) {
            this.scrollbar = new PerfectScrollbar(sidebar, this.config);
          }
        }
      }, 1000);
    }
  }

  public ngOnDestroy(): void {
    if (this.scrollbar) {
      this.scrollbar.destroy();
      this.scrollbar = undefined;
    }
  }
}
