import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
})
export class ExportComponent implements OnInit {
  public imageDataURL: string | undefined = undefined;

  public extractedText = 'no text extracted yet';

  public scale: number;

  public width: number;

  public height: number;
  public widthDisplay: number;

  public heightDisplay: number;

  public selectedTabIndex = 0;

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {}

  ngOnInit() {}

  public missingInput(): boolean {
    return (!this.scale) && !(this.width) && (!this.height);
  }

  public widthFilledError(): boolean {
    if (this.width) {
      return (!!this.height) || (!!this.scale);
    }
    return false;
  }

  public heightFilledError(): boolean {
    if (this.height) {
      return (!!this.width) || (!!this.scale);
    }
    return false;
  }

  public scaleFilledError(): boolean {
    if (this.scale) {
      return (!!this.height) || (!!this.width);
    }
    return false;
  }

  public exportAsImage(): void {
    this.selectedTabIndex = 2;
    const scale = {width: this.width, height: this.height, scale: this.scale};
    this.pdfViewerService.getPageAsImage_preview(1, scale, (dataURL) =>
      this.showImage(dataURL)
    );
  }

  public exportAsText(): void {
    this.selectedTabIndex = 3;
    this.pdfViewerService.getPageAsText_preview(1, (text) => this.showText(text));
  }

  private showText(text: string): void {
    this.extractedText = text;
  }

  private showImage(dataURL: any): void {
    this.imageDataURL = dataURL;
    this.getImageDimensions(dataURL);
  }

  private getImageDimensions(dataURL: string): void {
    const i = new Image();
    i.onload = () => {
      this.widthDisplay = i.width;
      this.heightDisplay = i.height;
    };
    i.src = dataURL;
  }
}
