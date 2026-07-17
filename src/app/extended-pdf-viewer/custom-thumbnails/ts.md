  ```typescript
  // Selected page, tracked so a lazily-drawn thumbnail can still select itself.
  private currentPage = 1;

  public onPageChange(page: number | undefined): void {
    this.currentPage = page ?? 1;
    const radiobuttons = document.getElementsByClassName('thumbnail-radiobutton');
    for (let i = 0; i < radiobuttons.length; i++) {
      const cbx = radiobuttons.item(i) as HTMLInputElement;
      cbx.checked = cbx.getAttribute('data-page-number') === String(this.currentPage);
    }
  }

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    const thumbnail = thumbnailEvent.thumbnail;
    const page = thumbnailEvent.pageId;

    const radiobutton = thumbnail.querySelector('input.thumbnail-radiobutton');
    if (radiobutton instanceof HTMLInputElement) {
      radiobutton.checked = page === this.currentPage;
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
