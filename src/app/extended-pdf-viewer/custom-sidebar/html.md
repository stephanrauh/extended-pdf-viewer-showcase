```html
<ngx-extended-pdf-viewer
    #pdfViewer
    [src]="'/assets/pdfs/stluciadance.com.pdf'"
    [customSidebar]="theme==='fancy' ? fancySidebar: theme === 'without'? withoutSidebar: null"
    [useBrowserLocale]="true"
    [(sidebarVisible)]="sidebarOpen"
    [textLayer]="true"
    [showHandToolButton]="true">
</ngx-extended-pdf-viewer>
```
