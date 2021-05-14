import { Component, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import PerfectScrollbar from 'perfect-scrollbar';


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

  constructor(
    @Inject(PERFECT_SCROLLBAR_CONFIG)
    public config: PerfectScrollbarConfigInterface
  ) {}

  public ngAfterViewInit(): void {
    const container = document.querySelector('#viewerContainer') as HTMLElement;
    this.scrollbar = new PerfectScrollbar(container, this.config);
  }

  public ngOnDestroy(): void {
    if (this.scrollbar) {
      this.scrollbar.destroy();
      this.scrollbar = undefined;
    }
  }
}
