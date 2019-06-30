import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { pdfBase64 } from './pdfBase64';

@Component({
  selector: 'app-base64',
  templateUrl: './base64.component.html',
  styleUrls: ['./base64.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Base64Component {
  public base64 = pdfBase64;
}
