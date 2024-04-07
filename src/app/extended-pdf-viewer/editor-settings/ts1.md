```typescript
  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  public set editorFontSize(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorFontSize = Number(target?.value);
  }

  public set editorFontColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorFontColor = target?.value;
  }

  public set editorInkColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorInkColor = target?.value;
  }
```
