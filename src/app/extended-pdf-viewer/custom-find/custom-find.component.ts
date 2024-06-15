import { ChangeDetectorRef, Component } from '@angular/core';
import { FindOptions, FindResultMatchesCount, IPDFViewerApplication, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

interface CustomFindOptions extends FindOptions {
  matchRegex: boolean;
}

@Component({
  selector: 'app-custom-find',
  templateUrl: './custom-find.component.html',
  styleUrls: ['./custom-find.component.scss'],
})
export class CustomFindComponent {
  searchtext = '(?<=\\s)([A-z]+ough)';
  findOptions: CustomFindOptions = {
    highlightAll: true,
    matchCase: false,
    wholeWords: false,
    matchDiacritics: false,
    matchRegex: true,
  };

  currentMatchNumber: number | undefined;
  totalMatches: number | undefined;

  public isLocalhost = isLocalhost();

  private originalConvertToRegExpString: any;

  get pdfViewerApplication(): IPDFViewerApplication {
    return (window as any).PDFViewerApplication;
  }

  constructor(private readonly cdr: ChangeDetectorRef) {  }

  pdfLoaded() {
    this.overideFindFeature();
  }

  ngOnDestroy() {
    this.restoreFindFeature();
  }

  findRegex() {
    this.dispatchFind('find');
  }

  findNext(): void {
    this.dispatchFind('again', false);
  }

  findPrevious(): void {
    this.dispatchFind('again', true);
  }

  public onUpdateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
  }

  private overideFindFeature() {
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
      const findController = this.pdfViewerApplication.findController as any;
      findController._convertToRegExpString = this.originalConvertToRegExpString;
    }
  }

  private dispatchFind(type: string, findPrevious = false): void {
    this.pdfViewerApplication.eventBus.dispatch('find', {
      ...this.findOptions,
      query: this.searchtext,
      type,
      findPrevious,
      source: undefined
    });
  }
}
