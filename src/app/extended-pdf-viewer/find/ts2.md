```typescript
constructor(private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService, 
  notificationService: PDFNotificationService
) {
  effect(() => {
    this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    this.PDFViewerApplication?.eventBus?.on('renderedtextlayerhighlights', (event: RenderedTextLayerHighlights) => {
      event.highlights.forEach((highlight) => {
        highlight.style.border = '2px solid black';
      });
    });
  });
}
```
