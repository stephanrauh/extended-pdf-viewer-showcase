import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

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
    const mobile = await firstValueFrom(this.isHandset$);
    if (mobile) {
      this.drawer.toggle();
    }
  }
}
