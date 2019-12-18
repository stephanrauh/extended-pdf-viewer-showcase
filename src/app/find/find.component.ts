import { Component} from '@angular/core';
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

  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;

  public currentMatchNumber: number;

  public totalMatches: number;

  public findState: FindState;

  public get findStateText(): string {
    switch (this.findState) {
      case FindState.FOUND: return 'found';
      case FindState.NOT_FOUND: return 'not found';
      case FindState.PENDING: return 'pending';
      case FindState.WRAPPED: return 'wrapped';
    }
  }

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
    if (
      this.ngxExtendedPdfViewerService.find(text, {
        highlightAll: this.highlightAll,
        matchCase: this.matchCase,
        wholeWords: this.wholeWord,
        ignoreAccents: this.ignoreAccents,
      })
    ) {
      this._searchtext = text;
    }
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
