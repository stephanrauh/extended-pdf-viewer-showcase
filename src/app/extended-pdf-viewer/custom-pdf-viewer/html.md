```html
<ngx-extended-pdf-viewer
  [src]="pdfSrc"
  [customPdfViewer]="minimalViewer"
  (pagesLoaded)="onPagesLoaded($event)"
  (pageChange)="onPageChange($event)"
  [theme]="theme">
</ngx-extended-pdf-viewer>

<ng-template #minimalViewer>
  <div class="zoom" style="height: 90vh" #root>
    <div class="html">
      <div class="body">
        <div id="outerContainer">
          <div id="mainContainer" class="custom-layout">
            <pdf-dummy-components></pdf-dummy-components>

            <div class="custom-sidebar">
              <label class="sidebar-label">Go to page</label>
              <select id="custom-page-select" class="page-select" [value]="currentPage" (change)="goToPage(+$any($event.target).value)">
                @for (p of pages; track p) {
                  <option [value]="p" [selected]="p === currentPage">Page {{ p }}</option>
                }
              </select>
            </div>

            <div id="viewerContainer" class="custom-viewer-container">
              <div id="viewer" class="pdfViewer"></div>
            </div>

          </div>
          <!-- Optional: add dialog components here if you need them
               (e.g. pdf-password-dialog, pdf-alt-text-dialog, etc.) -->
        </div>
      </div>
    </div>
  </div>
</ng-template>
