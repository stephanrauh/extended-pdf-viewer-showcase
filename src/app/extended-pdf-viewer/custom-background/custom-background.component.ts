import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, PdfBackground, PdfBackgroundParameters } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-custom-background',
  templateUrl: './custom-background.component.html',
  styleUrls: ['./custom-background.component.css'],
})
export class CustomBackgroundComponent {

  public visible = false;

  private image!: CanvasImageSource;

  public background: PdfBackground;

  private _choice: string | undefined = undefined;

  public activeTab = 1;

  public isLocalhost = isLocalhost();

  public get choice() {
    return this._choice;
  }

  public set choice(choice: string | undefined) {
    this._choice = choice;
    if (choice === '#e8e1c4') {
      this.activeTab = 2;
      this.background = '#e8e1c4';
    } else if (choice === 'by-page') {
      this.activeTab = 3;
      this.background = this.colorByPage;
    } else if (choice === 'image') {
      this.activeTab = 4;
      this.background = (params: PdfBackgroundParameters) => this.oldPaper(params);
    } else {
      this.activeTab = 1;
      this.background = undefined;
    }
    this.visible = false;
    setTimeout(() => this.visible = true, 100);
   }

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    this.loadImage("/assets/images/papyrus-bright.jpeg").then((image) => {
      this.image = image;
      setTimeout(() => this.visible = true, 100);
    });
  }

  public colorByPage(params: PdfBackgroundParameters): string | undefined {
    if (params?.pageNumber) {
      return params.pageNumber % 2 ? '#f3eb8e' : '#ffcb8a'
    }
    return undefined;
  }

  private loadImage(src): Promise<any> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src;
    })
  }

  public oldPaper = (params: PdfBackgroundParameters) => {
    if (params.context) {
      const context = params.context as CanvasRenderingContext2D;
      const width = params.width as number;
      const height = params.height as number;
      context.drawImage(this.image, 0, 0, width, height);
    }
  }
}
