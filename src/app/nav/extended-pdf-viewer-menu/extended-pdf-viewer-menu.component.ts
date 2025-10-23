import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-extended-pdf-viewer-menu',

    standalone: true,
    templateUrl: './extended-pdf-viewer-menu.component.html',
    styleUrls: ['./extended-pdf-viewer-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive]
})
export class ExtendedPdfViewerMenuComponent implements AfterViewInit, OnDestroy {
  public router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);
  private routerSubscription?: Subscription;

  @Input()
  public drawer: any;

  private drawerObserver?: MutationObserver;

  ngAfterViewInit(): void {
    // Scroll to active item on initial load
    setTimeout(() => this.scrollToActiveItem(), 100);

    // Subscribe to route changes to scroll to active item
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.scrollToActiveItem(), 100);
      });

    // Watch for drawer visibility changes (when kebab menu is opened)
    if (this.drawer) {
      this.drawerObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const classList = (mutation.target as HTMLElement).classList;
            // Check if drawer became visible (has w-80 and not hidden)
            if (classList.contains('w-80') && !classList.contains('hidden')) {
              setTimeout(() => this.scrollToActiveItem(), 100);
            }
          }
        });
      });

      this.drawerObserver.observe(this.drawer, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.drawerObserver?.disconnect();
  }

  private scrollToActiveItem(): void {
    const activeItem = this.elementRef.nativeElement.querySelector('.menu-item-active');
    if (activeItem && this.drawer) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  public async toggleDrawer(): Promise<void> {
    // Note: BreakpointObserver functionality removed due to CDK dependency removal
    // Simplified to always toggle for mobile-like behavior
    if (this.drawer) {
      // this.drawer.toggle();
    }
  }
}
