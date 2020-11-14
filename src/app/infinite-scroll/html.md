```html
  <ngx-extended-pdf-viewer
    *ngIf="showPdfViewer"
    [src]="'...'"
    [height]="height"
    [useBrowserLocale]="true"
    [textLayer]="showWidgets"
    (pagesLoaded)="onPagesLoaded($event)"
    [showHandToolButton]="showWidgets"
    [showToolbar]="showWidgets"
    [sidebarVisible]="showWidgets"
  >
  </ngx-extended-pdf-viewer>

```
