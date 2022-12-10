```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/Portugues-para-principiantes-1538054164.pdf'"
  [height]="'90vh'"
  [useBrowserLocale]="true"
  (pageChange)="onEvent('pageChange', $event)"
  (afterPrint)="onEvent('afterPrint', $event)"
  (beforePrint)="onEvent('beforePrint', $event)"
  (currentZoomFactor)="onEvent('currentZoomFactor', $event)"
  (pagesLoaded)="onPagesLoaded($event)"
  (pageRendered)="onEvent('pageRendered', $event)"
  (pdfDownloaded)="onEvent('pdfDownloaded', $event)"
  (pdfLoadingStarts)="onEvent('pdfLoadingStarts', $event)"
  (pdfLoaded)="onEvent('pdfLoaded', $event)"
  (pdfLoadingFailed)="onEvent('pdfLoadingFailed', $event)"
  (updateFindMatchesCount)="onEvent('updateFindMatchesCount', $event)"
  (updateFindState)="onEvent('updateFindState', $event)"
  (progress)="onEvent('onProgress', $event)"
  (annotationLayerRendered)="onEvent('annotationLayerRendered', $event)"
  (annotationEditorLayerRendered)="onEvent('annotationEditorLayerRendered', $event)"
  (xfaLayerRendered)="onEvent('xfaLayerRendered', $event)"
  (outlineLoaded)="onEvent('outlineLoaded', $event)"
  (attachmentsloaded)="onEvent('attachmentsloaded', $event)"
  (layersloaded)="onEvent('layersloaded', $event)">
</ngx-extended-pdf-viewer>
```
