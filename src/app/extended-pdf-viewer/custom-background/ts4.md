```typescript
@Component({
  selector: 'app-custom-background',
  templateUrl: './custom-background.component.html',
  styleUrls: ['./custom-background.component.css'],
})
export class CustomBackgroundComponent {
  public visible = false;

  private image!: CanvasImageSource;

    public oldPaper = (params: PdfBackgroundParameters) => {
    if (params.context) {
      const context = params.context as CanvasRenderingContext2D;
      const width = params.width as number;
      const height = params.height as number;
      context.drawImage(this.image, 0, 0, width, height);
    }
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    this.loadImage("/assets/images/papyrus-bright.jpeg").then((image) => {
      this.visible = true;
      this.image = image;
    });
  }

  private loadImage(src): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    })
  }


}
```
