import { Component } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  standalone: false,
  selector: 'app-signatures',
  templateUrl: './signatures.component.html',
  styleUrls: ['./signatures.component.css'],
})
export class SignaturesComponent {
  private _showSignature = true;

  public showPdf = true;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get showSignature(): boolean {
    return this._showSignature;
  }

  public set showSignature(show: boolean) {
    this._showSignature = show;
    this.showPdf = false;
    setTimeout(() => (this.showPdf = true), 100);
  }

  constructor() {
    pdfDefaultOptions.enableSignatureEditor = true;
  }
}
