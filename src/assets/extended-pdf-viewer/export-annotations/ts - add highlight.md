```typescript
import { NgxExtendedPdfViewerService, HighlightEditorAnnotation } from 'ngx-extended-pdf-viewer';

export class MyComponent {
  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  async addHighlight() {
    // Coordinates in PDF points (origin = bottom-left of page)
    const left = 100;
    const bottom = 500;
    const right = 350;
    const top = 515;

    // quadPoints in Adobe Acrobat format: tL, tR, bL, bR
    const quadPoints = [
      left, top,      // top-left
      right, top,     // top-right
      left, bottom,   // bottom-left
      right, bottom,  // bottom-right
    ];

    const highlight: HighlightEditorAnnotation = {
      annotationType: 9,
      color: [255, 255, 0],   // Yellow
      opacity: 0.5,
      thickness: 10,
      quadPoints,
      pageIndex: 0,
      rect: [left, bottom, right, top],
      rotation: 0,
    };

    await this.pdfViewerService.addEditorAnnotation(highlight);
  }
}
```
