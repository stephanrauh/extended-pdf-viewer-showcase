```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/Introduction.pdf'"
  [height]="'90vh'"
  (annotationLayerRendered)="onEvent('annotationLayerRendered', $event)"
  (annotationEditorLayerRendered)="onEvent('annotationEditorLayerRendered', $event)"
  >
</ngx-extended-pdf-viewer>
```
