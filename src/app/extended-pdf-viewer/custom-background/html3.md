```html
<ngx-extended-pdf-viewer
  *ngIf="visible"
  [src]="'/assets/pdfs/What About GraalVM.pdf'"
  [useBrowserLocale]="true"
  [pdfBackground]="colorByPage"
  [pdfBackgroundColorToReplace]="'#ffffff'">
</ngx-extended-pdf-viewer>
```
