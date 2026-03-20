```html
<!-- [textLayer]="true" is required for auto-detected links -->
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/auto-detected-links.pdf'"
  [height]="'90vh'"
  [textLayer]="true"
  (annotationLayerRendered)="onAnnotationLayerRendered($event)"
  (linkAnnotationsAdded)="onLinkAnnotationsAdded($event)"
>
</ngx-extended-pdf-viewer>
```
