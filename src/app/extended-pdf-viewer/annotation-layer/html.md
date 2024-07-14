```html
<ngx-extended-pdf-viewer
  [src]="'./assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf'"
  (annotationLayerRendered)="onAnnotationLayerRendered($event)"
  [zoom]="'auto'">
</ngx-extended-pdf-viewer>
```
