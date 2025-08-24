import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
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

  private cdr = inject(ChangeDetectorRef);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public leftCardTab = 'scripting'; // Controls the left card tabs: 'scripting' or 'catalog-js'

  private _fullscreen = false;
  private _showPdfViewer = true;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  public get showPdfViewer(): boolean {
    return this._showPdfViewer;
  }

  constructor() {
    try {
      if (localStorage) {
        const setting = localStorage.getItem('ngx-extended-pdf-viewer.enableScripting');
        if (setting) {
          pdfDefaultOptions.enableScripting = setting === 'true';
        }

        // Load catalog JavaScript settings
        const catalogAAJs = localStorage.getItem('ngx-extended-pdf-viewer.enableCatalogAAJavaScript');
        if (catalogAAJs) {
          pdfDefaultOptions.enableCatalogAAJavaScript = catalogAAJs === 'true';
        }

        const openActionJs = localStorage.getItem('ngx-extended-pdf-viewer.enableOpenActionJavaScript');
        if (openActionJs) {
          pdfDefaultOptions.enableOpenActionJavaScript = openActionJs === 'true';
        }

        // Restore the active tab after reload
        const savedTab = localStorage.getItem('ngx-extended-pdf-viewer.leftCardTab');
        if (savedTab) {
          this.leftCardTab = savedTab;
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
        localStorage.setItem('ngx-extended-pdf-viewer.leftCardTab', this.leftCardTab);
        window.location.reload();
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }

  public get enableCatalogAAJavaScript(): boolean {
    return pdfDefaultOptions.enableCatalogAAJavaScript;
  }

  public set enableCatalogAAJavaScript(enable: boolean) {
    pdfDefaultOptions.enableCatalogAAJavaScript = enable;
    try {
      if (localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.enableCatalogAAJavaScript', String(enable));
        this._showPdfViewer = false;
        setTimeout(() => {
          this._showPdfViewer = true;
          this.cdr.markForCheck();
        });
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }

  public get enableOpenActionJavaScript(): boolean {
    return pdfDefaultOptions.enableOpenActionJavaScript;
  }

  public set enableOpenActionJavaScript(enable: boolean) {
    pdfDefaultOptions.enableOpenActionJavaScript = enable;
    try {
      if (localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.enableOpenActionJavaScript', String(enable));
        this._showPdfViewer = false;
        setTimeout(() => {
          this._showPdfViewer = true;
          this.cdr.markForCheck();
        });
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }
}
