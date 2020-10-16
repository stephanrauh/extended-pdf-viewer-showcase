import { Component } from '@angular/core';

@Component({
  selector: 'app-page-view-mode',
  templateUrl: './page-view-mode.component.html',
  styleUrls: ['./page-view-mode.component.css'],
})
export class PageViewModeComponent {

  public page = 5;

  public pageLabel: string;

  public showPdfViewer = true;

  constructor() {}
}
