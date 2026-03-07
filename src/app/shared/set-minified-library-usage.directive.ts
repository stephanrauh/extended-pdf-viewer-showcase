import { Directive, inject, OnInit } from '@angular/core';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';

@Directive({
  selector: 'ngx-extended-pdf-viewer',
  standalone: true,
})
export class SetMinifiedLibraryUsageDirective implements OnInit {
  private pdfViewer = inject(NgxExtendedPdfViewerComponent);

  ngOnInit() {
    this.pdfViewer.minifiedJSLibraries.set(location.hostname !== 'localhost');
  }
}
