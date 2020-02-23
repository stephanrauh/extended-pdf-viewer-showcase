```html
  <ngx-extended-pdf-viewer
    #pdfViewer
    [customToolbar]="customCheckboxZoomToolbar"
    [src]="'assets/pdfs/dachstein.pdf'"
    [height]="'50vh'"
    [useBrowserLocale]="true"
    [textLayer]="true"
    [zoom]="zoom">
  </ngx-extended-pdf-viewer>

<ng-template #customCheckboxZoomToolbar>
  <div id="toolbarViewer">
    <div id="toolbarViewerLeft">
      <button [class.invisible]="true" id="sidebarToggle"></button>
      <button [class.invisible]="true" id="viewFind"></button>
      <pdf-paging-area [showPagingButtons]="true"></pdf-paging-area>
    </div>
    <div id="toolbarViewerRight">
      <pdf-presentation-mode [showPresentationModeButton]="false"></pdf-presentation-mode>
      <pdf-open-file [showOpenFileButton]="false"></pdf-open-file>
      <pdf-print [showPrintButton]="false"></pdf-print>
      <pdf-download [showDownloadButton]="false"></pdf-download>
      <pdf-bookmark [showBookmarkButton]="false"></pdf-bookmark>
      <button [class.invisible]="true" id="secondaryToolbarToggle"></button>
    </div>
    <div [class.invisible]="false" id="toolbarViewerMiddle">
      <div class="splitToolbarButton">
        <button id="zoomOut" class="invisible"></button>
        <button id="zoomIn" class="invisible"></button>
      </div>
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
