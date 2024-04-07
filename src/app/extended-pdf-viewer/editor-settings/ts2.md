```typescript
  public set editorInkOpacity(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorInkOpacity = Number(target?.value);
  }

  public set editorInkThickness(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorInkThickness = Number(target?.value);
  }

  public set editorHighlightColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightColor = target?.value;
  }

  public set editorHighlightDefaultColor(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightDefaultColor = target?.value;
  }

  public set editorHighlightShowAll(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightShowAll = target.value == 'true';
  }

  public set editorHighlightThickness(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pdfViewerService.editorHighlightThickness = Number(target?.value);
  }
```
