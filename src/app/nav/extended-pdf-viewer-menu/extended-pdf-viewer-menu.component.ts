import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MatToolbar } from '@angular/material/toolbar';
import { MatNavList, MatListItem } from '@angular/material/list';

@Component({
    selector: 'app-extended-pdf-viewer-menu',
    templateUrl: './extended-pdf-viewer-menu.component.html',
    styleUrls: ['./extended-pdf-viewer-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatToolbar, MatNavList, MatListItem, RouterLink]
})
export class ExtendedPdfViewerMenuComponent {
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private breakpointObserver = inject(BreakpointObserver);

  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe('(max-width: 1023px)')
    .pipe(map((result) => result.matches));

  @Input()
  public drawer: any;

  public async toggleDrawer(): Promise<void> {
    const mobile = await firstValueFrom(this.isHandset$);
    if (mobile) {
      this.drawer.toggle();
    }
  }
}
