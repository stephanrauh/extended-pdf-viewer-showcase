import { ChangeDetectionStrategy, Component, effect, OnDestroy } from '@angular/core';
import { PageRenderEvent, IPDFViewerApplication, pdfDefaultOptions, PDFNotificationService, PagesLoadedEvent, PdfLoadedEvent } from 'ngx-extended-pdf-viewer';
import { LogService } from '../../log.service';

@Component({
standalone: false,
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComponent implements OnDestroy {
   public _selectedTab = 0;

  public page = 5;

  public pageLabel!: string;

  public showPdfViewer = true;

  public height = 'auto';

  public get minifiedJSLibraries() {
    try {
      if (localStorage) {
        return localStorage.getItem('ngx-extended-pdf-viewer.simple.minifiedJSLibraries') === 'true' ;
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
    return false;
  }
  public set minifiedJSLibraries(value) {
    try {
      if (localStorage) {
        const change = value !== this.minifiedJSLibraries;
        localStorage.setItem('ngx-extended-pdf-viewer.simple.minifiedJSLibraries', String(value));
        if (change) {
          location = location;
        }
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }


  public get forceUsingLegacyES5() {
    if (this.minifiedJSLibraries) {
      return false;
    }
    try {
      if (localStorage) {
        return localStorage.getItem('ngx-extended-pdf-viewer.simple.ES5') === 'true'
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
    return false;
  }
  public set forceUsingLegacyES5(value) {
    try {
      if (localStorage) {
        const change = value !== this.forceUsingLegacyES5;
        localStorage.setItem('ngx-extended-pdf-viewer.simple.ES5', String(value));
        if (change) {
          location = location;
        }
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }

  public time = 0;
  public currentTime = 0;

  private startTime = new Date().getTime();
  private currentStartTime = new Date().getTime();

  /** This attribute is only used on browser without localStorage (e.g. Brave on iOS) */
  private themeIfLocalStorageIsUnavailable = 'light';

  private _fullscreen = false;
  private PDFViewerApplication?: IPDFViewerApplication;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  public localStorageIsSupported() {
    try {
      if (localStorage) {
        return true;
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
    return false;
  }

  public set selectedTab(index: number) {
    try {
      if (localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.simple.selectedTab', String(index));
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }

  public get selectedTab(): number {
    try {
      if (localStorage) {
        return Number(localStorage.getItem('ngx-extended-pdf-viewer.simple.selectedTab')) || 0;
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
    return 0;
  }

  public set theme(theme: string) {
    try {
      if (theme !== this.theme && localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.theme', theme);
        // eslint-disable-next-line no-self-assign
        location = location;
      } else {
        this.themeIfLocalStorageIsUnavailable = theme;
        // eslint-disable-next-line no-self-assign
        location = location;
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
      this.themeIfLocalStorageIsUnavailable = theme;
      // eslint-disable-next-line no-self-assign
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
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
      return this.themeIfLocalStorageIsUnavailable;
    }
  }

  constructor(public logService: LogService, notificationService: PDFNotificationService) {

    this.startTime = new Date().getTime();

    // increase the range chunk size for testing purposes
    // In general, that's not a good idea, but if you know what you're doing, you may
    // be able to tweak performance by fine-tuning the range chunk size according to the
    // needs of your application and infrastructure
    pdfDefaultOptions.rangeChunkSize=1024*256;
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public onUpdateFindResult(event: any): void {
    console.log('UpdateFindResult ' + event.matches);
  }

  public async getDiv(): Promise<void> {
    await this.getDivAtPosition(8, 20);
  }

  public async getDivAtPosition(page: number, position: number): Promise<void> {
    if (!this.PDFViewerApplication) {
      return;
    }
    if (!this.PDFViewerApplication.pdfViewer._pages[page].textLayer) {
      await this.PDFViewerApplication.pdfViewer._pages[page].draw();
    } else {
      // const textLayer = this.PDFViewerApplication.pdfViewer._pages[page].textLayer;
      // const divs = textLayer?.textDivs;
      // const textSnippets = textLayer?.textContentItemsStr;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onPageRender(event: PageRenderEvent): void {
    this.currentStartTime = new Date().getTime();
  }

  public onPageLoaded(event: unknown): void {
    console.log("Page Load", event);
  }

  public onPdfLoaded(event: PdfLoadedEvent): void {
    console.log("Loaded", event);
  }

  public onPageRendered(event: PageRenderEvent): void {
    const endTime = new Date().getTime();
    if (event.pageNumber === 5 && this.time === 0) {
      this.time = endTime - this.startTime;
    }
    this.currentTime = endTime - this.currentStartTime;
    console.log("Rendered", event);
  }

  public ngOnDestroy() {
    pdfDefaultOptions.rangeChunkSize = 64 * 1024; // restore the default value
  }
}
