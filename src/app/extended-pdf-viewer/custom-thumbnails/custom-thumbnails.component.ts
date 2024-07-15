import { Component, effect, ViewEncapsulation } from '@angular/core';
import { IPDFViewerApplication, PDFNotificationService, PdfThumbnailDrawnEvent } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomThumbnailsComponent {
  private _fullscreen = false;

  public rotation: 0 | 180 = 0;



  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  private PDFViewerApplication!: IPDFViewerApplication;

  constructor(notificationService: PDFNotificationService) {
    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public onPageChange(page: number): void {
    setTimeout(() => {
      const radiobuttons = document.getElementsByClassName('thumbnail-radiobutton');
      if (radiobuttons) {
        for (let i = 1; i <= radiobuttons.length; i++) {
          const cbx = radiobuttons.item(i - 1) as HTMLInputElement;
          cbx.checked = cbx.getAttribute('data-page-number') === String(page);
        }
      }
    });
  }

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    console.log('Thumbnail drawn ' + thumbnailEvent);
    const thumbnail = thumbnailEvent.thumbnail;
    const page = thumbnailEvent.pageId;

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

    overlay.ondblclick = () => {
      this.rotation = this.rotation ? 0 : 180;
    };
  }
}
