import { Component, effect, ViewEncapsulation, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IPDFViewerApplication, PDFNotificationService, PdfThumbnailDrawnEvent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FullscreenService } from '../../services/fullscreen.service';
import { Ie11MarkdownComponent } from '../../shared/ie11-markdown/ie11-markdown.component';
import { DemoComponent } from '../common/demo.component';
import { AsyncPipe } from '@angular/common';

/**
 * BREAKING CHANGES ANALYSIS (ngx-extended-pdf-viewer v26.0.0+)
 * ==============================================================
 *
 * The thumbnail CSS was updated to match modern PDF.js v5.4.938+ styling with box-shadow approach.
 *
 * ✅ NO BREAKING CHANGES for custom thumbnails
 *
 * Custom thumbnails continue to work because:
 *
 * 1. **Selector Scoping**: The new modern CSS uses `#thumbnailsView > .thumbnail` (direct child selector),
 *    but custom thumbnails wrap `.thumbnail` in `<a class="pdf-viewer-template">`, so they don't match.
 *    Custom thumbnails fall back to legacy CSS rules that remain for backward compatibility.
 *
 * 2. **Preserved Classes**: All classes used by custom thumbnails still exist:
 *    - `.thumbnail` - ✅ Present (legacy support)
 *    - `.thumbnailImage` - ✅ Present (legacy support)
 *    - `.thumbnailSelectionRing` - ✅ Present (legacy support, though not used in this example)
 *
 * 3. **CSS Variables**: Still supported:
 *    - `--thumbnail-width` - ✅ Used by both modern and legacy CSS
 *    - `--thumbnail-height` - ✅ Set inline by PDF.js, still works
 *
 * 4. **Custom Styling**: The template uses `style="border: none"` inline, which overrides
 *    both old and new default borders, so visual appearance is unaffected.
 *
 * 5. **Events**: `(thumbnailDrawn)` event and DOM manipulation via `querySelector` continue to work.
 *
 * Default (non-custom) thumbnails now feature:
 * - Modern box-shadow borders instead of solid borders
 * - Rounded corners (8px instead of 2px)
 * - Page number overlay badges (::after pseudo-element)
 * - [aria-current="page"] for current page selection
 * - Improved light/dark mode support via CSS variables
 */

@Component({
    selector: 'app-custom-thumbnails',

    standalone: true,
    templateUrl: './custom-thumbnails.component.html',
    styleUrls: ['./custom-thumbnails.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        Ie11MarkdownComponent,
        DemoComponent,
        NgxExtendedPdfViewerModule,
        AsyncPipe,
    ],
})
export class CustomThumbnailsComponent {
  private themeService = inject(ThemeService);

  public get theme(): string {
    return this.themeService.theme();
  }
  fullscreenService = inject(FullscreenService);

  private _fullscreen = false;

  public rotation: 0 | 180 = 0;
  public customthumbnailscomponentTab: string = 'htmltemplate';
  public codeTab: string = 'htmltemplate12';

  public get fullscreen(): boolean {
    return this._fullscreen;
  }

  public set fullscreen(full: boolean) {
    this._fullscreen = full;
  }

  private PDFViewerApplication!: IPDFViewerApplication;

  constructor() {
    const notificationService = inject(PDFNotificationService);

    effect(() => {
      this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
    });
  }

  public onPageChange(page: number | undefined): void {
    setTimeout(() => {
      const radiobuttons = document.getElementsByClassName('thumbnail-radiobutton');
      if (radiobuttons) {
        for (let i = 1; i <= radiobuttons.length; i++) {
          const cbx = radiobuttons.item(i - 1) as HTMLInputElement;
          cbx.checked = cbx.getAttribute('data-page-number') === String(page);
        }
      }
    });
  }

  public onThumbnailDrawn(thumbnailEvent: PdfThumbnailDrawnEvent): void {
    console.log('Thumbnail drawn ' + thumbnailEvent);
    const thumbnail = thumbnailEvent.thumbnail;
    const page = thumbnailEvent.pageId;

    if (page === this.PDFViewerApplication.page) {
      const radiobutton = thumbnail.querySelector('input.thumbnail-radiobutton');
      if (radiobutton instanceof HTMLInputElement) {
        radiobutton.checked = true;
      }
    }

    const overlay = thumbnail.querySelector('.image-container') as HTMLElement;
    let type: string;
    if (page <= 2) {
      overlay.style.backgroundColor = '#0000FF40';
      type = 'title page';
    } else if (page === 3 || page === 4) {
      overlay.style.backgroundColor = '#00FF0040';
      type = 'table of contents';
    } else {
      overlay.style.backgroundColor = '#FF000040';
      type = 'ready for review';
    }
    const textNode = thumbnail.querySelector('.thumbnail-text') as HTMLDivElement;
    if (textNode) {
      textNode.innerText = type;
    }

    overlay.ondblclick = () => {
      this.rotation = this.rotation ? 0 : 180;
    };
  }
}
