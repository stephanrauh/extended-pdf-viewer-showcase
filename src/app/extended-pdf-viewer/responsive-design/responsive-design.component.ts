import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, ResponsiveVisibility, PdfBreakpoints } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-responsive-design',
  templateUrl: './responsive-design.component.html',
  styleUrls: ['./responsive-design.component.css']
})
export class ResponsiveDesignComponent {
  public showToolbar = true;
  public showSidebarButton: ResponsiveVisibility = 'xxl';
  public showFindButton: ResponsiveVisibility = 'xxl';
  public showDrawEditor: ResponsiveVisibility = 'xxl';
  public showTextEditor: ResponsiveVisibility = 'xxl';
  public showPagingButtons: ResponsiveVisibility = 'xxl';
  public showZoomButtons: ResponsiveVisibility = 'xxl';
  public showPresentationModeButton: ResponsiveVisibility = 'xxl';
  public showOpenFileButton: ResponsiveVisibility = 'xxl';
  public showPrintButton: ResponsiveVisibility = 'xxl';
  public showDownloadButton: ResponsiveVisibility = 'xxl';
  public showSecondaryToolbarButton: ResponsiveVisibility = 'always-visible';
  public showRotateButton: ResponsiveVisibility = 'xxl';
  public showHandToolButton: ResponsiveVisibility = 'xxl';
  public showScrollingButton: ResponsiveVisibility = 'xxl';
  public showSpreadButton: ResponsiveVisibility = 'xxl';
  public showPropertiesButton: ResponsiveVisibility = 'xxl' ;
  public downloadFileName = 'user-defined-name.pdf';


  public traditionalOptions: Array<ResponsiveVisibility> = [true, false, 'always-visible',  'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  public options: Array<ResponsiveVisibility> = [true, false, 'always-visible', 'always-in-secondary-menu', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  public withExplanation(option: ResponsiveVisibility) {
    if (option === true) {
      return 'true (uses the defaults)';
    } else if (option === false) {
      return 'false (hidden)';
    } else {
      return option;
    }
  }

  public get xs() {
    return PdfBreakpoints.xs;
  }

  public set xs(value: number) {
    PdfBreakpoints.xs = value;
  }

  public get sm() {
    return PdfBreakpoints.sm;
  }

  public set sm(value: number) {
    PdfBreakpoints.sm = value;
  }

  public get md() {
    return PdfBreakpoints.md;
  }

  public set md(value: number) {
    PdfBreakpoints.md = value;
  }


  public get lg() {
    return PdfBreakpoints.lg;
  }

  public set lg(value: number) {
    PdfBreakpoints.lg = value;
  }


  public get xl() {
    return PdfBreakpoints.xl;
  }

  public set xl(value: number) {
    PdfBreakpoints.xl = value;
  }

  public get xxl() {
    return PdfBreakpoints.xxl;
  }

  public set xxl(value: number) {
    PdfBreakpoints.xxl = value;
  }

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public settingsWidth = "60%";

  public codeWidth = "38%";

  private _currentTab = 0;

  public get currentTab(): number {
    return this._currentTab;
  }

  public set currentTab(tab: number) {
    this._currentTab = tab;
    if (this.currentTab===1 || this.currentTab === 2) {
      this.codeWidth = "0";
      this.settingsWidth = "100%";
      this.showToolbar = true;
      this.showSecondaryToolbarButton = true;
    } else {
      this.codeWidth = "38%";
      this.settingsWidth = "60%";
    }
  }

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
  [showTextEditor]="${this.showTextEditor}"
  [showZoomButtons]="${this.showZoomButtons}"
  [showPresentationModeButton]="${this.showPresentationModeButton}"
  [showOpenFileButton]="${this.showOpenFileButton}"
  [showPrintButton]="${this.showPrintButton}"
  [showDownloadButton]="${this.showDownloadButton}"
  [showSecondaryToolbarButton]="${this.showSecondaryToolbarButton}"
  [showRotateButton]="${this.showRotateButton}"
  [showHandToolButton]="${this.showHandToolButton}"
  [showScrollingButton]="${this.showScrollingButton}"
  [showSpreadButton]="${this.showSpreadButton}"
  [showPropertiesButton]="${this.showPropertiesButton}"
  height="250px" zoom="25%">
</ngx-extended-pdf-viewer>
`;
  }

  public get breakpoints(): string {
    return `
    @Component({ ... })
export class CustomBreakpointsComponent {
  constructor() {
    // these are the default values
    PdfBreakpoints.xs = ${this.xs}; // unit: pixels
    PdfBreakpoints.sm = ${this.sm};
    PdfBreakpoints.md = ${this.md};
    PdfBreakpoints.lg = ${this.lg};
    PdfBreakpoints.xl = ${this.xl};
    PdfBreakpoints.xxl = ${this.xxl};
  }
}`;
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
