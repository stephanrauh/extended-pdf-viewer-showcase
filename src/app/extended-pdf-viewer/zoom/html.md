```html
<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/BootsFaces_Deep_Dive_1.0.pdf'"
  (currentZoomFactor)="updateZoomFactor($event)"
  [useBrowserLocale]="true" [height]="'90vh'"
  [(zoom)]="zoomSetting"
  [minZoom]="minZoom" [maxZoom]="maxZoom"
  [zoomLevels]="zoomLevels"
  [enablePinchOnMobile]="enablePinchOnMobile">
</ngx-extended-pdf-viewer>
```
