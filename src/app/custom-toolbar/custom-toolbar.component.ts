import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer/src/lib/ngx-extended-pdf-viewer.component';

@Component({
  selector: 'app-custom-toolbar',
  templateUrl: './custom-toolbar.component.html',
  styleUrls: ['./custom-toolbar.component.css']
})
export class CustomToolbarComponent {
  public _theme = 'checkbox';

  public zoom = '100%';

  @ViewChild('pdfViewer')
  public pdfViewer: AfterViewInit & OnDestroy; // NgxExtendedPdfViewerComponent;

  public set theme(theme: string) {
    if (this._theme !== theme) {
      this.pdfViewer.ngOnDestroy();
      this._theme = theme;
      this.pdfViewer.ngAfterViewInit();
    } else {
      this._theme = theme;
    }
  }

  public get theme(): string {
    return this._theme;
  }
}
