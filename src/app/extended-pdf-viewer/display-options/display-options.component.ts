import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { PageViewModeType, ScrollModeType, NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { FullscreenService } from '../../services/fullscreen.service';
import { FormsModule } from '@angular/forms';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-display-options',

  standalone: true,
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.css'],
  imports: [FormsModule, Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective, AsyncPipe],
})
export class DisplayOptionsComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  public fullscreenService = inject(FullscreenService);

  public activeTab = 'html';

  public showBorders = false;

  public get enableImageRightClick(): boolean {
    return pdfDefaultOptions.imagesRightClickMinSize > 0;
  }

  public set enableImageRightClick(value: boolean) {
    pdfDefaultOptions.imagesRightClickMinSize = value ? 16 : -1;
  }

  public scrollMode = 0; // ScrollModeType.vertical (default)

  private _pageViewMode: PageViewModeType = 'multiple';

  public get pageViewMode(): PageViewModeType {
    return this._pageViewMode;
  }

  public set pageViewMode(value: PageViewModeType) {
    this._pageViewMode = value;
    // When switching to single page mode, also set scroll mode to 3
    if (value === 'single') {
      this.scrollMode = 3;
    }
  }

  public spread: 'off' | 'odd' | 'even' = 'off';

  public getEffectiveScrollMode(): number {
    return this.pageViewMode === 'single' ? 3 : this.scrollMode;
  }

  public onScrollModeChange(newScrollMode: number): void {
    // Only update our scrollMode if we're not in single page view mode
    // (since single page mode forces scroll mode 3)
    if (this.pageViewMode !== 'single') {
      this.scrollMode = newScrollMode;
    }
  }
}
