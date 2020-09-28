```html
<ngx-extended-pdf-viewer
    #pdfViewer
    [src]="'assets/pdfs/stluciadance.com.pdf'"
    [customSidebar]="theme==='fancy' ? fancySidebar: theme === 'without'? withoutSidebar: null"
    [height]="'90vh'"
    [useBrowserLocale]="true"
    [textLayer]="true"
    [showHandToolButton]="true">
</ngx-extended-pdf-viewer>
```
