import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hiding-buttons',
  templateUrl: './hiding-buttons.component.html',
  styleUrls: ['./hiding-buttons.component.css']
})
export class HidingButtonsComponent {
  public showSidebarButton = false;
  public showFindButton = false;
  public showPagingButtons = false;
  public showZoomButtons = false;
  public showPresentationModeButton = false;
  public showOpenFileButton = false;
  public showPrintButton = false;
  public showDownloadButton = true;
  public showBookmarkButton = false;
  public showSecondaryToolbarButton = true;
  public showRotateButton = false;
  public showHandToolButton = false;
  public showScrollingButton = false;
  public showSpreadButton = false;
  public showPropertiesButton = false;
  public downloadFileName = 'user-defined-name.pdf';

  public get sourcecode() {
    return `<ngx-extended-pdf-viewer
  [src]="'assets/pdfs/pdf-sample.pdf'"
  [showSidebarButton]="${this.showSidebarButton}"
  [showFindButton]="${this.showFindButton}"
  [showPagingButtons]="${this.showPagingButtons}"
  [showZoomButtons]="${this.showZoomButtons}"
  [showPresentationModeButton]="${this.showPresentationModeButton}"
  [showOpenFileButton]="${this.showOpenFileButton}"
  [showPrintButton]="${this.showPrintButton}"
  [showDownloadButton]="${this.showDownloadButton}"
  [showBookmarkButton]="${this.showBookmarkButton}"
  [showSecondaryToolbarButton]="${this.showSecondaryToolbarButton}"
  [showRotateButton]="${this.showRotateButton}"
  [showHandToolButton]="${this.showHandToolButton}"
  [showScrollingButton]="${this.showScrollingButton}"
  [showSpreadButton]="${this.showSpreadButton}"
  [showPropertiesButton]="${this.showPropertiesButton}"
  [useBrowserLocale]="true" height="250px" zoom="25%">
</ngx-extended-pdf-viewer>
`;
  }
}
