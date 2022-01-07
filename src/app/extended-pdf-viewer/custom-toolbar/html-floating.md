```html
<ngx-extended-pdf-viewer
  #pdfViewer
  [customFreeFloatingBar]="floatingZoombar"
  [src]="'/assets/pdfs/dachstein.pdf'"
  [height]="'50vh'"
  [useBrowserLocale]="true"
  [textLayer]="true"
  [zoom]="zoom"
  [showZoomButtons]="false"
  [showFreeFloatingBar]="showFreeFloatingBar">
</ngx-extended-pdf-viewer>

<ng-template #floatingZoombar>
  <div style="position: absolute;bottom:20px;left:41%;z-index:1;background-color:#dbe5e9;padding:4px;padding-bottom: 8px;border:1px solid darkgray">
    <div>
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
