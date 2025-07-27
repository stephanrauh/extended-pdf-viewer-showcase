import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-scripting',

  standalone: true,
  templateUrl: './scripting.component.html',
  styleUrls: ['./scripting.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe],
})
export class ScriptingComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  constructor() {
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
