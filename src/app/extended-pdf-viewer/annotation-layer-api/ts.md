```typescript
  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async addImage(): Promise<void> {
    const { left, bottom, right, top, rotation } = parameters;
    await this.pdfService.addImageToAnnotationLayer({
      urlOrDataUrl: 'assets/images/ChatGPT-PDF-Viewer-Logo.jpg',
      page: 11,       // optional parameter
      left: 0,        // default value: 0
      bottom: '0%',   // default value: 0
      right: '100%',  // default value: 100%
      top: '100%',    // default value: 100%
      rotation: 270   // default value: 0
    });
  }
```
