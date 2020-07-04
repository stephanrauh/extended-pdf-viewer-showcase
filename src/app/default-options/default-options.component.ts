import { Component, ChangeDetectionStrategy } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-default-options',
  templateUrl: './default-options.component.html',
  styleUrls: ['./default-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultOptionsComponent {
  constructor() {
    pdfDefaultOptions.assetsFolder = 'bleeding-edge';
  }
}
