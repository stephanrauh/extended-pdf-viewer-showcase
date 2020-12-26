import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { pdfBase64 } from './pdfBase64';
import { pdfData2 } from './secondPdfBase64';

@Component({
  selector: 'app-base64',
  templateUrl: './base64.component.html',
  styleUrls: ['./base64.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Base64Component {
  public base64 = pdfBase64;

  public toggle(): void {
    if (this.base64 === pdfBase64) {
      this.base64 = pdfData2;
    } else {
      this.base64 = pdfBase64;
    }
  }
}
