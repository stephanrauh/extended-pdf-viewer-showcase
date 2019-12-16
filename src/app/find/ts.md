```typescript
@Component({ ... })
export class FindComponent {
  public highlightAll = false;
  public matchCase = false;
  public wholeWord = false;
  public ignoreAccents = false;

  public _searchtext = '';

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
     if (this.ngxExtendedPdfViewerService.find(
              text,
              { highlightAll: this.highlightAll,
                matchCase: this.matchCase,
                wholeWords: this.wholeWord,
                ignoreAccents: this.ignoreAccents})) {
      this._searchtext = text;
    }
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
}
```
