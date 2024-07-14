```typescript
constructor(notificationService: PDFNotificationService) {
  effect(() => {
    this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
  });
}
...
public onUpdateFindResult(event: FindResultMatchesCount): void {
  const matchIndexes = event.matches as Array<Array<number>>;
  const matchesLengths = event.matchesLength as Array<Array<number>>;
  const matchesColors = event.matchesColor as Array<Array<number>>;

  setTimeout(() => {
    matchIndexes.forEach((findings, page) => {
      if (findings?.length > 0) {
        const currentPage = this.PDFViewerApplication.pdfViewer._pages[page];
        if (currentPage.textHighlighter.textDivs) {
          if (page && matchesLengths[page][0] > 0) {
            const converted = currentPage.textHighlighter._convertMatches([matchIndexes[page]], [matchesLengths[page]], [matchesColors[page]]) as Array<any>;
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
```
