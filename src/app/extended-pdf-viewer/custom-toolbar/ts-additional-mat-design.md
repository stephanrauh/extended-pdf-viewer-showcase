The `exportAsImage()` method uses `NgxExtendedPdfViewerService.getPageAsImage()` to render the current page as an image and open it in a new tab:

```typescript
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

export class MyComponent {
  private pdfViewerService = inject(NgxExtendedPdfViewerService);

  public exportAsImage(): void {
    (async () => {
      const url = await this.pdfViewerService.getPageAsImage(
        1,           // page number
        { width: 1000 }, // scale
        '#000000'    // background color
      );
      if (url) {
        const byteString = atob(url.split(',')[1]);
        const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');
        if (newWindow) {
          newWindow.onload = () => URL.revokeObjectURL(blobUrl);
        }
      }
    })();
  }
}
```
