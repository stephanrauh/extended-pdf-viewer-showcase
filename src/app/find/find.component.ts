import { Component, OnInit } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css']
})
export class FindComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  public _searchtext = '';

  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
    if (this.ngxExtendedPdfViewerService.find(text,
      { highlightAll: this.highlightAll,
        matchCase: this.matchCase,
        wholeWords: this.wholeWord,
        ignoreAccents: this.ignoreAccents})) {
      this._searchtext = text;
    }
  }

  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService) {}

  ngOnInit() {}

  public onCheckboxClicked() {
    this.ngxExtendedPdfViewerService.find(this._searchtext,
      { highlightAll: this.highlightAll,
        matchCase: this.matchCase,
        wholeWords: this.wholeWord,
        ignoreAccents: this.ignoreAccents});
  }

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }
}
