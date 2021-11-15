```typescript
import { Component, Inject, AfterViewInit } from '@angular/core';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import PerfectScrollbar from 'perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
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
export class PerfectScrollbarComponent implements AfterViewInit {
  public scrollbar: any = undefined;

  constructor(
    @Inject(PERFECT_SCROLLBAR_CONFIG)
    public config: PerfectScrollbarConfigInterface
  ) {}

  public ngAfterViewInit(): void {
    const container = document.querySelector('#viewerContainer');
    this.scrollbar = new PerfectScrollbar(container, this.config);

    const sidebar = document.querySelector('#thumbnailView') as HTMLElement;
    if (sidebar) {
      this.scrollbar = new PerfectScrollbar(sidebar, this.config);
    }
  }
}
```
