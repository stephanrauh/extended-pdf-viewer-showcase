import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { isBrowser } from '../common/utilities';

@Component({
standalone: false,
  selector: 'app-csp',
  templateUrl: './csp.component.html',
  styleUrls: ['./csp.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CSPComponent implements OnDestroy {
   public _useInlineScripts = false;

  constructor() {
    if (isBrowser()) {
      const urlParams = new URLSearchParams(window.location.search);
      this._useInlineScripts = urlParams.get('useInlineScripts') === 'true';
      pdfDefaultOptions.rangeChunkSize = 1024 * 1024;
    }
  }

  public get useInlineScripts() {
    return this._useInlineScripts;
  }

  public set useInlineScripts(value: boolean) {
    if (isBrowser()) {
      this._useInlineScripts = value;
      location.search = `useInlineScripts=${value}`;
    }
  }

  public ngOnDestroy() {
    pdfDefaultOptions.rangeChunkSize = 64 * 1024; // restore the default value
  }
}
