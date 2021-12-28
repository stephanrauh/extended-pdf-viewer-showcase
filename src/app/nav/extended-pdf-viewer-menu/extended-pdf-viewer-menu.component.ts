import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, Observable, take, tap } from 'rxjs';

@Component({
  selector: 'app-extended-pdf-viewer-menu',
  templateUrl: './extended-pdf-viewer-menu.component.html',
  styleUrls: ['./extended-pdf-viewer-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendedPdfViewerMenuComponent implements OnInit {
  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 1023px)')
    .pipe(map((result) => result.matches));

  @Input()
  public drawer: any;

  constructor(private router: Router, private cd: ChangeDetectorRef,private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    setTimeout(() => {
      const currentUrl = this.router.routerState.snapshot.url;
      this.highlightActiveMenu(currentUrl);
    },500);

    this.router.events
      .pipe(
        filter((event) => event.constructor.name === 'NavigationEnd'),
        tap((event: any) => {
          const url = event.url;
          this.highlightActiveMenu(url);
        })
      )
      .subscribe();
  }

  private highlightActiveMenu(url: any) {
    const menuItems = document.querySelectorAll('a.mat-list-item');
    menuItems.forEach((item) => {
      let href = (item as HTMLAnchorElement).href;
      const pos = href.lastIndexOf('/');
      if (pos >= 0) {
        href = href.substring(pos + 1);
      }
      const active = url.endsWith(href);
      if (active) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  public async toggleDrawer(): Promise<void> {
    const mobile = await this.isHandset$.pipe(take(1)).toPromise();
    if (mobile) {
      this.drawer.toggle();
    }
  }
}
