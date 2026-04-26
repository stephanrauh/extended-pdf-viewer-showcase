```html
<ngx-extended-pdf-viewer
    [src]="'/assets/pdfs/ngx-extended-pdf-viewer-flyer.pdf'"
    [customSidebar]="sidebarType === 'review'
                       ? reviewSidebar
                       : sidebarType === 'toc'
                         ? tocSidebar
                         : undefined"
    [(sidebarVisible)]="sidebarOpen"
    [textLayer]="true"
    [showHandToolButton]="true">
</ngx-extended-pdf-viewer>

<!-- Pass an ng-template to [customSidebar] -->
<ng-template #reviewSidebar>
  <div id="viewsManager" style="top: 32px; bottom: auto">
    <!-- your custom sidebar content here -->
    <div id="viewsManagerResizer" class="hidden"></div>
  </div>
</ng-template>
```
