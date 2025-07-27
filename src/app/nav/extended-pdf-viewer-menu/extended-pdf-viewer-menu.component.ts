import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-extended-pdf-viewer-menu',

    standalone: true,
    templateUrl: './extended-pdf-viewer-menu.component.html',
    styleUrls: ['./extended-pdf-viewer-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive]
})
export class ExtendedPdfViewerMenuComponent {
  public router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  @Input()
  public drawer: any;

  public async toggleDrawer(): Promise<void> {
    // Note: BreakpointObserver functionality removed due to CDK dependency removal
    // Simplified to always toggle for mobile-like behavior
    if (this.drawer) {
      // this.drawer.toggle();
    }
  }
}
