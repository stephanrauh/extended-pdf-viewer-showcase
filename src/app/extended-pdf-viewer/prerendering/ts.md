```typescript
 @Component({ ... })
export class PrerenderingComponent {
  public spreadMode: 'off' | 'even' | 'odd' = 'off';

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  public onPageRendered(): void {
    if (!this.pdfViewerService.isRenderQueueEmpty()) {
      // try again later when the pages requested by the pdf.js core or the user have been rendered
      setTimeout(() => this.onPageRendered(), 100);
    }

    const pagesBefore = this.spreadMode === 'off' ? 2 : 2;
    const pagesAfter = this.spreadMode === 'off' ? 2 : 5;
    let startPage = Math.max(this.page - pagesBefore, 1);
    let endPage = Math.min(this.page  + pagesAfter, this.pdfViewerService.numberOfPages());

    const renderedPages = this.pdfViewerService.currentlyRenderedPages();

    for (let page = startPage; page <= endPage; page++) {
      const pageIndex = page - 1;
      if (this.pdfViewerService.hasPageBeenRendered(pageIndex)) {
          this.pdfViewerService.addPageToRenderQueue(pageIndex);
          break; // break because you can request only one page at a time
      }
    }
  }
}

```
