```typescript
  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  public async addHighlight(): Promise<void> {
    await this.pdfService.addHighlightToAnnotationLayer(
      [255, 255, 0],  // color: yellow RGB array
      11,             // page: page number (0-based)
                      // the origin of the coordinate system is bottom-left 
                      // i.e. (0, 0) is the bottom-most left point of the PDF page
      '20%',          // left: left position
      '60',          // bottom: bottom position in PDF coordinates (varies between documents!)
      '80px',          // right: right position in screen coordinate (these are real screen coordinates - zooming messes with your coordinates!)
      '70%',          // top: top position
      undefined,      // thickness: optional line thickness (defaults to 12)
      0,              // rotation: optional rotation in degrees (defaults to 0)
      0.5             // opacity: optional opacity (0.0 to 1.0) (defaults to 0.5)
    );
  }
```
