import { Component, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import PerfectScrollbar from 'perfect-scrollbar';
import { isBrowser } from '../common/utilities';
import { FullscreenService } from '../../services/fullscreen.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  minScrollbarLength: 100,
};

@Component({
standalone: false,
  selector: 'app-perfect-scrollbar',
  templateUrl: './perfect-scrollbar.component.html',
  styleUrls: ['./perfect-scrollbar.component.css'],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
})
export class PerfectScrollbarComponent implements AfterViewInit, OnDestroy {
  public scrollbar: PerfectScrollbar | undefined = undefined;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(
    @Inject(PERFECT_SCROLLBAR_CONFIG) public config: PerfectScrollbarConfigInterface,
    public fullscreenService: FullscreenService
  ) {}

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
