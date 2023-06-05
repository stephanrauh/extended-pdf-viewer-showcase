```typescript

public extractedText: string | undefined;

public extractedLines: Array<string> = [];

constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

public async exportAsText(): Promise<void> {
  this.selectedTabIndex = 3;
  this.extractedLines = [];
  this.extractedText = await this.pdfViewerService.getPageAsText(1);
}

public async exportAsLines(): Promise<void> {
  const lines = await this.pdfViewerService.getPageAsLines(1);
  this.extractedText = undefined;
  this.extractedLines = lines.map(line => line.text);
  console.log(lines);
}
```
