```html
<ngx-extended-pdf-viewer
  #pdfViewer
  [customToolbar]="customCheckboxZoomToolbar"
  [src]="'/assets/pdfs/dachstein.pdf'"
  [zoom]="zoom">
</ngx-extended-pdf-viewer>

<ng-template #customCheckboxZoomToolbar>
  <div id="toolbarViewer">
    <div [class.invisible]="false" id="toolbarViewerMiddle">
      <pdf-zoom-dropdown class="invisible"></pdf-zoom-dropdown>

      <input type="radio" id="zoom50" class="toolbarField radio" tabindex="94" (click)="zoom = '50%'" name="zoom" [checked]="zoom==='50%'" />
      <label for="zoom50" class="toolbarLabel">50%</label>

      <input type="radio" id="zoom100" class="toolbarField radio" tabindex="95" (click)="zoom = '100%'" name="zoom" [checked]="zoom==='100%'"/>
      <label for="zoom100" class="toolbarLabel">100%</label>

      <input type="radio" id="zoom200" class="toolbarField radio" tabindex="96" (click)="zoom = '200%'" name="zoom" [checked]="zoom==='200%'"/>
      <label for="zoom200" class="toolbarLabel">200%</label>

      <input type="radio" id="zoom-auto" class="toolbarField radio" tabindex="97" (click)="zoom = 'auto'" name="zoom" [checked]="zoom==='auto'"/>
      <label for="zoom-auto" class="toolbarLabel">auto</label>
    </div>
  </div>
</ng-template>
```
