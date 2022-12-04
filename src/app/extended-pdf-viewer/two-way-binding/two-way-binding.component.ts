import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxExtendedPdfViewerService, ScrollModeType } from 'ngx-extended-pdf-viewer';
import { PdfSidebarView } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-two-way-binding',
  templateUrl: './two-way-binding.component.html',
  styleUrls: ['./two-way-binding.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoWayBindingComponent {
  // tslint:disable-next-line: variable-name
  public _selectedTab = 0;

  public handTool = true;

  public page = 5;

  public pageLabel!: string;

  public rotation: 0 | 90 | 180 | 270 = 0;

  public scrollMode: ScrollModeType = ScrollModeType.vertical;

  public sidebarVisible = true;

  public activeSidebarView: PdfSidebarView = PdfSidebarView.THUMBS;

  public src = './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';

  public spread: 'off' | 'even' | 'odd' = 'off';

  public zoom: number | string = 'auto';

  public currentZoomFactor!: number;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  public set selectedTab(index: number) {
    try {
      if (localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.simple.selectedTab', String(index));
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
    }
  }

  public get selectedTab(): number {
    try {
      if (localStorage) {
        return Number(localStorage.getItem('ngx-extended-pdf-viewer.simple.selectedTab')) || 0;
      }
      return 0;
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
      return 0;
    }
  }

  public load(file: string): void {
    const view = this.activeSidebarView;
    this.src=file;
    // loading a file resets the default view
    setTimeout(() => this.activeSidebarView = view, 150);
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
