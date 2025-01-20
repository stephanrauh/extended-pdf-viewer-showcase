```typescript
 public exportAsImage(): void {
  (async () => {
    const url = await this.pdfViewerService.getPageAsImage(1, { width: 1000 }, '#000000');
    if (url) {
      // Create a Blob from the data URL
      const byteString = atob(url.split(',')[1]);
      const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      // Create an object URL from the Blob
      const blobUrl = URL.createObjectURL(blob);

      // Open the object URL in a new tab
      const newWindow = window.open(blobUrl, '_blank');

      // Revoke the object URL after the new window has loaded
      if (newWindow) {
        newWindow.onload = function () {
          URL.revokeObjectURL(blobUrl);
        };
      }
    }
  })();
}
```
