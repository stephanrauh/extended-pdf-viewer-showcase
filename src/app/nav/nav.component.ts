import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { pdfDefaultOptions, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { versions } from './versions';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 1023px)').pipe(map((result) => result.matches));

  public version = versions.extendedPdfViewer;
  public library = 'ngx-extended-pdf-viewer';

  public angularVersion = versions.angular;

  public _viewer: string | null = 'ngx-extended-pdf-viewer';

  public ngxExtendedPdfViewer = true;

  public ng2PdfViewer = false;

  public hideMenu = false;

  public set viewer(v: string) {
    if (this._viewer !== v) {
      this._viewer = v;
      this.switchViewer();
    }
  }

  public get viewer(): string {
    return this._viewer || 'ngx-extended-pdf-viewer';
  }

  public pdfjsVersion = '';

  constructor(private breakpointObserver: BreakpointObserver, private notification: PDFNotificationService, private route: ActivatedRoute) {
    route.url.subscribe((url) => {
      this.hideMenu = location.pathname.includes('iframe');
      console.error(location.pathname);
      console.error(this.hideMenu);
    });

    try {
      this.pdfjsVersion = this.notification.pdfjsVersion;
      this.activateViewer();
    } catch (exception) {
      alert('Error! ' + exception);
    }
  }

  public switchViewer(): void {
    if (localStorage) {
      const previousViewer = localStorage.getItem('showcase.viewer');
      localStorage.setItem('showcase.viewer', this.viewer);
      if (previousViewer === 'ng2-pdf-viewer' && this.viewer !== 'ng2-pdf-viewer') {
        location.pathname = '/extended-pdf-viewer';
      } else if (previousViewer !== 'ng2-pdf-viewer' && this.viewer === 'ng2-pdf-viewer') {
        location.pathname = '/ng2-pdf-viewer';
      } else {
        location = location; // trigger reload
      }
    }
  }
  public activateViewer(): void {
    if (localStorage) {
      if (location.pathname.startsWith('/ng2-pdf-viewer')) {
        localStorage.setItem('showcase.viewer', 'ng2-pdf-viewer');
      }
      if (location.pathname.startsWith('/extended-pdf-viewer')) {
        if (localStorage.getItem('showcase.viewer') === 'ng2-pdf-viewer') {
          localStorage.setItem('showcase.viewer', 'ngx-extended-pdf-viewer');
        }
      }
      this._viewer = localStorage.getItem('showcase.viewer');
    }
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
      this.pdfjsVersion = ', pdf.js ' + versions.pdfJsDist;
      this.library = 'ng2-pdf-viewer';
      this.version = versions.ng2PdfViewer;
    }
  }

  private determinePdfJsVersion(): void {
    setTimeout(() => {
      if ((window as any).pdfjsLib) {
        this.pdfjsVersion = ', pdf.js ' + (window as any).pdfjsLib.version + ',';
      } else {
        this.pdfjsVersion = ''; // maybe we're currently showing one of the pages without example file
        this.determinePdfJsVersion();
      }
    }, 100);
  }
}
