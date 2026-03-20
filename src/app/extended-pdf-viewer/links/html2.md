```html
<ngx-extended-pdf-viewer *ngIf="!hidden"
  [src]="'/assets/pdfs/blind-text-collection.pdf'"
  [height]="'90vh'"
  (annotationLayerRendered)="afterAnnotationLayerRendered($event)"
  (linkAnnotationsAdded)="afterLinkAnnotationsAdded($event)"
>
</ngx-extended-pdf-viewer>
```
