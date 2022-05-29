import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PageRenderEvent } from 'ngx-extended-pdf-viewer/lib/events/page-render-event';
import { LogService } from '../../log.service';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComponent {
  // tslint:disable-next-line: variable-name
  public _selectedTab = 0;

  public page = 5;

  public pageLabel!: string;

  public showPdfViewer = true;

  public height: string = '95%';

  public time = 0;
  public currentTime = 0;

  private startTime = new Date().getTime();
  private currentStartTime = new Date().getTime();

  /** This attribute is only used on browser without localStorage (e.g. Brave on iOS) */
  private themeIfLocalStorageIsUnavailable = 'light';

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  public localStorageIsSupported() {
    try {
      if (localStorage) {
        return true;
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
    }
    return false;
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
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
    }
    return 0;
  }

  public set theme(theme: string) {
    try {
      if (theme !== this.theme && localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.theme', theme);
        location = location;
      } else {
        this.themeIfLocalStorageIsUnavailable = theme;
        location = location;
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
      this.themeIfLocalStorageIsUnavailable = theme;
      location = location;
    }
  }

  public get theme(): string {
    try {
      if (localStorage) {
        return localStorage.getItem('ngx-extended-pdf-viewer.theme') || 'light';
      } else {
        return this.themeIfLocalStorageIsUnavailable;
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
      return this.themeIfLocalStorageIsUnavailable;
    }
  }

  constructor(public logService: LogService, private pdfService: NgxExtendedPdfViewerService) {
    this.startTime = new Date().getTime();
  }

  public onUpdateFindResult(event: any): void {
    console.log('UpdateFindResult ' + event.matches);
  }

  public async getDiv(): Promise<void> {
    await this.getDivAtPosition(8, 20);
  }

  public async getDivAtPosition(page: number, position: number): Promise<void> {
    const PDFViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;

    if (!PDFViewerApplication.pdfViewer._pages[page].textLayer) {
      await PDFViewerApplication.pdfViewer._pages[page].draw();
    } else {
      const textLayer = PDFViewerApplication.pdfViewer._pages[page].textLayer;
      const divs = textLayer.textDivs;
      const textSnippets = textLayer.textContentItemsStr;
    }
  }

  public onPageRender(): void {
    this.currentStartTime = new Date().getTime();
  }

  public onPageRendered(event: PageRenderEvent): void {
    const endTime = new Date().getTime();
    if (event.pageNumber === 5 && this.time === 0) {
      this.time = endTime - this.startTime;
    }
    this.currentTime = endTime - this.currentStartTime;
  }
}
