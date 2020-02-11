```html
<ngx-extended-pdf-viewer
  [src]="'https://www.math.ias.edu/~lurie/281notes/Lecture15-Wall.pdf'"
  backgroundColor="#ffffff"
  [height]="'90vh'"
  [useBrowserLocale]="true"
  (afterPrint)="onEvent('afterPrint', $event)"
  (beforePrint)="onEvent('beforePrint', $event)"
  (currentZoomFactor)="onEvent('currentZoomFactor', $event)"
  (pagesLoaded)="onPagesLoaded($event)"
  (pageRendered)="onEvent('pageRendered', $event)"
  (pdfDownloaded)="onEvent('pdfDownloaded', $event)"
  (pdfLoaded)="onEvent('pdfLoaded', $event)"
  (pdfLoadingFailed)="onEvent('pdfLoadingFailed', $event)"
  (updateFindMatchesCount)="onEvent('updateFindMatchesCount', $event)"
  (updateFindState)="onEvent('updateFindState', $event)"
>
</ngx-extended-pdf-viewer>
```
