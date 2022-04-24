```typescript
@Component({ ... })
export class ScrollingComponent {
  constructor(private pdfService: NgxExtendedPdfViewerService) { }

  public scroll(pageNumber: number, top: number | string): void {
    this.pdfService.scrollPageIntoView(pageNumber, {top});
  }
}
```
