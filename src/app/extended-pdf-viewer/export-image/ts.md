```typescript
constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

public async exportAsImage(): Promise<void> {
  const scale = {width: this.width}; 
  // or: scale = {height: this.height};
  // or: scale = {scale: this.scale};
  const dataURL = await this.pdfViewerService.getPageAsImage(1, scale);
  this.showImage(dataURL);
}

private showImage(dataURL: any): void {
  this.imageDataURL = dataURL;
  this.getImageDimensions(dataURL);
}

private getImageDimensions(dataURL: string): void {
  const i = new Image();
  i.onload = () => {
    this.widthDisplay = i.width;
    this.heightDisplay = i.height;
  };
  i.src = dataURL;
}
```
