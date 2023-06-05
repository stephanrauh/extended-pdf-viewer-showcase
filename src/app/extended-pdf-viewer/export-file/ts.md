```typescript
constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  public blob: Blob | undefined;
  
  public async export(): Promise<void> {
    this.selectedTabIndex = 2;
    this.blob = await this.pdfViewerService.export();
  }
}
```
