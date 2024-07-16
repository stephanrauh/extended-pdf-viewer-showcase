import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { pdfDefaultOptions, PDFNotificationService, PDFScriptLoaderService } from 'ngx-extended-pdf-viewer';
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

  constructor(private breakpointObserver: BreakpointObserver, route: ActivatedRoute

  ) {
    route.url.subscribe((url) => {
      this.hideMenu = location.pathname.includes('iframe');
    });

    try {
      this.activateViewer();
    } catch (exception) {
      alert('Error! ' + exception);
    }
  }

  public switchViewer(): void {
    try {
      if (localStorage) {
        localStorage.setItem('showcase.viewer', this.viewer);
          location = location; // trigger reload
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
    }
  }
  public activateViewer(): void {
    try {
      if (localStorage) {
        this._viewer = localStorage.getItem('showcase.viewer');
      }
    } catch (safariSecurityException) {
      // localStorage is not available on Safari
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
