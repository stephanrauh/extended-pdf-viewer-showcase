import { Component } from '@angular/core';
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

  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;
  public multipleSearchTerms = false;

  public currentMatchNumber: number;

  public totalMatches: number;

  public findState: FindState;

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
          matchCase: this.matchCase,
          wholeWords: this.wholeWord,
          ignoreAccents: this.ignoreAccents
        }
      );
    } else {
      if (
        this.ngxExtendedPdfViewerService.find(this._searchtext, {
          highlightAll: this.highlightAll,
          matchCase: this.matchCase,
          wholeWords: this.wholeWord,
          ignoreAccents: this.ignoreAccents
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
    private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService
  ) {}

  public updateFindState(result: FindState) {
    this.findState = result;
  }

  public updateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
  }

  public onCheckboxClicked() {
    this.ngxExtendedPdfViewerService.find(this._searchtext, {
      highlightAll: this.highlightAll,
      matchCase: this.matchCase,
      wholeWords: this.wholeWord,
      ignoreAccents: this.ignoreAccents
    });
  }

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }
}
