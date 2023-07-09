```html
<ngx-extended-pdf-viewer
  [src]="'./assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
  [minifiedJSLibraries]="!isLocalhost"
  [zoom]="'auto'"
  (annotationLayerRendered)="onAnnotationLayerRendered($event)">
</ngx-extended-pdf-viewer>
```
