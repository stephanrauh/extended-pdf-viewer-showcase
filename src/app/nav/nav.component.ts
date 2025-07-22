import { Component, effect, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { pdfDefaultOptions, PDFNotificationService } from 'ngx-extended-pdf-viewer';
import { versions } from './versions';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FullscreenService } from '../services/fullscreen.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { OctocatComponent } from './octocat/octocat.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { NgClass, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { ExtendedPdfViewerMenuComponent } from './extended-pdf-viewer-menu/extended-pdf-viewer-menu.component';
@Component({
    selector: 'app-nav',
    standalone: true,
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
    imports: [
        MatToolbar,
        MatToolbarRow,
        OctocatComponent,
        MatIconButton,
        MatIcon,
        MatRadioGroup,
        NgClass,
        FormsModule,
        MatRadioButton,
        MatSidenavContainer,
        MatSidenav,
        ExtendedPdfViewerMenuComponent,
        MatSidenavContent,
        RouterOutlet,
        AsyncPipe,
    ],
})
export class NavComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private notificationService = inject(PDFNotificationService);
  private fullscreenService = inject(FullscreenService);

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

  constructor() {
    const route = inject(ActivatedRoute);
    const notificationService = this.notificationService;

    if (this.isBrowser()) {
      route.url.subscribe(() => {
        this.hideMenu = location.pathname.includes('iframe');
      });

      // Subscribe to fullscreen changes to hide/show menu
      this.fullscreenService.isFullscreen$.subscribe(isFullscreen => {
        if (!location.pathname.includes('iframe')) {
          this.hideMenu = isFullscreen;
        }
      });

      effect(() => {
        const PDFViewerApplication = notificationService.onPDFJSInitSignal();
        setTimeout(() => this.pdfjsVersion = PDFViewerApplication ? `, pdf.js ${this.notificationService.pdfjsVersion},` : '');
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
