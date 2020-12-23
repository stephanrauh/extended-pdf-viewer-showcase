import { Component } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-page-view-mode',
  templateUrl: './page-view-mode.component.html',
  styleUrls: ['./page-view-mode.component.css'],
})
export class PageViewModeComponent {

  public page = 5;

  public pageLabel: string;

  public showPdfViewer = true;

  constructor() {
    // pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
}
