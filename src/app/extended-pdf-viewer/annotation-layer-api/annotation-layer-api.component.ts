import { Component, inject } from '@angular/core';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-annotation-layer-api',
    templateUrl: './annotation-layer-api.component.html',
    styleUrls: ['./annotation-layer-api.component.css'],
    imports: [
        MatCard,
        MatTabGroup,
        MatTab,
        MatButton,
        MatTooltipModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class AnnotationLayerApiComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onAnnotationEditorEvent(event: any): void {
    console.log('Event annotationEditorEvent: ', event);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async addImage(parameters: any): Promise<void> {
    const { left, bottom, right, top, rotation } = parameters;
    await this.pdfService.addImageToAnnotationLayer({
      urlOrDataUrl: 'assets/images/ChatGPT-PDF-Viewer-Logo.jpg',
      page: 11,
      left,
      bottom,
      right,
      top,
      rotation,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async addHighlight(parameters: any): Promise<void> {
    const { color, left, bottom, right, top, thickness, rotation, opacity } = parameters;
    await this.pdfService.addHighlightToAnnotationLayer(
      color,
      11,
      left,
      bottom,
      right,
      top,
      thickness,
      rotation,
      opacity
    );
  }
}
