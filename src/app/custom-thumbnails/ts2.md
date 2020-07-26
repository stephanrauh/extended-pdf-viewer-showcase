```typescript
@Component({
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomThumbnailsComponent implements OnInit, OnDestroy {
  private onEnterListener = (event: CustomEvent) =>    this.showTooltip(event);
  private onLeaveListener = (event: CustomEvent) =>    this.hideTooltip(event);

  constructor() {}

  ngOnInit() {
    document.addEventListener('hoveringOverThumbnail', this.onEnterListener);
    document.addEventListener('leavingThumbnail', this.onLeaveListener);
  }

  ngOnDestroy() {
    document.removeEventListener('hoveringOverThumbnail', this.onEnterListener);
    document.removeEventListener('leavingThumbnail', this.onLeaveListener);
  }

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    const thumbnail = thumbnailEvent.thumbnail;
    const page = thumbnailEvent.pageId;
    let type: string;
    if (page <= 2) {
      type = 'title page';
    } else if (page === 3 || page === 4) {
      type = 'table of contents';
    } else {
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
  }

  private hideTooltip(event: CustomEvent): void {
    const thumbnail = event.detail.thumbnail as HTMLElement;
    const textDiv = thumbnail.querySelector('.thumbnail-text') as HTMLElement;
    textDiv.style.display = 'none';
  }
}
```
