import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { IPDFViewerApplication, NgxExtendedPdfViewerService, pdfDefaultOptions, PDFNotificationService, RenderedTextLayerHighlights } from 'ngx-extended-pdf-viewer';
import { FindState, FindResultMatchesCount } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css'],
})
export class FindComponent {
  // tslint:disable-next-line:variable-name
  public _searchtext = '';

  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public matchDiacritics = false;

  public multiple = false;

  public matchRegExp = false;

  public _searchtext2 = 'Portuguese';

  public highlightAll2 = false;
  public matchCase2 = false;
  public wholeWord2 = false;
  public matchDiacritics2 = false;

  public multiple2 = false;

  public matchRegExp2 = false;

  public currentMatchNumber: number | undefined;

  public totalMatches: number | undefined;

  public findState: FindState | undefined;

  private _fullscreen = false;

  private _selectedTab: number = 0;
  private PDFViewerApplication!: IPDFViewerApplication;
  public dontScrollIntoView: boolean | undefined;
  public dontScrollIntoView2: boolean | undefined;

  public pagesWithResult: Array<number> = [];

  public get selectedTab(): number {
    return this._selectedTab;
  }

  public set selectedTab(tab) {
    this._selectedTab = tab;
    if (tab === 1) {
        this._searchtext = "Brazilian";
        this.highlightAll = true;
        const promises = this.find() as Array<Promise<number>>;

        // delay the second search to make sure the first search has scrolled to the first result
        const wrappedPromises = promises.map(p =>
          p.then(result => result > 0 ? result : Promise.reject())
        );
        ((async () => {
        await Promise.any(wrappedPromises);
        this._searchtext2 = "Portuguese";
        this.highlightAll2 = true;
        this.find2();
        }))();
    } else {
      this._searchtext2 = "";
      this.highlightAll2 = false;
      this.find2();
    }
  }

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
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

  public get searchtext2(): string {
    return this._searchtext2;
  }

  public set searchtext2(text: string) {
    this._searchtext2 = text;
    this.find2();
  }

  private find(): Array<Promise<number>> | undefined {
    this.pagesWithResult = [];
    if (!this._searchtext) {
      this.findState = undefined;
      this.currentMatchNumber = undefined;
      this.totalMatches = undefined;
    }
    let searchtext = this.multiple ? this._searchtext.split(' ') : this._searchtext;
    const numberOfResultsPromises = this.ngxExtendedPdfViewerService.find(searchtext, {
      highlightAll: this.highlightAll,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      matchDiacritics: this.matchDiacritics,
      dontScrollIntoView: this.dontScrollIntoView,
      useSecondaryFindcontroller: false,
      findMultiple: this.multiple,
      regexp: this.matchRegExp
    });
    numberOfResultsPromises?.forEach(async (numberOfResultsPromise, pageIndex) => {
      const numberOfResultsPerPage = await numberOfResultsPromise;
      if (numberOfResultsPerPage > 0) {
        this.pagesWithResult.push(pageIndex);
      }
    });
    return numberOfResultsPromises;
  }

  private find2(): Array<Promise<number>> | undefined {
    this.pagesWithResult = [];
    if (!this._searchtext2) {
      this.findState = undefined;
      this.currentMatchNumber = undefined;
      this.totalMatches = undefined;
    }
    const numberOfResultsPromises = this.ngxExtendedPdfViewerService.find(this._searchtext2, {
      highlightAll: this.highlightAll2,
      matchCase: this.matchCase2,
      wholeWords: this.wholeWord2,
      matchDiacritics: this.matchDiacritics2,
      dontScrollIntoView: this.dontScrollIntoView2,
      useSecondaryFindcontroller: true,
      findMultiple: this.multiple2,
      regexp: this.matchRegExp2
    });
    numberOfResultsPromises?.forEach(async (numberOfResultsPromise, pageIndex) => {
      const numberOfResultsPerPage = await numberOfResultsPromise;
      if (numberOfResultsPerPage > 0) {
        this.pagesWithResult.push(pageIndex);
      }
    });
    return numberOfResultsPromises;
  }

  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService, private cdr: ChangeDetectorRef,
    notificationService: PDFNotificationService
  ) {
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
      this.PDFViewerApplication?.eventBus?.on('renderedtextlayerhighlights', (event: RenderedTextLayerHighlights) => {
        event.highlights.forEach((highlight) => {
          highlight.style.border = '2px solid black';
        });
      });
    });
  }

  public updateFindState(result: FindState) {
    this.findState = result;
  }

  public updateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
  }

  public onCheckboxClicked() {
    let searchtext = this.multiple ? this._searchtext.split(' ') : this._searchtext;
    this.ngxExtendedPdfViewerService.find(searchtext, {
      highlightAll: this.highlightAll,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      matchDiacritics: this.matchDiacritics,
      findMultiple: this.multiple,
      regexp: this.matchRegExp,
      dontScrollIntoView: this.dontScrollIntoView,
      useSecondaryFindcontroller: false
    });
  }

  public onCheckboxClicked2() {
    this.ngxExtendedPdfViewerService.find(this._searchtext2, {
      highlightAll: this.highlightAll2,
      matchCase: this.matchCase2,
      wholeWords: this.wholeWord2,
      matchDiacritics: this.matchDiacritics2,
      findMultiple: this.multiple2,
      regexp: this.matchRegExp2,
      dontScrollIntoView: this.dontScrollIntoView2,
      useSecondaryFindcontroller: true
    });
  }


  public findNext(useSecondaryFindcontroller: boolean): void {
    this.ngxExtendedPdfViewerService.findNext(useSecondaryFindcontroller);
  }

  public findPrevious(useSecondaryFindcontroller: boolean): void {
    this.ngxExtendedPdfViewerService.findPrevious(useSecondaryFindcontroller);
  }
}
