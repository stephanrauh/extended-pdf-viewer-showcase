import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, ResponsiveVisibility, PdfBreakpoints } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-hiding-buttons',
  templateUrl: './hiding-buttons.component.html',
  styleUrls: ['./hiding-buttons.component.css']
})
export class HidingButtonsComponent {
  public showToolbar = true;
  public showSidebarButton = false;
  public showFindButton = true;
  public findbarVisible = false;
  public showDrawEditor = false;
  public showHighlightEditor = false;
  public showTextEditor = false;
  public showStampEditor = false;
  public showPagingButtons = false;
  public showZoomButtons = false;
  public showPresentationModeButton = false;
  public showOpenFileButton = false;
  public showPrintButton = false;
  public showDownloadButton = true;
  public showSecondaryToolbarButton = true;
  public showRotateCwButton = false;
  public showRotateCcwButton = false;
  public showHandToolButton = false;
  public showScrollingButtons = false;
  public showSpreadButton = false;
  public showPropertiesButton = false;
  public propertiesDialogVisible = false;
  public downloadFileName = 'user-defined-name.pdf';

  public set showRotateButton(rotate: boolean) {
    this.showRotateCwButton = rotate;
    this.showRotateCcwButton = rotate;
  }



  private _fullscreen = false;

  public settingsWidth = "60%";

  public codeWidth = "38%";

  private _currentTab = 0;

  public get currentTab(): number {
    return this._currentTab;
  }

  public set currentTab(tab: number) {
    this._currentTab = tab;

      this.codeWidth = "38%";
      this.settingsWidth = "60%";
  }

  public options: Array<ResponsiveVisibility> = [true, false, 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  public get sourcecode() {
    return `<ngx-extended-pdf-viewer
  [src]="'/assets/pdfs/pdf-sample.pdf'"
  [showToolbar]="${this.showToolbar}"
  [showSidebarButton]="${this.showSidebarButton}"
  [showFindButton]="${this.showFindButton}"
  [showPagingButtons]="${this.showPagingButtons}"
  [showDrawEditor]="${this.showDrawEditor}"
  [showStampEditor]="${this.showStampEditor}"
  [showTextEditor]="${this.showTextEditor}"
  [showZoomButtons]="${this.showZoomButtons}"
  [showPresentationModeButton]="${this.showPresentationModeButton}"
  [showOpenFileButton]="${this.showOpenFileButton}"
  [showPrintButton]="${this.showPrintButton}"
  [showDownloadButton]="${this.showDownloadButton}"
  [showSecondaryToolbarButton]="${this.showSecondaryToolbarButton}"
  [showRotateButton]="${this.showRotateButton}"
  [showRotateCwButton]="${this.showRotateCwButton}"
  [showRotateCcwButton]="${this.showRotateCcwButton}"
  [showHandToolButton]="${this.showHandToolButton}"
  [showScrollingButtons]="${this.showScrollingButtons}"
  [showSpreadButton]="${this.showSpreadButton}"
  [showPropertiesButton]="${this.showPropertiesButton}">
</ngx-extended-pdf-viewer>
`;
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
