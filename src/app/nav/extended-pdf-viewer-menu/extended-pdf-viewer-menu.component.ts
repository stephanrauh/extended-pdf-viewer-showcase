import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Component({
standalone: false,
  selector: 'app-extended-pdf-viewer-menu',
  templateUrl: './extended-pdf-viewer-menu.component.html',
  styleUrls: ['./extended-pdf-viewer-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendedPdfViewerMenuComponent {
  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 1023px)')
    .pipe(map((result) => result.matches));

  @Input()
  public drawer: any;

  constructor(private router: Router, private cd: ChangeDetectorRef,private breakpointObserver: BreakpointObserver) {}

  public async toggleDrawer(): Promise<void> {
    const mobile = await this.isHandset$.pipe(take(1)).toPromise();
    if (mobile) {
      this.drawer.toggle();
    }
  }
}
