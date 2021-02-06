```html
<ngx-extended-pdf-viewer
  #pdfViewer
  [src]="'/assets/pdfs/dachstein.pdf'"
  [height]="'50vh'"
  [useBrowserLocale]="true"
  [textLayer]="true"
  [customToolbar]="multiToolbar">
</ngx-extended-pdf-viewer>
<ng-template #multiToolbar>
  <div class="header">
    <button mat-icon-button id="zoomIn">
      <mat-icon>zoom_in</mat-icon>
    </button>
    <button mat-icon-button id="zoomOut">
      <mat-icon>zoom_out</mat-icon>
    </button>
    <button mat-icon-button>
      <mat-icon>fullscreen</mat-icon>
    </button>

    <button mat-icon-button id="primaryPageRotateCw">
      <mat-icon>replay</mat-icon>
    </button>

    <div class="flex-spacer"></div>
    <button mat-icon-button id="print">
      <mat-icon>print</mat-icon>
    </button>
    <button mat-icon-button id="download">
      <mat-icon>download</mat-icon>
    </button>
  </div>
</ng-template>


```
