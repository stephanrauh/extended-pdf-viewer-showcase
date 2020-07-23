import { Component, OnInit } from '@angular/core';
import { PdfThumbnailDrawnEvent } from '../../../../ngx-extended-pdf-viewer/projects/ngx-extended-pdf-viewer/src/lib/events/pdf-thumbnail-drawn-event';

(window as any).updateThumbnailSelection = (page: number) => {
  setTimeout(() => {
    const checkboxes = document.getElementsByClassName('thumbnail-checkbox');
    if (checkboxes) {
      for (let i = 1; i <= checkboxes.length; i++) {
        const cbx = checkboxes.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  });
};

@Component({
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
})
export class CustomThumbnailsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  public onPageChange(page: number): void {
    const checkboxes = document.getElementsByClassName('thumbnail-checkbox');
    if (checkboxes) {
      for (let i = 1; i <= checkboxes.length; i++) {
        const cbx = checkboxes.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  }

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    console.log('Thumnail drawn ' + thumbnailEvent);
    const thumbnail = thumbnailEvent.thumbnail;
    const page = thumbnailEvent.pageId;
    const overlay = thumbnail.querySelector('.image-container') as HTMLElement;
    if (page <= 2) {
      overlay.style.backgroundColor = '#0000FF40';
    } else if (page === 3 || page === 4) {
      overlay.style.backgroundColor = '#00FF0040';
    } else {
      overlay.style.backgroundColor = '#FF000040';
    }
   }
}
