import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SetMinifiedLibraryUsageDirective } from '../../shared/set-minified-library-usage.directive';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-modifying-page-order',

  standalone: true,
  templateUrl: './modifying-page-order.component.html',
  styleUrls: ['./modifying-page-order.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, SetMinifiedLibraryUsageDirective, AsyncPipe],
})
export class ModifyingPageOrderComponent implements OnDestroy {
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  public activeTab = 'html';
  public demoTab: 'reorder' | 'splitMerge' = 'reorder';
  public showViewer = true;
  public enableSplitMerge = false;

  public onDemoTabChange(tab: 'reorder' | 'splitMerge'): void {
    this.demoTab = tab;
    this.showViewer = false;
    this.enableSplitMerge = tab === 'splitMerge';
    setTimeout(() => {
      this.showViewer = true;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    // No need to reset pdfDefaultOptions — we use component inputs instead
  }
}
