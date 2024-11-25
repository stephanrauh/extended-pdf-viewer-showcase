```typescript
@Component({
standalone: false,  ... })
export class FindComponent {
  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;
  public multiple = false;
  public matchRegExp = false;

  public _searchtext = '';

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

  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService) {}

  public onCheckboxClicked() {
    this.ngxExtendedPdfViewerService.find(this._searchtext, this.highlightAll, this.matchCase, this.wholeWord, this.ignoreAccents);
  }

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }

  public updateFindState(result: FindState) {
    this.findState = result;
  }

  public updateFindMatchesCount(result: FindResultMatchesCount) {
    this.currentMatchNumber = result.current;
    this.totalMatches = result.total;
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
}
```
