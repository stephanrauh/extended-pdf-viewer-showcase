import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-export-image',
    
    standalone: true,
    templateUrl: './export-image.component.html',
    styleUrls: ['./export-image.component.css'],
    imports: [
        MatCard,
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        MatError,
        MatButton,
        MatTabGroup,
        MatTab,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class ExportImageComponent {
  private pdfViewerService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  public imageDataURL: string | undefined = undefined;

  public background: string | undefined;

  public extractedText = 'no text extracted yet';

  public scale!: number;

  public width!: number;

  public height!: number;
  public widthDisplay!: number;

  public heightDisplay!: number;

  public selectedTabIndex = 0;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
    pdfDefaultOptions.textLayerMode = 1;
  }

  public missingInput(): boolean {
    return !this.scale && !this.width && !this.height;
  }

  public widthFilledError(): boolean {
    if (this.width) {
      return !!this.height || !!this.scale;
    }
    return false;
  }

  public heightFilledError(): boolean {
    if (this.height) {
      return !!this.width || !!this.scale;
    }
    return false;
  }

  public scaleFilledError(): boolean {
    if (this.scale) {
      return !!this.height || !!this.width;
    }
    return false;
  }

  public exportAsImage(): void {
    this.selectedTabIndex = 2;
    const scale = { width: this.width, height: this.height, scale: this.scale };
    (async () => this.showImage(await this.pdfViewerService.getPageAsImage(1, scale, this.background)))();
  }

  public exportAsText(): void {
    this.selectedTabIndex = 3;
    (async () => this.showText(await this.pdfViewerService.getPageAsText(1)))();
  }

  public async exportAsLines(): Promise<void> {
    const lines = await this.pdfViewerService.getPageAsLines(1);
    console.log(lines);
  }

  private showText(text: string): void {
    this.extractedText = text;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
