  ```typescript
  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    const thumbnail = thumbnailEvent.thumbnail;

    if (page === this.PDFViewerApplication.page) {
      const radiobutton = thumbnail.querySelector('input.thumbnail-radiobutton');
      if (radiobutton instanceof HTMLInputElement) {
        radiobutton.checked = true;
      }
    }

    const overlay = thumbnail.querySelector('.image-container') as HTMLElement;
    let type: string;
    if (page <= 2) {
      overlay.style.backgroundColor = '#0000FF40';
      type = 'title page';
    } else if (page === 3 || page === 4) {
      overlay.style.backgroundColor = '#00FF0040';
      type = 'table of contents';
    } else {
      overlay.style.backgroundColor = '#FF000040';
      type = 'ready for review';
    }
    const textNode = thumbnail.querySelector('.thumbnail-text') as HTMLDivElement;
    if (textNode) {
      textNode.innerText = type;
    }
  }
```
