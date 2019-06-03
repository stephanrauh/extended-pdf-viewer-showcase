```typescript
@Component({ ... })
export class FindComponent {
  public _searchtext = '';

  public get searchtext(): string {
    return this._searchtext;
  }

  public set searchtext(text: string) {
    if (this.ngxExtendedPdfViewerService.find(text)) {
      this._searchtext = text;
    }
  }

  constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService) {}

  public findNext(): void {
    this.ngxExtendedPdfViewerService.findNext();
  }

  public findPrevious(): void {
    this.ngxExtendedPdfViewerService.findPrevious();
  }
}
```
