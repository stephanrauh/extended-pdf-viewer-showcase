```html
<ngx-extended-pdf-viewer
    [src]="'/assets/pdfs/themes_de_la_Science-fiction.pdf'"
    [height]="'90vh'"
    (pagesLoaded)="listLayers()"
    (layerVisibilityChanged)="onLayerVisibilityChanged($event)">
</ngx-extended-pdf-viewer>
```
