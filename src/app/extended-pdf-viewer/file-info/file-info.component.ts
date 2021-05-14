import { Component } from '@angular/core';
import {
  PdfDocumentInfo,
  PdfDocumentPropertiesExtractor
} from 'ngx-extended-pdf-viewer';


@Component({
  selector: 'app-simple',
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.css'],
})
export class FileInfoComponent {

  public fileInfo!: PdfDocumentInfo;

  public onPagesLoaded() {
    new PdfDocumentPropertiesExtractor().getDocumentProperties().then((result) => this.fileInfo = result);
  }
}
