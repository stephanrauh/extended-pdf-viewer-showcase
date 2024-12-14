import { Component, effect } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { pdfDefaultOptions, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { versions } from './versions';
import { ActivatedRoute } from '@angular/router';
@Component({
standalone: false,
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

  constructor(private breakpointObserver: BreakpointObserver, route: ActivatedRoute, private notificationService: PDFNotificationService) {
    if (this.isBrowser()) {
      route.url.subscribe(() => {
        this.hideMenu = location.pathname.includes('iframe');
      });

        effect(() => {
          const PDFViewerApplication = notificationService.onPDFJSInitSignal();
          if (PDFViewerApplication) {
            this.pdfjsVersion = `, pdf.js ${this.notificationService.pdfjsVersion},`;
          } else {
            this.pdfjsVersion = '';
          }
        });


      try {
        this.activateViewer();
      } catch (exception) {
        alert('Error! ' + exception);
      }
    }
  }


  /**
   * Checks if the code is running in a browser environment.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  public switchViewer(): void {
    try {
      if (localStorage) {
        localStorage.setItem('showcase.viewer', this.viewer);
        // eslint-disable-next-line no-self-assign
        location = location; // trigger reload
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
  }
  public activateViewer(): void {
    try {
      if (localStorage) {
        this._viewer = localStorage.getItem('showcase.viewer');
      }
    } catch /* (safariSecurityException) */ {
      // localStorage is not available on Safari
    }
    if (!this._viewer) {
      this._viewer = 'ngx-extended-pdf-viewer';
    }
    if (this._viewer === 'ngx-extended-pdf-viewer') {
      pdfDefaultOptions.assetsFolder = 'assets';
    } else if (this._viewer === 'bleeding-edge') {
      pdfDefaultOptions.assetsFolder = 'bleeding-edge';
    }
  }
}
