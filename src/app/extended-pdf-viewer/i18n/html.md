```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf'"
  backgroundColor="#ffffff"
  [height]="'90vh'"
  [useBrowserLocale]="true"
  *ngIf="!hidePdfViewer"
  [language]="language"
  textLayer="true"

>
</ngx-extended-pdf-viewer>
```
