import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { isLocalhost } from '../common/utilities';

@Component({
  selector: 'app-scripting',
  templateUrl: './scripting.component.html',
  styleUrls: ['./scripting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptingComponent {

  public isLocalhost = isLocalhost();

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
    setTimeout(() => this.pdfService.recalculateSize());
  }

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    try {
      if (localStorage) {
        const setting = localStorage.getItem('ngx-extended-pdf-viewer.enableScripting');
        if (setting) {
          pdfDefaultOptions.enableScripting = setting === 'true';
        }
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
    }
  }

  public get enableScripting(): boolean {
    return pdfDefaultOptions.enableScripting;
  }

  public set enableScripting(enable: boolean) {
    pdfDefaultOptions.enableScripting = enable;
    try {
      if (localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.enableScripting', String(enable));
        document.location = document.location;
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
    }
  }
}
