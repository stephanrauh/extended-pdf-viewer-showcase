import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { timestamp } from 'rxjs/operators';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-signatures',
  templateUrl: './signatures.component.html',
  styleUrls: ['./signatures.component.css'],
})
export class SignaturesComponent {
  // tslint:disable-next-line: variable-name
  private _showSignature = true;

  public showPdf = true;

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

  public get showSignature(): boolean {
    return this._showSignature;
  }

  public set showSignature(show: boolean) {
    this._showSignature = show;
    this.showPdf = false;
    setTimeout(() => this.showPdf = true, 100);
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    // pdfDefaultOptions.renderInteractiveForms = false;
  }
}
