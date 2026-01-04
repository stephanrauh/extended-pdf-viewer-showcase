import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { NgScrollbarExt, NgScrollbarAsyncViewport } from 'ngx-scrollbar';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-perfect-scrollbar',
  standalone: true,
  templateUrl: './perfect-scrollbar.component.html',
  styleUrls: ['./perfect-scrollbar.component.css'],
  imports: [Ie11MarkdownComponent, DemoComponent, NgxExtendedPdfViewerModule, AsyncPipe, NgScrollbarExt, NgScrollbarAsyncViewport],
})
export class PerfectScrollbarComponent {
  private themeService = inject(ThemeService);
  private cdr = inject(ChangeDetectorRef);
  fullscreenService = inject(FullscreenService);

  public get theme(): string {
    return this.themeService.theme();
  }

  public activeTab = 'html';
  public pdfReady = false;

  public onPagesLoaded(): void {
    // asyncViewport="auto" handles waiting for the element, just render the component
    requestAnimationFrame(() => {
      this.pdfReady = true;
      this.cdr.detectChanges();
    });
  }
}
