import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, ResponsiveVisibility, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';
import { LanguagePipe } from 'ngx-markdown';

@Component({
    selector: 'app-hiding-buttons',
    templateUrl: './hiding-buttons.component.html',
    styleUrls: ['./hiding-buttons.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        MatCheckbox,
        FormsModule,
        MatFormField,
        MatInput,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
        LanguagePipe,
    ],
})
export class HidingButtonsComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

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

  constructor() {
    pdfDefaultOptions.enableSignatureEditor = true;
    pdfDefaultOptions.enablePageReordering = true;
  }
}
