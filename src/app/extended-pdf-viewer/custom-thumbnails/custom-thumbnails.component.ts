import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { NgxExtendedPdfViewerService, PdfThumbnailDrawnEvent } from 'ngx-extended-pdf-viewer';

(window as any).updateThumbnailSelection = (page: number) => {
  (window as any).PDFViewerApplication.page = page;
  setTimeout(() => {
    const radiobuttons = document.getElementsByClassName('thumbnail-radiobutton');
    if (radiobuttons) {
      for (let i = 1; i <= radiobuttons.length; i++) {
        const cbx = radiobuttons.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  });
};

@Component({
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomThumbnailsComponent implements OnInit, OnDestroy {
  private onEnterListener = (event: CustomEvent) => this.showTooltip(event);
  private onLeaveListener = (event: CustomEvent) => this.hideTooltip(event);
    private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}

  ngOnInit() {
    (document as any).addEventListener('hoveringOverThumbnail', this.onEnterListener);
    (document as any).addEventListener('leavingThumbnail', this.onLeaveListener);
  }

  ngOnDestroy() {
    (document as any).removeEventListener('hoveringOverThumbnail', this.onEnterListener);
    (document as any).removeEventListener('leavingThumbnail', this.onLeaveListener);
  }

  public onPageChange(page: number): void {
    const radiobuttons = document.getElementsByClassName(
      'thumbnail-radiobutton'
    );
    if (radiobuttons) {
      for (let i = 1; i <= radiobuttons.length; i++) {
        const cbx = radiobuttons.item(i - 1) as HTMLInputElement;
        cbx.checked = i === page + 1;
      }
    }
  }

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    console.log('Thumnail drawn ' + thumbnailEvent);
    const thumbnail = thumbnailEvent.thumbnail;
    const page = thumbnailEvent.pageId;

    if (page === (window as any).PDFViewerApplication.page) {
      (window as any).updateThumbnailSelection(page);
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
    thumbnail.onmouseenter = (event: MouseEvent) => {
      const thumbnailHoverEvent = new CustomEvent('hoveringOverThumbnail', {
        detail: {
          thumbnail,
          page,
          type,
        },
      });
      document.dispatchEvent(thumbnailHoverEvent);
    };

    thumbnail.onmouseleave = (event: MouseEvent) => {
      const thumbnailLeaveEvent = new CustomEvent('leavingThumbnail', {
        detail: {
          thumbnail,
          page,
          type,
        },
      });
      document.dispatchEvent(thumbnailLeaveEvent);
    };
  }

  private showTooltip(event: CustomEvent): void {
    const thumbnail = event.detail.thumbnail as HTMLElement;
    const page = event.detail.page as number;
    const type = event.detail.type as string;
    const textDiv = thumbnail.querySelector('.thumbnail-text') as HTMLElement;
    textDiv.style.display = 'block';
    textDiv.innerHTML = type;
    console.log('show tooltip of page ' + page + ' (' + type + ')');
  }

  private hideTooltip(event: CustomEvent): void {
    const thumbnail = event.detail.thumbnail as HTMLElement;
    const textDiv = thumbnail.querySelector('.thumbnail-text') as HTMLElement;
    textDiv.style.display = 'none';
  }
}
