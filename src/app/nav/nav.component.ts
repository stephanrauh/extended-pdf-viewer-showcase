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

  public angularVersion = dependencies['@angular/core'].replace('^', '');

  public _viewer = 'ngx-extended-pdf-viewer';

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
    this.notification.pdfjsVersion.subscribe((s) => (this.pdfjsVersion = s));
    this.activateViewer();
  }

  public switchViewer(): void {
    localStorage.setItem('showcase.viewer', this.viewer);
    location = location;

  }
  public activateViewer(): void {
    this._viewer = localStorage.getItem('showcase.viewer');
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
