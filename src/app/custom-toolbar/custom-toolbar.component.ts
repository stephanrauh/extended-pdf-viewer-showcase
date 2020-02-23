import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
// import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer/src/lib/ngx-extended-pdf-viewer.component';

@Component({
  selector: 'app-custom-toolbar',
  templateUrl: './custom-toolbar.component.html',
  styleUrls: ['./custom-toolbar.component.css']
})
export class CustomToolbarComponent {
  public _design = 'findbar';

  @ViewChild('pdfViewer')
  public  pdfViewer: OnInit & OnDestroy; // NgxExtendedPdfViewerComponent;

  public set design(design: string) {
    if (this._design !== design) {
      debugger;
      this.pdfViewer.ngOnDestroy();
      this._design = design;
      this.pdfViewer.ngOnInit();
    } else {
      this._design = design;
    }
  }

  public get design(): string {
    return this._design;
  }
}
