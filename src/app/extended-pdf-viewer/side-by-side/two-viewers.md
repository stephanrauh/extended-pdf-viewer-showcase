```html
<div style="display: flex; gap: 8px">
  <div style="flex: 1; min-width: 0">
    <ngx-extended-pdf-viewer [src]="'/assets/pdfs/CDK.pdf'" [zoom]="'auto'" [height]="'100vh'" [textLayer]="true">
    </ngx-extended-pdf-viewer>
  </div>
  <div style="flex: 1; min-width: 0">
    <ngx-extended-pdf-viewer [src]="'/assets/pdfs/GraalVM.pdf'" [zoom]="'auto'" [height]="'100vh'" [textLayer]="true">
    </ngx-extended-pdf-viewer>
  </div>
</div>
```
