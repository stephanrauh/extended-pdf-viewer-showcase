import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-custom-sidebar',
  templateUrl: './custom-sidebar.component.html',
  styleUrls: ['./custom-sidebar.component.css']
})
export class CustomSidebarComponent implements OnInit {
  // tslint:disable-next-line: variable-name
  public _theme = 'default';

  public showPdfViewer = true;

  public sidebarOpen = true;

  constructor() {}

  ngOnInit() {}

  public set theme(theme: string) {
    if (this._theme !== theme) {
      this.showPdfViewer = false;
      this._theme = theme;
      setTimeout(() => this.showPdfViewer = true, 500);
    } else {
      this._theme = theme;
    }
  }

  public get theme(): string {
    return this._theme;
  }
}
