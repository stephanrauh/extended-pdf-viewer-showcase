import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PDFNotificationService } from 'ngx-extended-pdf-viewer';
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

  public angularVersion = dependencies['@angular/core'].replace("^", "");

  public pdfjsVersion = '';

  constructor(
    private breakpointObserver: BreakpointObserver,
    private notification: PDFNotificationService
  ) {
    this.notification.pdfjsVersion.subscribe((s) => (this.pdfjsVersion = s));
  }
}
