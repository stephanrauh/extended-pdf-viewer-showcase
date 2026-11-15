```typescript
constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  public blob: Blob | undefined;

  // Version 32, bleeding edge only: false, true or 'non-forms'
  public flatten: boolean | 'non-forms' = false;

  public async export(): Promise<void> {
    this.selectedTabIndex = 2;
    this.blob = await this.pdfViewerService.getCurrentDocumentAsBlob({ flatten: this.flatten });
  }
}
```
