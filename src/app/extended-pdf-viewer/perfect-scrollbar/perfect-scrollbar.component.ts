import { Component, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import PerfectScrollbar from 'perfect-scrollbar';
import { isLocalhost } from '../common/utilities';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  minScrollbarLength: 100,

};

@Component({
  selector: 'app-perfect-scrollbar',
  templateUrl: './perfect-scrollbar.component.html',
  styleUrls: ['./perfect-scrollbar.component.css'],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class PerfectScrollbarComponent implements AfterViewInit, OnDestroy {

  public scrollbar: PerfectScrollbar | undefined = undefined;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(
    @Inject(PERFECT_SCROLLBAR_CONFIG)
    public config: PerfectScrollbarConfigInterface, private pdfService: NgxExtendedPdfViewerService
  ) {}

  public ngAfterViewInit(): void {
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

  public ngOnDestroy(): void {
    if (this.scrollbar) {
      this.scrollbar.destroy();
      this.scrollbar = undefined;
    }
  }
}
