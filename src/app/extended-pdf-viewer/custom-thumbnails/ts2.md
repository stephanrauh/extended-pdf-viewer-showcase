```typescript
@Component({
standalone: false, 
  selector: 'app-custom-thumbnails',
  templateUrl: './custom-thumbnails.component.html',
  styleUrls: ['./custom-thumbnails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomThumbnailsComponent {
  // Bound in the template as [rotation]="rotation()".
  // A signal, not a plain field: (thumbnailDrawn) is raised outside the
  // Angular zone, so a plain assignment in the listener below would never
  // reach change detection and the binding would never update.
  public rotation = signal<0 | 180>(0);

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    const overlay = thumbnailEvent.thumbnail.querySelector('.image-container') as HTMLElement;
    overlay.ondblclick = () => {
      this.rotation.update((r) => (r ? 0 : 180));
    };
  }
}
```
