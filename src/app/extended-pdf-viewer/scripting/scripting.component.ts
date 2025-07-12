import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';

@Component({
  standalone: false,
  selector: 'app-scripting',
  templateUrl: './scripting.component.html',
  styleUrls: ['./scripting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptingComponent {
  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor(public fullscreenService: FullscreenService) {
    try {
      if (localStorage) {
        const setting = localStorage.getItem('ngx-extended-pdf-viewer.enableScripting');
        if (setting) {
          pdfDefaultOptions.enableScripting = setting === 'true';
        }
      }
    } catch /* (safariSecurityException) */ {
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
        window.location.reload();
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }
}
