```html
<ngx-extended-pdf-viewer
    #pdfViewer
    [src]="'/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf'"
    [customSidebar]="theme==='fancy' ? fancySidebar: theme === 'without'? withoutSidebar: null"
    [(sidebarVisible)]="sidebarOpen"
    [textLayer]="true"
    [showHandToolButton]="true">
</ngx-extended-pdf-viewer>
```
