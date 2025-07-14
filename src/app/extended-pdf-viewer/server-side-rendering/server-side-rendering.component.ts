import { Component, inject } from '@angular/core';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerService, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { MatCard } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-server-side-rendering',
    templateUrl: './server-side-rendering.component.html',
    styleUrls: ['./server-side-rendering.component.css'],
    imports: [MatCard, MatTabGroup, MatTab, Ie11MarkdownComponent, DemoComponent, RouterLink, NgxExtendedPdfViewerModule, AsyncPipe]
})
export class ServerSideRenderingComponent {
  private pdfService = inject(NgxExtendedPdfViewerService);
  fullscreenService = inject(FullscreenService);

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }
}
