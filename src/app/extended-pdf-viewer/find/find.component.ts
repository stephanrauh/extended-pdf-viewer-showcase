import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { FindOptions, IPDFViewerApplication, NgxExtendedPdfViewerService, PDFNotificationService } from 'ngx-extended-pdf-viewer';
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

  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public matchDiacritics = false;

  public currentMatchNumber: number | undefined;

  public totalMatches: number | undefined;

  public findState: FindState | undefined;

  private _fullscreen = false;

  private _selectedTab: number = 0;
  private PDFViewerApplication!: IPDFViewerApplication;

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
    this.ngxExtendedPdfViewerService.find(this._searchtext, {
      highlightAll: this.highlightAll,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      matchDiacritics: this.matchDiacritics,
    });
  }



  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService, private cdr: ChangeDetectorRef,
    notificationService: PDFNotificationService
  ) {
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

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
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      matchDiacritics: this.matchDiacritics,
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
    allSpans.forEach((span) => {
      (span as HTMLElement).classList.remove('fade-out');
    });
  }

  private onUpdateFindResult(event: FindResultMatchesCount): void {
    const matchIndexes = event.matches as Array<Array<number>>;
    const matchesLengths = event.matchesLength as Array<Array<number>>;

    setTimeout(() => {
      matchIndexes.forEach((findings, page) => {
        if (findings?.length > 0) {
          const currentPage = this.PDFViewerApplication.pdfViewer._pages[page];
          if (currentPage.textHighlighter.textDivs) {
            if (page && matchesLengths[page][0] > 0) {
              const converted = currentPage.textHighlighter._convertMatches([matchIndexes[page]], [matchesLengths[page]]) as Array<any>;
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
