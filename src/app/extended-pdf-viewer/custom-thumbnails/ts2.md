```typescript
@Component({
standalone: false, 
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomThumbnailsComponent implements OnInit, OnDestroy {
  constructor() {}

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    const overlay = thumbnail.querySelector('.image-container') as HTMLElement;
     overlay.ondblclick = () => {
      this.rotation = this.rotation ? 0 : 180;
    };
  }

}
```
