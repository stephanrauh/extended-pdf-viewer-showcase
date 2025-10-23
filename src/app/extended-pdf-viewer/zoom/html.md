```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf'"
  (currentZoomFactor)="updateZoomFactor($event)"
  [(zoom)]="zoomSetting"
  [minZoom]="minZoom" [maxZoom]="maxZoom"
  [zoomLevels]="zoomLevels"
  >
</ngx-extended-pdf-viewer>
```
