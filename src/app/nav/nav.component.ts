import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  pdfDefaultOptions,
  PDFNotificationService,
} from 'ngx-extended-pdf-viewer';
import { version } from 'ngx-extended-pdf-viewer/package.json';
import { dependencies } from '../../../package.json';
import { version as ng2PdfViewerLibVersion } from 'pdfjs-dist/package.json';
import { version as ng2PdfViewerVersion } from 'ng2-pdf-viewer/package.json';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 810px)')
    .pipe(map((result) => result.matches));

  public version = version;
  public library = 'ngx-extended-pdf-viewer';

  public angularVersion = dependencies['@angular/core'].replace('^', '');

  public _viewer = 'ngx-extended-pdf-viewer';

  public ngxExtendedPdfViewer = true;

  public ng2PdfViewer = false;

  public set viewer(v: string) {
    if (this._viewer !== v) {
      this._viewer = v;
      this.switchViewer();
    }
  }

  public get viewer(): string {
    return this._viewer;
  }

  public pdfjsVersion = '';

  constructor(
    private breakpointObserver: BreakpointObserver,
    private notification: PDFNotificationService
  ) {
    try {
      this.notification.pdfjsVersion.subscribe((s) => (this.pdfjsVersion = s));
      this.activateViewer();
    } catch (exception) {
      alert("Error! " + exception);
    }
  }

  public switchViewer(): void {
    const previousViewer = localStorage.getItem('showcase.viewer');
    localStorage.setItem('showcase.viewer', this.viewer);
    if (
      previousViewer === 'ng2-pdf-viewer' &&
      this.viewer !== 'ng2-pdf-viewer'
    ) {
      location.pathname = '/extended-pdf-viewer';
    } else if (
      previousViewer !== 'ng2-pdf-viewer' &&
      this.viewer === 'ng2-pdf-viewer'
    ) {
      location.pathname = '/ng2-pdf-viewer';
    } else {
      location = location; // trigger reload
    }
  }
  public activateViewer(): void {
    if (location.pathname.startsWith('/ng2-pdf-viewer')) {
      localStorage.setItem('showcase.viewer', 'ng2-pdf-viewer');
    }
    if (location.pathname.startsWith('/extended-pdf-viewer')) {
      if (localStorage.getItem('showcase.viewer') === 'ng2-pdf-viewer') {
        localStorage.setItem('showcase.viewer', 'ngx-extended-pdf-viewer');
      }
    }
    this._viewer = localStorage.getItem('showcase.viewer');
    if (!this._viewer) {
      this._viewer = 'ngx-extended-pdf-viewer';
    }
    if (this._viewer === 'ngx-extended-pdf-viewer') {
      pdfDefaultOptions.assetsFolder = 'assets';
      this.determinePdfJsVersion();
    } else if (this._viewer === 'bleeding-edge') {
      pdfDefaultOptions.assetsFolder = 'bleeding-edge';
      this.determinePdfJsVersion();
    } else if (this._viewer === 'ng2-pdf-viewer') {
      this.ngxExtendedPdfViewer = false;
      this.ng2PdfViewer = true;
      this.pdfjsVersion = ', pdf.js ' + ng2PdfViewerLibVersion + ',';
      this.library = 'ng2-pdf-viewer';
      this.version = ng2PdfViewerVersion;
    }
  }

  private determinePdfJsVersion(): void {
    setTimeout(() => {
      if ((window as any).pdfjsLib) {
        this.pdfjsVersion =
          ', pdf.js ' + (window as any).pdfjsLib.version + ',';
      } else {
        this.determinePdfJsVersion();
      }
    }, 100);
  }
}
