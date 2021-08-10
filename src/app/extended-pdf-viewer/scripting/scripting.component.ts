import { Component, ChangeDetectionStrategy } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-scripting',
  templateUrl: './scripting.component.html',
  styleUrls: ['./scripting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScriptingComponent {

  constructor() {
    if (localStorage) {
      const setting = localStorage.getItem('ngx-extended-pdf-viewer.enableScripting');
      if (setting) {
        pdfDefaultOptions.enableScripting = setting === "true";
      }
    }
  }

  public get enableScripting(): boolean {
    return  pdfDefaultOptions.enableScripting;
  }

  public set enableScripting(enable: boolean) {
    pdfDefaultOptions.enableScripting = enable;
    if (localStorage) {
      localStorage.setItem(
        'ngx-extended-pdf-viewer.enableScripting',
        String(enable)
      );
      document.location = document.location;
    }
  }
}
