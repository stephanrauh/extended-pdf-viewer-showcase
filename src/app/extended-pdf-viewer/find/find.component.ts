import { ChangeDetectorRef, Component } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { FindState, FindResultMatchesCount } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css']
})
export class FindComponent {
  // tslint:disable-next-line:variable-name
  public _searchtext = '';
  public _searchtext2 = '';
  public _searchtext3 = '';

  public fuzzy = false;
  public highlightAll = false;
  public currentPage = false;
  private _pageRange = "";
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;
  public multipleSearchTerms = false;

  public currentMatchNumber: number | undefined;

  public totalMatches: number | undefined;

  public findState: FindState | undefined;

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
    return "";
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
      this.ngxExtendedPdfViewerService.findMultiple(
        [this._searchtext, this.searchtext2, this._searchtext3],
        {
          highlightAll: this.highlightAll,
          currentPage: this.currentPage,
          matchCase: this.matchCase,
          wholeWords: this.wholeWord,
          ignoreAccents: this.ignoreAccents,
          fuzzySearch: this.fuzzy,
          pageRange: this.pageRange
        }
      );
    } else {
      if (
        this.ngxExtendedPdfViewerService.find(this._searchtext, {
          highlightAll: this.highlightAll,
          currentPage: this.currentPage,
          matchCase: this.matchCase,
          wholeWords: this.wholeWord,
          ignoreAccents: this.ignoreAccents,
          fuzzySearch: this.fuzzy,
          pageRange: this.pageRange
        })
      ) {
      }
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

  constructor(
    private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService, private cdr: ChangeDetectorRef
  ) {}

  public updateFindState(result: FindState) {
    this.findState = result;
  }

  public updateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
    this.cdr.detectChanges();
  }

  public onCheckboxClicked() {
    this.ngxExtendedPdfViewerService.find(this._searchtext, {
      highlightAll: this.highlightAll,
      currentPage: this.currentPage,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      ignoreAccents: this.ignoreAccents,
      fuzzySearch: this.fuzzy,
      pageRange: this.pageRange
    });
  }

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }
}
