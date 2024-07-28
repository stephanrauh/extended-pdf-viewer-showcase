import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-csp',
  templateUrl: './csp.component.html',
  styleUrls: ['./csp.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CSPComponent implements OnDestroy {
  // tslint:disable-next-line: variable-name
  public _useInlineScripts = false;

  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this._useInlineScripts = urlParams.get('useInlineScripts')==='true';
    pdfDefaultOptions.rangeChunkSize = 1024 * 1024;
  }

  public get useInlineScripts() {
    return this._useInlineScripts;
  }

  public set useInlineScripts(value: boolean) {
    this._useInlineScripts = value;
    location.search = `useInlineScripts=${value}`;
  }

  public ngOnDestroy() {
    pdfDefaultOptions.rangeChunkSize = 64 * 1024; // restore the default value
  }
}
