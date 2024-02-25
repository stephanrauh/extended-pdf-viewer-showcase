```typescript
  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async addImage(): Promise<void> {
    await this.pdfService.addImageToAnnotationLayer('assets/images/ChatGPT-PDF-Viewer-Logo.jpg', 11, 0, 0, 50, 50, 0);
  }
```
