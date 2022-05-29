import { ChangeDetectorRef, Component } from '@angular/core';
import { FindOptions, IPDFViewerApplication, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { FindState, FindResultMatchesCount } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css'],
})
export class FindComponent {
  // tslint:disable-next-line:variable-name
  public _searchtext = '';
  public _searchtext2 = '';
  public _searchtext3 = '';

  public fuzzy = false;
  public highlightAll = false;
  public currentPage = false;
  private _pageRange = '';
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;
  public multipleSearchTerms = false;

  public currentMatchNumber: number | undefined;

  public totalMatches: number | undefined;

  public findState: FindState | undefined;

  private _fullscreen = false;

  private _selectedTab: number = 0;

  public get selectedTab(): number {
    return this._selectedTab;
  }

  public set selectedTab(tab) {
    this._selectedTab = tab;
    if (tab !== 1) {
      this.resetFindResult();
    }
  }

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.ngxExtendedPdfViewerService.recalculateSize());
  }

  public get pageRange(): string {
    return this._pageRange;
  }

  public set pageRange(pageRange: string) {
    this._pageRange = pageRange;
    this.find();
  }

  public get findStateText(): string {
    switch (this.findState) {
      case FindState.FOUND:
        return 'found';
      case FindState.NOT_FOUND:
        return 'not found';
      case FindState.PENDING:
        return 'pending';
      case FindState.WRAPPED:
        return 'wrapped';
    }
    return '';
  }

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
    this._searchtext = text;
    this.find();
  }

  private find() {
    if (!this._searchtext) {
      this.findState = undefined;
      this.currentMatchNumber = undefined;
      this.totalMatches = undefined;
    }
    if (this.multipleSearchTerms) {
      this.ngxExtendedPdfViewerService.findMultiple([this._searchtext, this.searchtext2, this._searchtext3], {
        highlightAll: this.highlightAll,
        currentPage: this.currentPage,
        matchCase: this.matchCase,
        wholeWords: this.wholeWord,
        ignoreAccents: this.ignoreAccents,
        fuzzySearch: this.fuzzy,
        pageRange: this.pageRange,
        findMultipleSearchTexts: this.multipleSearchTerms
      } as FindOptions);
    } else {
        this.ngxExtendedPdfViewerService.find(this._searchtext, {
          highlightAll: this.highlightAll,
          currentPage: this.currentPage,
          matchCase: this.matchCase,
          wholeWords: this.wholeWord,
          ignoreAccents: this.ignoreAccents,
          fuzzySearch: this.fuzzy,
          pageRange: this.pageRange,
          findMultipleSearchTexts: this.multipleSearchTerms
        })
    }
  }

  public get searchtext2(): string {
    return this._searchtext2;
  }

  public set searchtext2(text: string) {
    this._searchtext2 = text;
    this.find();
  }
  public get searchtext3(): string {
    return this._searchtext3;
  }

  public set searchtext3(text: string) {
    this._searchtext3 = text;
    this.find();
  }

  public isLocalhost = isLocalhost();

  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService, private cdr: ChangeDetectorRef) {}

  public updateFindState(result: FindState) {
    this.findState = result;
  }

  public updateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
    if (this._selectedTab === 1) {
      this.onUpdateFindResult(result);
    }
  }

  public onCheckboxClicked() {
    this.ngxExtendedPdfViewerService.find(this._searchtext, {
      highlightAll: this.highlightAll,
      currentPage: this.currentPage,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      ignoreAccents: this.ignoreAccents,
      fuzzySearch: this.fuzzy,
      pageRange: this.pageRange,
      findMultipleSearchTexts: this.multipleSearchTerms
    });
  }

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }

  public resetFindResult(): void {
    const allSpans = document.querySelectorAll('.textLayer > span') as NodeList;
    allSpans.forEach((span, index) => {
      (span as HTMLElement).classList.remove('fade-out');
    });
  }

  public onUpdateFindResult(event: FindResultMatchesCount): void {
    const PDFViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
    const matchIndexes = event.matches as Array<Array<number>>;
    const matchesLengths = event.matchesLength as Array<Array<number>>;
    const matchesColors = event.matchesColor as Array<Array<number>>;

    setTimeout(() => {
      matchIndexes.forEach((findings, page) => {
        if (findings?.length > 0) {
          const currentPage = PDFViewerApplication.pdfViewer._pages[page];
          if (currentPage.textHighlighter.textDivs) {
            if (page && matchesLengths[page][0] > 0) {
              const converted = currentPage.textHighlighter._convertMatches([matchIndexes[page]], [matchesLengths[page]], [matchesColors[page]]) as Array<any>;
              const allSpans = currentPage.div.querySelectorAll('.textLayer > span') as NodeList;
              allSpans.forEach((span, index) => {
                if (converted.some((highlight) => index >= highlight.begin.divIdx && index <= highlight.end.divIdx)) {
                  (span as HTMLElement).classList.remove('fade-out');
                } else {
                  (span as HTMLElement).classList.add('fade-out');
                }
              });
            }
          }
        }
      });
    }, 200);
  }
}
