import { Component } from '@angular/core';
import { AnnotationLayerRenderedEvent, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-page-view-mode',
  templateUrl: './page-view-mode.component.html',
  styleUrls: ['./page-view-mode.component.css'],
})
export class PageViewModeComponent {

  public page = 5;

  public spreadMode: "off" | "even" | "odd" = "off";

  public showBorders = true;

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) { }
}
