import { Component } from '@angular/core';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
standalone: false,
  selector: 'app-server-side-rendering',
  templateUrl: './server-side-rendering.component.html',
  styleUrls: ['./server-side-rendering.component.css']
})
export class ServerSideRenderingComponent {
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  constructor(private pdfService: NgxExtendedPdfViewerService, public fullscreenService: FullscreenService) {}
}
