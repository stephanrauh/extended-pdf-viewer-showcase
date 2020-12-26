```html
  <ngx-extended-pdf-viewer
    [src]="'/assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
    [height]="'90vh'"
    [useBrowserLocale]="true"
    (pagesLoaded)="onPagesLoaded()"
  >
  </ngx-extended-pdf-viewer>
```
