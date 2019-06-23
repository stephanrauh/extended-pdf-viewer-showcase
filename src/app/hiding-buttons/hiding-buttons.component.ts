import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hiding-buttons',
  templateUrl: './hiding-buttons.component.html'
})
export class HidingButtonsComponent {
  public showSidebarButton = false;
  public showFindButton = false;
  public showPagingButtons = false;
  public showZoomButtons = false;
  public showPresentationModeButton = false;
  public showOpenFileButton = false;
  public showPrintButton = false;
  public showDownloadButton = false;
  public showBookmarkButton = false;
  public showSecondaryToolbarButton = true;
  public showRotateButton = false;
  public showHandToolButton = false;
  public showScrollingButton = false;
  public showSpreadButton = false;
  public showPropertiesButton = false;
}
