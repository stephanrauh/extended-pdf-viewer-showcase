```html
<ngx-extended-pdf-viewer
  *ngIf="visible"
  [src]="'/assets/pdfs/What About GraalVM.pdf'"
  [useBrowserLocale]="true"
  [pdfBackground]="oldPaper"
  [pdfBackgroundColorToReplace]="'#ffffff'">
</ngx-extended-pdf-viewer>
```
