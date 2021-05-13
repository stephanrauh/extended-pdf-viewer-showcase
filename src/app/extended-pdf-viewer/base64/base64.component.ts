import { Component, ChangeDetectionStrategy } from '@angular/core';
import { pdfBase64 } from './pdfBase64';
import { pdfData2 } from './secondPdfBase64';

@Component({
  selector: 'app-base64',
  templateUrl: './base64.component.html',
  styleUrls: ['./base64.component.css'],
})
export class Base64Component {
  public base64 = undefined;

  public ngOnInit(): void {
    setTimeout(() => this.base64 = pdfBase64, 1500);
  }

  public toggle(): void {
    if (this.base64 === pdfBase64) {
      this.base64 = pdfData2;
    } else {
      this.base64 = pdfBase64;
    }
  }
}
