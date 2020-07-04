import { Component } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdfjs-versions',
  templateUrl: './pdfjs-versions.component.html',
  styleUrls: ['./pdfjs-versions.component.css'],
})
export class PdfjsVersionsComponent {
  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
}
