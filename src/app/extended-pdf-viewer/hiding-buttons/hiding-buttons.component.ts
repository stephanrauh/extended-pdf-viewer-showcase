import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, ResponsiveVisibility } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-hiding-buttons',
  templateUrl: './hiding-buttons.component.html',
  styleUrls: ['./hiding-buttons.component.css'],
})
export class HidingButtonsComponent {
  public showToolbar = true;
  public showSidebarButton = false;
  public showFindButton = false;
  public findbarVisible = false;
  public showDrawEditor = false;
  public showHighlightEditor = false;
  public showTextEditor = false;
  public showMovePageButton = false;
  public showSignatureEditor = false;
  public showStampEditor = false;
  public showPagingButtons = false;
  public showZoomButtons = false;
  public showPresentationModeButton = false;
  public showOpenFileButton = false;
  public showPrintButton = false;
  public showDownloadButton = false;
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

  public settingsWidth = '60%';

  public codeWidth = '38%';

  private _currentTab = 0;

  public get currentTab(): number {
    return this._currentTab;
  }

  public set currentTab(tab: number) {
    this._currentTab = tab;

    this.codeWidth = '38%';
    this.settingsWidth = '60%';
  }

  public options: ResponsiveVisibility[] = [true, false, 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

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
  [showSignatureEditor]="${this.showSignatureEditor}"
  [showHighlightEditor]="${this.showHighlightEditor}"
  [showDrawEditor]="${this.showDrawEditor}"
  [showStampEditor]="${this.showStampEditor}"
  [showTextEditor]="${this.showTextEditor}"
  [showZoomButtons]="${this.showZoomButtons}"
  [showPresentationModeButton]="${this.showPresentationModeButton}"
  [showOpenFileButton]="${this.showOpenFileButton}"
  [showPrintButton]="${this.showPrintButton}"
  [showDownloadButton]="${this.showDownloadButton}"
  [show=SecondaryToolbarButton]="${this.showSecondaryToolbarButton}"
  [showMovePageButton]="${this.showMovePageButton}"
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

  constructor(private pdfService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {
    pdfDefaultOptions.enableSignatureEditor = true;
  }
}
