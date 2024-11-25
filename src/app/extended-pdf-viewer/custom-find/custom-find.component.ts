import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { FindOptions, FindResultMatchesCount, IPDFViewerApplication, pdfDefaultOptions, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { MyCustomFindController } from './my-custom-find-controller';

interface CustomFindOptions extends FindOptions {
  matchRegex: boolean;
}

@Component({
standalone: false,
  selector: 'app-custom-find',
  templateUrl: './custom-find.component.html',
  styleUrls: ['./custom-find.component.scss'],
})
export class CustomFindComponent {
  public searchtext = '(?<=\\s)([A-z]+ough)';
  findOptions: CustomFindOptions = {
    highlightAll: true,
    matchCase: false,
    wholeWords: false,
    matchDiacritics: false,
    matchRegex: true,
  };

  public currentMatchNumber: number | undefined;
  public totalMatches: number | undefined;



  private pdfViewerApplication: IPDFViewerApplication | undefined;

  private originalConvertToRegExpString: any;

  public currentTab=0;


  constructor(private readonly cdr: ChangeDetectorRef,  public notificationService: PDFNotificationService) {
    pdfDefaultOptions.findController = MyCustomFindController;
    effect(() => {
      this.pdfViewerApplication = notificationService.onPDFJSInitSignal();
    });
   }

  public pdfLoaded(): void {
    this.overideFindFeature();
  }

  public ngOnDestroy(): void {
    this.restoreFindFeature();
  }

  public findRegex(): void {
    this.dispatchFind('find');
  }

  public findNext(): void {
    this.dispatchFind('again', false);
  }

  public findPrevious(): void {
    this.dispatchFind('again', true);
  }

  public onUpdateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
  }

  private overideFindFeature() {
    if (!this.pdfViewerApplication) {
      console.error("PDF Viewer Application is not initialized");
      return;
    }
    const findController = this.pdfViewerApplication.findController as any;

    this.originalConvertToRegExpString = findController._convertToRegExpString;
    findController._convertToRegExpString = (query: string, ...args: any[]) => {
      const { matchRegex } = findController.state;

      if (!matchRegex) return this.originalConvertToRegExpString.call(findController, query, ...args);
      return [false, query];
    };
  }

  private restoreFindFeature() {
    if (this.originalConvertToRegExpString) {
      if (this.pdfViewerApplication) {
      const findController = this.pdfViewerApplication.findController as any;
      findController._convertToRegExpString = this.originalConvertToRegExpString;
      }
    }
  }

  private dispatchFind(type: string, findPrevious = false): void {
    this.pdfViewerApplication?.eventBus.dispatch('find', {
      ...this.findOptions,
      query: this.searchtext,
      type,
      findPrevious,
      source: undefined
    });
  }
}
