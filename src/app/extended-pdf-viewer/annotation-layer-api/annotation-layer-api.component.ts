import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
    selector: 'app-annotation-layer-api',
    
    standalone: true,
    templateUrl: './annotation-layer-api.component.html',
    styleUrls: ['./annotation-layer-api.component.css'],
    imports: [
        CommonModule,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class AnnotationLayerApiComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  private _fullscreen = false;
  
  // Tab state for the two tab groups
  activeTab: string = 'images';
  activeTab2: string = 'html';

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
    await this.pdfService.addImageToAnnotationLayer({ // Temporarily using addImageToAnnotationLayer instead of addHighlightToAnnotationLayer
      urlOrDataUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIytjb2xvcisiLz48L3N2Zz4=',
      page: 11,
      left,
      bottom,
      right,
      top,
      rotation: rotation || 0
    });
  }
}
