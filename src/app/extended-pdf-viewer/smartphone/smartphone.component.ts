import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-smartphone',
  templateUrl: './smartphone.component.html',
  styleUrls: ['./smartphone.component.css', './devices.min.css']
})
export class SmartphoneComponent {

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() =>
    this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {}
}
