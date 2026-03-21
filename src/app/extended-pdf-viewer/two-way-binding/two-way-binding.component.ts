import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { NgxExtendedPdfViewerService, ScrollModeType, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { PdfSidebarView } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';

@Component({
    selector: 'app-two-way-binding',
    
    standalone: true,
    templateUrl: './two-way-binding.component.html',
    styleUrls: ['./two-way-binding.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective,
        AsyncPipe,
    ],
})
export class TwoWayBindingComponent {
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
   private pdfService = inject(NgxExtendedPdfViewerService);
   fullscreenService = inject(FullscreenService);

   public codeTab: string = 'html';

  public handTool = true;

  public page = 5;

  public pageLabel!: string;

  public rotation: 0 | 90 | 180 | 270 = 0;

  public scrollMode: ScrollModeType = ScrollModeType.vertical;

  public sidebarVisible = true;

  public activeSidebarView: PdfSidebarView = PdfSidebarView.THUMBS;

  public src = './assets/pdfs/The Public Domain - Enclosing the Commons of the Mind.pdf';

  public spread: 'off' | 'even' | 'odd' = 'off';

  public zoom: number | string = 'auto';

  public currentZoomFactor!: number;

  private _fullscreen = false;

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;

  }

  private _selectedTab = 0;

  public set selectedTab(index: number) {
    this._selectedTab = index;
    try {
      if (localStorage) {
        localStorage.setItem('ngx-extended-pdf-viewer.two-way-binding.selectedTab', String(index));
      }
    } catch /* safariSecurityException */ {
      // localStorage is not available on Safari
    }
    this.cdr.markForCheck();
  }

  public get selectedTab(): number {
    return this._selectedTab;
  }

  constructor() {
    try {
      if (localStorage) {
        const stored = Number(localStorage.getItem('ngx-extended-pdf-viewer.two-way-binding.selectedTab'));
        // Only restore if it's a valid tab index (0, 1, or 2)
        if (stored >= 0 && stored <= 2) {
          this._selectedTab = stored;
        }
      }
    } catch /* safariSecurityException */ {
      // localStorage is not available on Safari
    }
  }

  public load(file: string): void {
    const view = this.activeSidebarView;
    this.src=file;
    // loading a file resets the default view
    setTimeout(() => {
      this.activeSidebarView = view;
      this.cdr.markForCheck();
    }, 150);
  }
}
